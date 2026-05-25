'use client';

/**
 * VersaSemiDonutChart — half-circle donut chart for Versa UI.
 *
 * Usage:
 * ```tsx
 * <VersaSemiDonutChart
 *   data={[
 *     { name: 'Segment 1', value: 416 },
 *     { name: 'Segment 2', value: 250 },
 *   ]}
 *   showTrack
 * />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Sector, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '../../../utils/cn';
import { getSeriesColor, prefersReducedMotion, resolveSegmentColors, formatPercentage } from '../utils/ChartUtils';
import { ChartEmptyState } from '../core/ChartEmptyState';
import { DonutLegend, type DonutLegendItem } from './DonutLegend';
import { useCssVarNumber } from '../hooks/useCssVarNumber';
import { useThemeChangeKey } from '../hooks/useThemeChangeKey';

const HOVER_EXPAND_PX = 4;
import { PieTooltipContent } from '../core/PieTooltip';
import type { VersaSemiDonutChartProps } from '../types/ChartTypes';

// Constants

const CHART_WIDTH = 240;
const CHART_HEIGHT = 128;
const OUTER_RADIUS = 112;
const INNER_RADIUS = 78;
const PADDING_ANGLE = 1.5;
const trackData = [{ name: 'track', value: 1 }];
const PADDED_WIDTH = CHART_WIDTH + HOVER_EXPAND_PX * 2;
const PADDED_HEIGHT = CHART_HEIGHT + HOVER_EXPAND_PX;

// VersaSemiDonutChart

export const VersaSemiDonutChart: React.FC<VersaSemiDonutChartProps> = ({
    data,
    size = 'large',
    legend = true,
    showTrack = false,
    total: totalProp,
    centerContent,
    className,
}) => {
    const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set());

    const handleToggle = useCallback((name: string) => {
        setHiddenSegments((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }, []);

    const coloredData = useMemo(() => resolveSegmentColors(data), [data]);
    const visibleData = useMemo(
        () => coloredData.filter((d) => !hiddenSegments.has(d.name)),
        [coloredData, hiddenSegments],
    );
    const total = useMemo(
        () => visibleData.reduce((sum, d) => sum + d.value, 0),
        [visibleData],
    );

    const legendItems: DonutLegendItem[] = useMemo(
        () => {
            const denominator = totalProp ?? coloredData.reduce((s, x) => s + x.value, 0);
            return coloredData.map((d) => ({
                name: d.name,
                value: d.value,
                formattedValue: formatPercentage(d.value, denominator),
                color: d.resolvedColor,
                isHidden: hiddenSegments.has(d.name),
            }));
        },
        [coloredData, hiddenSegments, totalProp],
    );

    const legendLayout = 'wrap';
    const reducedMotion = prefersReducedMotion();

    const baseData = useMemo(
        () => visibleData.map((d) => ({
            ...d,
            fill: getSeriesColor(d.resolvedColor),
            fillHover: getSeriesColor(d.resolvedColor, 'medium'),
        })),
        [visibleData],
    );

    const SEMI_START = 180;
    const SEMI_SWEEP = 180;
    const fillRatio = useMemo(
        () => (showTrack && totalProp != null && totalProp > 0)
            ? Math.min(total / totalProp, 1)
            : 1,
        [showTrack, totalProp, total],
    );
    const semiEndAngle = SEMI_START - SEMI_SWEEP * fillRatio;
    const pieData = baseData;

    const clipPrefix = useMemo(() => `sdc-${Math.random().toString(36).slice(2, 7)}`, []);
    const cornerRadius = useCssVarNumber('--corner-radius-default-small', 4);
    const themeKey = useThemeChangeKey();

    // Compute per-segment translation vector for outward hover effect.
    const segmentTranslations = useMemo(() => {
        const sweep = SEMI_START - semiEndAngle;
        const pieTotal = pieData.reduce((s, d) => s + d.value, 0);
        if (pieTotal === 0) return [];
        let cum = SEMI_START;
        return pieData.map((d) => {
            const seg = (d.value / pieTotal) * sweep;
            const mid = cum - seg / 2;
            cum -= seg;
            const rad = (mid * Math.PI) / 180;
            return {
                x: HOVER_EXPAND_PX * Math.cos(rad),
                y: -HOVER_EXPAND_PX * Math.sin(rad),
            };
        });
    }, [pieData, semiEndAngle]);

    // Empty state — placed after all hooks to satisfy React rules of hooks.
    if (!data.length || total === 0) {
        return <ChartEmptyState />;
    }

    const renderSectorWithGlow = (sectorProps: Record<string, unknown>) => {
        const {
            cx: sCx, cy: sCy, innerRadius: sIR, outerRadius: sOR,
            startAngle: sSA, endAngle: sEA, fill: sFill,
            cornerRadius: _sCR, ...sRest
        } = sectorProps;

        const n = (v: unknown) => Number(v);
        const clipId = `${clipPrefix}-${n(sSA).toFixed(0)}-${n(sEA).toFixed(0)}`;
        return (
            <g>
                <defs>
                    <clipPath id={clipId}>
                        <Sector
                            cx={n(sCx)} cy={n(sCy)}
                            innerRadius={n(sIR)} outerRadius={n(sOR)}
                            startAngle={n(sSA)} endAngle={n(sEA)}
                            cornerRadius={cornerRadius}
                        />
                    </clipPath>
                </defs>
                <Sector
                    {...(sRest as Record<string, unknown>)}
                    cx={n(sCx)} cy={n(sCy)}
                    innerRadius={n(sIR)} outerRadius={n(sOR)}
                    startAngle={n(sSA)} endAngle={n(sEA)}
                    fill={sFill as string}
                    cornerRadius={cornerRadius}
                    stroke="none"
                />
                <g clipPath={`url(#${clipId})`} style={{ pointerEvents: 'none' }}>
                    <Sector
                        cx={n(sCx)} cy={n(sCy)}
                        innerRadius={n(sIR)} outerRadius={n(sOR)}
                        startAngle={n(sSA)} endAngle={n(sEA)}
                        cornerRadius={cornerRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        style={{
                            strokeWidth: 'var(--effects-glow-inner-shadow-blur-medium)',
                            filter: 'blur(calc(var(--effects-glow-inner-shadow-blur-medium) / 2))',
                        }}
                    />
                </g>
            </g>
        );
    };

    const renderInactiveShape = (props: unknown) => {
        return renderSectorWithGlow(props as Record<string, unknown>);
    };

    return (
        <div className={cn('flex flex-col items-center gap-[var(--spacing-10)] w-full', className)}>
            <div
                className="relative overflow-hidden"
                data-donut-id={clipPrefix}
                style={{ width: PADDED_WIDTH, height: PADDED_HEIGHT }}
            >
                <PieChart width={PADDED_WIDTH} height={PADDED_WIDTH}>
                    {showTrack && (
                        <Pie
                            data={trackData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={INNER_RADIUS}
                            outerRadius={OUTER_RADIUS}
                            cornerRadius={cornerRadius}
                            startAngle={180}
                            endAngle={0}
                            isAnimationActive={false}
                            stroke="none"
                        >
                            <Cell
                                fill="var(--color-neutral-outline-subtlest)"
                                style={{ pointerEvents: 'none' }}
                            />
                        </Pie>
                    )}

                    <Pie
                        key={themeKey}
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={INNER_RADIUS}
                        outerRadius={OUTER_RADIUS}
                        cornerRadius={cornerRadius}
                        paddingAngle={pieData.length > 1 ? PADDING_ANGLE : 0}
                        startAngle={SEMI_START}
                        endAngle={semiEndAngle}
                        isAnimationActive={!reducedMotion}
                        animationDuration={600}
                        animationEasing="ease-out"
                        activeIndex={-1}
                        inactiveShape={renderInactiveShape}
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.fill}
                                style={{
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </Pie>
                    <RechartsTooltip
                        content={<PieTooltipContent />}
                        wrapperStyle={{ outline: 'none', zIndex: 10, pointerEvents: 'none' }}
                    />
                </PieChart>

                {centerContent && (
                    <div
                        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                        style={{ bottom: 0 }}
                        aria-hidden="true"
                    >
                        {centerContent(total)}
                    </div>
                )}

                <style>{`
                    [data-donut-id="${clipPrefix}"] .recharts-pie-sector {
                        transition: transform 200ms ease-out, filter 200ms ease-out;
                    }
                    [data-donut-id="${clipPrefix}"] .recharts-pie-sector:hover {
                        filter: drop-shadow(0 0 6px rgba(0,0,0,0.12));
                    }
                    ${segmentTranslations.map((t, i) => `
                    [data-donut-id="${clipPrefix}"] .recharts-pie:last-child .recharts-pie-sector:nth-child(${i + 1}):hover {
                        transform: translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px);
                    }
                    [data-donut-id="${clipPrefix}"] .recharts-pie:last-child .recharts-pie-sector:nth-child(${i + 1}):hover path {
                        fill: ${pieData[i]?.fillHover};
                    }`).join('')}
                `}</style>
            </div>

            {legend && (
                <DonutLegend
                    items={legendItems}
                    layout={legendLayout}
                    onToggle={handleToggle}
                />
            )}
        </div>
    );
};

VersaSemiDonutChart.displayName = 'VersaSemiDonutChart';
