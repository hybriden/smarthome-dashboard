import type { AdapterRegistration, DataSourceAdapter } from "./types";

const adapters = new Map<string, AdapterRegistration>();

export function registerAdapter(registration: AdapterRegistration): void {
  adapters.set(registration.id, registration);
}

export function getAdapterRegistration(
  id: string,
): AdapterRegistration | undefined {
  return adapters.get(id);
}

export function listAdapterRegistrations(): AdapterRegistration[] {
  return Array.from(adapters.values());
}

export function createAdapter(id: string): DataSourceAdapter {
  const reg = adapters.get(id);
  if (!reg) throw new Error(`Unknown adapter: ${id}`);
  return reg.create();
}
