'use client';

/**
 * DonutLegend — card-style legend for donut and semi-donut charts.
 * Renders each item in a bordered card with indicator + label on left, value on right.
 */

import React, { useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { getSeriesColor } from '../utils/ChartUtils';
import type { ChartColorToken } from '../types/ChartTypes';
import { useIsMobile } from '../hooks/useIsMobile';

// Types

export interface DonutLegendItem {
    /** Segment name. */
    name: string;
    /** Segment value. */
    value: number;
    /** Formatted display string (e.g. "375 (37.5%)"). */
    formattedValue: string;
    /** Color token for the indicator. */
    color: ChartColorToken;
    /** Whether this segment is hidden via legend toggle. */
    isHidden?: boolean;
}

export interface DonutLegendProps {
    /** Legend items to display. */
    items: DonutLegendItem[];
    /** Layout mode: 'wrap' for 4+ items (grid), 'stack' for 2-3 (full-width). */
    layout?: 'wrap' | 'stack';
    /** Indicator marker style: circle (default for donut) or horizontal-line (for gauge). */
    markerStyle?: 'circle' | 'horizontal-line';
    /** Callback when an item is toggled. */
    onToggle?: (name: string) => void;
    /** Additional CSS class names. */
    className?: string;
}

// Sub-components

const LegendCard: React.FC<{
    item: DonutLegendItem;
    markerStyle: 'circle' | 'horizontal-line';
    onToggle?: () => void;
}> = ({ item, markerStyle, onToggle }) => {
    const isInteractive = !!onToggle;

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (onToggle && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onToggle();
            }
        },
        [onToggle],
    );

    return (
        <div
            className={cn(
                'flex items-center',
                'border border-[var(--color-neutral-outline-subtlest)]',
                'rounded-[var(--corner-radius-thematic-small)]',
                'px-[var(--spacing-4)] py-[var(--spacing-2)]',
                item.isHidden && 'opacity-40',
                isInteractive && 'cursor-pointer',
            )}
            style={{ background: 'var(--color-neutral-surface-subtle)' }}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-pressed={isInteractive ? !item.isHidden : undefined}
            aria-label={isInteractive ? `Toggle ${item.name}` : item.name}
            onClick={onToggle}
            onKeyDown={isInteractive ? handleKeyDown : undefined}
        >
            <div className="flex flex-1 items-center justify-between gap-[var(--spacing-3)] min-w-0">
                {/* Left: Indicator + Name */}
                <div className="flex items-center gap-[var(--spacing-2)] min-w-0">
                    {/* Indicator */}
                    <div
                        className="pointer-events-none relative shrink-0"
                        style={{
                            width: markerStyle === 'horizontal-line' ? 16 : 12,
                            height: markerStyle === 'horizontal-line' ? 2 : 12,
                            borderRadius: 'var(--corner-radius-default-fully-rounded)',
                        }}
                    >
                        <div
                            aria-hidden="true"
                            className="absolute inset-0"
                            style={{
                                background: getSeriesColor(item.color),
                                borderRadius: 'inherit',
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{ borderRadius: 'inherit', boxShadow: 'var(--glow-small)' }}
                        />
                    </div>
                    <span
                        className="text-b5 truncate"
                        style={{ color: 'var(--color-neutral-text-medium)' }}
                    >
                        {item.name}
                    </span>
                </div>

                {/* Right: Value */}
                <span
                    className="text-h9 whitespace-nowrap shrink-0"
                    style={{ color: 'var(--color-neutral-text-strong)' }}
                >
                    {item.formattedValue}
                </span>
            </div>
        </div>
    );
};

// DonutLegend

export const DonutLegend: React.FC<DonutLegendProps> = ({
    items,
    layout = 'wrap',
    markerStyle = 'circle',
    onToggle,
    className,
}) => {
    const isMobile = useIsMobile();
    if (!items.length) return null;

    const isStack = layout === 'stack';

    return (
        <div
            className={cn(
                'flex w-full gap-[var(--spacing-4)]',
                isStack
                    ? 'flex-col'
                    : 'flex-wrap justify-center',
                className,
            )}
            role="group"
            aria-label="Chart legend"
        >
            {items.map((item) => (
                <div
                    key={item.name}
                    className={isStack ? 'w-full' : undefined}
                    style={!isStack ? {
                        flex: isMobile ? '1 1 calc(50% - 8px)' : '1 1 calc(33.333% - 12px)',
                        maxWidth: isMobile ? 'calc(50% - 8px)' : 'calc(33.333% - 12px)',
                        minWidth: isMobile ? '130px' : '160px',
                    } : undefined}
                >
                    <LegendCard
                        item={item}
                        markerStyle={markerStyle}
                        onToggle={onToggle ? () => onToggle(item.name) : undefined}
                    />
                </div>
            ))}
        </div>
    );
};

DonutLegend.displayName = 'DonutLegend';
