'use client';

/**
 * ChartLoadingState — skeleton placeholder while chart data loads.
 *
 * Shows animated pulse bars that match the chart size variant.
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import type { ChartSize } from '../types/ChartTypes';

export interface ChartLoadingStateProps {
    size?: ChartSize;
    className?: string;
}

/** Predetermined heights for skeleton bars to create a natural-looking silhouette. */
const SKELETON_HEIGHTS = [40, 65, 55, 80, 50, 70, 45, 75, 60, 85, 48, 72];

export const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({
    size = 'large',
    className,
}) => {
    const barCount = size === 'large' ? 12 : 6;
    const barWidth = 16;

    return (
        <div
            className={cn(
                'flex items-end justify-between w-full h-full min-h-[200px] px-[var(--spacing-8)] pb-[var(--spacing-6)]',
                className,
            )}
            role="status"
            aria-label="Loading chart"
        >
            {Array.from({ length: barCount }, (_, i) => (
                <div
                    key={i}
                    className="animate-pulse motion-reduce:animate-none"
                    style={{
                        width: barWidth,
                        height: `${SKELETON_HEIGHTS[i % SKELETON_HEIGHTS.length]}%`,
                        background: 'var(--color-neutral-surface-medium)',
                        borderRadius: 'var(--corner-radius-default-small)',
                        animationDelay: `${i * 75}ms`,
                    }}
                    aria-hidden="true"
                />
            ))}
        </div>
    );
};

ChartLoadingState.displayName = 'ChartLoadingState';
