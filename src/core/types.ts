export interface Capability {
  id: string;
  type: "boolean" | "number" | "enum" | "string";
  title: string;
  value: unknown;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  options?: { id: string; title: string }[];
  settable: boolean;
}

export interface Device {
  id: string;
  sourceId: string;
  name: string;
  zone?: string;
  deviceClass: DeviceClass;
  capabilities: Capability[];
  online: boolean;
}

export type DeviceClass =
  | "light"
  | "thermostat"
  | "sensor"
  | "socket"
  | "speaker"
  | "lock"
  | "windowcoverings"
  | "camera"
  | "alarm"
  | "garagedoor"
  | "solar"
  | "other";

export interface Zone {
  id: string;
  sourceId: string;
  name: string;
  parentId?: string;
  icon?: string;
}

export type AdapterEvent =
  | { type: "device:update"; device: Device }
  | { type: "device:add"; device: Device }
  | { type: "device:remove"; deviceId: string }
  | { type: "zone:update"; zone: Zone }
  | { type: "connection:change"; connected: boolean };

export interface AdapterConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  required: boolean;
  placeholder?: string;
}

export interface DataSourceAdapter {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly configFields: AdapterConfigField[];

  connect(config: Record<string, string>): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  getDevices(): Promise<Device[]>;
  getZones(): Promise<Zone[]>;

  setCapabilityValue(
    deviceId: string,
    capabilityId: string,
    value: unknown,
  ): Promise<void>;

  subscribe(handler: (event: AdapterEvent) => void): () => void;
}

export interface AdapterRegistration {
  id: string;
  name: string;
  icon: string;
  configFields: AdapterConfigField[];
  create: () => DataSourceAdapter;
}
