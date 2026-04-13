'use client';

import type { FC, CSSProperties } from 'react';
import { useProgressBar } from '@react-aria/progress';

export const PROGRESS_BAR_SIZES = ['default', 'small'] as const;

export type ProgressBarSize = (typeof PROGRESS_BAR_SIZES)[number];

interface ProgressBarProps {
    /** Size of the progress bar - Default (8px) or Small (4px) */
    size?: ProgressBarSize;
    /** Completion percentage (0-100) */
    value?: number;
    /** Whether to show the percentage label */
    showLabel?: boolean;
    /** Optional className for the container */
    className?: string;
    /** Accessible label for the progress bar */
    'aria-label'?: string;
}

const SIZE_CONFIG: Record<ProgressBarSize, {
    barHeight: string;
    gap: string;
    glowBlur: string;
    textClass: string;
}> = {
    default: {
        barHeight: '8px',
        gap: 'var(--spacing-4, 8px)', // 8px gap for default
        glowBlur: 'var(--effects-glow-inner-shadow-blur-medium, 0px)',
        textClass: 'text-b5',
    },
    small: {
        barHeight: '4px',
        gap: 'var(--spacing-2, 4px)', // 4px gap for small
        glowBlur: 'var(--effects-glow-inner-shadow-blur-small, 0px)',
        textClass: 'text-b6',
    },
};

export const ProgressBar: FC<ProgressBarProps> = ({
    size = 'default',
    value = 0,
    showLabel = true,
    className = '',
    'aria-label': ariaLabel = 'Progress',
}) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));
    const sizeConfig = SIZE_CONFIG[size];

    // React Aria hook for accessibility
    const { progressBarProps, labelProps } = useProgressBar({
        value: clampedValue,
        minValue: 0,
        maxValue: 100,
        'aria-label': ariaLabel,
    });

    // Container styles
    const containerStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: sizeConfig.gap,
        width: '100%',
        borderRadius: 'var(--corner-radius-default-fully-rounded, 200px)',
    };

    // Track (background) styles
    const trackStyle: CSSProperties = {
        flex: 1,
        height: sizeConfig.barHeight,
        backgroundColor: 'var(--color-brand-primary-subtler)',
        borderRadius: 'var(--corner-radius-default-fully-rounded, 200px)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '1px',
        minWidth: '1px',
    };

    // Bar (fill) styles
    const barStyle: CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${clampedValue}%`,
        backgroundColor: 'var(--color-brand-primary-strong)',
        borderRadius: 'var(--corner-radius-default-fully-rounded, 200px)',
        transition: 'width 0.3s ease-out',
    };

    // Inner glow overlay styles
    const glowStyle: CSSProperties = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: size === 'default' ? 'var(--glow-medium)' : 'var(--glow-small)',
        borderRadius: 'var(--corner-radius-default-fully-rounded, 200px)',
    };

    // Label styles
    const labelStyle: CSSProperties = {
        color: 'var(--color-neutral-text-strong)',
        whiteSpace: 'nowrap',
        minWidth: '32px',
        textAlign: 'left',
    };

    return (
        <div className={className} style={containerStyle} {...progressBarProps}>
            <div style={trackStyle}>
                <div style={barStyle}>
                    <div style={glowStyle} />
                </div>
            </div>
            {showLabel && (
                <span className={sizeConfig.textClass} style={labelStyle} {...labelProps}>
                    {Math.round(clampedValue)}%
                </span>
            )}
        </div>
    );
};

export default ProgressBar;
