import type { AdapterEvent, DataSourceAdapter, Device, Zone } from "./types";
import { createAdapter } from "./registry";

export interface AdapterConnection {
  adapter: DataSourceAdapter;
  config: Record<string, string>;
  connected: boolean;
  unsubscribe?: () => void;
}

type ManagerListener = (event: AdapterEvent & { sourceId: string }) => void;

class DataSourceManager {
  private connections = new Map<string, AdapterConnection>();
  private listeners = new Set<ManagerListener>();

  subscribe(listener: ManagerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: AdapterEvent & { sourceId: string }): void {
    this.listeners.forEach((l) => l(event));
  }

  async connectAdapter(
    adapterId: string,
    config: Record<string, string>,
  ): Promise<void> {
    await this.disconnectAdapter(adapterId);

    const adapter = createAdapter(adapterId);
    const connection: AdapterConnection = {
      adapter,
      config,
      connected: false,
    };

    connection.unsubscribe = adapter.subscribe((event) => {
      if (event.type === "connection:change") {
        connection.connected = event.connected;
      }
      this.notify({ ...event, sourceId: adapterId });
    });

    this.connections.set(adapterId, connection);

    await adapter.connect(config);
    connection.connected = true;
    this.notify({
      type: "connection:change",
      connected: true,
      sourceId: adapterId,
    });
  }

  async disconnectAdapter(adapterId: string): Promise<void> {
    const existing = this.connections.get(adapterId);
    if (existing) {
      existing.unsubscribe?.();
      await existing.adapter.disconnect();
      this.connections.delete(adapterId);
      this.notify({
        type: "connection:change",
        connected: false,
        sourceId: adapterId,
      });
    }
  }

  async getAllDevices(): Promise<Device[]> {
    const all: Device[] = [];
    for (const conn of this.connections.values()) {
      if (conn.connected) {
        const devices = await conn.adapter.getDevices();
        all.push(...devices);
      }
    }
    return all;
  }

  async getAllZones(): Promise<Zone[]> {
    const all: Zone[] = [];
    for (const conn of this.connections.values()) {
      if (conn.connected) {
        const zones = await conn.adapter.getZones();
        all.push(...zones);
      }
    }
    return all;
  }

  async setCapabilityValue(
    sourceId: string,
    deviceId: string,
    capabilityId: string,
    value: unknown,
  ): Promise<void> {
    const conn = this.connections.get(sourceId);
    if (!conn?.connected) throw new Error(`Adapter ${sourceId} not connected`);
    await conn.adapter.setCapabilityValue(deviceId, capabilityId, value);
  }

  getConnectionStatus(adapterId: string): boolean {
    return this.connections.get(adapterId)?.connected ?? false;
  }

  getConnectedAdapterIds(): string[] {
    return Array.from(this.connections.entries())
      .filter(([, c]) => c.connected)
      .map(([id]) => id);
  }

  async disconnectAll(): Promise<void> {
    const ids = Array.from(this.connections.keys());
    await Promise.all(ids.map((id) => this.disconnectAdapter(id)));
  }
}

export const manager = new DataSourceManager();
