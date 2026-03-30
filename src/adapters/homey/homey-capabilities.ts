interface CapabilityMeta {
  title: string;
  icon: string;
}

const CAPABILITY_MAP: Record<string, CapabilityMeta> = {
  onoff: { title: "On/Off", icon: "power" },
  dim: { title: "Brightness", icon: "sun" },
  light_hue: { title: "Hue", icon: "palette" },
  light_saturation: { title: "Saturation", icon: "palette" },
  light_temperature: { title: "Color Temp", icon: "thermometer" },
  light_mode: { title: "Light Mode", icon: "lightbulb" },
  measure_temperature: { title: "Temperature", icon: "thermometer" },
  measure_humidity: { title: "Humidity", icon: "droplets" },
  measure_pressure: { title: "Pressure", icon: "gauge" },
  measure_luminance: { title: "Luminance", icon: "sun" },
  measure_power: { title: "Power", icon: "zap" },
  meter_power: { title: "Energy", icon: "battery" },
  measure_battery: { title: "Battery", icon: "battery" },
  target_temperature: { title: "Target Temp", icon: "thermometer" },
  thermostat_mode: { title: "Mode", icon: "settings" },
  alarm_motion: { title: "Motion", icon: "move" },
  alarm_contact: { title: "Contact", icon: "door-open" },
  alarm_smoke: { title: "Smoke", icon: "flame" },
  alarm_co: { title: "CO", icon: "alert-triangle" },
  alarm_water: { title: "Water Leak", icon: "droplets" },
  windowcoverings_set: { title: "Position", icon: "blinds" },
  windowcoverings_closed: { title: "Closed", icon: "blinds" },
  volume_set: { title: "Volume", icon: "volume-2" },
  volume_mute: { title: "Mute", icon: "volume-x" },
  locked: { title: "Locked", icon: "lock" },
  speaker_playing: { title: "Playing", icon: "play" },
};

export function getCapabilityMeta(capabilityId: string): CapabilityMeta {
  return (
    CAPABILITY_MAP[capabilityId] ?? {
      title: capabilityId.replace(/_/g, " "),
      icon: "circle",
    }
  );
}
