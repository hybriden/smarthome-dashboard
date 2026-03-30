import { Header } from "./Header";
import { ZoneTabs } from "./ZoneTabs";
import { DashboardGrid } from "./DashboardGrid";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export function DashboardShell() {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <ZoneTabs />
      <DashboardGrid />
      <SettingsPanel />
    </div>
  );
}
