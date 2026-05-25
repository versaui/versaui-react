'use client';

/**
 * ChartGrid — token-driven grid lines for Versa UI charts.
 * Stroke uses `--color-neutral-divider-base`.
 */

import React from 'react';
import { CartesianGrid } from 'recharts';
import type { ChartGridProps } from '../types/ChartTypes';

export const ChartGrid: React.FC<ChartGridProps> = ({
    horizontal = true,
    vertical = false,
}) => {
    return (
        <CartesianGrid
            horizontal={horizontal}
            vertical={vertical}
            stroke="var(--color-neutral-divider-base)"
            strokeWidth={1}
            strokeDasharray=""
        />
    );
};

ChartGrid.displayName = 'ChartGrid';
