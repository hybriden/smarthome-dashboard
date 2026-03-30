import type { ComponentType } from "react";
import type { Device } from "@/core/types";
import { LightWidget } from "./LightWidget";
import { ThermostatWidget } from "./ThermostatWidget";
import { SensorWidget } from "./SensorWidget";
import { SwitchWidget } from "./SwitchWidget";
import { AlarmWidget } from "./AlarmWidget";
import { CoverWidget } from "./CoverWidget";
import { GarageDoorWidget } from "./GarageDoorWidget";
import { GenericWidget } from "./GenericWidget";

export interface WidgetProps {
  device: Device;
}

const WIDGET_MAP: Record<string, ComponentType<WidgetProps>> = {
  light: LightWidget,
  thermostat: ThermostatWidget,
  sensor: SensorWidget,
  socket: SwitchWidget,
  alarm: AlarmWidget,
  windowcoverings: CoverWidget,
  garagedoor: GarageDoorWidget,
};

export function getWidgetComponent(
  deviceClass: string,
): ComponentType<WidgetProps> {
  return WIDGET_MAP[deviceClass] ?? GenericWidget;
}
