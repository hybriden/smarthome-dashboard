import type {
  AdapterEvent,
  DataSourceAdapter,
  Device,
  Zone,
  AdapterConfigField,
} from "@/core/types";

const DEMO_ZONES: Zone[] = [
  { id: "living-room", sourceId: "demo", name: "Living Room" },
  { id: "bedroom", sourceId: "demo", name: "Bedroom" },
  { id: "kitchen", sourceId: "demo", name: "Kitchen" },
  { id: "bathroom", sourceId: "demo", name: "Bathroom" },
  { id: "office", sourceId: "demo", name: "Office" },
];

const DEMO_DEVICES: Device[] = [
  {
    id: "demo-light-1",
    sourceId: "demo",
    name: "Ceiling Light",
    zone: "living-room",
    deviceClass: "light",
    online: true,
    capabilities: [
      { id: "onoff", type: "boolean", title: "On/Off", value: true, settable: true },
      { id: "dim", type: "number", title: "Brightness", value: 0.75, min: 0, max: 1, step: 0.01, settable: true },
      { id: "light_temperature", type: "number", title: "Color Temp", value: 0.5, min: 0, max: 1, step: 0.01, settable: true },
    ],
  },
  {
    id: "demo-light-2",
    sourceId: "demo",
    name: "Desk Lamp",
    zone: "office",
    deviceClass: "light",
    online: true,
    capabilities: [
      { id: "onoff", type: "boolean", title: "On/Off", value: false, settable: true },
      { id: "dim", type: "number", title: "Brightness", value: 0.5, min: 0, max: 1, step: 0.01, settable: true },
    ],
  },
  {
    id: "demo-thermo-1",
    sourceId: "demo",
    name: "Living Room Thermostat",
    zone: "living-room",
    deviceClass: "thermostat",
    online: true,
    capabilities: [
      { id: "measure_temperature", type: "number", title: "Temperature", value: 21.5, units: "\u00b0C", settable: false },
      { id: "target_temperature", type: "number", title: "Target", value: 22, min: 5, max: 30, step: 0.5, units: "\u00b0C", settable: true },
      {
        id: "thermostat_mode",
        type: "enum",
        title: "Mode",
        value: "auto",
        options: [
          { id: "auto", title: "Auto" },
          { id: "heat", title: "Heat" },
          { id: "cool", title: "Cool" },
          { id: "off", title: "Off" },
        ],
        settable: true,
      },
    ],
  },
  {
    id: "demo-sensor-1",
    sourceId: "demo",
    name: "Outdoor Sensor",
    zone: "living-room",
    deviceClass: "sensor",
    online: true,
    capabilities: [
      { id: "measure_temperature", type: "number", title: "Temperature", value: 8.3, units: "\u00b0C", settable: false },
      { id: "measure_humidity", type: "number", title: "Humidity", value: 72, units: "%", settable: false },
    ],
  },
  {
    id: "demo-sensor-2",
    sourceId: "demo",
    name: "Bathroom Sensor",
    zone: "bathroom",
    deviceClass: "sensor",
    online: true,
    capabilities: [
      { id: "measure_temperature", type: "number", title: "Temperature", value: 23.1, units: "\u00b0C", settable: false },
      { id: "measure_humidity", type: "number", title: "Humidity", value: 65, units: "%", settable: false },
    ],
  },
  {
    id: "demo-socket-1",
    sourceId: "demo",
    name: "Coffee Machine",
    zone: "kitchen",
    deviceClass: "socket",
    online: true,
    capabilities: [
      { id: "onoff", type: "boolean", title: "On/Off", value: false, settable: true },
      { id: "measure_power", type: "number", title: "Power", value: 0, units: "W", settable: false },
    ],
  },
  {
    id: "demo-socket-2",
    sourceId: "demo",
    name: "TV Plug",
    zone: "living-room",
    deviceClass: "socket",
    online: true,
    capabilities: [
      { id: "onoff", type: "boolean", title: "On/Off", value: true, settable: true },
      { id: "measure_power", type: "number", title: "Power", value: 85, units: "W", settable: false },
    ],
  },
  {
    id: "demo-alarm-1",
    sourceId: "demo",
    name: "Front Door",
    zone: "living-room",
    deviceClass: "alarm",
    online: true,
    capabilities: [
      { id: "alarm_contact", type: "boolean", title: "Contact", value: false, settable: false },
    ],
  },
  {
    id: "demo-alarm-2",
    sourceId: "demo",
    name: "Hallway Motion",
    zone: "living-room",
    deviceClass: "alarm",
    online: true,
    capabilities: [
      { id: "alarm_motion", type: "boolean", title: "Motion", value: false, settable: false },
    ],
  },
  {
    id: "demo-cover-1",
    sourceId: "demo",
    name: "Bedroom Blinds",
    zone: "bedroom",
    deviceClass: "windowcoverings",
    online: true,
    capabilities: [
      { id: "windowcoverings_set", type: "number", title: "Position", value: 1, min: 0, max: 1, step: 0.01, settable: true },
    ],
  },
];

export class DemoAdapter implements DataSourceAdapter {
  readonly id = "demo";
  readonly name = "Demo";
  readonly icon = "play-circle";
  readonly configFields: AdapterConfigField[] = [];

  private connected = false;
  private devices = structuredClone(DEMO_DEVICES);
  private handlers = new Set<(event: AdapterEvent) => void>();
  private interval?: ReturnType<typeof setInterval>;

  async connect(): Promise<void> {
    this.connected = true;
    this.emit({ type: "connection:change", connected: true });
    this.startSimulation();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    if (this.interval) clearInterval(this.interval);
    this.emit({ type: "connection:change", connected: false });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getDevices(): Promise<Device[]> {
    return structuredClone(this.devices);
  }

  async getZones(): Promise<Zone[]> {
    return structuredClone(DEMO_ZONES);
  }

  async setCapabilityValue(
    deviceId: string,
    capabilityId: string,
    value: unknown,
  ): Promise<void> {
    const device = this.devices.find((d) => d.id === deviceId);
    if (!device) return;
    const cap = device.capabilities.find((c) => c.id === capabilityId);
    if (!cap || !cap.settable) return;
    cap.value = value;
    this.emit({ type: "device:update", device: structuredClone(device) });
  }

  subscribe(handler: (event: AdapterEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private emit(event: AdapterEvent): void {
    this.handlers.forEach((h) => h(event));
  }

  private startSimulation(): void {
    this.interval = setInterval(() => {
      const sensor = this.devices.find((d) => d.id === "demo-sensor-1");
      if (sensor) {
        const temp = sensor.capabilities.find(
          (c) => c.id === "measure_temperature",
        );
        if (temp) {
          temp.value = Math.round(((temp.value as number) + (Math.random() - 0.5) * 0.4) * 10) / 10;
          this.emit({ type: "device:update", device: structuredClone(sensor) });
        }
      }

      const motion = this.devices.find((d) => d.id === "demo-alarm-2");
      if (motion) {
        const alarm = motion.capabilities.find(
          (c) => c.id === "alarm_motion",
        );
        if (alarm) {
          alarm.value = Math.random() > 0.7;
          this.emit({ type: "device:update", device: structuredClone(motion) });
        }
      }
    }, 5000);
  }
}
