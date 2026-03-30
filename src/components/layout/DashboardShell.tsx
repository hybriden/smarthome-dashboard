import { Header } from "./Header";
import { DashboardGrid } from "./DashboardGrid";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { DevicePicker } from "@/components/settings/DevicePicker";

export function DashboardShell() {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <DashboardGrid />
      <SettingsPanel />
      <DevicePicker />
    </div>
  );
}
