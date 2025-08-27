import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Chart = ({ data }) => {
  const translateLabel = (value) => {
    if (value === "low") return "Baixa";
    if (value === "medium") return "Média";
    if (value === "high") return "Alta";
    if (value === "normal") return "Normal";
    return value;
  };

  return (
    <ResponsiveContainer width={"100%"} height={500}>
      <BarChart width={150} height={40} data={data}>
        <XAxis dataKey="name" tickFormatter={translateLabel} />
        <YAxis />
        <Tooltip
          cursor={false}
          contentStyle={{ textTransform: "capitalize" }}
          labelFormatter={translateLabel}
          formatter={(value, name) => [`Total: ${value}`, ""]}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="total" fill="#484948" />
      </BarChart>
    </ResponsiveContainer>
  );
};
