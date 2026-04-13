'use client';

import React, { useState, useCallback } from 'react';
import { CirclesThreeIcon } from '@phosphor-icons/react';
import { useFocusRing } from '@react-aria/focus';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Badge } from '../Badge/Badge';

export const BAR_TAB_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export const BAR_TAB_STATES = ['default', 'hovered', 'selected', 'disabled'] as const;

export type BarTabOrientation = (typeof BAR_TAB_ORIENTATIONS)[number];
export type BarTabState = (typeof BAR_TAB_STATES)[number];

// Container variants
const containerVariants = cva(
    [
        'relative flex items-center box-border outline-none',
        'bg-transparent h-10',
        'transition-[background-color,box-shadow] duration-150 ease-out',
        'gap-[6px]',
    ],
    {
        variants: {
            orientation: {
                horizontal: 'justify-center px-[var(--spacing-4)] py-0',
                vertical: 'justify-start pl-[var(--spacing-5)] pr-[var(--spacing-4)] py-[var(--spacing-4)] min-w-[160px]',
            },
            disabled: {
                true: 'cursor-not-allowed',
                false: 'cursor-pointer',
            },
        },
        defaultVariants: {
            orientation: 'horizontal',
            disabled: false,
        },
    }
);

// Bar indicator variants
const barIndicatorVariants = cva(
    [
        'absolute rounded-[1px]',
        'bg-[var(--color-brand-primary-strong)]',
        'transition-[opacity,transform] duration-150 ease-out',
    ],
    {
        variants: {
            orientation: {
                horizontal: 'bottom-0 left-0 right-0 h-0.5',
                vertical: 'top-0 bottom-0 left-0 w-0.5',
            },
            selected: {
                true: 'opacity-100 scale-100',
                false: 'opacity-0 scale-[0.8]',
            },
        },
        defaultVariants: {
            orientation: 'horizontal',
            selected: false,
        },
    }
);

// Icon wrapper variants
const iconWrapperVariants = cva(
    [
        'flex items-center justify-center shrink-0',
        'w-5 h-5',
        'transition-colors duration-200 ease-out',
    ],
    {
        variants: {
            state: {
                default: 'text-[var(--color-neutral-icon-medium)]',
                hovered: 'text-[var(--color-neutral-icon-strong)]',
                selected: 'text-[var(--color-brand-primary-strong)]',
                disabled: 'text-[var(--color-neutral-icon-disabled)]',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

// Label variants
const labelVariants = cva(
    [
        'whitespace-nowrap',
        'transition-colors duration-200 ease-out',
    ],
    {
        variants: {
            state: {
                default: 'text-[var(--color-neutral-text-medium)]',
                hovered: 'text-[var(--color-neutral-text-strong)]',
                selected: 'text-[var(--color-brand-primary-strong)]',
                disabled: 'text-[var(--color-neutral-text-subtle)]',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

export interface BarTabProps extends VariantProps<typeof containerVariants> {
    /** Orientation of the tab */
    orientation?: BarTabOrientation;
    /** Visual state (for demo purposes) */
    state?: BarTabState;
    /** Whether to show the leading icon */
    showIcon?: boolean;
    /** Custom leading icon (defaults to CirclesThree) */
    leadingIcon?: React.ReactNode;
    /** Whether to show the badge */
    showBadge?: boolean;
    /** Badge count value */
    badgeCount?: number;
    /** Tab label */
    children: React.ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS class */
    className?: string;
    /** For controlled selected state */
    selected?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Hide internal bar indicator (used when parent handles sliding bar) */
    hideBarIndicator?: boolean;
}

export function BarTab({
    orientation = 'horizontal',
    state = 'default',
    showIcon = true,
    leadingIcon,
    showBadge = false,
    badgeCount = 0,
    children,
    onClick,
    className = '',
    selected,
    disabled = false,
    hideBarIndicator = false,
}: BarTabProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    // Derive actual state from props
    const actualState: BarTabState = disabled ? 'disabled' : (selected ? 'selected' : state);
    const isDisabled = disabled || actualState === 'disabled';

    // Derive visual state (includes hover)
    const visualState: BarTabState = isDisabled
        ? 'disabled'
        : actualState === 'selected'
            ? 'selected'
            : isHovered
                ? 'hovered'
                : 'default';

    const handleMouseEnter = useCallback(() => {
        if (!isDisabled) setIsHovered(true);
    }, [isDisabled]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const handleClick = useCallback(() => {
        if (!isDisabled && onClick) onClick();
    }, [isDisabled, onClick]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isDisabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    }, [isDisabled, onClick]);

    // Badge state mapping
    const getBadgeState = () => {
        if (actualState === 'disabled') return 'disabled';
        if (actualState === 'selected') return 'primary';
        return 'default';
    };

    const icon = leadingIcon || <CirclesThreeIcon size={20} weight="regular" />;

    return (
        <div
            role="tab"
            tabIndex={isDisabled ? -1 : 0}
            aria-selected={actualState === 'selected'}
            aria-disabled={isDisabled}
            className={clsx(containerVariants({ orientation, disabled: isDisabled }), className)}
            style={{
                boxShadow: isFocusVisible && !isDisabled ? 'var(--focus-ring-primary)' : 'none',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...focusProps}
        >
            {/* Bar indicator */}
            {!hideBarIndicator && (
                <div
                    className={barIndicatorVariants({ orientation, selected: actualState === 'selected' })}
                    aria-hidden="true"
                />
            )}

            {/* Icon */}
            {showIcon && (
                <div className={iconWrapperVariants({ state: visualState })}>
                    {icon}
                </div>
            )}

            {/* Label */}
            <span className={clsx('text-baseline-h8', labelVariants({ state: visualState }))}>
                {children}
            </span>

            {/* Badge */}
            {showBadge && (
                <Badge size="small" state={getBadgeState()} dot={false}>
                    {badgeCount}
                </Badge>
            )}
        </div>
    );
}

export default BarTab;
