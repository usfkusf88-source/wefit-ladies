"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Brand-forward categorical palette (pink-led, accessible on white).
const PALETTE = ["#E14FA0", "#F472B6", "#BE185D", "#F9A8D4", "#9333EA", "#6366F1", "#0EA5E9", "#14B8A6", "#F59E0B", "#64748B", "#0A0A0B"];

function ChartCard({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      {empty ? (
        <div className="flex h-56 items-center justify-center text-sm text-zinc-400">لا توجد بيانات بعد</div>
      ) : (
        <div className="h-56 w-full" dir="ltr">
          {children}
        </div>
      )}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #E4E4E7",
    fontSize: 12,
    fontFamily: "var(--font-cairo)",
  },
} as const;

export function GrowthChart({ data }: { data: { label: string; count: number }[] }) {
  const empty = data.every((d) => d.count === 0);
  return (
    <ChartCard title="نمو التسجيلات اليومي (آخر 30 يوم)" empty={empty}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="pinkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E14FA0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#E14FA0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#A1A1AA" }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#A1A1AA" }} allowDecimals={false} tickLine={false} axisLine={false} width={30} />
          <Tooltip {...tooltipStyle} />
          <Area type="monotone" dataKey="count" name="تسجيلات" stroke="#E14FA0" strokeWidth={2.5} fill="url(#pinkFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function BarList({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <ChartCard title={title} empty={data.length === 0}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            tick={{ fontSize: 11, fill: "#52525B" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip {...tooltipStyle} cursor={{ fill: "#FBEAF3" }} />
          <Bar dataKey="value" name="عدد" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DonutChart({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-zinc-400">لا توجد بيانات بعد</div>
      ) : (
        <>
          <div className="h-48 w-full" dir="ltr">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={2}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
            {data.map((d, i) => (
              <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
