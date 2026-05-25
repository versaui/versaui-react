'use client';

/**
 * VersaGaugeChart — production-grade radial bar (gauge) chart for Versa UI.
 *
 * Matches Figma nodes:
 *   46:2778 — Gauge Chart (all variants)
 *   2570:14981 — Gauge Chart with Legend
 *
 * Built on Recharts RadialBarChart / RadialBar for concentric ring rendering.
 *
 * Usage:
 * ```tsx
 * <VersaGaugeChart
 *   size="large"
 *   rings={[
 *     { value: 375, max: 1000, label: 'Active users', color: 'primary' },
 *     { value: 750, max: 1000, label: 'Sessions', color: 'secondary' },
 *     { value: 875, max: 1000, label: 'Conversions', color: 'tertiary' },
 *   ]}
 *   legend
 * />
 * ```
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, Tooltip as RechartsTooltip, Sector } from 'recharts';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import {
    getSeriesColor,
    getColorForIndex,
    getTrackColor,
    clamp,
    formatPercentage,
    prefersReducedMotion,
} from '../utils/ChartUtils';
import { ChartEmptyState } from '../core/ChartEmptyState';
import { DonutLegend, type DonutLegendItem } from '../DonutChart/DonutLegend';
import { useCssVarNumber } from '../hooks/useCssVarNumber';
import { useThemeChangeKey } from '../hooks/useThemeChangeKey';
import { PieTooltipContent } from '../core/PieTooltip';
import type {
    GaugeChartProps,
    GaugeRing,
    GaugeChartSize,
    ChartColorToken,
} from '../types/ChartTypes';
import { useIsMobile } from '../hooks/useIsMobile';

// GaugeRingShape — custom sector shape for gauge chart foreground rings.

export interface GaugeRingShapeProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
    cornerRadius?: number;
    forceCornerRadius?: boolean;
    [key: string]: unknown;
}

export const GaugeRingShape: React.FC<GaugeRingShapeProps> = (props) => {
    const {
        cx, cy, innerRadius, outerRadius,
        startAngle, endAngle, fill, cornerRadius,
        forceCornerRadius,
        ...rest
    } = props;

    const [isHovered, setIsHovered] = useState(false);

    const n = (v: unknown) => Number(v);
    const clipId = useMemo(
        () => `gauge-${Math.random().toString(36).slice(2, 7)}-${n(startAngle).toFixed(0)}-${n(endAngle).toFixed(0)}`,
        [startAngle, endAngle],
    );

    // Strip non-SVG props that Recharts passes through
    const {
        payload: _p, value: _v, background: _b,
        animationBegin: _ab, animationDuration: _ad,
        animationEasing: _ae, isAnimationActive: _ia,
        ...sectorRest
    } = rest;

    // Hover fill from data payload
    const payload = _p as { fillHover?: string } | undefined;
    const activeFill = isHovered && payload?.fillHover ? payload.fillHover : fill;

    return (
        <g
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ClipPath for inner glow masking */}
            <defs>
                <clipPath id={clipId}>
                    <Sector
                        cx={n(cx)}
                        cy={n(cy)}
                        innerRadius={n(innerRadius)}
                        outerRadius={n(outerRadius)}
                        startAngle={n(startAngle)}
                        endAngle={n(endAngle)}
                        cornerRadius={cornerRadius}
                        forceCornerRadius={forceCornerRadius}
                    />
                </clipPath>
            </defs>

            {/* Main sector */}
            <Sector
                {...(sectorRest as Record<string, unknown>)}
                cx={n(cx)}
                cy={n(cy)}
                innerRadius={n(innerRadius)}
                outerRadius={n(outerRadius)}
                startAngle={n(startAngle)}
                endAngle={n(endAngle)}
                fill={activeFill as string}
                cornerRadius={cornerRadius}
                forceCornerRadius={forceCornerRadius}
                stroke="none"
            />

            {/* Inner glow: white stroke clipped to sector interior */}
            <g clipPath={`url(#${clipId})`} style={{ pointerEvents: 'none' }}>
                <Sector
                    cx={n(cx)}
                    cy={n(cy)}
                    innerRadius={n(innerRadius)}
                    outerRadius={n(outerRadius)}
                    startAngle={n(startAngle)}
                    endAngle={n(endAngle)}
                    cornerRadius={cornerRadius}
                    forceCornerRadius={forceCornerRadius}
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

GaugeRingShape.displayName = 'GaugeRingShape';

// Size configuration — from Figma 46:2778

/**
 * Ring geometry per size variant.
 *
 * Derived from Figma SVG circle measurements (scaled +20%):
 *   default: baseInner=54, ringStep=12, barSize=6
 *   large:   baseInner=62, ringStep=14, barSize=8
 */
