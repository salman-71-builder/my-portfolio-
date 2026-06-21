"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatTaka, formatTakaCompact } from "@/lib/finance";

const AXIS = { fontSize: 11, fill: "#666666" };
const taka = (v: unknown) => formatTaka(Number(v));

export interface MonthPoint {
  label: string;
  revenue: number;
  profit: number;
}
export interface NamedValue {
  name: string;
  value: number;
  color?: string;
}
export interface DayPoint {
  day: string;
  revenue: number;
}

/** Revenue (and profit) over the last 12 months. */
export function RevenueLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatTakaCompact}
        />
        <Tooltip formatter={taka} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#1a2f5e"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Net Profit"
          stroke="#c0392b"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Profit by month (bar, red when negative). */
export function ProfitBarChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatTakaCompact}
        />
        <Tooltip formatter={taka} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="profit" name="Net Profit" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.profit >= 0 ? "#16a34a" : "#dc2626"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Pie chart of expense breakdown. */
export function ExpensePie({ data }: { data: NamedValue[] }) {
  const has = data.some((d) => d.value > 0);
  if (!has) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No costs recorded for this period.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data.filter((d) => d.value > 0)}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={48}
          paddingAngle={2}
        >
          {data
            .filter((d) => d.value > 0)
            .map((d, i) => (
              <Cell key={i} fill={d.color ?? "#64748b"} />
            ))}
        </Pie>
        <Tooltip formatter={taka} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bar — works for category sales and best sellers. */
export function HBarChart({
  data,
  color = "#1a2f5e",
}: {
  data: NamedValue[];
  color?: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No sales in this period.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 38)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatTakaCompact}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip formatter={taka} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Daily sales for the current month. */
export function DailySalesChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="day" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatTakaCompact}
        />
        <Tooltip formatter={taka} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar
          dataKey="revenue"
          name="Revenue"
          radius={[4, 4, 0, 0]}
          fill="#c0392b"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
