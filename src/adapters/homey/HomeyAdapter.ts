import type {
  AdapterConfigField,
  AdapterEvent,
  DataSourceAdapter,
  Device,
  Zone,
} from "@/core/types";
import type { HomeyRawDevice, HomeyRawZone } from "./types";
import { mapHomeyDevice, mapHomeyZone } from "./homey-mapper";

export class HomeyAdapter implements DataSourceAdapter {
  readonly id = "homey";
  readonly name = "Homey";
  readonly icon = "home";
  readonly configFields: AdapterConfigField[] = [
    {
      key: "ip",
      label: "Homey IP Address",
      type: "url",
      required: true,
      placeholder: "192.168.1.x",
    },
    {
      key: "token",
      label: "API Token",
      type: "password",
      required: true,
      placeholder: "Bearer token from Homey Developer Tools",
    },
  ];

  private connected = false;
  private baseUrl = "";
  private token = "";
  private devices = new Map<string, Device>();
  private zones = new Map<string, Zone>();
  private handlers = new Set<(event: AdapterEvent) => void>();
  private pollInterval?: ReturnType<typeof setInterval>;

  async connect(config: Record<string, string>): Promise<void> {
    const ip = config["ip"];
    const token = config["token"];
    if (!ip || !token) throw new Error("Homey IP and token are required");

    this.baseUrl = ip.startsWith("http") ? ip : `http://${ip}`;
    this.token = token;

    // Fetch initial data
    const [rawDevices, rawZones] = await Promise.all([
      this.apiGet<Record<string, HomeyRawDevice>>("/api/manager/devices/device"),
      this.apiGet<Record<string, HomeyRawZone>>("/api/manager/zones/zone"),
    ]);

    for (const raw of Object.values(rawZones)) {
      this.zones.set(raw.id, mapHomeyZone(raw));
    }
    for (const raw of Object.values(rawDevices)) {
      this.devices.set(raw.id, mapHomeyDevice(raw));
    }

    this.connected = true;
    this.emit({ type: "connection:change", connected: true });

    // Poll for updates (Homey local API doesn't expose WebSocket easily without SDK)
    this.pollInterval = setInterval(() => this.poll(), 5000);
  }

  async disconnect(): Promise<void> {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.connected = false;
    this.devices.clear();
    this.zones.clear();
    this.emit({ type: "connection:change", connected: false });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async setCapabilityValue(
    deviceId: string,
    capabilityId: string,
    value: unknown,
  ): Promise<void> {
    await this.apiPut(
      `/api/manager/devices/device/${deviceId}/capability/${capabilityId}`,
      { value },
    );
  }

  subscribe(handler: (event: AdapterEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private emit(event: AdapterEvent): void {
    this.handlers.forEach((h) => h(event));
  }

  private async apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) throw new Error(`Homey API ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  private async apiPut(path: string, body: unknown): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Homey API ${res.status}: ${res.statusText}`);
  }

  private async poll(): Promise<void> {
    try {
      const rawDevices = await this.apiGet<Record<string, HomeyRawDevice>>(
        "/api/manager/devices/device",
      );
      for (const raw of Object.values(rawDevices)) {
        const mapped = mapHomeyDevice(raw);
        const existing = this.devices.get(raw.id);
        if (!existing) {
          this.devices.set(raw.id, mapped);
          this.emit({ type: "device:add", device: mapped });
        } else if (JSON.stringify(existing) !== JSON.stringify(mapped)) {
          this.devices.set(raw.id, mapped);
          this.emit({ type: "device:update", device: mapped });
        }
      }
    } catch {
      // Connection lost
      if (this.connected) {
        this.connected = false;
        this.emit({ type: "connection:change", connected: false });
      }
    }
  }
}
