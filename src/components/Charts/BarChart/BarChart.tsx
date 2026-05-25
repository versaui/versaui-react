'use client';

/**
 * BarChart — composable bar chart for Versa UI.
 *
 * Usage:
 * ```tsx
 * <ChartContainer size="large" aria-label="Monthly sales">
 *   <VersaBarChart data={data} size="large">
 *     <ChartGrid horizontal />
 *     <ChartXAxis dataKey="month" />
 *     <ChartYAxis />
 *     <ChartTooltip />
 *     <ChartBar dataKey="series1" color="primary" name="Series 1" />
 *     <ChartBar dataKey="series2" color="secondary" name="Series 2" />
 *   </VersaBarChart>
 * </ChartContainer>
 * ```
 *
 * Supports two interaction modes via `interactionMode`:
 * - `'shared'` (default) — group hover, cursor-following tooltip, no arrow.
 * - `'focused'` — per-bar hover, anchored tooltip with arrow, active dot.
 *
 * The legend is rendered automatically below the chart from the child
 * `<ChartBar>` definitions. Pass `legend={false}` to hide it.
 */

import React, { useState, useCallback, useMemo, useRef, useId } from 'react';
import { BarChart as RechartsBarChart, Bar as RechartsBar } from 'recharts';
import { cn } from '../../../utils/cn';
import { ChartLegend } from '../core/ChartLegend';
import { ChartTooltip } from '../core/ChartTooltip';
import { getColorForIndex, getSeriesColor, isEmptyDataset, prefersReducedMotion } from '../utils/ChartUtils';
import { ChartEmptyState } from '../core/ChartEmptyState';
import type {
    BarChartProps,
    ChartSeries,
    ChartBarProps,
    ChartColorToken,
    ChartInteractionMode,
} from '../types/ChartTypes';

// Constants

/**
 * Active dot dimensions — from Figma node 1318:2326.
 *
 * Structure: 12px white circle (outer) + 8px brand-colored circle (inner)
 * Shadow: elevation/medium/2 (dy:3, blur:12, rgba(0,0,0,0.08))
 */
const ACTIVE_DOT = {
    outerRadius: 6,   // 12px diameter
    innerRadius: 4,   // 8px diameter
    shadowDy: 3,
    shadowBlur: 6,    // stdDeviation = blur/2 → feGaussianBlur 6 = 12px CSS blur
    shadowOpacity: 0.08,
} as const;

// Custom shape renderer

interface BarShapeProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    /** Color token resolved from the parent ChartBar. */
    colorToken: ChartColorToken;
    /** The actual series data key (e.g. 'revenue'). Used to identify hovered series. */
    seriesDataKey?: string;
    /** Current hover index from the chart (set via activeIndex). */
    activeBarIndex?: number;
    /** This bar's data index. */
    index?: number;
    /** Whether to render the active dot indicator on hover. */
    showActiveDot?: boolean;
    /** Interaction mode — controls per-bar vs group hover. */
    interactionMode?: ChartInteractionMode;
    /** Callback to report hovered bar position + dataKey for anchored tooltip (focused mode). */
    _onBarHover?: (position: { x: number; y: number } | null, dataKey?: string) => void;
}

