'use client';

import React, { type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { CalendarBlank } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

// Types - sizes renamed: old 'small' is now 'default', old 'default' is now 'large'
export const NOTIFICATION_ITEM_SIZES = ['default', 'large'] as const;
export const NOTIFICATION_ITEM_LEADING_TYPES = ['none', 'icon', 'avatar', 'brand'] as const;
export const NOTIFICATION_ITEM_ICON_STATES = ['default', 'warning', 'error', 'success'] as const;

export type NotificationItemSize = (typeof NOTIFICATION_ITEM_SIZES)[number];
export type NotificationItemLeadingType = (typeof NOTIFICATION_ITEM_LEADING_TYPES)[number];
export type NotificationItemIconState = (typeof NOTIFICATION_ITEM_ICON_STATES)[number];

export interface NotificationItemProps {
    /** Size variant */
    size?: NotificationItemSize;
    /** Type of leading item */
    leadingItem?: NotificationItemLeadingType;
    /** Title text (required) */
    title: string;
    /** Description text (optional) */
    description?: string;
    /** Timestamp text (optional) */
    timestamp?: string;
    /** Whether notification is unread */
    unread?: boolean;
    /** Icon for leadingItem='icon' */
    icon?: ReactNode;
    /** Icon container state variant */
    iconState?: NotificationItemIconState;
    /** Avatar component for leadingItem='avatar' */
    avatar?: ReactNode;
    /** Brand icon component for leadingItem='brand' */
    brand?: ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

// CVA Variants for main container
const containerVariants = cva(
    'flex items-start cursor-pointer p-2',
    {
        variants: {
            size: {
                default: 'gap-2', // old 'small'
                large: 'gap-3',   // old 'default'
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
);

// CVA for icon container styling based on state
const iconContainerVariants = cva(
    'flex items-center justify-center shrink-0 rounded-full',
    {
        variants: {
            size: {
                default: 'p-1.5', // 6px - old 'small'
                large: 'p-2',     // 8px - old 'default'
            },
            state: {
                default: 'bg-[var(--color-neutral-surface-subtle)] border border-[var(--color-neutral-outline-subtle)]',
                warning: 'bg-[var(--color-state-warning-subtlest)] border border-[var(--color-state-warning-subtler)]',
                error: 'bg-[var(--color-state-error-subtlest)] border border-[var(--color-state-error-subtler)]',
                success: 'bg-[var(--color-state-success-subtlest)] border border-[var(--color-state-success-subtler)]',
            },
        },
        defaultVariants: {
            size: 'default',
            state: 'warning',
        },
    }
);

// CVA for brand container styling (neutral background)
const brandContainerVariants = cva(
    'flex items-center justify-center shrink-0 rounded-full bg-[var(--color-neutral-surface-subtle)]',
    {
        variants: {
            size: {
                default: 'p-1.5', // 6px - old 'small'
                large: 'p-2',     // 8px - old 'default'
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
);

// Size configuration - swapped: default is now smaller, large is bigger
const SIZE_CONFIG = {
    default: {
        titleClass: 'text-h8',
        descriptionClass: 'text-b5',
        timestampClass: 'text-b6',
        iconSize: 20,
        avatarSize: 32,
        brandSize: 20,
    },
    large: {
        titleClass: 'text-h7',
        descriptionClass: 'text-b4',
        timestampClass: 'text-b5',
        iconSize: 24,
        avatarSize: 40,
        brandSize: 24,
    },
} as const;

// Icon color based on state
const ICON_COLORS: Record<NotificationItemIconState, string> = {
    default: 'var(--color-neutral-icon-medium)',
    warning: 'var(--color-state-warning-medium)',
    error: 'var(--color-state-error-medium)',
    success: 'var(--color-state-success-medium)',
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    size = 'default',
    leadingItem = 'none',
    title,
    description,
    timestamp,
    unread = false,
    icon,
    iconState = 'warning',
    avatar,
    brand,
    onClick,
    className = '',
}) => {
    const config = SIZE_CONFIG[size];

    // Render leading item based on type
    const renderLeadingItem = () => {
        switch (leadingItem) {
            case 'icon':
                return (
                    <div className={iconContainerVariants({ size, state: iconState })}>
                        {icon ? (
                            React.isValidElement(icon)
                                ? React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string; weight?: string }>, {
                                    size: config.iconSize,
                                    color: ICON_COLORS[iconState],
                                    weight: 'duotone',
                                })
                                : icon
                        ) : (
                            <CalendarBlank
                                size={config.iconSize}
                                color={ICON_COLORS[iconState]}
                                weight="duotone"
                            />
                        )}
                    </div>
                );

            case 'avatar':
                if (!avatar) return null;
                return (
                    <div
                        className="shrink-0 rounded-full overflow-hidden"
                        style={{
                            width: config.avatarSize,
                            height: config.avatarSize,
                        }}
                    >
                        {avatar}
                    </div>
                );

            case 'brand':
                return (
                    <div className={brandContainerVariants({ size })}>
                        {brand ? (
                            React.isValidElement(brand)
                                ? React.cloneElement(brand as React.ReactElement<{ size?: number }>, {
                                    size: config.brandSize,
                                })
                                : brand
                        ) : null}
                    </div>
                );

            case 'none':
            default:
                return null;
        }
    };

    return (
        <div
            className={containerVariants({ size, className })}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            {/* Leading Item */}
            {renderLeadingItem()}

            {/* Content Container */}
            <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                {/* Title Row with Unread Indicator */}
                <div className="flex items-center gap-2 w-full">
                    <p
                        className={cn("flex-1 min-w-0 truncate text-[var(--color-neutral-text-strong)]", config.titleClass)}
                    >
                        {title}
                    </p>
                    {unread && (
                        <div
                            className="shrink-0 w-2 h-2 rounded-full"
                            style={{ backgroundColor: '#FB2C36' }}
                            aria-label="Unread"
                        />
                    )}
                </div>

                {/* Description */}
                {description && (
                    <p
                        className={cn("text-[var(--color-neutral-text-medium)]", config.descriptionClass)}
                    >
                        {description}
                    </p>
                )}

                {/* Timestamp */}
                {timestamp && (
                    <p
                        className={cn("text-[var(--color-neutral-text-medium)]", config.timestampClass)}
                    >
                        {timestamp}
                    </p>
                )}
            </div>
        </div>
    );
};

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
