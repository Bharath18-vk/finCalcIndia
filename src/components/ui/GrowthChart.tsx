"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { formatINR } from "@/lib/formatters";

export interface GrowthChartSeries {
  key: string;
  label: string;
  color: string;
  fillColor?: string;
  fillOpacity?: number;
}

export interface GrowthChartProps {
  title?: string;
  subtitle?: string;
  data: Record<string, any>[];
  series: GrowthChartSeries[];
  xAxisKey?: string;
  height?: number;
  yAxisFormatter?: (value: number) => string;
}

function formatCompactINR(val: number): string {
  if (Math.abs(val) >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  if (Math.abs(val) >= 1000) {
    return `₹${(val / 1000).toFixed(0)}k`;
  }
  return `₹${val}`;
}

const DynamicAreaChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const {
        ResponsiveContainer,
        AreaChart,
        Area,
        XAxis,
        YAxis,
        Tooltip,
        Legend,
        CartesianGrid,
      } = mod;

      return function InnerAreaChart({
        data,
        series,
        xAxisKey = "label",
        height = 280,
        yAxisFormatter = formatCompactINR,
      }: {
        data: Record<string, any>[];
        series: GrowthChartSeries[];
        xAxisKey?: string;
        height?: number;
        yAxisFormatter?: (value: number) => string;
      }) {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {series.map((s) => (
                  <linearGradient
                    key={`grad-${s.key}`}
                    id={`grad-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={s.fillColor || s.color}
                      stopOpacity={s.fillOpacity ?? 0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={s.fillColor || s.color}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11, fill: "#64748b" }}
                stroke="#cbd5e1"
                tickLine={false}
              />
              <YAxis
                tickFormatter={yAxisFormatter}
                tick={{ fontSize: 11, fill: "#64748b" }}
                stroke="#cbd5e1"
                tickLine={false}
                width={55}
              />
              <Tooltip
                formatter={(val: unknown) => [formatINR(Number(val)), ""]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                formatter={(val) => (
                  <span className="text-xs font-semibold text-slate-700">
                    {val}
                  </span>
                )}
              />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#grad-${s.key})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => <GrowthChartFallback />,
  }
);

function GrowthChartFallback() {
  return (
    <div
      className="w-full h-[280px] flex items-center justify-center bg-slate-50/60 rounded-xl border border-slate-200/60 animate-pulse"
      aria-hidden="true"
    >
      <div className="w-48 h-32 flex items-end gap-2">
        <div className="w-8 h-12 bg-slate-200 rounded-t" />
        <div className="w-8 h-20 bg-slate-200 rounded-t" />
        <div className="w-8 h-28 bg-emerald-200 rounded-t" />
        <div className="w-8 h-36 bg-emerald-300 rounded-t" />
      </div>
    </div>
  );
}

export const GrowthAreaChart: React.FC<GrowthChartProps> = ({
  title = "Growth Projection",
  subtitle,
  data,
  series,
  xAxisKey = "label",
  height = 280,
  yAxisFormatter,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-2">
        {isMounted ? (
          <DynamicAreaChart
            data={data}
            series={series}
            xAxisKey={xAxisKey}
            height={height}
            yAxisFormatter={yAxisFormatter}
          />
        ) : (
          <GrowthChartFallback />
        )}
      </div>

      {/* Accessible table for screen readers and search engines */}
      <table className="sr-only">
        <caption>{title} trajectory</caption>
        <thead>
          <tr>
            <th scope="col">{xAxisKey}</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <th scope="row">{row[xAxisKey]}</th>
              {series.map((s) => (
                <td key={s.key}>{formatINR(row[s.key] || 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
