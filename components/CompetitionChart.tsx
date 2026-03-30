'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

type Point = {
  timestamp: string;
  [key: string]: string | number;
};

export function CompetitionChart({ data, seriesKeys }: { data: Point[]; seriesKeys: string[] }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="timestamp" tick={{ fill: '#9fb0d0', fontSize: 12 }} />
          <YAxis tick={{ fill: '#9fb0d0', fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {seriesKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              strokeWidth={2}
              dot={false}
              stroke={["#6ea8fe", "#82ca9d", "#ffc658", "#ff7c7c", "#a78bfa", "#34d399"][index % 6]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
