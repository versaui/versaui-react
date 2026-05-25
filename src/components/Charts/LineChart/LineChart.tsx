'use client';

/**
 * VersaLineChart — composable line chart for Versa UI.
 *
 * Usage:
 * ```tsx
 * <ChartContainer size="large" aria-label="Revenue trends">
 *   <VersaLineChart data={data} variant="curvy">
 *     <ChartGrid horizontal />
 *     <ChartXAxis dataKey="month" />
 *     <ChartYAxis />
 *     <ChartTooltip />
 *     <ChartLine dataKey="series1" color="primary" name="Series 1" showArea />
 *     <ChartLine dataKey="series2" color="secondary" name="Series 2" showArea />
 *   </VersaLineChart>
 * </ChartContainer>
 * ```
 *
 * The legend is rendered automatically below the chart from the child
 * `<ChartLine>` definitions. Pass `legend={false}` to hide it.
 *
 * Area gradient `<defs>` are injected automatically for every series
 * that has `showArea` enabled — gradients reference CSS variables for
 * full theme adaptivity.
 */

import React, { useState, useCallback, useMemo, useId } from 'react';
import { ComposedChart, Line as RechartsLine, Area as RechartsArea } from 'recharts';
import { cn } from '../../../utils/cn';
import { ChartLegend } from '../core/ChartLegend';
import { getColorForIndex, getSeriesColor, isEmptyDataset, prefersReducedMotion } from '../utils/ChartUtils';
import { ChartEmptyState } from '../core/ChartEmptyState';
import type {
    ChartSeries,
    ChartLineProps,
    ChartColorToken,
    LineChartVariant,
    LineChartProps,
} from '../types/ChartTypes';

// Active dot — matches bar chart Figma node 1318:2326

const ACTIVE_DOT = {
    outerRadius: 6,   // 12px diameter
    innerRadius: 4,   // 8px diameter
    shadowDy: 3,
    shadowBlur: 6,
    shadowOpacity: 0.08,
} as const;

interface ActiveDotProps {
    cx?: number;
    cy?: number;
    colorToken: ChartColorToken;
}

const ActiveDot: React.FC<ActiveDotProps> = ({ cx = 0, cy = 0, colorToken }) => {
    const uniqueId = useId();
    const filterId = `line-dot-shadow-${uniqueId.replace(/:/g, '_')}`;
    const fill = getSeriesColor(colorToken, 'medium');

    return (
        <g filter={`url(#${filterId})`} style={{ pointerEvents: 'none' }}>
            <defs>
                <filter
                    id={filterId}
                    x="-150%"
                    y="-150%"
                    width="400%"
                    height="400%"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy={ACTIVE_DOT.shadowDy} />
                    <feGaussianBlur stdDeviation={ACTIVE_DOT.shadowBlur} />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${ACTIVE_DOT.shadowOpacity} 0`}
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                </filter>
            </defs>
            {/* Outer white circle — 12px diameter */}
            <circle
                cx={cx}
                cy={cy}
                r={ACTIVE_DOT.outerRadius}
                fill="var(--color-neutral-surface-base, white)"
            />
            {/* Inner brand-colored circle — 8px diameter */}
            <circle
                cx={cx}
                cy={cy}
                r={ACTIVE_DOT.innerRadius}
                fill={fill}
            />
        </g>
    );
};

// Curve type resolver

function resolveCurveType(variant: LineChartVariant): string {
    switch (variant) {
        case 'curvy':
            return 'natural';
        case 'zigzag':
            return 'linear';
        default:
            return 'natural';
    }
}

// ChartLine

export const ChartLine: React.FC<
    ChartLineProps & {
        /** Injected by parent VersaLineChart — do not set manually. */
        _variant?: LineChartVariant;
        /** Injected by parent VersaLineChart — auto-assigned color index. */
        _colorIndex?: number;
    }
> = ({
    dataKey,
    color,
    name,
    showArea = false,
    strokeWidth = 2,
    showActiveDot = true,
    connectNulls = true,
    _variant = 'curvy',
    _colorIndex = 0,
}) => {
    const resolvedColor = color || getColorForIndex(_colorIndex);
    const reducedMotion = typeof window !== 'undefined' ? prefersReducedMotion() : false;
    const curveType = resolveCurveType(_variant);
    const strokeColor = getSeriesColor(resolvedColor, 'medium');
    const gradientId = `line-area-gradient-${resolvedColor}-${dataKey}`;

    return (
        <>
            {/* Area fill beneath the line — conditional */}
            {showArea && (
                <RechartsArea
                    type={curveType as 'natural' | 'linear'}
                    dataKey={dataKey}
                    name={name || dataKey}
                    stroke="none"
                    fill={`url(#${gradientId})`}
                    fillOpacity={1}
                    connectNulls={connectNulls}
                    isAnimationActive={!reducedMotion}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    /* Hide from legend — the Line handles legend registration */
                    legendType="none"
                />
            )}

            {/* Line stroke */}
            <RechartsLine
                type={curveType as 'natural' | 'linear'}
                dataKey={dataKey}
                name={name || dataKey}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                dot={false}
                activeDot={
                    showActiveDot
                        ? (props: unknown) => {
                              const p = props as Record<string, unknown>;
                              return (
                                  <ActiveDot
                                      cx={p.cx as number}
                                      cy={p.cy as number}
                                      colorToken={resolvedColor}
                                  />
                              );
                          }
                        : false
                }
                connectNulls={connectNulls}
                isAnimationActive={!reducedMotion}
                animationDuration={800}
                animationEasing="ease-out"
            />
        </>
    );
};

