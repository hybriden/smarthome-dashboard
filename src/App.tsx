import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { manager } from "@/core/manager";
import { useSettingsStore } from "@/store/settings";
import { useDeviceStore } from "@/store/devices";
import { useZoneStore } from "@/store/zones";
import { useConnectionStore } from "@/store/connections";
import "@/adapters";

export default function App() {
  const adapterConfigs = useSettingsStore((s) => s.adapterConfigs);
  const updateDevice = useDeviceStore((s) => s.updateDevice);
  const addDevice = useDeviceStore((s) => s.addDevice);
  const removeDevice = useDeviceStore((s) => s.removeDevice);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const setZones = useZoneStore((s) => s.setZones);
  const setConnected = useConnectionStore((s) => s.setConnected);

  useEffect(() => {
    const unsubscribe = manager.subscribe((event) => {
      switch (event.type) {
        case "device:update":
          updateDevice(event.device);
          break;
        case "device:add":
          addDevice(event.device);
          break;
        case "device:remove":
          removeDevice(event.deviceId);
          break;
        case "connection:change":
          setConnected(event.sourceId, event.connected);
          break;
      }
    });

    return () => {
      unsubscribe();
      manager.disconnectAll();
    };
  }, [updateDevice, addDevice, removeDevice, setConnected]);

  useEffect(() => {
    async function sync() {
      const enabled = adapterConfigs.filter((c) => c.enabled);

      for (const ac of enabled) {
        if (!manager.getConnectionStatus(ac.adapterId)) {
          try {
            await manager.connectAdapter(ac.adapterId, ac.config);
            const [devices, zones] = await Promise.all([
              manager.getAllDevices(),
              manager.getAllZones(),
            ]);
            setDevices(devices);
            setZones(zones);
          } catch (err) {
            console.error(`Failed to connect ${ac.adapterId}:`, err);
          }
        }
      }

      // Disconnect adapters that are no longer enabled
      const enabledIds = new Set(enabled.map((c) => c.adapterId));
      for (const id of manager.getConnectedAdapterIds()) {
        if (!enabledIds.has(id)) {
          await manager.disconnectAdapter(id);
          // Refresh device list
          const devices = await manager.getAllDevices();
          setDevices(devices);
        }
      }
    }

    sync();
  }, [adapterConfigs, setDevices, setZones]);

  return <DashboardShell />;
}
