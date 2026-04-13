'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Checks, ArrowRight } from '@phosphor-icons/react';
import { NotificationItem, type NotificationItemProps } from './NotificationItem';
import { LinkButton } from '../Button/LinkButton';
import { Divider } from '../Divider/Divider';
import { Material } from '../Material/Material';

// Types
export const NOTIFICATION_DROPDOWN_SIZES = ['default', 'large'] as const;
export type NotificationDropdownSize = (typeof NOTIFICATION_DROPDOWN_SIZES)[number];

// Notification data type (extends NotificationItemProps with id)
export interface NotificationData extends Omit<NotificationItemProps, 'onClick'> {
    id: string;
}

// CVA for container layout styles (visual styling handled by Material)
const containerVariants = cva(
    // Base layout styles only
    'flex flex-col',
    {
        variants: {
            size: {
                default: 'w-[320px] p-2',
                large: 'w-[400px] p-3',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
);

// CVA for notification list
const listVariants = cva('flex flex-col overflow-y-auto', {
    variants: {
        size: {
            default: 'gap-1',
            large: 'gap-2',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

// Size config for child component props (cannot be Tailwind)
const SIZE_CONFIG = {
    default: {
        notificationItemSize: 'default' as const,
        linkButtonSize: 'small' as const,
    },
    large: {
        notificationItemSize: 'large' as const,
        linkButtonSize: 'default' as const,
    },
} as const;

export interface NotificationDropdownProps extends VariantProps<typeof containerVariants> {
    /** Size variant */
    size?: NotificationDropdownSize;
    /** Array of notification items */
    notifications: NotificationData[];
    /** Callback when a notification is clicked */
    onNotificationClick?: (id: string) => void;
    /** Callback when "Mark all as Read" is clicked */
    onMarkAllAsRead?: () => void;
    /** Callback when "View All" is clicked */
    onViewAll?: () => void;
    /** Maximum height for scrolling (optional) */
    maxHeight?: number;
    /** Additional CSS classes */
    className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    size = 'default',
    notifications: initialNotifications,
    onNotificationClick,
    onMarkAllAsRead,
    onViewAll,
    maxHeight = 400,
    className = '',
}) => {
    const config = SIZE_CONFIG[size];

    // Internal state for managing read/unread
    const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);

    // Detect if there are any unread messages
    const hasUnread = useMemo(() => notifications.some((n) => n.unread), [notifications]);

    // Mark all as read handler
    const handleMarkAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        onMarkAllAsRead?.();
    }, [onMarkAllAsRead]);

    // Notification click handler
    const handleNotificationClick = useCallback(
        (id: string) => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
            );
            onNotificationClick?.(id);
        },
        [onNotificationClick]
    );

    return (
        <Material
            size={size === 'large' ? 'large' : 'medium'}
            elevation="floating"
            className={containerVariants({ size, className })}
        >
            <div className="flex flex-col overflow-hidden" style={{ borderRadius: 'inherit' }}>
            {/* Notification List */}
            <div
                className={listVariants({ size })}
                style={{ maxHeight }}
            >
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        {...notification}
                        size={config.notificationItemSize}
                        onClick={() => handleNotificationClick(notification.id)}
                    />
                ))}
            </div>

            {/* Divider above footer */}
            <Divider orientation="horizontal" style="intrusion" className="my-2" />

            {/* Footer with Links */}
            <div className="flex items-center justify-between px-2 py-1">
                {/* Mark all as Read */}
                <LinkButton
                    type="neutral"
                    size={config.linkButtonSize}
                    leadingIcon={<Checks weight="bold" />}
                    onClick={handleMarkAllAsRead}
                    disabled={!hasUnread}
                >
                    Mark all as Read
                </LinkButton>

                {/* View All */}
                <LinkButton
                    type="primary"
                    size={config.linkButtonSize}
                    trailingIcon={<ArrowRight weight="bold" />}
                    onClick={onViewAll}
                >
                    View All
                </LinkButton>
            </div>
            </div>
        </Material>
    );
};

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;
