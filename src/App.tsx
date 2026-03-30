import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { manager } from "@/core/manager";
import { useSettingsStore } from "@/store/settings";
import { useDeviceStore } from "@/store/devices";
import { useZoneStore } from "@/store/zones";
import { useConnectionStore } from "@/store/connections";
import { handleHomeyCallback } from "@/adapters/homey/homey-auth";
import "@/adapters";

export default function App() {
  const adapterConfigs = useSettingsStore((s) => s.adapterConfigs);
  const toggleAdapter = useSettingsStore((s) => s.toggleAdapter);
  const updateDevice = useDeviceStore((s) => s.updateDevice);
  const addDevice = useDeviceStore((s) => s.addDevice);
  const removeDevice = useDeviceStore((s) => s.removeDevice);
  const setDevices = useDeviceStore((s) => s.setDevices);
  const setZones = useZoneStore((s) => s.setZones);
  const setConnected = useConnectionStore((s) => s.setConnected);
  const [authHandled, setAuthHandled] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Remove code from URL
      window.history.replaceState({}, "", "/");

      handleHomeyCallback(code)
        .then((auth) => {
          console.log("Homey authenticated!", {
            homeyId: auth.homeyId,
            localUrl: auth.homeyLocalUrl,
            cloudUrl: auth.homeyCloudUrl,
          });
          // Auto-enable Homey adapter
          toggleAdapter("homey", true);
          setAuthHandled(true);
        })
        .catch((err) => {
          console.error("Homey auth failed:", err);
          setAuthHandled(true);
        });
    } else {
      setAuthHandled(true);
    }
  }, [toggleAdapter]);

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
    if (!authHandled) return;

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

      const enabledIds = new Set(enabled.map((c) => c.adapterId));
      for (const id of manager.getConnectedAdapterIds()) {
        if (!enabledIds.has(id)) {
          await manager.disconnectAdapter(id);
          const devices = await manager.getAllDevices();
          setDevices(devices);
        }
      }
    }

    sync();
  }, [adapterConfigs, setDevices, setZones, authHandled]);

  return <DashboardShell />;
}
