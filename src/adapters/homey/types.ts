export interface HomeyRawCapability {
  id: string;
  type: "boolean" | "number" | "string" | "enum";
  title: string | Record<string, string>;
  getable: boolean;
  setable: boolean;
  value: unknown;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  values?: { id: string; title: string | Record<string, string> }[];
}

export interface HomeyRawDevice {
  id: string;
  name: string;
  class: string;
  zone: string;
  available: boolean;
  capabilitiesObj: Record<string, HomeyRawCapability>;
}

export interface HomeyRawZone {
  id: string;
  name: string;
  parent: string | null;
  icon: string;
}
