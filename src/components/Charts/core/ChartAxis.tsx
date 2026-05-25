'use client';

/**
 * ChartXAxis / ChartYAxis — token-driven axis components.
 * Typography: `text-b4` on desktop, `text-b5` on mobile (≤767px).
 * Color: `--color-neutral-text-subtle`.
 */

import React from 'react';
import { XAxis, YAxis } from 'recharts';
import { truncateLabel, formatAxisValue } from '../utils/ChartUtils';
import { useIsMobile } from '../hooks/useIsMobile';
import type { ChartXAxisProps, ChartYAxisProps } from '../types/ChartTypes';

// --- Shared axis style tokens ---

const AXIS_TICK_STYLE: React.CSSProperties = {
    fontFamily: 'var(--typescale-b4-font-family)',
    fontSize: 'var(--typescale-b4-size)',
    fontWeight: 'var(--typescale-b4-weight)' as unknown as number,
    fill: 'var(--color-neutral-text-subtle)',
    letterSpacing: 'var(--typescale-b4-letter-spacing)',
};

/** Mobile: one composite size smaller (text-b5, ~12px). */
const AXIS_TICK_STYLE_MOBILE: React.CSSProperties = {
    fontFamily: 'var(--typescale-b5-font-family)',
    fontSize: 'var(--typescale-b5-size)',
    fontWeight: 'var(--typescale-b5-weight)' as unknown as number,
    fill: 'var(--color-neutral-text-subtle)',
    letterSpacing: 'var(--typescale-b5-letter-spacing)',
};

// --- Custom tick renderers ---

interface CustomXTickProps {
    x?: number;
    y?: number;
    payload?: { value: string | number };
    maxLabelLength: number;
    formatter?: (value: string | number) => string;
    tickStyle: React.CSSProperties;
}

const CustomXTick: React.FC<CustomXTickProps> = ({
    x,
    y,
    payload,
    maxLabelLength,
    formatter,
    tickStyle,
}) => {
    if (!payload) return null;

    const formatted = formatAxisValue(payload.value, formatter);
    const label = truncateLabel(formatted, maxLabelLength);

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16}
                textAnchor="middle"
                style={tickStyle}
                aria-label={formatted}
            >
                {label}
            </text>
        </g>
    );
};

interface CustomYTickProps {
    x?: number;
    y?: number;
    payload?: { value: number };
    formatter?: (value: number) => string;
    tickStyle: React.CSSProperties;
}

const CustomYTick: React.FC<CustomYTickProps> = ({
    x,
    y,
    payload,
    formatter,
    tickStyle,
}) => {
    if (!payload) return null;

    const label = formatter
        ? formatter(payload.value)
        : String(payload.value);

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={4}
                textAnchor="end"
                style={tickStyle}
                aria-label={label}
            >
                {label}
            </text>
        </g>
    );
};

// --- Exported components ---

export const ChartXAxis: React.FC<ChartXAxisProps> = ({
    dataKey,
    maxLabelLength = 8,
    formatter,
    hide = false,
}) => {
    const isMobile = useIsMobile();
    const tickStyle = isMobile ? AXIS_TICK_STYLE_MOBILE : AXIS_TICK_STYLE;

    if (hide) return null;

    return (
        <XAxis
            dataKey={dataKey}
            tickLine={false}
            axisLine={false}
            tick={(props: unknown) => (
                <CustomXTick
                    {...(props as CustomXTickProps)}
                    maxLabelLength={maxLabelLength}
                    formatter={formatter}
                    tickStyle={tickStyle}
                />
            )}
            interval="preserveStartEnd"
        />
    );
};

ChartXAxis.displayName = 'ChartXAxis';

export const ChartYAxis: React.FC<ChartYAxisProps> = ({
    formatter,
    width = 40,
    hide = false,
}) => {
    const isMobile = useIsMobile();
    const tickStyle = isMobile ? AXIS_TICK_STYLE_MOBILE : AXIS_TICK_STYLE;
    const resolvedWidth = isMobile ? Math.min(width, 32) : width;

    if (hide) return null;

    return (
        <YAxis
            width={resolvedWidth}
            tickLine={false}
            axisLine={false}
            tick={(props: unknown) => (
                <CustomYTick
                    {...(props as CustomYTickProps)}
                    formatter={formatter}
                    tickStyle={tickStyle}
                />
            )}
        />
    );
};

ChartYAxis.displayName = 'ChartYAxis';

