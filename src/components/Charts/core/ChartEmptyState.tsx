'use client';

/**
 * ChartEmptyState — placeholder when a chart has no data.
 *
 * Typography: text-b4, color --color-neutral-text-subtle.
 */

import React from 'react';
import { cn } from '../../../utils/cn';

export interface ChartEmptyStateProps {
    message?: string;
    icon?: React.ReactNode;
    className?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
    message = 'No data available',
    icon,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center w-full h-full min-h-[200px] gap-[var(--spacing-4)]',
                className,
            )}
            role="status"
            aria-label={message}
        >
            {icon && (
                <div
                    className="flex items-center justify-center"
                    style={{ color: 'var(--color-neutral-icon-subtle)' }}
                    aria-hidden="true"
                >
                    {icon}
                </div>
            )}
            <span
                className="text-b4 text-center"
                style={{ color: 'var(--color-neutral-text-subtle)' }}
            >
                {message}
            </span>
        </div>
    );
};

ChartEmptyState.displayName = 'ChartEmptyState';