const BarShape: React.FC<BarShapeProps> = ({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    colorToken,
    seriesDataKey,
    activeBarIndex,
    index,
    showActiveDot = true,
    interactionMode = 'shared',
    _onBarHover,
}) => {
    const uniqueId = useId();
    // Per-bar hover state — only used in focused mode.
    const [isLocalHovered, setIsLocalHovered] = useState(false);
    const isGroupActive = activeBarIndex !== undefined && activeBarIndex === index;

    // In shared mode: hover is driven by group-level activeBarIndex only.
    // In focused mode: hover is driven by per-bar mouse events (local hover).
    const showHover = interactionMode === 'focused'
        ? isLocalHovered || isGroupActive
        : isGroupActive;

    const fill = getSeriesColor(colorToken, showHover ? 'medium' : 'subtle');
    const noMotion = prefersReducedMotion();

    const handleMouseEnter = useCallback(() => {
        setIsLocalHovered(true);
        _onBarHover?.({ x: x + width / 2, y }, seriesDataKey);
    }, [_onBarHover, x, width, y, seriesDataKey]);
    const handleMouseLeave = useCallback(() => {
        setIsLocalHovered(false);
        _onBarHover?.(null);
    }, [_onBarHover]);

    // Unique filter ID for active dot shadow.
    const dotShadowId = `bar-dot-shadow-${uniqueId.replace(/:/g, '_')}`;

    // Active dot position: top-center of the bar.
    const dotCx = x + width / 2;
    const dotCy = y;

    // Derive whether to show the active dot from interaction mode.
    const renderActiveDot = showActiveDot && interactionMode === 'focused';

    return (
        <g
            {...(interactionMode === 'focused' ? {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
            } : {})}
            role="graphics-symbol"
            aria-label={`Bar value`}
        >
            {/* Filter definitions for active dot */}
            {renderActiveDot && (
                <defs>
                    <filter
                        id={dotShadowId}
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
            )}

            {/*
             * Bar body + inner glow — single foreignObject div.
             * Both background and box-shadow use live CSS variables,
             * so corner-radius updates instantly on theme switch.
             */}
            <foreignObject
                x={x}
                y={y}
                width={width}
                height={height}
                style={{ overflow: 'visible' }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: fill,
                        borderRadius: 'var(--corner-radius-default-small)',
                        boxShadow: 'var(--glow-medium)',
                        transition: noMotion ? 'none' : 'background 150ms ease-out',
                    }}
                />
            </foreignObject>

            {/* Active indicator dot — only in focused mode */}
            {renderActiveDot && showHover && height > 0 && (
                <g filter={`url(#${dotShadowId})`} style={{ pointerEvents: 'none' }}>
                    {/* Outer white circle — 12px diameter */}
                    <circle
                        cx={dotCx}
                        cy={dotCy}
                        r={ACTIVE_DOT.outerRadius}
                        fill="var(--color-neutral-surface-base, white)"
                    />
                    {/* Inner brand-colored circle — 8px diameter */}
                    <circle
                        cx={dotCx}
                        cy={dotCy}
                        r={ACTIVE_DOT.innerRadius}
                        fill={fill}
                    />
                </g>
            )}
        </g>
    );
};

// ChartBar — composable wrapper creating Recharts <Bar> with Versa styling

export const ChartBar: React.FC<ChartBarProps & {
    _colorIndex?: number;
    /** Interaction mode — injected by VersaBarChart. */
    interactionMode?: ChartInteractionMode;
    /** Active bar index — injected by VersaBarChart for group-level hover tracking. */
    _activeBarIndex?: number | null;
    /** Callback for focused mode bar hover position reporting. */
    _onBarHover?: (position: { x: number; y: number } | null) => void;
}> = ({
    dataKey,
    color,
    name,
    showActiveDot = true,
    interactionMode = 'shared',
    _colorIndex = 0,
    _activeBarIndex,
    _onBarHover,
}) => {
    const resolvedColor = color || getColorForIndex(_colorIndex);
    const reducedMotion = typeof window !== 'undefined' ? prefersReducedMotion() : false;

    // Derive active dot from interaction mode — interactionMode takes priority.
    const resolvedShowActiveDot = interactionMode === 'focused' ? showActiveDot : false;

    return (
        <RechartsBar
            dataKey={dataKey}
            name={name || dataKey}
            fill={getSeriesColor(resolvedColor)}
            barSize={16}
            isAnimationActive={!reducedMotion}
            animationDuration={600}
            animationEasing="ease-out"
            shape={(props: unknown) => (
                <BarShape
                    {...(props as unknown as BarShapeProps)}
                    colorToken={resolvedColor}
                    seriesDataKey={dataKey}
                    showActiveDot={resolvedShowActiveDot}
                    interactionMode={interactionMode}
                    activeBarIndex={_activeBarIndex ?? undefined}
                    _onBarHover={_onBarHover}
                />
            )}
        />
    );
};

ChartBar.displayName = 'ChartBar';

// Helpers

/**
 * Extract series definitions from ChartBar children so the legend can be
 * auto-generated.
 */
function extractSeriesFromChildren(children: React.ReactNode): ChartSeries[] {
    const series: ChartSeries[] = [];
    let colorIdx = 0;

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const props = child.props as Partial<ChartBarProps>;
        if (props.dataKey) {
            series.push({
                dataKey: props.dataKey,
                name: props.name || props.dataKey,
                color: (props.color as ChartColorToken) || getColorForIndex(colorIdx),
            });
            colorIdx++;
        }
    });

    return series;
}

/** Returns bar spacing derived from Figma specs based on series count. */
function getBarGap(seriesCount: number): number {
    if (seriesCount >= 3) return 4;
    if (seriesCount === 2) return 8;
    return 0;
}

/** Returns bar size based on series count matching Figma. */
function getBarSize(seriesCount: number): number {
    return seriesCount <= 1 ? 32 : 16;
}

/** Check whether a child element is a ChartTooltip. */
function isChartTooltip(child: React.ReactElement): boolean {
    const type = child.type;
    if (type === ChartTooltip) {
        return true;
    }
    if (typeof type === 'function' || typeof type === 'object') {
        const name = (type as { displayName?: string }).displayName;
        return name === 'Tooltip' || name === 'ChartTooltip';
    }
    return false;
}

