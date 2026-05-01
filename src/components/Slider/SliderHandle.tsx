'use client';

import React, { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Handle states
export type SliderHandleState = 'default' | 'hovered' | 'pressed' | 'disabled';
export const SLIDER_HANDLE_STATES = ['default', 'hovered', 'pressed', 'disabled'] as const;

// CVA variants for handle styling
const handleVariants = cva(
    // Base styles - 20×20px, fully rounded, centered content
    'relative flex items-center justify-center w-5 h-5 rounded-full shrink-0 box-border transition-[border] duration-200 ease-out',
    {
        variants: {
            state: {
                default: 'cursor-grab',
                hovered: 'cursor-grab',
                pressed: 'cursor-grabbing',
                disabled: 'cursor-not-allowed',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

// CVA for inner dot
const dotVariants = cva(
    'w-1.5 h-1.5 rounded-full shrink-0',
    {
        variants: {
            disabled: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            disabled: false,
        },
    }
);

export interface SliderHandleProps extends VariantProps<typeof handleVariants> {
    /** Current state of the handle */
    state?: SliderHandleState;
    /** Current value (for ARIA) */
    value?: number;
    /** Minimum value (for ARIA) */
    min?: number;
    /** Maximum value (for ARIA) */
    max?: number;
    /** Value text for screen readers */
    valueText?: string;
    /** Show value indicator on hover/drag (managed by parent Slider) */
    showValueIndicator?: boolean;
    /** Additional class name */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Mouse down handler */
    onMouseDown?: (e: React.MouseEvent) => void;
    /** Mouse enter handler */
    onMouseEnter?: () => void;
    /** Mouse leave handler */
    onMouseLeave?: () => void;
    /** Key down handler */
    onKeyDown?: (e: React.KeyboardEvent) => void;
    /** Touch start handler */
    onTouchStart?: (e: React.TouchEvent) => void;
}

/**
 * SliderHandle - The draggable thumb that users interact with to select a value.
 * 
 * Specs:
 * - Size: 20×20px fixed
 * - Shape: Fully rounded (200px border-radius)
 * - Background: Static white (disabled: neutral surface strong)
 * - Border: Primary subtler (default), Primary subtle (hovered), none (disabled)
 * - Shadow: elevation-small-2
 * - Inner Dot: 6×6px centered, brand primary strong (disabled: white)
 */
export const SliderHandle: React.FC<SliderHandleProps> = ({
    state = 'default',
    value,
    min = 0,
    max = 100,
    valueText,
    className,
    style,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onTouchStart,
}) => {
    const isDisabled = state === 'disabled';
    const isHovered = state === 'hovered';
    const isPressed = state === 'pressed';

    // Dynamic styles that can't be expressed in Tailwind (design tokens)
    const dynamicStyles: React.CSSProperties = useMemo(() => ({
        backgroundColor: isDisabled
            ? 'var(--color-neutral-surface-strong)'
            : 'var(--color-neutral-surface-static-white)',
        border: isDisabled
            ? 'none'
            : isPressed
                ? '2px solid var(--color-brand-primary-strong)'
                : isHovered
                    ? '2px solid var(--color-brand-primary-subtle)'
                    : '1px solid var(--color-brand-primary-subtler)',
        boxShadow: isDisabled
            ? 'none'
            : 'var(--elevation-small-2-shadow)',
        backdropFilter: isDisabled ? 'none' : 'blur(var(--elevation-small-blur))',
        WebkitBackdropFilter: isDisabled ? 'none' : 'blur(var(--elevation-small-blur))',
        ...style,
    }), [state, isDisabled, isHovered, isPressed, style]);

    // Inner dot styles
    const dotStyles: React.CSSProperties = useMemo(() => ({
        backgroundColor: isDisabled
            ? 'var(--color-neutral-surface-static-white)'
            : 'var(--color-brand-primary-strong)',
    }), [isDisabled]);

    return (
        <div
            className={cn(handleVariants({ state }), className)}
            style={dynamicStyles}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={onKeyDown}
            onTouchStart={onTouchStart}
            role="slider"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={valueText}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
        >
            {/* Inner Dot */}
            <div
                className={cn(dotVariants({ disabled: isDisabled }))}
                style={dotStyles}
            />
        </div>
    );
};

export default SliderHandle;
