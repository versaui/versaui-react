'use client';

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { BellSimpleIcon } from '@phosphor-icons/react';

export const NOTIFICATION_ICON_STATES = ['default', 'hovered', 'selected'] as const;
export type NotificationIconState = (typeof NOTIFICATION_ICON_STATES)[number];

// CVA for container with state-based styling
const containerVariants = cva(
    [
        'relative flex items-center justify-center',
        'w-8 h-8 p-1.5',
        'rounded-[var(--corner-radius-thematic-small)]',
        'cursor-pointer outline-none',
        'transition-[background-color,border-color] duration-150 ease-out',
        'box-border',
    ],
    {
        variants: {
            state: {
                default: [
                    'bg-[var(--color-neutral-surface-subtlest)]',
                    'border border-transparent',
                ],
                hovered: [
                    'bg-[var(--color-neutral-surface-subtle)]',
                    'border border-transparent',
                ],
                selected: [
                    'bg-[var(--color-neutral-surface-subtlest)]',
                    'border border-[var(--color-neutral-outline-strong)]',
                ],
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

interface NotificationIconProps extends VariantProps<typeof containerVariants> {
    /** 
     * Controls selected state. Hover is always handled internally. 
     * When true, shows selected styling. When false/undefined, shows default or hovered based on mouse.
     */
    selected?: boolean;
    notificationDot?: boolean;
    onClick?: () => void;
    className?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
    selected = false,
    notificationDot = false,
    onClick,
    className = '',
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Determine visual state
    const state: NotificationIconState = selected ? 'selected' : (isHovered ? 'hovered' : 'default');

    return (
        <button
            className={containerVariants({ state, className })}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            type="button"
        >
            <BellSimpleIcon
                size={20}
                weight="regular"
                className="text-[var(--color-neutral-icon-medium)]"
            />
            {notificationDot && (
                <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-[var(--color-neutral-surface-subtlest)] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[var(--color-state-error-medium)]" />
                </div>
            )}
        </button>
    );
};
