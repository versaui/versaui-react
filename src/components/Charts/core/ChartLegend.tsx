'use client';

/**
 * ChartLegend — visual key identifying chart data series.
 * Supports default/small sizes, circle/line markers, glow overlays,
 * value display, and interactive series toggling with keyboard support.
 *
 * On mobile (≤767px), automatically downsizes to 'small' variant
 * with tighter inter-item spacing for compact viewports.
 */

import React, { useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { getSeriesColor } from '../utils/ChartUtils';
import { useIsMobile } from '../hooks/useIsMobile';
import type {
    ChartLegendProps,
    ChartLegendMarkerStyle,
    ChartColorToken,
} from '../types/ChartTypes';

const legendItemVariants = cva('flex items-center relative shrink-0', {
    variants: {
        size: {
            default: 'gap-[var(--spacing-4)]',
            small: 'gap-[var(--spacing-2)]',
        },
    },
    defaultVariants: { size: 'default' },
});

function getIndicatorDimensions(
    size: 'default' | 'small',
    markerStyle: ChartLegendMarkerStyle,
): { width: number; height: number } {
    if (markerStyle === 'horizontal-line') {
        return size === 'default' ? { width: 20, height: 4 } : { width: 16, height: 2 };
    }
    if (markerStyle === 'vertical-line') {
        return size === 'default' ? { width: 4, height: 20 } : { width: 2, height: 16 };
    }
    return size === 'default' ? { width: 16, height: 16 } : { width: 12, height: 12 };
}

const LegendIndicator: React.FC<{
    size: 'default' | 'small';
    markerStyle: ChartLegendMarkerStyle;
    color: ChartColorToken;
}> = ({ size, markerStyle, color }) => {
    const { width, height } = getIndicatorDimensions(size, markerStyle);
    return (
        <div
            className="pointer-events-none relative shrink-0"
            style={{
                width, height,
                borderRadius: 'var(--corner-radius-default-fully-rounded)',
            }}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: getSeriesColor(color), borderRadius: 'inherit' }}
            />
            <div
                className="absolute inset-0"
                style={{ borderRadius: 'inherit', boxShadow: 'var(--glow-small)' }}
            />
        </div>
    );
};

const LegendItem: React.FC<{
    size: 'default' | 'small';
    markerStyle: ChartLegendMarkerStyle;
    color: ChartColorToken;
    label: string;
    value?: string | number;
    showValue: boolean;
    isHidden: boolean;
    onToggle?: () => void;
}> = ({ size, markerStyle, color, label, value, showValue, isHidden, onToggle }) => {
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
    const labelClass = size === 'default' ? 'text-b4' : 'text-b5';
    const valueClass = size === 'default' ? 'text-h8' : 'text-h9';

    return (
        <div
            className={cn(legendItemVariants({ size }), isHidden && 'opacity-40', isInteractive && 'cursor-pointer')}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-pressed={isInteractive ? !isHidden : undefined}
            aria-label={isInteractive ? `Toggle ${label}` : label}
            onClick={onToggle}
            onKeyDown={isInteractive ? handleKeyDown : undefined}
        >
            <div className={cn(legendItemVariants({ size }))}>
                <LegendIndicator size={size} markerStyle={markerStyle} color={color} />
                <span className={cn(labelClass, 'shrink-0 whitespace-nowrap')} style={{ color: 'var(--color-neutral-text-medium)' }}>
                    {label}
                </span>
            </div>
            {showValue && value !== undefined && (
                <span className={cn(valueClass, 'shrink-0 whitespace-nowrap')} style={{ color: 'var(--color-neutral-text-strong)' }}>
                    {value}
                </span>
            )}
        </div>
    );
};

export const ChartLegend: React.FC<ChartLegendProps> = ({
    size = 'default',
    markerStyle = 'circle',
    showValue = false,
    series = [],
    onToggle,
    hiddenSeries = new Set<string>(),
    className,
}) => {
    const isMobile = useIsMobile();
    // On mobile, force 'small' variant for compact viewports.
    const resolvedSize = isMobile ? 'small' : size;
    // Tighter inter-item gap on mobile (spacing-4 vs spacing-7).
    const containerGap = isMobile ? 'gap-[var(--spacing-4)]' : 'gap-[var(--spacing-7)]';

    if (!series.length) return null;
    return (
        <div
            className={cn('flex flex-wrap items-start px-[var(--spacing-4)]', containerGap, className)}
            role="group"
            aria-label="Chart legend"
        >
            {series.map((s) => (
                <LegendItem
                    key={s.dataKey}
                    size={resolvedSize}
                    markerStyle={markerStyle}
                    color={s.color}
                    label={s.name}
                    showValue={showValue}
                    isHidden={hiddenSeries.has(s.dataKey)}
                    onToggle={onToggle ? () => onToggle(s.dataKey) : undefined}
                />
            ))}
        </div>
    );
};

ChartLegend.displayName = 'ChartLegend';

