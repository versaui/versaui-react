'use client';

import { useMemo, type FC, type CSSProperties } from 'react';
import { useProgressBar } from '@react-aria/progress';

export const CIRCULAR_PROGRESS_BAR_SIZES = ['large', 'default', 'small'] as const;

export type CircularProgressBarSize = (typeof CIRCULAR_PROGRESS_BAR_SIZES)[number];

interface CircularProgressBarProps {
    /** Size of the circular progress bar - Large (64px), Default (48px), or Small (40px) */
    size?: CircularProgressBarSize;
    /** Completion percentage (0-100) */
    value?: number;
    /** Whether to show the percentage label in the center */
    showLabel?: boolean;
    /** Optional className for the container */
    className?: string;
    /** Accessible label for the progress bar */
    'aria-label'?: string;
}

/**
 * Size configurations based on Figma specifications
 * Large: Container 64x64, Circle 56x56, Bar stroke 4px, Container stroke 2px
 * Default: Container 48x48, Circle 40x40, Bar stroke 3px, Container stroke 1.5px
 * Small: Container 40x40, Circle 32x32, Bar stroke 2px, Container stroke 1px
 */
const SIZE_CONFIG: Record<CircularProgressBarSize, {
    containerSize: number;
    circleSize: number;
    trackStroke: number;
    barStroke: number;
    textClass: string;
}> = {
    large: {
        containerSize: 64,
        circleSize: 56,
        trackStroke: 2,
        barStroke: 4,
        textClass: 'text-b4',
    },
    default: {
        containerSize: 48,
        circleSize: 40,
        trackStroke: 1.5,
        barStroke: 3,
        textClass: 'text-b5',
    },
    small: {
        containerSize: 40,
        circleSize: 32,
        trackStroke: 1,
        barStroke: 2,
        textClass: 'text-b6',
    },
};

export const CircularProgressBar: FC<CircularProgressBarProps> = ({
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

    // Calculate SVG parameters
    const { containerSize, circleSize, trackStroke, barStroke } = sizeConfig;
    const center = containerSize / 2;
    const radius = (circleSize - barStroke) / 2; // Radius accounts for stroke width
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    // Container styles
    const containerStyle: CSSProperties = useMemo(() => ({
        position: 'relative',
        width: containerSize,
        height: containerSize,
        overflow: 'hidden',
    }), [containerSize]);

    // SVG styles
    const svgStyle: CSSProperties = useMemo(() => ({
        width: containerSize,
        height: containerSize,
        transform: 'rotate(-90deg)', // Start from top
    }), [containerSize]);

    // Track (background circle) styles
    const trackStyle: CSSProperties = useMemo(() => ({
        fill: 'none',
        stroke: 'var(--color-brand-primary-subtler)',
        strokeWidth: trackStroke,
    }), [trackStroke]);

    // Bar (progress circle) styles
    const barStyle: CSSProperties = useMemo(() => ({
        fill: 'none',
        stroke: 'var(--color-brand-primary-strong)',
        strokeWidth: barStroke,
        strokeLinecap: 'round',
        strokeDasharray: circumference,
        strokeDashoffset: strokeDashoffset,
        transition: 'stroke-dashoffset 0.3s ease-out',
    }), [barStroke, circumference, strokeDashoffset]);



    // Label styles
    const labelStyle: CSSProperties = useMemo(() => ({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'var(--color-neutral-text-strong)',
        textAlign: 'center',
        whiteSpace: 'nowrap',
    }), []);

    return (
        <div className={className} style={containerStyle} {...progressBarProps}>
            <svg style={svgStyle}>
                {/* Track circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    style={trackStyle}
                />
                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    style={barStyle}
                />
            </svg>

            {showLabel && (
                <span className={sizeConfig.textClass} style={labelStyle} {...labelProps}>
                    {Math.round(clampedValue)}%
                </span>
            )}
        </div>
    );
};

export default CircularProgressBar;
