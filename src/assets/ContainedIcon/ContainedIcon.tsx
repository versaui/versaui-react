'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const CONTAINED_ICON_STYLES = ['simple', 'expressive'] as const;
export const CONTAINED_ICON_ROLES = [
    'primary',
    'secondary',
    'neutral',
    'success',
    'error',
    'warning',
] as const;
export const CONTAINED_ICON_SIZES = ['small', 'medium', 'large', 'xlarge'] as const;
export const CONTAINED_ICON_CORNER_RADIUS_TYPES = ['default', 'control', 'full'] as const;

export type ContainedIconStyle = (typeof CONTAINED_ICON_STYLES)[number];
export type ContainedIconRole = (typeof CONTAINED_ICON_ROLES)[number];
export type ContainedIconSize = (typeof CONTAINED_ICON_SIZES)[number];
export type ContainedIconCornerRadiusType = (typeof CONTAINED_ICON_CORNER_RADIUS_TYPES)[number];

const ROLE_ICON_COLORS: Record<ContainedIconRole, string> = {
    primary: 'var(--color-brand-primary-strong)',
    secondary: 'var(--color-brand-secondary-strong)',
    neutral: 'var(--color-neutral-icon-strong)',
    success: 'var(--color-state-success-strong)',
    error: 'var(--color-state-error-strong)',
    warning: 'var(--color-state-warning-strong)',
};

const SIZE_ICON_PIXELS: Record<ContainedIconSize, number> = {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
};

const containedIconVariants = cva(
    'flex items-center justify-center shrink-0 overflow-hidden box-border select-none',
    {
        variants: {
            size: {
                small: 'w-8 h-8',
                medium: 'w-10 h-10',
                large: 'w-12 h-12',
                xlarge: 'w-16 h-16',
            },
            cornerRadiusType: {
                default: '',
                control: '',
                full: 'rounded-[var(--corner-radius-default-fully-rounded)]',
            },
            style: {
                simple: 'shadow-none',
                expressive: [
                    'border border-transparent',
                    '[background-origin:border-box]',
                    '[background-clip:padding-box,border-box]',
                ],
            },
            role: {
                primary: '',
                secondary: '',
                neutral: '',
                success: '',
                error: '',
                warning: '',
            },
        },
        compoundVariants: [
            // Simple style: solid fill and outline, zero shadow
            {
                style: 'simple',
                role: 'primary',
                className: 'bg-[var(--color-brand-primary-subtlest)] border border-[var(--color-brand-primary-subtler)]',
            },
            {
                style: 'simple',
                role: 'secondary',
                className: 'bg-[var(--color-brand-secondary-subtlest)] border border-[var(--color-brand-secondary-subtler)]',
            },
            {
                style: 'simple',
                role: 'neutral',
                className: 'bg-[var(--color-neutral-surface-subtle)] border border-[var(--color-neutral-outline-subtle)]',
            },
            {
                style: 'simple',
                role: 'success',
                className: 'bg-[var(--color-state-success-subtlest)] border border-[var(--color-state-success-subtler)]',
            },
            {
                style: 'simple',
                role: 'error',
                className: 'bg-[var(--color-state-error-subtlest)] border border-[var(--color-state-error-subtler)]',
            },
            {
                style: 'simple',
                role: 'warning',
                className: 'bg-[var(--color-state-warning-subtlest)] border border-[var(--color-state-warning-subtler)]',
            },

            // Expressive style: gradient fill and outline
            {
                style: 'expressive',
                role: 'primary',
                className: '[background:var(--gradient-thematic-fill-primary-subtle)_padding-box,var(--gradient-thematic-outline-primary-subtle)_border-box]',
            },
            {
                style: 'expressive',
                role: 'secondary',
                className: '[background:var(--gradient-thematic-fill-secondary-subtle)_padding-box,var(--gradient-thematic-outline-secondary-subtle)_border-box]',
            },
            {
                style: 'expressive',
                role: 'neutral',
                className: '[background:var(--gradient-thematic-fill-neutral)_padding-box,var(--gradient-thematic-outline-neutral)_border-box]',
            },
            {
                style: 'expressive',
                role: 'success',
                className: '[background:var(--gradient-thematic-fill-success-subtle)_padding-box,var(--gradient-thematic-outline-success-subtle)_border-box]',
            },
            {
                style: 'expressive',
                role: 'error',
                className: '[background:var(--gradient-thematic-fill-error-subtle)_padding-box,var(--gradient-thematic-outline-error-subtle)_border-box]',
            },
            {
                style: 'expressive',
                role: 'warning',
                className: '[background:var(--gradient-thematic-fill-warning-subtle)_padding-box,var(--gradient-thematic-outline-warning-subtle)_border-box]',
            },

            // Expressive style insets by size
            {
                style: 'expressive',
                size: 'small',
                className: 'shadow-[var(--inset-subtle-small)]',
            },
            {
                style: 'expressive',
                size: 'medium',
                className: 'shadow-[var(--inset-subtle-medium)]',
            },
            {
                style: 'expressive',
                size: 'large',
                className: 'shadow-[var(--inset-subtle-medium)]',
            },
            {
                style: 'expressive',
                size: 'xlarge',
                className: 'shadow-[var(--inset-subtle-large)]',
            },

            // Corner radius by size and cornerRadiusType
            {
                cornerRadiusType: 'default',
                size: 'small',
                className: 'rounded-[var(--corner-radius-default-small)]',
            },
            {
                cornerRadiusType: 'default',
                size: 'medium',
                className: 'rounded-[var(--corner-radius-default-medium)]',
            },
            {
                cornerRadiusType: 'default',
                size: 'large',
                className: 'rounded-[var(--corner-radius-default-large)]',
            },
            {
                cornerRadiusType: 'default',
                size: 'xlarge',
                className: 'rounded-[var(--corner-radius-default-x-large)]',
            },
            {
                cornerRadiusType: 'control',
                size: 'small',
                className: 'rounded-[var(--corner-radius-control-small)]',
            },
            {
                cornerRadiusType: 'control',
                size: 'medium',
                className: 'rounded-[var(--corner-radius-control-medium)]',
            },
            {
                cornerRadiusType: 'control',
                size: 'large',
                className: 'rounded-[var(--corner-radius-control-large)]',
            },
            {
                cornerRadiusType: 'control',
                size: 'xlarge',
                className: 'rounded-[var(--corner-radius-control-x-large)]',
            },
            {
                cornerRadiusType: 'full',
                className: 'rounded-[var(--corner-radius-default-fully-rounded)]',
            },
        ],
        defaultVariants: {
            style: 'simple',
            role: 'primary',
            size: 'medium',
            cornerRadiusType: 'default',
        },
    }
);

