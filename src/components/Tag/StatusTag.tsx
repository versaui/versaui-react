'use client';

import React, { isValidElement, cloneElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TagSimpleIcon, TagChevronIcon, CheckCircleIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

// Constants
export const STATUS_TAG_SIZES = ['default', 'small'] as const;
export const STATUS_TAG_STYLES = ['simple', 'expressive'] as const;
export const STATUS_TAG_STATUSES = ['default', 'highlight', 'success', 'error', 'warning'] as const;

export type StatusTagSize = (typeof STATUS_TAG_SIZES)[number];
export type StatusTagStyle = (typeof STATUS_TAG_STYLES)[number];
export type StatusTagStatus = (typeof STATUS_TAG_STATUSES)[number];

// CVA Variants
const statusTagVariants = cva(
    [
        'inline-flex items-center justify-center box-border',
        'rounded-full',
        'backdrop-blur-0',
        'relative',
    ],
    {
        variants: {
            style: {
                simple: 'outline outline-1 -outline-offset-1',
                expressive: 'border border-transparent shadow-[var(--inset-subtle-small)]',
            },
            size: {
                default: 'gap-1.5',
                small: 'gap-1',
            },
            status: {
                default: '',
                highlight: '',
                success: '',
                error: '',
                warning: '',
            },
            hasIcon: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            // Simple style background, outline, shadow
            { style: 'simple', status: 'default', class: 'bg-[var(--color-neutral-surface-subtle)] outline-[var(--color-neutral-outline-subtle)]' },
            { style: 'simple', status: 'highlight', class: 'bg-[var(--color-brand-secondary-subtlest)] outline-[var(--color-brand-secondary-subtle)]' },
            { style: 'simple', status: 'success', class: 'bg-[var(--color-state-success-subtlest)] outline-[var(--color-state-success-subtle)]' },
            { style: 'simple', status: 'error', class: 'bg-[var(--color-state-error-subtlest)] outline-[var(--color-state-error-subtle)]' },
            { style: 'simple', status: 'warning', class: 'bg-[var(--color-state-warning-subtlest)] outline-[var(--color-state-warning-subtle)]' },

            // Expressive style composite fill & outline gradient tokens
            {
                style: 'expressive',
                status: 'default',
                class: '[background:var(--gradient-thematic-fill-neutral)_padding-box,var(--gradient-thematic-outline-neutral)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                status: 'highlight',
                class: '[background:var(--gradient-thematic-fill-secondary-subtle)_padding-box,var(--gradient-thematic-outline-secondary-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                status: 'success',
                class: '[background:var(--gradient-thematic-fill-success-subtle)_padding-box,var(--gradient-thematic-outline-success-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                status: 'error',
                class: '[background:var(--gradient-thematic-fill-error-subtle)_padding-box,var(--gradient-thematic-outline-error-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                status: 'warning',
                class: '[background:var(--gradient-thematic-fill-warning-subtle)_padding-box,var(--gradient-thematic-outline-warning-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },

            // Default size padding
            { size: 'default', hasIcon: true, class: 'py-1 pl-2 pr-3' },
            { size: 'default', hasIcon: false, class: 'py-1 px-3' },
            // Small size padding
            { size: 'small', hasIcon: true, class: 'py-0.5 pl-1.5 pr-2' },
            { size: 'small', hasIcon: false, class: 'py-0.5 px-2' },
        ],
        defaultVariants: {
            style: 'simple',
            size: 'default',
            status: 'default',
            hasIcon: true,
        },
    }
);

const textWrapperVariants = cva('flex items-center justify-center', {
    variants: {
        size: {
            default: 'h-5',
            small: 'h-4',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

// Status color mapping
const STATUS_COLORS: Record<StatusTagStatus, string> = {
    default: 'var(--color-neutral-text-medium)',
    highlight: 'var(--color-brand-secondary-strong)',
    success: 'var(--color-state-success-strong)',
    error: 'var(--color-state-error-strong)',
    warning: 'var(--color-state-warning-strong)',
};

// Size to icon size mapping
const ICON_SIZES: Record<StatusTagSize, number> = {
    default: 20,
    small: 16,
};

// Default icons per status
const DEFAULT_ICONS: Record<StatusTagStatus, React.ComponentType<{ size: number; weight: 'regular' | 'duotone'; color: string; className: string }>> = {
    default: TagSimpleIcon,
    highlight: TagChevronIcon,
    success: CheckCircleIcon,
    error: WarningCircleIcon,
    warning: WarningIcon,
};

// Props
export interface StatusTagProps extends VariantProps<typeof statusTagVariants> {
    /** Visual style treatment: 'simple' (solid surface) or 'expressive' (gradient surface). Default: 'simple' */
    style?: StatusTagStyle;
    /** Alias for style prop */
    variant?: StatusTagStyle;
    size?: StatusTagSize;
    status?: StatusTagStatus;
    icon?: boolean | React.ReactNode;
    label?: string;
    className?: string;
}

// Icon Component
const StatusIcon: React.FC<{
    icon: boolean | React.ReactNode;
    status: StatusTagStatus;
    size: StatusTagSize;
    style?: StatusTagStyle;
}> = ({ icon, status, size, style = 'simple' }) => {
    if (icon === false) return null;

    const iconSize = ICON_SIZES[size];
    const color = STATUS_COLORS[status];
    const iconClassName = 'block shrink-0';
    const weight = style === 'expressive' ? 'duotone' : 'regular';

    // Default icon based on status
    if (icon === true) {
        const IconComponent = DEFAULT_ICONS[status];
        return <IconComponent size={iconSize} weight={weight} color={color} className={iconClassName} />;
    }

    // Custom icon - clone with enforced size, weight, and color
    if (isValidElement(icon)) {
        return cloneElement(icon as React.ReactElement<{ size?: number; color?: string; weight?: string; className?: string }>, {
            size: iconSize,
            color,
            weight: (icon.props as any)?.weight ?? weight,
            className: cn(iconClassName, (icon.props as any)?.className),
        });
    }

    return <>{icon}</>;
};

// Component
export const StatusTag: React.FC<StatusTagProps> = ({
    style,
    variant,
    size = 'default',
    status = 'default',
    icon = true,
    label = 'Status',
    className,
}) => {
    const resolvedStyle = style || variant || 'simple';
    const hasIcon = icon !== false;
    const textColor = STATUS_COLORS[status];

    return (
        <div className={cn(statusTagVariants({ style: resolvedStyle, size, status, hasIcon }), className)}>
            <StatusIcon icon={icon} status={status} size={size} style={resolvedStyle} />

            <div className={textWrapperVariants({ size })}>
                <span
                    className={cn(size === 'default' ? 'text-b4' : 'text-b5', 'whitespace-nowrap')}
                    style={{ color: textColor }}
                >
                    {label}
                </span>
            </div>
        </div>
    );
};

StatusTag.displayName = 'StatusTag';

export default StatusTag;