interface SizeConfig {
    /** Inner edge radius of the innermost ring. */
    baseInnerRadius: number;
    /** Radial step between ring centers (center-to-center distance). */
    ringStep: number;
    /** Visual stroke width (bar thickness) for each ring. */
    barSize: number;
    /** Chart diameter when rendering 2 rings. */
    chartSize2: number;
    /** Chart diameter when rendering 3 rings. */
    chartSize3: number;
    /** Center label container width. */
    centerWidth: number;
    /** CSS class for the value text. */
    valueClass: string;
    /** CSS class for the subtitle text. */
    subtitleClass: string;
}

const SIZE_CONFIGS: Record<GaugeChartSize, SizeConfig> = {
    default: {
        baseInnerRadius: 54,
        ringStep: 12,
        barSize: 6,
        chartSize2: 162,
        chartSize3: 190,
        centerWidth: 86,
        valueClass: 'text-h7',
        subtitleClass: 'text-b6',
    },
    large: {
        baseInnerRadius: 62,
        ringStep: 14,
        barSize: 8,
        chartSize2: 180,
        chartSize3: 212,
        centerWidth: 96,
        valueClass: 'text-h6',
        subtitleClass: 'text-b5',
    },
};

// Container variant (cva)

const containerVariants = cva(
    'relative flex flex-col items-center w-full',
    {
        variants: {
            size: {
                default: 'gap-[var(--spacing-6)]',
                large: 'gap-[var(--spacing-8)]',
            },
        },
        defaultVariants: { size: 'large' },
    },
);

// Helpers

function resolveColor(ring: GaugeRing, index: number): ChartColorToken {
    return ring.color || getColorForIndex(index);
}

// Loading State (gauge-specific skeleton)

