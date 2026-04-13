'use client';

import React, { isValidElement, cloneElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TagSimpleIcon, TagChevronIcon, CheckCircleIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

// Constants
export const STATUS_TAG_SIZES = ['default', 'small'] as const;
export const STATUS_TAG_STATUSES = ['default', 'highlight', 'success', 'error', 'warning'] as const;

export type StatusTagSize = (typeof STATUS_TAG_SIZES)[number];
export type StatusTagStatus = (typeof STATUS_TAG_STATUSES)[number];

// CVA Variants
const statusTagVariants = cva(
    [
        'inline-flex items-center justify-center box-border',
        'rounded-full',
        '-outline-offset-1 outline outline-1',
        'backdrop-blur-0',
    ],
    {
        variants: {
            size: {
                default: 'gap-1.5',
                small: 'gap-1',
            },
            status: {
                default: 'bg-[var(--color-neutral-surface-subtle)] outline-[var(--color-neutral-outline-subtle)]',
                highlight: 'bg-[var(--color-brand-secondary-subtlest)] outline-[var(--color-brand-secondary-subtler)]',
                success: 'bg-[var(--color-state-success-subtlest)] outline-[var(--color-state-success-subtler)]',
                error: 'bg-[var(--color-state-error-subtlest)] outline-[var(--color-state-error-subtler)]',
                warning: 'bg-[var(--color-state-warning-subtlest)] outline-[var(--color-state-warning-subtler)]',
            },
            hasIcon: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            // Default size padding
            { size: 'default', hasIcon: true, className: 'py-1 pl-2 pr-3' },
            { size: 'default', hasIcon: false, className: 'py-1 px-3' },
            // Small size padding
            { size: 'small', hasIcon: true, className: 'py-0.5 pl-1.5 pr-2' },
            { size: 'small', hasIcon: false, className: 'py-0.5 px-2' },
        ],
        defaultVariants: {
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
const DEFAULT_ICONS: Record<StatusTagStatus, React.ComponentType<{ size: number; weight: 'duotone'; color: string; className: string }>> = {
    default: TagSimpleIcon,
    highlight: TagChevronIcon,
    success: CheckCircleIcon,
    error: WarningCircleIcon,
    warning: WarningIcon,
};

// Props
export interface StatusTagProps extends VariantProps<typeof statusTagVariants> {
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
}> = ({ icon, status, size }) => {
    if (icon === false) return null;

    const iconSize = ICON_SIZES[size];
    const color = STATUS_COLORS[status];
    const iconClassName = 'block shrink-0';

    // Default icon based on status
    if (icon === true) {
        const IconComponent = DEFAULT_ICONS[status];
        return <IconComponent size={iconSize} weight="duotone" color={color} className={iconClassName} />;
    }

    // Custom icon - clone with enforced size and color
    if (isValidElement(icon)) {
        return cloneElement(icon as React.ReactElement<{ size?: number; color?: string; className?: string }>, {
            size: iconSize,
            color,
            className: iconClassName,
        });
    }

    return <>{icon}</>;
};

// Component
export const StatusTag: React.FC<StatusTagProps> = ({
    size = 'default',
    status = 'default',
    icon = true,
    label = 'Status',
    className,
}) => {
    const hasIcon = icon !== false;
    const textColor = STATUS_COLORS[status];

    return (
        <div className={cn(statusTagVariants({ size, status, hasIcon }), className)}>
            <StatusIcon icon={icon} status={status} size={size} />

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
