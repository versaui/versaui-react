'use client';

/**
 * PieTooltipContent — shared tooltip for donut, semi-donut, and gauge charts.
 * Renders a Material-wrapped inverse tooltip with a color indicator and value.
 */

import React from 'react';
import { Material } from '../../Material';
import type { ChartColorToken } from '../types/ChartTypes';

export interface PieTooltipContentProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: { fill: string; color?: ChartColorToken; label?: string; displayValue?: string };
    }>;
    /** Names to skip (e.g. 'track' for background arcs). */
    skipNames?: string[];
    /** If provided, uses `payload.label` instead of `name` and `payload.displayValue` instead of `value`. */
    usePayloadLabels?: boolean;
}

export const PieTooltipContent: React.FC<PieTooltipContentProps> = ({
    active,
    payload,
    skipNames = ['track'],
    usePayloadLabels = false,
}) => {
    if (!active || !payload?.length) return null;

    const entry = skipNames.length > 0
        ? payload.find((p) => !skipNames.includes(p.name))
        : payload[0];
    if (!entry) return null;

    const displayName = usePayloadLabels ? entry.payload.label ?? entry.name : entry.name;
    const displayValue = usePayloadLabels
        ? entry.payload.displayValue ?? entry.value.toLocaleString()
        : entry.value.toLocaleString();

    return (
        <div className="pointer-events-none" role="tooltip">
            <Material
                size="small"
                elevation="floating"
                surfaceColor="var(--color-neutral-surface-inverse)"
                className="flex flex-col gap-[var(--spacing-1)] items-start p-[var(--spacing-4)]"
            >
                <div className="flex items-center gap-[var(--spacing-2)]">
                    <span
                        className="inline-block size-2 shrink-0"
                        style={{
                            background: entry.payload.fill,
                            borderRadius: 'var(--corner-radius-default-fully-rounded)',
                        }}
                    />
                    <span
                        className="text-b5 whitespace-nowrap"
                        style={{ color: 'var(--color-neutral-text-inverse)' }}
                    >
                        {displayName}&nbsp;&nbsp;{displayValue}
                    </span>
                </div>
            </Material>
        </div>
    );
};

PieTooltipContent.displayName = 'PieTooltipContent';