const GaugeLoadingState: React.FC<{ size: GaugeChartSize }> = ({ size }) => {
    const config = SIZE_CONFIGS[size];
    const chartSize = config.chartSize3;
    const center = chartSize / 2;

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: chartSize, height: chartSize }}
            role="status"
            aria-label="Loading gauge chart"
        >
            <svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`}>
                {[0, 1, 2].map((i) => {
                    const radius = config.baseInnerRadius + config.barSize / 2 + i * config.ringStep;
                    const circumference = 2 * Math.PI * radius;
                    return (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke="var(--color-neutral-surface-medium)"
                            strokeWidth={config.barSize}
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * 0.25}
                            strokeLinecap="round"
                            className="animate-pulse motion-reduce:animate-none"
                            style={{
                                transformOrigin: 'center',
                                transform: 'rotate(-90deg)',
                                animationDelay: `${i * 100}ms`,
                            }}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

// VersaGaugeChart

export const VersaGaugeChart: React.FC<GaugeChartProps> = ({
    rings,
    size = 'large',
    legend = false,
    showCenterLabel = true,
    centerValue,
    centerSubtitle,
    centerContent,
    roundedCaps = true,
    loading = false,
    animated = true,
    'aria-label': ariaLabel,
    className,
}) => {
    const isMobile = useIsMobile();
    const config = SIZE_CONFIGS[size];
    const reducedMotion = prefersReducedMotion();
    const shouldAnimate = animated && !reducedMotion;

    // Read corner-radius token reactively (changes with theme).
    const cornerRadius = useCssVarNumber('--corner-radius-default-small', 4);

    // Force remount on theme change to replay reveal animation.
    const themeKey = useThemeChangeKey();

    // Ref for the chart container — used to patch background fill colors.
    const chartRef = useRef<HTMLDivElement>(null);

    // Resolve colors and compute chart data.
    // RadialBarChart expects data in reverse order: outermost ring first in data array.
    const ringCount = rings ? rings.length : 0;
    const chartSize = ringCount >= 3
        ? config.chartSize3
        : config.chartSize2;

    // Compute dynamic chart size for >3 rings
    const dynamicChartSize = ringCount > 3
        ? config.chartSize3 + (ringCount - 3) * config.ringStep * 2
        : chartSize;

    const radialData = useMemo(() => {
        if (!rings || rings.length === 0) return [];
        // Reverse so outermost ring (last in user's array) is rendered outermost
        return [...rings].reverse().map((ring, reversedIndex) => {
            const originalIndex = rings.length - 1 - reversedIndex;
            const colorToken = resolveColor(ring, originalIndex);
            const max = ring.max ?? 100;
            const clamped = clamp(ring.value ?? 0, 0, max);
            // Convert to percentage for RadialBarChart (domain 0–100)
            const pct = max === 0 ? 0 : (clamped / max) * 100;

            return {
                name: ring.label,
                label: ring.label,
                value: pct,
                rawValue: clamped,
                max,
                pct,
                displayValue: formatPercentage(clamped, max),
                fill: getSeriesColor(colorToken, 'medium'),
                fillHover: getSeriesColor(colorToken, 'strong'),
                trackFill: getTrackColor(colorToken),
                colorToken,
            };
        });
    }, [rings, themeKey]);

    // Compute inner/outer radius for the RadialBarChart.
    const innerRadiusCalc = config.baseInnerRadius;
    const outerRadiusCalc = innerRadiusCalc + config.barSize + (ringCount - 1) * config.ringStep;

    // Legend items (original order, innermost first)
    const legendItems: DonutLegendItem[] = useMemo(() => {
        if (!rings || rings.length === 0) return [];
        return rings.map((ring, i) => {
            const colorToken = resolveColor(ring, i);
            const max = ring.max ?? 100;
            const clamped = clamp(ring.value ?? 0, 0, max);
            return {
                name: ring.label,
                value: clamped,
                formattedValue: formatPercentage(clamped, max),
                color: colorToken,
            };
        });
    }, [rings]);

    // Patch Recharts' default gray (#eee) background sector fills with
    // brand subtlest colors. Recharts hardcodes `fill="#eee"` on background
    // sectors with no per-ring override. We use `style.fill` (not
    // setAttribute) because CSS inline styles support `var()` custom
    // properties while SVG attributes do not.
    useEffect(() => {
        const el = chartRef.current;
        if (!el || !radialData.length) return;
        const paths = el.querySelectorAll<SVGPathElement>(
            '.recharts-radial-bar-background path',
        );
        paths.forEach((path, i) => {
            if (radialData[i]?.trackFill) {
                path.style.fill = radialData[i].trackFill;
            }
        });
    }, [radialData, themeKey]);

    // Loading state
    if (loading) {
        return (
            <div
                className={cn(containerVariants({ size }), className)}
                role="img"
                aria-label={ariaLabel || 'Gauge chart loading'}
            >
                <GaugeLoadingState size={size} />
            </div>
        );
    }

    // Empty state
    if (!rings || rings.length === 0) {
        return <ChartEmptyState />;
    }

    // Determine the center label value
    const resolvedCenterValue = centerValue !== undefined
        ? centerValue
        : rings[0]
            ? clamp(rings[0].value ?? 0, 0, rings[0].max ?? 100).toLocaleString()
            : '';
    const resolvedCenterSubtitle = centerSubtitle ?? rings[0]?.label ?? '';

    // Corner radius for rounded caps
    const cr = roundedCaps ? cornerRadius : 0;

    return (
        <div
            className={cn(containerVariants({ size }), className)}
            role="img"
            aria-label={ariaLabel || `Gauge chart with ${ringCount} ring${ringCount !== 1 ? 's' : ''}`}
        >
            {/* Chart */}
            <div ref={chartRef} className="relative" style={{ width: dynamicChartSize, height: dynamicChartSize }}>
                <RadialBarChart
                    key={themeKey}
                    width={dynamicChartSize}
                    height={dynamicChartSize}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadiusCalc}
                    outerRadius={outerRadiusCalc}
                    barSize={config.barSize}
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                >
                    {/* Explicit domain so ring arcs map accurately to 0–100% */}
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                        dataKey="value"
                        cornerRadius={cr}
                        forceCornerRadius
                        activeShape={false}
                        background
                        shape={(shapeProps: unknown) => (
                            <GaugeRingShape
                                {...(shapeProps as Record<string, unknown>)}
                                cornerRadius={cr}
                                forceCornerRadius
                            />
                        )}
                        isAnimationActive={shouldAnimate}
                        animationDuration={600}
                        animationEasing="ease-out"
                    />
                    <RechartsTooltip
                        content={<PieTooltipContent usePayloadLabels />}
                        cursor={false}
                        wrapperStyle={{ outline: 'none', zIndex: 10, pointerEvents: 'none' }}
                    />
                </RadialBarChart>

                {/* Center content */}
                {centerContent ? (
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        aria-hidden="true"
                    >
                        {centerContent(rings)}
                    </div>
                ) : showCenterLabel && (
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        aria-hidden="true"
                    >
                        <div
                            className="flex flex-col items-center text-center"
                            style={{ width: config.centerWidth }}
                        >
                            <span
                                className={cn(config.valueClass, 'w-full')}
                                style={{ color: 'var(--color-neutral-text-strong)' }}
                            >
                                {resolvedCenterValue}
                            </span>
                            <span
                                className={cn(config.subtitleClass, 'w-full')}
                                style={{ color: 'var(--color-neutral-text-medium)' }}
                            >
                                {resolvedCenterSubtitle}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            {legend && (
                <DonutLegend
                    items={legendItems}
                    layout={isMobile ? 'stack' : 'wrap'}
                    markerStyle="horizontal-line"
                    className={isMobile ? 'max-w-[240px]' : 'w-full'}
                />
            )}
        </div>
    );
};

VersaGaugeChart.displayName = 'VersaGaugeChart';
