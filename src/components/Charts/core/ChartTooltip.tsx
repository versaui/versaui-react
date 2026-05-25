'use client';

/**
 * ChartTooltip — custom tooltip for Versa UI charts.
 * Supports shared (cursor-following) and focused (anchored with arrow) interaction modes.
 */

import React from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '../../../utils/cn';
import { getSeriesColor } from '../utils/ChartUtils';
import type { ChartTooltipProps, ChartTooltipPayload, ChartColorToken, ChartInteractionMode } from '../types/ChartTypes';
import { Material } from '../../Material';

// --- Internal props injected by parent chart components ---

interface ChartTooltipInternalProps {
    /** Anchored tooltip position — injected by VersaBarChart in focused mode. */
    _tooltipPosition?: { x: number; y: number } | null;
    /** Hovered bar's data key — injected by VersaBarChart in focused mode. */
    _hoveredDataKey?: string | null;
}

// --- Default tooltip content ---

interface DefaultTooltipContentProps extends ChartTooltipPayload {
    formatter?: (value: number, name: string) => string;
    labelFormatter?: (label: string) => string;
    className?: string;
    showArrow?: boolean;
    anchored?: boolean;
}

const DefaultTooltipContent: React.FC<DefaultTooltipContentProps> = ({
    active,
    payload,
    label,
    formatter,
    labelFormatter,
    className,
    showArrow = true,
    anchored = false,
}) => {
    if (!active || !payload?.length) return null;

    const formattedLabel = labelFormatter && label ? labelFormatter(label) : label;

    const seriesItems = payload.map((entry, index) => {
        const formattedValue = formatter
            ? formatter(entry.value, entry.name)
            : String(entry.value);

        return (
            <div key={`${entry.dataKey}-${index}`} className="flex items-center gap-1.5">
                <span
                    className="inline-block size-2 shrink-0 rounded-[var(--corner-radius-default-fully-rounded)]"
                    style={{ background: entry.color }}
                    aria-hidden="true"
                />
                <span className="text-b5 text-[var(--color-neutral-text-inverse)] whitespace-nowrap">
                    {entry.name}&nbsp;&nbsp;{formattedValue}
                </span>
            </div>
        );
    });

    const arrowElement = showArrow && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full pointer-events-none z-10">
            <svg width={16} height={8} viewBox="0 0 16 8" className="block" aria-hidden="true">
                <path d="M0 0 L6 6 Q8 8 10 6 L16 0 Z" fill="var(--color-neutral-surface-inverse)" />
            </svg>
        </div>
    );

    if (anchored) {
        return (
            <div
                className={cn('pointer-events-none', className)}
                role="tooltip"
                style={{ transform: 'translate(-50%, -100%)', paddingBottom: 12 }}
            >
                <div className="relative outline-none shadow-[var(--elevation-medium-2-shadow)] backdrop-blur-[var(--elevation-medium-blur)] bg-[var(--color-neutral-surface-inverse)] rounded-[var(--corner-radius-default-small)] w-fit p-2 flex flex-col gap-1 items-start">
                    {formattedLabel && (
                        <span className="text-b5 text-[var(--color-neutral-text-inverse)] whitespace-nowrap">
                            {formattedLabel}
                        </span>
                    )}
                    {seriesItems}
                    {arrowElement}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('pointer-events-none', className)} role="tooltip">
            <div className="flex flex-col items-center">
                <Material
                    size="small"
                    elevation="floating"
                    surfaceColor="var(--color-neutral-surface-inverse)"
                    className="flex flex-col gap-[var(--spacing-1)] items-start p-[var(--spacing-4)]"
                >
                    {formattedLabel && (
                        <span
                            className="text-b5 whitespace-nowrap"
                            style={{ color: 'var(--color-neutral-text-inverse)' }}
                        >
                            {formattedLabel}
                        </span>
                    )}
                    {payload.map((entry, index) => {
                        const formattedValue = formatter
                            ? formatter(entry.value, entry.name)
                            : String(entry.value);

                        return (
                            <div
                                key={`${entry.dataKey}-${index}`}
                                className="flex items-center gap-[var(--spacing-2)]"
                            >
                                <span
                                    className="inline-block size-2 shrink-0 rounded-[var(--corner-radius-default-fully-rounded)]"
                                    style={{ background: entry.color }}
                                    aria-hidden="true"
                                />
                                <span
                                    className="text-b5 whitespace-nowrap"
                                    style={{ color: 'var(--color-neutral-text-inverse)' }}
                                >
                                    {entry.name}&nbsp;&nbsp;{formattedValue}
                                </span>
                            </div>
                        );
                    })}
                </Material>

                {showArrow && (
                    <svg
                        width={16}
                        height={8}
                        viewBox="0 0 16 8"
                        className="relative z-10 -mt-px"
                        aria-hidden="true"
                    >
                        <path
                            d="M0 0 L6 6 Q8 8 10 6 L16 0 Z"
                            fill="var(--color-neutral-surface-inverse)"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

// --- Exported component ---

export const ChartTooltip: React.FC<
    Omit<React.ComponentProps<typeof RechartsTooltip>, 'content'> &
    ChartTooltipProps &
    ChartTooltipInternalProps
> = ({
    content: CustomContent,
    formatter,
    labelFormatter,
    interactionMode = 'shared',
    className,
    _tooltipPosition,
    _hoveredDataKey,
    ...props
}) => {
    const isFocused = interactionMode === 'focused';
    const showArrow = isFocused;

    return (
        <RechartsTooltip
            cursor={{ fill: 'transparent' }}
            animationDuration={isFocused ? 0 : 150}
            animationEasing="ease-out"
            isAnimationActive={!isFocused}
            {...(isFocused ? {
                offset: 0,
                allowEscapeViewBox: { x: true, y: true },
                position: _tooltipPosition ? { x: _tooltipPosition.x, y: _tooltipPosition.y } : undefined,
            } : {})}
            {...props}
            content={(rechartsProps) => {
                const { active, payload, label } = rechartsProps as ChartTooltipPayload & { label?: string };

                // In focused mode, only show tooltip when a bar is directly hovered.
                if (isFocused && !_tooltipPosition) return null;

                let resolvedPayload = payload?.map((entry) => ({
                    ...entry,
                    color: entry.color || getSeriesColor('primary' as ChartColorToken),
                })) ?? [];

                // In focused mode, filter to only the hovered bar's series.
                if (isFocused && _hoveredDataKey) {
                    resolvedPayload = resolvedPayload.filter(
                        (entry) => entry.dataKey === _hoveredDataKey,
                    );
                }

                // Deduplicate: Area + Line with same dataKey both appear in payload.
                // Prefer the Line entry (solid stroke color) over Area (gradient/none).
                if (resolvedPayload.length > 0) {
                    const entryMap = new Map<string, typeof resolvedPayload[0]>();
                    for (const entry of resolvedPayload) {
                        const existing = entryMap.get(entry.name);
                        if (!existing || existing.color === 'none' || existing.color?.startsWith('url(')) {
                            entryMap.set(entry.name, entry);
                        }
                    }
                    resolvedPayload = Array.from(entryMap.values());
                }

                if (CustomContent) {
                    return (
                        <CustomContent
                            active={active}
                            payload={resolvedPayload}
                            label={label}
                        />
                    );
                }

                return (
                    <DefaultTooltipContent
                        active={active}
                        payload={resolvedPayload}
                        label={label}
                        formatter={formatter}
                        labelFormatter={labelFormatter}
                        className={className}
                        showArrow={showArrow}
                        anchored={isFocused}
                    />
                );
            }}
            wrapperStyle={{ outline: 'none', zIndex: 10, pointerEvents: 'none' }}
        />
    );
};

ChartTooltip.displayName = 'Tooltip';
