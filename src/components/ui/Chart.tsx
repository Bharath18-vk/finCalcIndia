"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { formatINR } from "@/lib/formatters";

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface ChartProps {
  data?: ChartSlice[];
  slices?: { label: string; value: number; color: string }[];
  title?: string;
  totalLabel?: string;
}

// Lazy load Recharts to keep initial JS payload minimal and prevent SSR hydration mismatch
const DynamicPieChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } = mod;

      return function InnerPieChart({ data }: { data: ChartSlice[] }) {
        return (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
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
                height={36}
                formatter={(val) => (
                  <span className="text-xs font-semibold text-slate-700">{val}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => <ChartFallback />,
  }
);

function ChartFallback() {
  return (
    <div
      className="w-full h-[260px] flex items-center justify-center bg-slate-50/60 rounded-xl border border-slate-200/60 animate-pulse"
      aria-hidden="true"
    >
      <div className="w-32 h-32 rounded-full border-8 border-slate-200 border-t-emerald-500" />
    </div>
  );
}

export const FinancialBreakdownChart: React.FC<ChartProps> = ({
  data,
  slices,
  title = "Breakdown",
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const normalizedData: ChartSlice[] =
    data ||
    (slices
      ? slices.map((s) => ({ name: s.label, value: s.value, color: s.color }))
      : []);
  const total = normalizedData.reduce((acc, curr) => acc + curr.value, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="text-xs font-semibold text-slate-500">
          Total: {formatINR(total)}
        </span>
      </div>

      <div className="mt-3">
        {isMounted ? <DynamicPieChart data={normalizedData} /> : <ChartFallback />}
      </div>

      {/* Accessible data table for screen readers and search engines */}
      <table className="sr-only">
        <caption>{title} data table</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Amount</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {normalizedData.map((item) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
              <tr key={item.name}>
                <th scope="row">{item.name}</th>
                <td>{formatINR(item.value)}</td>
                <td>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
