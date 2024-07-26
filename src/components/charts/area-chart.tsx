import {
  AreaChart,
  Area,
} from "recharts";

const TinyAreaChart = ({ data, dataKey }: { data: Array<any>; dataKey: string }) => {
  return (
    <AreaChart
      width={200}
      height={55}
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <Area type="monotone" dataKey={dataKey} stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  );
};

export default TinyAreaChart;
