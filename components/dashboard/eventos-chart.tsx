"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function EventosChart({
  data,
}: {
  data: { name: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-500">
        Ainda não há eventos suficientes para o gráfico.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#78716c" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#78716c" />
          <Tooltip
            formatter={(value) => [value ?? 0, "Eventos"]}
            contentStyle={{ borderRadius: 12, borderColor: "#e7e5e4" }}
          />
          <Bar dataKey="total" fill="#2d6a4f" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
