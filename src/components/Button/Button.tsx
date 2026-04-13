'use client';

import React, { useMemo } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader } from './Loader';

// Types
export const BUTTON_TYPES = ['primary', 'neutral', 'error'] as const;
export const BUTTON_SIZES = ['small', 'medium', 'large'] as const;
export const BUTTON_STYLES = ['filled', 'thematic', 'subtle', 'outline'] as const;

export type ButtonType = (typeof BUTTON_TYPES)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

const ICON_SIZES: Record<ButtonSize, number> = { small: 16, medium: 20, large: 24 };

// CVA variants for structural styling
const buttonVariants = cva(
    'relative inline-flex items-center justify-center font-bold transition-[background,box-shadow,color,transform] duration-150 ease-out focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shrink-0 min-w-fit active:scale-[0.98] active:duration-75',
    {
        variants: {
            size: { small: '', medium: '', large: '' },
            isIconOnly: { true: '', false: '' },
            fullWidth: { true: 'w-full', false: '' },
        },
        compoundVariants: [
            // Icon-only buttons
            { size: 'small', isIconOnly: true, class: 'w-8 h-8 text-h9 rounded-[var(--corner-radius-thematic-small)] gap-[2px]' },
            { size: 'medium', isIconOnly: true, class: 'w-10 h-10 text-h8 rounded-[var(--corner-radius-thematic-medium)] gap-[4px]' },
            { size: 'large', isIconOnly: true, class: 'w-12 h-12 text-h7 rounded-[var(--corner-radius-thematic-large)] gap-[6px]' },
            // Text buttons
            { size: 'small', isIconOnly: false, class: 'px-[var(--spacing-5)] h-8 text-h9 rounded-[var(--corner-radius-thematic-small)] gap-[2px]' },
            { size: 'medium', isIconOnly: false, class: 'px-[var(--spacing-6)] h-10 text-h8 rounded-[var(--corner-radius-thematic-medium)] gap-[4px]' },
            { size: 'large', isIconOnly: false, class: 'px-[var(--spacing-6)] h-12 text-h7 rounded-[var(--corner-radius-thematic-large)] gap-[6px]' },
        ],
        defaultVariants: { size: 'medium', isIconOnly: false, fullWidth: false },
    }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonType;
    size?: ButtonSize;
    buttonStyle?: ButtonStyle;
    loading?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    buttonStyle = 'filled',
    loading = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    leadingIcon,
    trailingIcon,
    className,
    disabled,
    fullWidth = false,
    ...props
}) => {
    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled || loading });

    const isHovered = propIsHovered ?? ariaIsHovered;
    const isFocused = propIsFocused ?? isFocusVisible;
    const isIconOnly = !React.Children.count(children) && (!!leadingIcon || !!trailingIcon);

    const isPrimary = variant === 'primary';
    const isError = variant === 'error';
    const isNeutral = variant === 'neutral';
    const iconSize = ICON_SIZES[size];

    // Inline styles required for dynamic token composition (gradients, combined shadows, etc.)
    const styles = useMemo(() => {
        if (disabled) {
            return {
                background: buttonStyle === 'subtle' ? 'transparent' : 'var(--color-neutral-surface-disabled)',
                color: 'var(--color-neutral-text-disabled)',
                border: buttonStyle === 'subtle' ? '1px solid transparent' : '1px solid var(--color-neutral-outline-subtlest)',
            };
        }

        let bg: string, color: string, border: string, boxShadow: string | undefined;
        let hoverBg: string | undefined, hoverShadow: string | undefined, hoverBorder: string | undefined;
        let backgroundOrigin: string | undefined, backgroundClip: string | undefined;

        switch (buttonStyle) {
            case 'filled':
                bg = isPrimary ? 'var(--color-brand-primary-strong)' : isError ? 'var(--color-state-error-strong)' : 'var(--color-neutral-surface-medium)';
                color = isNeutral ? 'var(--color-neutral-text-strong)' : 'var(--color-neutral-text-inverse)';
                border = '1px solid transparent';
                boxShadow = isNeutral ? undefined : `var(--elevation-${size}-1-shadow)`;
                hoverBg = isPrimary ? 'var(--color-brand-primary-stronger)' : isError ? 'var(--color-state-error-stronger)' : 'var(--color-neutral-surface-strong)';
                hoverShadow = isNeutral ? undefined : `var(--elevation-${size}-2-shadow)`;
                break;

            case 'thematic': {
                const themeColor = isPrimary ? 'primary' : isError ? 'error' : 'neutral';
                const insetType = isNeutral ? 'subtle' : 'default';
                const fillGradient = `var(--gradient-thematic-fill-${themeColor})`;
                const outlineGradient = `var(--gradient-thematic-outline-${themeColor})`;
                bg = `${fillGradient} padding-box, ${outlineGradient} border-box`;
                backgroundOrigin = 'border-box';
                backgroundClip = 'padding-box, border-box';
                color = isNeutral ? 'var(--color-neutral-text-strong)' : 'var(--color-neutral-text-inverse)';
                border = '1px solid transparent';
                const insetSize = size === 'small' ? 'small' : 'medium';
                boxShadow = `var(--inset-${insetType}-${insetSize})`;
                const hoverFill = isPrimary ? 'var(--color-brand-primary-stronger)'
                    : isError ? 'var(--color-state-error-stronger)'
                        : 'var(--color-neutral-surface-strong)';
                hoverBg = `linear-gradient(${hoverFill}, ${hoverFill}) padding-box, ${outlineGradient} border-box`;
                hoverShadow = boxShadow;
                break;
            }

            case 'subtle':
                bg = 'transparent';
                color = isPrimary ? 'var(--color-brand-primary-strong)' : isError ? 'var(--color-state-error-strong)' : 'var(--color-neutral-text-strong)';
                border = '1px solid transparent';
                hoverBg = isPrimary ? 'var(--color-brand-primary-subtlest)' : isError ? 'var(--color-state-error-subtlest)' : 'var(--color-neutral-surface-medium)';
                break;

            case 'outline':
            default: {
                bg = isNeutral ? 'var(--color-neutral-surface-subtlest)' : 'transparent';
                color = isPrimary ? 'var(--color-brand-primary-strong)' : isError ? 'var(--color-state-error-strong)' : 'var(--color-neutral-text-strong)';
                const defaultOutline = isPrimary ? 'var(--color-brand-primary-strong)' : isError ? 'var(--color-state-error-strong)' : 'var(--color-neutral-outline-subtle)';
                border = `1px solid ${defaultOutline}`;
                hoverBg = isPrimary ? 'var(--color-brand-primary-subtlest)' : isError ? 'var(--color-state-error-subtlest)' : bg;
                if (isNeutral) {
                    hoverBorder = '1px solid var(--color-neutral-outline-strong)';
                    const elevationSize = size === 'small' ? 'small' : 'medium';
                    boxShadow = `var(--elevation-${elevationSize}-1-shadow)`;
                    hoverShadow = `var(--elevation-${elevationSize}-2-shadow)`;
                }
                break;
            }
        }

        // Apply hover state
        if (isHovered && hoverBg) {
            bg = hoverBg;
            if (hoverShadow) boxShadow = hoverShadow;
            if (hoverBorder) border = hoverBorder;
        }

        // Apply focus ring (large buttons use 3px ring, others use 2px)
        let focusRing: string | undefined;
        if (isFocused) {
            const isLarge = size === 'large';
            if (isPrimary) focusRing = isLarge ? 'var(--focus-ring-primary-large)' : 'var(--focus-ring-primary)';
            else if (isError) focusRing = isLarge ? 'var(--focus-ring-error-large)' : 'var(--focus-ring-error)';
            else focusRing = isLarge ? 'var(--focus-ring-neutral-large)' : 'var(--focus-ring-neutral)';
        }

        // Combine elevation shadow with focus ring
        let combinedShadow = boxShadow || 'none';
        if (focusRing) combinedShadow = boxShadow ? `${boxShadow}, ${focusRing}` : focusRing;

        // Loading state overrides
        if (loading) {
            const variantColor = isPrimary ? 'brand-primary' : isError ? 'state-error' : 'neutral';
            if (buttonStyle === 'outline') {
                bg = 'transparent';
                border = `1px solid var(--color-${variantColor}-${isNeutral ? 'outline-subtle' : 'subtle'})`;
            } else if (buttonStyle === 'subtle') {
                bg = 'transparent';
                border = '1px solid transparent';
            } else {
                bg = `var(--color-${variantColor}-${isNeutral ? 'surface-medium' : 'subtlest'})`;
                border = '1px solid transparent';
            }
            combinedShadow = 'none';
            color = isNeutral ? 'var(--color-neutral-text-medium)' : `var(--color-${variantColor}-strong)`;
        }

        return {
            background: bg,
            color,
            border,
            boxShadow: combinedShadow,
            backgroundOrigin,
            backgroundClip,
            outline: 'none',
            backdropFilter: `blur(var(--elevation-${size}-blur))`,
            WebkitBackdropFilter: `blur(var(--elevation-${size}-blur))`,
        };
    }, [variant, size, buttonStyle, disabled, isHovered, isFocused, loading, isPrimary, isError, isNeutral]);

    const renderIcon = (icon: React.ReactNode) => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon as React.ReactElement, { size: iconSize, weight: 'regular' } as any);
        }
        return icon;
    };

    return (
        <button
            className={cn(buttonVariants({ size, isIconOnly, fullWidth }), className, 'group')}
            disabled={disabled || loading}
            style={styles}
            {...hoverProps}
            {...focusProps}
            {...props}
        >
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Loader size={iconSize} variant={variant} />
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-full gap-[inherit]">
                    {leadingIcon && (
                        <span className="flex items-center justify-center shrink-0" style={{ width: iconSize, height: iconSize }}>
                            {renderIcon(leadingIcon)}
                        </span>
                    )}
                    {!isIconOnly && children && (
                        <span className="flex items-center justify-center px-1 whitespace-nowrap">{children}</span>
                    )}
                    {trailingIcon && (
                        <span className="flex items-center justify-center shrink-0" style={{ width: iconSize, height: iconSize }}>
                            {renderIcon(trailingIcon)}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
};
