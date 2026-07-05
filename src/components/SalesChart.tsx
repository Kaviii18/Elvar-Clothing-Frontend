// src/components/SalesChart.tsx
// ----------------------------------------------------------
// Élvar Clothing — Admin Sales Chart
// Recharts AreaChart + BarChart toggle, dark luxury theme.
// ----------------------------------------------------------

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  BarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SalesDataPoint {
  name: string;
  sales: number;
  orders?: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  title?: string;
  subtitle?: string;
  currency?: string;
  height?: number;
}

// FIX 1: Define an explicit, self-contained props interface instead of
// extending TooltipProps<number, string>. Recharts' PropertiesReadFromContext
// strips 'payload' and 'label' from the public-facing TooltipProps type,
// causing TS2339. Owning the interface directly avoids that.
interface ElvarTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
  currency: string;
}

// ─── Élvar Design Tokens ────────────────────────────────────────────────────

const TOKENS = {
  bg:          '#14120f',
  surface:     '#1a1714',
  card:        '#211e1a',
  border:      '#2e2a25',
  cream:       '#F0EBE1',
  muted:       '#7a7068',
  gold:        '#c9a84c',
  goldLight:   '#e2c882',
  green:       '#4ade80',
  gridLine:    'rgba(255,255,255,0.04)',
};

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

