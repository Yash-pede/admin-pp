import dayjs from "dayjs";
import { AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const AreaChartBig = ({
  data,
  XDataKey,
  dataKey,
  dataKey2,
}: {
  data: Array<any>;
  XDataKey: string;
  dataKey: string;
  dataKey2?: string;
}) => {
  const isValidDate = (date: any) => {
    return dayjs(date).isValid();
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            opacity: 0.9,
            maxWidth: "300px",
            color: "black",
            border: "1px solid #8884d8",
            borderRadius: "7px",
          }}
        >
          <h4 style={{ fontSize: "18px", fontWeight: "bold" }}>
            {isValidDate(label) ? dayjs(label).format("MMMM") : label}
          </h4>
          <hr />
          <p style={{ fontSize: "16px", fontWeight: "semibold" }}>
            {dataKey}: {payload[0].value}
          </p>
          {dataKey2 && (
            <p style={{ fontSize: "16px", fontWeight: "semibold" }}>
              {dataKey2}: {payload[1].value}
            </p>
          )}
          {/* {JSON.stringify(payload[0].payload, null, 2)} */}
        </div>
      );
    }

    return null;
  };
  return (
    <AreaChart
      width={750}
      height={350}
      data={data}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* <CartesianGrid st rokeDasharray="3 3" /> */}
      <XAxis
        dataKey={XDataKey}
        tickFormatter={(x) => {
          if (isValidDate(x)) {
            return dayjs(x).format("MMM YYYY");
          }
          return x;
        }}
      />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke="#8884d8"
        fillOpacity={1}
        fill="url(#colorUv)"
      />
      {!!dataKey2 && (
        <Area
          type="monotone"
          dataKey={dataKey2}
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorPv)"
        />
      )}
    </AreaChart>
  );
};
