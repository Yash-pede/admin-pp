import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
} from "recharts";

const BarChartTiny = ({ data }: { data: Array<any> }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF0080"];

  return (
    <BarChart
      width={350}
      height={Math.min(data.length * 40, 400)}
      data={data}
      layout="vertical"
    >
      <XAxis type="number" />
      <YAxis type="category" dataKey="name" width={100} />

      <Bar dataKey="value" fill="#8884d8" barSize={12}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  );
};

export default BarChartTiny;
