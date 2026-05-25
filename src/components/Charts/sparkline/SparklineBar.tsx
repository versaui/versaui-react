'use client';

/**
 * SparklineBar — compact vertical bar micro-chart for Versa UI.
 *
 * Pure HTML/CSS implementation using flexbox for natural responsive sizing.
 * Intended for metric cards, dashboard widgets, and overview surfaces.
 *
 * Features:
 * - Token-driven trend coloring (success / error)
 * - Optional last-bar highlight
 * - Staggered reveal animation with `prefers-reduced-motion` support
 * - Graceful handling of empty, null, and single-point datasets
 * - Inner glow via `--glow-small`
 * - Responsive width via flexbox, fixed height per size variant
 */

import React, { useMemo, useId } from 'react';
import { prefersReducedMotion } from '../utils/ChartUtils';
import type { SparklineBarProps, SparklineSize, SparklineTrend } from './SparklineTypes';

// Constants

/** Fixed bar width across all sizes (uniform thickness per Figma). */
const BAR_WIDTH = 4;

/** Corner radius for bar top corners. */
const BAR_RADIUS = 2;

/** Maximum number of visible bars per size (from Figma). */
const SIZE_MAX_BARS: Record<SparklineSize, number> = {
    large: 16,
    medium: 10,
    small: 8,
};

/** Gap between bars per size variant (px — from Figma spacing tokens). */
const SIZE_GAP: Record<SparklineSize, number> = {
    large: 8,
    medium: 6,
    small: 4,
};

/** Container heights per size variant (matches Figma). */
const SIZE_HEIGHTS: Record<SparklineSize, number> = {
    large: 104,
    medium: 88,
    small: 56,
};

/** Padding per size variant. */
const SIZE_PADDING: Record<SparklineSize, string> = {
    large: '8px 8px 0 8px',
    medium: '8px 8px 0 8px',
    small: '4px 4px 0 4px',
};

/** Color tokens per trend. */
const TREND_TOKENS: Record<SparklineTrend, { bar: string; current: string }> = {
    positive: {
        bar: 'var(--color-state-success-subtler)',
        current: 'var(--color-state-success-subtle)',
    },
    negative: {
        bar: 'var(--color-state-error-subtler)',
        current: 'var(--color-state-error-subtle)',
    },
};

/** Animation duration per bar (ms). */
const ANIM_DURATION = 400;
/** Stagger delay per bar (ms). */
const ANIM_STAGGER = 30;

// Component

export const SparklineBar: React.FC<SparklineBarProps> = ({
    data,
    trend = 'positive',
    size = 'large',
    highlightLast = true,
    className,
}) => {
    const noMotion = prefersReducedMotion();
    const chartHeight = SIZE_HEIGHTS[size];
    const gap = SIZE_GAP[size];
    const padding = SIZE_PADDING[size];
    const tokens = TREND_TOKENS[trend];
    const uniqueId = useId();

    // Normalise data — clamp to non-negative numbers, then take the last N bars for the size.
    const bars = useMemo(() => {
        if (!data || data.length === 0) return [];
        const maxBars = SIZE_MAX_BARS[size];
        const sliced = data.length > maxBars ? data.slice(-maxBars) : data;
        return sliced.map((d) => ({
            value: typeof d.value === 'number' && isFinite(d.value) ? Math.max(0, d.value) : 0,
        }));
    }, [data, size]);

    const maxValue = useMemo(() => Math.max(...bars.map((b) => b.value), 1), [bars]);

    if (bars.length === 0) {
        return (
            <div
                className={className}
                style={{ width: '100%', height: chartHeight }}
                role="img"
                aria-label="Empty sparkline bar chart"
            />
        );
    }

    return (
        <div
            className={className}
            style={{ width: '100%', height: chartHeight }}
            role="img"
            aria-label={`Sparkline bar chart showing ${trend} trend`}
        >
            {/* Inject scoped keyframes for this instance */}
            {!noMotion && (
                <style>{`
                    @keyframes sparkline-bar-grow-${uniqueId.replace(/:/g, '')} {
                        from { transform: scaleY(0); opacity: 0; }
                        to   { transform: scaleY(1); opacity: 1; }
                    }
                `}</style>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    width: '100%',
                    height: '100%',
                    gap: `${gap}px`,
                    padding,
                    boxSizing: 'border-box',
                }}
            >
                {bars.map((bar, i) => {
                    const heightPct = maxValue > 0
                        ? Math.max(4, (bar.value / maxValue) * 100)
                        : 4;
                    const isCurrent = highlightLast && i === bars.length - 1;
                    const fill = isCurrent ? tokens.current : tokens.bar;
                    const animName = `sparkline-bar-grow-${uniqueId.replace(/:/g, '')}`;

                    return (
                        <div
                            key={i}
                            style={{
                                width: BAR_WIDTH,
                                flexShrink: 0,
                                height: `${heightPct}%`,
                                background: fill,
                                borderRadius: `${BAR_RADIUS}px ${BAR_RADIUS}px 0 0`,
                                boxShadow: 'var(--glow-small)',
                                transformOrigin: 'bottom center',
                                animation: noMotion
                                    ? 'none'
                                    : `${animName} ${ANIM_DURATION}ms ease-out ${i * ANIM_STAGGER}ms both`,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

SparklineBar.displayName = 'SparklineBar';