ChartLine.displayName = 'ChartLine';

// Helpers

interface ExtractedLineSeries extends ChartSeries {
    showArea: boolean;
}

/**
 * Extract series definitions from ChartLine children so the legend and
 * gradient defs can be auto-generated.
 */
function extractSeriesFromChildren(children: React.ReactNode): ExtractedLineSeries[] {
    const series: ExtractedLineSeries[] = [];
    let colorIdx = 0;

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const props = child.props as Partial<ChartLineProps>;
        if (props.dataKey) {
            series.push({
                dataKey: props.dataKey,
                name: props.name || props.dataKey,
                color: (props.color as ChartColorToken) || getColorForIndex(colorIdx),
                showArea: props.showArea || false,
            });
            colorIdx++;
        }
    });

    return series;
}

// Area gradient defs

/**
 * Renders `<linearGradient>` definitions inside `<defs>` for each series
 * that has `showArea` enabled.
 *
 * Gradients use `getSeriesColor(token, 'medium')` at 20% opacity at the top
 * and 0% opacity at the bottom — this creates the soft fade matching Figma.
 * Because the stop-color references a CSS variable, the gradient adapts
 * automatically on theme switch.
 */
const AreaGradientDefs: React.FC<{ series: ExtractedLineSeries[] }> = ({ series }) => {
    const areaSeries = series.filter((s) => s.showArea);
    if (areaSeries.length === 0) return null;

    return (
        <defs>
            {areaSeries.map((s) => {
                const gradientId = `line-area-gradient-${s.color}-${s.dataKey}`;
                const color = getSeriesColor(s.color, 'medium');
                return (
                    <linearGradient
                        key={gradientId}
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                );
            })}
        </defs>
    );
};

// VersaLineChart

export interface VersaLineChartProps extends LineChartProps {
    /** Whether to show the auto-generated legend. Default: true. */
    legend?: boolean;
    /** Legend size override. Defaults to 'small' for medium charts, 'default' for large. */
    legendSize?: 'default' | 'small';
}

export const VersaLineChart: React.FC<VersaLineChartProps> = ({
    data,
    variant = 'curvy',
    size = 'large',
    children,
    className,
    legend = true,
    legendSize,
}) => {
    // Hidden series for legend toggle.
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

    const handleToggleSeries = useCallback((dataKey: string) => {
        setHiddenSeries((prev) => {
            const next = new Set(prev);
            if (next.has(dataKey)) {
                next.delete(dataKey);
            } else {
                next.add(dataKey);
            }
            return next;
        });
    }, []);

    // Extract series from ChartLine children.
    const series = useMemo(
        () => extractSeriesFromChildren(children),
        [children],
    );

    // Filter data for hidden series — set hidden series values to null
    // so Recharts still renders categories but skips hidden lines.
    const filteredData = useMemo(() => {
        if (!data || hiddenSeries.size === 0) return data || [];
        return data.map((point) => {
            const filtered = { ...point };
            hiddenSeries.forEach((key) => {
                filtered[key] = null;
            });
            return filtered;
        });
    }, [data, hiddenSeries]);

    const resolvedLegendSize = legendSize || (size === 'medium' ? 'small' : 'default');

    // Handle empty data.
    if (isEmptyDataset(data)) {
        return <ChartEmptyState />;
    }

    // Clone ChartLine children to inject the variant prop and auto-assigned color index.
    const enhancedChildren = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const props = child.props as Partial<ChartLineProps>;
        if (props.dataKey) {
            const sIndex = series.findIndex((s) => s.dataKey === props.dataKey);
            return React.cloneElement(child as React.ReactElement, {
                _variant: variant,
                _colorIndex: sIndex >= 0 ? sIndex : 0,
            } as Record<string, unknown>);
        }
        return child;
    });

    return (
        <div className={cn('flex flex-col gap-[var(--spacing-6)] w-full', className)}>
            <ComposedChart
                data={filteredData}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
                {/* Area gradient definitions — injected before children */}
                <AreaGradientDefs series={series} />

                {enhancedChildren}
            </ComposedChart>

            {legend && series.length > 1 && (
                <ChartLegend
                    size={resolvedLegendSize}
                    markerStyle="horizontal-line"
                    series={series}
                    onToggle={handleToggleSeries}
                    hiddenSeries={hiddenSeries}
                />
            )}
        </div>
    );
};

VersaLineChart.displayName = 'VersaLineChart';
