'use client';

/**
 * ChartContainer — responsive wrapper for all Versa UI charts.
 * Handles padding, border-radius, responsive sizing, accessibility,
 * and delegates to empty/loading states when appropriate.
 */

import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartLoadingState } from './ChartLoadingState';
import type { ChartContainerProps } from '../types/ChartTypes';

const containerVariants = cva(
    'relative flex flex-col items-start justify-end w-full',
    {
        variants: {
            size: {
                large: [
                    'rounded-[var(--corner-radius-default-x-large)]',
                    'pb-[var(--spacing-4)]',
                ].join(' '),
                medium: [
                    'rounded-[var(--corner-radius-default-large)]',
                    'pb-[var(--spacing-5)]',
                ].join(' '),
            },
        },
        defaultVariants: {
            size: 'large',
        },
    },
);

export const ChartContainer: React.FC<ChartContainerProps> = ({
    size = 'large',
    loading = false,
    empty = false,
    'aria-label': ariaLabel,
    className,
    children,
    minHeight = 300,
    aspectRatio,
}) => {
    if (loading) {
        return (
            <div
                className={cn(containerVariants({ size }), className)}
                role="img"
                aria-label={ariaLabel || 'Chart loading'}
                style={{ minHeight }}
            >
                <ChartLoadingState size={size} />
            </div>
        );
    }

    if (empty) {
        return (
            <div
                className={cn(containerVariants({ size }), className)}
                role="img"
                aria-label={ariaLabel || 'No chart data'}
                style={{ minHeight }}
            >
                <ChartEmptyState />
            </div>
        );
    }

    return (
        <div
            className={cn(containerVariants({ size }), className)}
            role="img"
            aria-label={ariaLabel || 'Chart'}
        >
            <ResponsiveContainer
                width="100%"
                height="100%"
                minHeight={minHeight}
                aspect={aspectRatio}
            >
                {children as React.ReactElement}
            </ResponsiveContainer>
        </div>
    );
};

ChartContainer.displayName = 'ChartContainer';