/** Check whether a child element is a ChartBar (by having a dataKey prop). */
function isChartBar(child: React.ReactElement): boolean {
    const props = child.props as Partial<ChartBarProps>;
    return !!props.dataKey;
}

// VersaBarChart

export interface VersaBarChartProps extends BarChartProps {
    /** Whether to show the auto-generated legend. Default: true. */
    legend?: boolean;
    /** Legend size override. Defaults to 'small' for medium charts, 'default' for large. */
    legendSize?: 'default' | 'small';
    /** Legend marker style. Default: 'circle'. */
    legendMarkerStyle?: 'circle' | 'horizontal-line' | 'vertical-line';
}

export const VersaBarChart: React.FC<VersaBarChartProps> = ({
    data,
    size = 'large',
    interactionMode = 'shared',
    children,
    className,
    legend = true,
    legendSize,
    legendMarkerStyle = 'circle',
}) => {
    // Hidden series for legend toggle.
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

    // Group-level hover index — only used in shared mode.
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const activeIndexRef = useRef<number | null>(null);

    // Hovered bar position — only used in focused mode for anchored tooltip.
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
    // Hovered bar's color token (dataKey) — only used in focused mode to filter tooltip payload.
    const [hoveredDataKey, setHoveredDataKey] = useState<string | null>(null);

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

    // Recharts onMouseMove — track group-level hover for shared mode.
    const handleMouseMove = useCallback((state: { activeTooltipIndex?: number }) => {
        if (interactionMode !== 'shared') return;
        const idx = state?.activeTooltipIndex ?? null;
        if (activeIndexRef.current !== idx) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
        }
    }, [interactionMode]);

    const handleMouseLeave = useCallback(() => {
        if (interactionMode !== 'shared') return;
        activeIndexRef.current = null;
        setActiveIndex(null);
    }, [interactionMode]);

    // Callback from BarShape in focused mode — reports hovered bar position + dataKey.
    const handleBarHover = useCallback((position: { x: number; y: number } | null, dataKey?: string) => {
        setTooltipPosition(position);
        setHoveredDataKey(dataKey ?? null);
    }, []);

    // Extract series from ChartBar children.
    const series = useMemo(
        () => extractSeriesFromChildren(children),
        [children],
    );

    // Filter data for hidden series — set hidden series values to null
    // so Recharts still renders categories but skips hidden bars.
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
    const barGap = getBarGap(series.length);
    const barSize = getBarSize(series.length);

    // Handle empty data.
    if (isEmptyDataset(data)) {
        return <ChartEmptyState />;
    }

    // Clone children to inject interactionMode, barSize, and activeIndex.
    const enhancedChildren = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Inject interactionMode + anchored position into ChartTooltip.
        if (isChartTooltip(child)) {
            return React.cloneElement(child as React.ReactElement, {
                interactionMode,
                _tooltipPosition: interactionMode === 'focused' ? tooltipPosition : undefined,
                _hoveredDataKey: interactionMode === 'focused' ? hoveredDataKey : undefined,
            } as Record<string, unknown>);
        }

        // Inject barSize + interactionMode + activeIndex + hover callback + _colorIndex into ChartBar.
        if (isChartBar(child)) {
            const childProps = child.props as any;
            const childDataKey = childProps.dataKey;
            const sIndex = series.findIndex((s) => s.dataKey === childDataKey);
            return React.cloneElement(child as React.ReactElement, {
                barSize,
                interactionMode,
                _colorIndex: sIndex >= 0 ? sIndex : 0,
                _activeBarIndex: interactionMode === 'shared' ? activeIndex : undefined,
                _onBarHover: interactionMode === 'focused' ? handleBarHover : undefined,
            } as Record<string, unknown>);
        }

        return child;
    });

    return (
        <div className={cn('flex flex-col gap-[var(--spacing-6)] w-full', className)}>
            <RechartsBarChart
                data={filteredData}
                barGap={barGap}
                barCategoryGap="15%"
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                onMouseMove={interactionMode === 'shared' ? handleMouseMove : undefined}
                onMouseLeave={interactionMode === 'shared' ? handleMouseLeave : undefined}
            >
                {enhancedChildren}
            </RechartsBarChart>

            {legend && series.length > 1 && (
                <ChartLegend
                    size={resolvedLegendSize}
                    markerStyle={legendMarkerStyle}
                    series={series}
                    onToggle={handleToggleSeries}
                    hiddenSeries={hiddenSeries}
                />
            )}
        </div>
    );
};

VersaBarChart.displayName = 'VersaBarChart';