export interface ContainedIconProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'role' | 'color'>,
    VariantProps<typeof containedIconVariants> {
    /** Visual style treatment: 'simple' (solid fill + outline) or 'expressive' (gradient fill + outline + inset shadow) */
    style?: ContainedIconStyle;
    /** Semantic role controlling colors and gradients */
    role?: ContainedIconRole;
    /** Container and icon size variant */
    size?: ContainedIconSize;
    /** Corner radius type: 'default' uses default tokens, 'control' uses control tokens */
    cornerRadiusType?: ContainedIconCornerRadiusType;
    /** Optional explicit corner-radius override */
    cornerRadius?: string;
    /** Icon element or component to render inside the container */
    icon?: React.ReactNode | React.ElementType;
    /** Optional icon color override. Defaults to role's icon color token */
    color?: string;
    /** Optional explicit icon size in pixels */
    iconSize?: number;
    /** Icon weight: defaults to 'regular' for simple, 'duotone' for expressive */
    iconWeight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    /** Content to render inside the container */
    children?: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Inline style object for the container element */
    containerStyle?: React.CSSProperties;
}

/**
 * ContainedIcon Component
 *
 * Renders an icon inside a styled container supporting Simple (solid fill & outline)
 * and Expressive (thematic gradient & subtle inset shadow) visual styles across all core roles.
 */
export const ContainedIcon = forwardRef<HTMLDivElement, ContainedIconProps>(
    (
        {
            style = 'simple',
            role = 'primary',
            size = 'medium',
            cornerRadiusType = 'default',
            cornerRadius,
            icon,
            color,
            iconSize,
            iconWeight,
            className,
            children,
            containerStyle,
            ...props
        },
        ref
    ) => {
        const resolvedIconColor = color || ROLE_ICON_COLORS[role];
        const resolvedIconSize = iconSize ?? SIZE_ICON_PIXELS[size];
        const resolvedWeight = iconWeight ?? (style === 'expressive' ? 'duotone' : 'regular');

        const mergedStyle: React.CSSProperties = {
            ...(cornerRadius ? { borderRadius: cornerRadius } : {}),
            ...containerStyle,
        };

        const targetNode = icon ?? children;

        const renderContent = () => {
            if (!targetNode) return null;

            // Handle React element (e.g. <Sparkle />)
            if (React.isValidElement(targetNode)) {
                const elementProps = (targetNode.props || {}) as Record<string, unknown>;
                return React.cloneElement(targetNode as React.ReactElement, {
                    size: elementProps.size ?? resolvedIconSize,
                    weight: elementProps.weight ?? resolvedWeight,
                    color: elementProps.color ?? resolvedIconColor,
                    style: { display: 'block', ...(elementProps.style as React.CSSProperties) },
                } as any);
            }

            // Handle component function/class/forwardRef (e.g. Phosphor icons, Lucide icons)
            if (
                typeof targetNode === 'function' ||
                (typeof targetNode === 'object' && targetNode !== null && '$$typeof' in targetNode)
            ) {
                const IconComponent = targetNode as React.ElementType;
                return (
                    <IconComponent
                        size={resolvedIconSize}
                        weight={resolvedWeight}
                        color={resolvedIconColor}
                        style={{ display: 'block' }}
                    />
                );
            }

            return targetNode;
        };

        return (
            <div
                ref={ref}
                className={cn(containedIconVariants({ style, role, size, cornerRadiusType }), className)}
                style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
                aria-hidden="true"
                {...props}
            >
                {renderContent()}
            </div>
        );
    }
);

ContainedIcon.displayName = 'ContainedIcon';

export default ContainedIcon;
