import { TrendingUp, Clock, Calendar, Zap } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import type { WidgetProps } from "./WidgetRegistry";

function findCap(device: { capabilities: { id: string; value: unknown }[] }, id: string) {
  return device.capabilities.find(c => c.id === id)?.value as number | undefined;
}

export function ElectricityCostWidget({ device, customName, onRename, onRemove }: WidgetProps) {
  const currentCost = findCap(device, "meter_sum_current");
  const monthlyCost = findCap(device, "meter_sum_month");
  const dailyCost = findCap(device, "meter_sum_day");
  const yearlyCost = findCap(device, "meter_sum_year");
  const priceNow = findCap(device, "meter_price_incl");
  const priceExcl = findCap(device, "meter_price_excl");
  const gridPrice = findCap(device, "meter_gridprice_incl");
  const consumptionHour = findCap(device, "meter_consumption_hour");
  const costToday = findCap(device, "meter_cost_today");
  const gridToday = findCap(device, "meter_grid_today");

  const todayTotal = (costToday ?? 0) + (gridToday ?? 0);

  return (
    <WidgetWrapper
      title={customName ?? device.name}
      onRename={onRename}
      onRemove={onRemove}
      subtitle={priceNow != null ? `${priceNow.toFixed(2)} NOK/kWh` : "Electricity costs"}
      online={device.online}
      indicator="on"
    >
      {/* Current rate + hourly cost */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-white/90">
              {currentCost?.toFixed(1) ?? "—"}
            </span>
            <span className="text-xs text-muted">NOK/h</span>
          </div>
          <span className="text-[10px] text-muted">Current rate</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Zap size={10} />
            <span className="tabular-nums">{consumptionHour != null ? `${(consumptionHour/1000).toFixed(1)} kWh` : "—"}</span>
          </div>
          <span className="text-[10px] text-muted">this hour</span>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="space-y-1.5">
        {/* Today */}
        <div className="flex items-center justify-between rounded-lg bg-surface-dark/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-brand" />
            <span className="text-[11px] text-muted">Today</span>
          </div>
          <span className="text-[11px] font-medium tabular-nums text-white/80">
            {todayTotal > 0 ? `${todayTotal.toFixed(0)} kr` : `${dailyCost?.toFixed(1) ?? "—"} NOK`}
          </span>
        </div>

        {/* This month */}
        <div className="flex items-center justify-between rounded-lg bg-surface-dark/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-brand" />
            <span className="text-[11px] text-muted">This month</span>
          </div>
          <span className="text-[11px] font-medium tabular-nums text-white/80">
            {monthlyCost != null ? `${monthlyCost.toFixed(0)} NOK` : "—"}
          </span>
        </div>

        {/* This year */}
        <div className="flex items-center justify-between rounded-lg bg-surface-dark/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={10} className="text-brand" />
            <span className="text-[11px] text-muted">This year</span>
          </div>
          <span className="text-[11px] font-medium tabular-nums text-white/80">
            {yearlyCost != null ? `${(yearlyCost/1000).toFixed(1)}k NOK` : "—"}
          </span>
        </div>
      </div>

      {/* Price breakdown footer */}
      <div className="mt-2 flex justify-between text-[9px] text-muted-dark">
        <span>Strøm: {priceExcl?.toFixed(2) ?? "—"}</span>
        <span>Nett: {gridPrice?.toFixed(2) ?? "—"}</span>
        <span>Total: {priceNow?.toFixed(2) ?? "—"} NOK/kWh</span>
      </div>
    </WidgetWrapper>
  );
}
