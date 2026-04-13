'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// =============================================================================
// Types
// =============================================================================

export const OTP_INPUT_BLOCK_SIZES = ['default', 'large'] as const;
export type OTPInputBlockSize = (typeof OTP_INPUT_BLOCK_SIZES)[number];

export const OTP_INPUT_BLOCK_STATES = ['default', 'hovered', 'active', 'filled', 'error', 'disabled'] as const;
export type OTPInputBlockState = (typeof OTP_INPUT_BLOCK_STATES)[number];

export interface OTPInputBlockProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Size variant */
    size?: OTPInputBlockSize;
    /** Visual state - typically managed by parent */
    state?: OTPInputBlockState;
    /** Additional className */
    className?: string;
}

// =============================================================================
// CVA Variants
// =============================================================================

/**
 * OTP Input Block styling variants
 * Based on Figma specs: 2 sizes × 6 states
 */
const otpInputBlockVariants = cva(
    [
        // Base layout
        'flex items-center justify-center',
        'border border-solid text-center',
        'transition-all duration-150',
        // Placeholder styling
        'placeholder:text-[var(--color-neutral-surface-strongest)]',
        // Corner radius
        'rounded-[var(--corner-radius-default-medium)]',
        // Focus visible outline is handled by state variants
    ],
    {
        variants: {
            size: {
                default: [
                    'w-12 h-12',      // 48×48px
                    'px-2',           // 8px horizontal padding
                    'text-h5',        // 24px bold
                ],
                large: [
                    'w-14 h-14',      // 56×56px
                    'px-2 py-[10px]', // 8px horizontal, 10px vertical
                    'text-h4',        // 32px bold
                ],
            },
            state: {
                default: [
                    'bg-[var(--color-neutral-surface-subtle)]',
                    'border-[var(--color-neutral-outline-subtle)]',
                    'text-[var(--color-neutral-text-subtle)]',
                    'hover:bg-[var(--color-neutral-surface-medium)]',
                    'outline-1 outline-transparent -outline-offset-1',
                    'cursor-pointer',
                ],
                hovered: [
                    'bg-[var(--color-neutral-surface-medium)]',
                    'border-[var(--color-neutral-outline-subtle)]',
                    'text-[var(--color-neutral-text-subtle)]',
                    'outline-1 outline-transparent -outline-offset-1',
                    'cursor-pointer',
                ],
                active: [
                    'bg-[var(--color-neutral-surface-subtle)]',
                    'border-[var(--color-neutral-outline-subtle)]',
                    'text-[var(--color-neutral-text-strong)]',
                    'outline-1 outline-[var(--color-brand-primary-strong)] -outline-offset-1',
                    'shadow-[var(--focus-ring-primary)]',
                ],
                filled: [
                    'bg-[var(--color-neutral-surface-subtle)]',
                    'border-[var(--color-neutral-outline-medium)]',
                    'text-[var(--color-neutral-text-strong)]',
                    'outline-1 outline-transparent -outline-offset-1',
                ],
                error: [
                    'bg-[var(--color-neutral-surface-subtle)]',
                    'border-[var(--color-neutral-outline-subtle)]',
                    'text-[var(--color-neutral-text-strong)]',
                    'outline-1 outline-[var(--color-state-error-strong)] -outline-offset-1',
                    'shadow-[var(--focus-ring-error)]',
                ],
                disabled: [
                    'bg-[var(--color-neutral-surface-disabled)]',
                    'border-[var(--color-neutral-outline-subtlest)]',
                    'text-[var(--color-neutral-text-disabled)]',
                    'outline-1 outline-transparent -outline-offset-1',
                    'cursor-not-allowed',
                ],
            },
        },
        defaultVariants: {
            size: 'default',
            state: 'default',
        },
    }
);

export type OTPInputBlockVariants = VariantProps<typeof otpInputBlockVariants>;

// =============================================================================
// Component
// =============================================================================

/**
 * OTP Input Block Component
 * 
 * Individual input slot for OTP/verification code inputs.
 * Designed to be used as a building block for the OTPInput component.
 * 
 * @example
 * ```tsx
 * <OTPInputBlock size="default" state="active" value="1" />
 * ```
 */
export const OTPInputBlock = forwardRef<HTMLInputElement, OTPInputBlockProps>(
    (
        {
            size = 'default',
            state = 'default',
            className = '',
            disabled,
            placeholder = '',
            ...props
        },
        ref
    ) => {
        // Override state if disabled prop is true
        const effectiveState = disabled ? 'disabled' : state;

        return (
            <input
                ref={ref}
                type="text"
                maxLength={1}
                disabled={disabled}
                placeholder={placeholder}
                className={`${otpInputBlockVariants({ size, state: effectiveState })} ${className}`}
                style={{
                    fontFamily: 'var(--typography-font-family-display)',
                    fontWeight: 'var(--typography-font-weight-display)',
                }}
                {...props}
            />
        );
    }
);

OTPInputBlock.displayName = 'OTPInputBlock';

// Export variants for use in parent components
export { otpInputBlockVariants };
export default OTPInputBlock;