// FIX 2: Component now uses ElvarTooltipProps — 'payload' and 'label' are
// fully visible to TypeScript, and the entry type in .map() is inferred
// correctly, eliminating TS2339 and TS7006.
const ElvarTooltip = ({
  active,
  payload,
  label,
  currency,
}: ElvarTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: TOKENS.card,
        border: `1px solid ${TOKENS.border}`,
        padding: '12px 16px',
        borderRadius: 0,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        minWidth: 150,
      }}
    >
      <p
        style={{
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: TOKENS.muted,
          marginBottom: 8,
          fontFamily: 'inherit',
        }}
      >
        {label}
      </p>

      {/* FIX 3: 'entry' is now typed via ElvarTooltipProps['payload'][number],
          so no implicit 'any' (TS7006 resolved). */}
      {payload.map((entry) => (
        <div
          key={String(entry.dataKey)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: TOKENS.muted,
              textTransform: 'capitalize',
              fontFamily: 'inherit',
            }}
          >
            {entry.name === 'sales' ? 'Revenue' : 'Orders'}
          </span>
          <span
            style={{
              fontSize: 13,
              color: entry.name === 'sales' ? TOKENS.gold : TOKENS.green,
              fontWeight: 600,
              marginLeft: 'auto',
              paddingLeft: 16,
              fontFamily: 'inherit',
            }}
          >
            {entry.name === 'sales'
              ? `${currency} ${Number(entry.value).toLocaleString('en-LK')}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Tick Formatters ────────────────────────────────────────────────────────

const yTickFormatter = (value: number, currency: string): string => {
  if (value >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${currency} ${(value / 1_000).toFixed(0)}k`;
  return `${currency} ${value}`;
};

// ─── Legend Renderer ────────────────────────────────────────────────────────

const renderLegend = (props: { payload?: { value: string; color: string }[] }) => {
  const { payload = [] } = props;
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', paddingRight: 8 }}>
      {payload.map((entry) => (
        <span
          key={entry.value}
          style={{
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: TOKENS.muted,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 12,
              height: 2,
              background: entry.color,
              display: 'inline-block',
              borderRadius: 2,
            }}
          />
          {entry.value === 'sales' ? 'Revenue' : 'Orders'}
        </span>
      ))}
    </div>
  );
};

// ─── Chart Component ────────────────────────────────────────────────────────

const SalesChart = ({
  data,
  title = 'Revenue Overview',
  subtitle,
  currency = 'Rs.',
  height = 320,
}: SalesChartProps) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const hasOrders = useMemo(() => data.some((d) => d.orders !== undefined), [data]);

  const axisStyle = { fontSize: 10, fill: TOKENS.muted, fontFamily: 'inherit' };

  const sharedProps = {
    data,
    margin: { top: 10, right: 10, left: 10, bottom: 0 },
  };

  const gradId = 'elvarSalesGrad';
  const gradIdOrders = 'elvarOrdersGrad';

  // FIX 4: Cast the recharts-injected props to ElvarTooltipProps at each
  // Tooltip content call site. This breaks the unresolved ValueType/NameType
  // generic chain that caused TS2322 on lines 315 and 377.
  const tooltipContent = (props: unknown) => (
    <ElvarTooltip {...(props as ElvarTooltipProps)} currency={currency} />
  );

  return (
    <div
      style={{
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.border}`,
        padding: '24px 24px 16px',
        width: '100%',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: TOKENS.muted,
              marginBottom: 4,
            }}
          >
            {subtitle ?? 'Analytics'}
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 300,
              color: TOKENS.cream,
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </p>
        </div>

        {/* Toggle buttons */}
        <div style={{ display: 'flex', gap: 0 }}>
          {(['area', 'bar'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '6px 14px',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: `1px solid ${TOKENS.border}`,
                background: chartType === type ? TOKENS.gold : 'transparent',
                color: chartType === type ? TOKENS.bg : TOKENS.muted,
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'area' ? (
          <AreaChart {...sharedProps}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={TOKENS.gold}  stopOpacity={0.25} />
                <stop offset="95%" stopColor={TOKENS.gold}  stopOpacity={0.01} />
              </linearGradient>
              {hasOrders && (
                <linearGradient id={gradIdOrders} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={TOKENS.green} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={TOKENS.green} stopOpacity={0.01} />
                </linearGradient>
              )}
            </defs>

            <CartesianGrid stroke={TOKENS.gridLine} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={axisStyle}
              axisLine={{ stroke: TOKENS.border }}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v) => yTickFormatter(v, currency)}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={72}
              yAxisId="sales"
            />
            {hasOrders && (
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ ...axisStyle }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
            )}

            <Tooltip content={tooltipContent} cursor={{ stroke: TOKENS.border, strokeWidth: 1 }} />
            {hasOrders && (
              <Legend content={(props) => renderLegend(props as { payload?: { value: string; color: string }[] })} />
            )}

            <Area
              yAxisId="sales"
              type="monotone"
              dataKey="sales"
              stroke={TOKENS.gold}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, fill: TOKENS.gold, stroke: TOKENS.bg, strokeWidth: 2 }}
            />
            {hasOrders && (
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke={TOKENS.green}
                strokeWidth={1.5}
                fill={`url(#${gradIdOrders})`}
                dot={false}
                activeDot={{ r: 3, fill: TOKENS.green, stroke: TOKENS.bg, strokeWidth: 2 }}
                strokeDasharray="4 3"
              />
            )}
          </AreaChart>
        ) : (
          <BarChart {...sharedProps} barCategoryGap="35%">
            <CartesianGrid stroke={TOKENS.gridLine} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={axisStyle}
              axisLine={{ stroke: TOKENS.border }}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v) => yTickFormatter(v, currency)}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={72}
              yAxisId="sales"
            />
            {hasOrders && (
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={36}
              />
            )}

            <Tooltip content={tooltipContent} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            {hasOrders && (
              <Legend content={(props) => renderLegend(props as { payload?: { value: string; color: string }[] })} />
            )}

            <Bar yAxisId="sales" dataKey="sales" fill={TOKENS.gold} opacity={0.85} radius={[2, 2, 0, 0]} />
            {hasOrders && (
              <Bar yAxisId="orders" dataKey="orders" fill={TOKENS.green} opacity={0.6} radius={[2, 2, 0, 0]} />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* ── Footer rule ── */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${TOKENS.border}`,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: 9, letterSpacing: '0.1em', color: TOKENS.muted, textTransform: 'uppercase' }}>
          Élvar Clothing · Admin
        </span>
      </div>
    </div>
  );
};

export default SalesChart;