"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";

const TOKENOMICS = [
  { name: "Liquidez (PancakeSwap)", value: 40, color: "#2E6BFF" },
  { name: "Ecosistema y Pagos", value: 25, color: "#D4B06A" },
  { name: "Marketing", value: 15, color: "#2DD4A7" },
  { name: "Equipo (Vesting)", value: 10, color: "#4D85FF" },
  { name: "Reserva Estratégica", value: 10, color: "#E8C98A" },
];

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

function CustomLabel({ cx, cy, midAngle, outerRadius, percent, name }: LabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--muted-foreground)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] sm:text-xs"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-popover px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: d.payload.color }}
        />
        <span className="text-xs font-medium text-foreground">{d.name}</span>
      </div>
      <p className="mt-1 font-mono text-sm text-foreground">
        {d.value}% — {(d.value * 5_000_000).toLocaleString("en-US")} SERVI
      </p>
    </div>
  );
}

export function TokenomicsSection() {
  return (
    <section id="tokenomics" className="relative border-t border-white/5 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="DISTRIBUCIÓN DE TOKENS"
            title="Tokenomics de SERVI"
            description="500,000,000 SERVI distribuidos estratégicamente para asegurar el crecimiento y la liquidez del ecosistema."
          />
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 items-center">
          {/* Chart */}
          <Reveal delay={0.1}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="h-[320px] sm:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={TOKENOMICS}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={CustomLabel}
                        stroke="none"
                      >
                        {TOKENOMICS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Legend + Details */}
          <Reveal delay={0.15}>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Supply Total
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-foreground">
                  500,000,000
                </p>
                <p className="mt-1 text-sm text-muted-foreground">SERVI tokens (BEP-20)</p>
              </div>

              {TOKENOMICS.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {item.value}%
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {(item.value * 5_000_000).toLocaleString("en-US")} SERVI
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
