"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { formatINR } from "@/lib/formatters";

export interface ComparisonBarConfig {
  key: string;
  label: string;
  color: string;
  stackId?: string;
}

export interface ComparisonBarChartProps {
  title?: string;
  subtitle?: string;
  data: Record<string, any>[];
  bars: ComparisonBarConfig[];
  xAxisKey?: string;
  height?: number;
  yAxisFormatter?: (value: number) => string;
  isCurrency?: boolean;
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

const DynamicBarChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const {
        ResponsiveContainer,
        BarChart,
        Bar,
        XAxis,
        YAxis,
        Tooltip,
        Legend,
        CartesianGrid,
      } = mod;

      return function InnerBarChart({
        data,
        bars,
        xAxisKey = "category",
        height = 280,
        yAxisFormatter,
        isCurrency = true,
      }: {
        data: Record<string, any>[];
        bars: ComparisonBarConfig[];
        xAxisKey?: string;
        height?: number;
        yAxisFormatter?: (value: number) => string;
        isCurrency?: boolean;
      }) {
        const defaultYFormatter = isCurrency
          ? formatCompactINR
          : (v: number) => `${v}%`;

        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
                tickFormatter={yAxisFormatter || defaultYFormatter}
                tick={{ fontSize: 11, fill: "#64748b" }}
                stroke="#cbd5e1"
                tickLine={false}
                width={55}
              />
              <Tooltip
                formatter={(val: unknown) => [
                  isCurrency ? formatINR(Number(val)) : `${val}%`,
                  "",
                ]}
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
              {bars.map((bar) => (
                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  name={bar.label}
                  fill={bar.color}
                  stackId={bar.stackId}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => <ComparisonChartFallback />,
  }
);

function ComparisonChartFallback() {
  return (
    <div
      className="w-full h-[280px] flex items-center justify-center bg-slate-50/60 rounded-xl border border-slate-200/60 animate-pulse"
      aria-hidden="true"
    >
      <div className="w-48 h-32 flex items-end justify-center gap-4">
        <div className="w-12 h-24 bg-slate-200 rounded-t" />
        <div className="w-12 h-32 bg-emerald-300 rounded-t" />
      </div>
    </div>
  );
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  title = "Comparison",
  subtitle,
  data,
  bars,
  xAxisKey = "category",
  height = 280,
  yAxisFormatter,
  isCurrency = true,
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
          <DynamicBarChart
            data={data}
            bars={bars}
            xAxisKey={xAxisKey}
            height={height}
            yAxisFormatter={yAxisFormatter}
            isCurrency={isCurrency}
          />
        ) : (
          <ComparisonChartFallback />
        )}
      </div>

      {/* Accessible table */}
      <table className="sr-only">
        <caption>{title} data table</caption>
        <thead>
          <tr>
            <th scope="col">{xAxisKey}</th>
            {bars.map((b) => (
              <th key={b.key} scope="col">
                {b.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <th scope="row">{row[xAxisKey]}</th>
              {bars.map((b) => (
                <td key={b.key}>
                  {isCurrency
                    ? formatINR(Number(row[b.key]) || 0)
                    : `${row[b.key]}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
