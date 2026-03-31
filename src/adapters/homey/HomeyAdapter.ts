import type {
  AdapterConfigField,
  AdapterEvent,
  DataSourceAdapter,
  Device,
  Zone,
} from "@/core/types";
import type { HomeyRawDevice, HomeyRawZone } from "./types";
import { mapHomeyDevice, mapHomeyZone } from "./homey-mapper";
import {
  loadAuth,
  isTokenExpired,
  refreshHomeyToken,
  type HomeyAuthData,
} from "./homey-auth";

export class HomeyAdapter implements DataSourceAdapter {
  readonly id = "homey";
  readonly name = "Homey";
  readonly icon = "home";
  readonly configFields: AdapterConfigField[] = [
    {
      key: "ip",
      label: "Homey IP Address (optional — auto-detected from OAuth)",
      type: "url",
      required: false,
      placeholder: "192.168.10.x",
    },
  ];

  private connected = false;
  private baseUrl = "";
  private token = "";
  private auth: HomeyAuthData | null = null;
  private devices = new Map<string, Device>();
  private zones = new Map<string, Zone>();
  private handlers = new Set<(event: AdapterEvent) => void>();
  private pollInterval?: ReturnType<typeof setInterval>;

  async connect(config: Record<string, string>): Promise<void> {
    // Try OAuth2 first
    this.auth = loadAuth();

    if (this.auth) {
      // Refresh token if needed
      if (isTokenExpired(this.auth)) {
        this.auth = await refreshHomeyToken(this.auth);
      }
      this.token = this.auth.homeyToken;

      // Determine base URL: prefer manual IP, then local URL from auth, then cloud
      const manualIp = config["ip"];
      if (manualIp) {
        this.baseUrl = manualIp.startsWith("http") ? manualIp : `http://${manualIp}`;
      } else if (window.location.port === "9999") {
        // Deployed on Synology — use nginx reverse proxy to avoid CORS
        this.baseUrl = `${window.location.origin}/homey-api`;
      } else if (this.auth.homeyLocalUrl) {
        this.baseUrl = this.auth.homeyLocalUrl;
      } else if (this.auth.homeyCloudUrl) {
        this.baseUrl = this.auth.homeyCloudUrl;
      } else {
        throw new Error("No Homey URL found — enter IP manually or re-authenticate");
      }
    } else if (config["ip"] && config["token"]) {
      // Fallback: manual IP + token (legacy mode)
      this.baseUrl = config["ip"].startsWith("http") ? config["ip"] : `http://${config["ip"]}`;
      this.token = config["token"];
    } else {
      throw new Error("Please log in with Homey first (click Connect in Settings)");
    }

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

  private refreshing: Promise<void> | null = null;

  private async forceRefresh(): Promise<void> {
    if (!this.auth) throw new Error("No auth data — please re-authenticate");
    // Deduplicate concurrent refresh attempts
    if (!this.refreshing) {
      this.refreshing = (async () => {
        try {
          this.auth = await refreshHomeyToken(this.auth!);
          this.token = this.auth.homeyToken;
        } finally {
          this.refreshing = null;
        }
      })();
    }
    await this.refreshing;
  }

  private async ensureToken(): Promise<void> {
    if (this.auth && isTokenExpired(this.auth)) {
      await this.forceRefresh();
    }
  }

  private async apiGet<T>(path: string): Promise<T> {
    await this.ensureToken();
    let res = await fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    // Auto-refresh on 401
    if (res.status === 401 && this.auth) {
      await this.forceRefresh();
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
    }
    if (!res.ok) throw new Error(`Homey API ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  private async apiPut(path: string, body: unknown): Promise<void> {
    await this.ensureToken();
    let res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    // Auto-refresh on 401
    if (res.status === 401 && this.auth) {
      await this.forceRefresh();
      res = await fetch(`${this.baseUrl}${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }
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
      if (this.connected) {
        this.connected = false;
        this.emit({ type: "connection:change", connected: false });
      }
    }
  }
}
