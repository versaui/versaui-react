'use client';

import React, { useState, useCallback } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { CirclesThreeIcon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Badge } from '../Badge/Badge';
import { Material } from '../Material/Material';

export const CONTAINER_TAB_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export const CONTAINER_TAB_STATES = ['default', 'hovered', 'selected', 'disabled'] as const;
export const CONTAINER_TAB_SIZES = ['default', 'small'] as const;
export const CONTAINER_TAB_VARIANTS = ['primary', 'neutral'] as const;

export type ContainerTabOrientation = (typeof CONTAINER_TAB_ORIENTATIONS)[number];
export type ContainerTabState = (typeof CONTAINER_TAB_STATES)[number];
export type ContainerTabSize = (typeof CONTAINER_TAB_SIZES)[number];
export type ContainerTabVariant = (typeof CONTAINER_TAB_VARIANTS)[number];

// Container variants
const containerVariants = cva(
    [
        'inline-flex items-center box-border',
        'transition-[background-color,box-shadow,outline] duration-150 ease-out',
        'overflow-hidden',
    ],
    {
        variants: {
            orientation: {
                horizontal: 'justify-center w-auto',
                vertical: 'justify-start w-full',
            },
            size: {
                default: 'gap-[var(--spacing-2)] py-2 px-3 rounded-[var(--corner-radius-thematic-medium)]',
                small: 'gap-[2px] p-2 h-8 rounded-[var(--corner-radius-thematic-small)]',
            },
            state: {
                default: 'bg-transparent border border-transparent',
                hovered: 'bg-[var(--color-neutral-surface-medium)] border border-transparent',
                selected: 'border',
                disabled: 'bg-transparent border border-transparent cursor-not-allowed',
            },
            variant: {
                primary: '',
                neutral: '',
            },
            disabled: {
                true: 'cursor-not-allowed',
                false: 'cursor-pointer',
            },
        },
        compoundVariants: [
            // Primary selected
            {
                state: 'selected',
                variant: 'primary',
                className: [
                    'border-transparent',
                    'shadow-[var(--inset-subtle-small)]',
                    '[background:linear-gradient(var(--color-brand-primary-subtlest),var(--color-brand-primary-subtlest))_padding-box,var(--gradient-thematic-outline-primary-subtle)_border-box]',
                    '[background-origin:border-box]',
                    '[background-clip:padding-box,border-box]',
                ],
            },
            // Neutral selected — container becomes transparent; Material wrapper handles surface
            {
                state: 'selected',
                variant: 'neutral',
                className: [
                    'bg-transparent',
                    'border-transparent',
                    'shadow-none',
                ],
            },
        ],
        defaultVariants: {
            orientation: 'horizontal',
            size: 'default',
            state: 'default',
            variant: 'primary',
            disabled: false,
        },
    }
);

// Icon wrapper variants
const iconWrapperVariants = cva(
    [
        'flex items-center justify-center shrink-0',
        'transition-colors duration-200 ease-out',
    ],
    {
        variants: {
            size: {
                default: 'w-5 h-5',
                small: 'w-4 h-4',
            },
            state: {
                default: 'text-[var(--color-neutral-icon-medium)]',
                hovered: 'text-[var(--color-neutral-icon-strong)]',
                selected: '',
                disabled: 'text-[var(--color-neutral-icon-disabled)]',
            },
            variant: {
                primary: '',
                neutral: '',
            },
        },
        compoundVariants: [
            {
                state: 'selected',
                variant: 'primary',
                className: 'text-[var(--color-brand-primary-strong)]',
            },
            {
                state: 'selected',
                variant: 'neutral',
                className: 'text-[var(--color-neutral-icon-strong)]',
            },
        ],
        defaultVariants: {
            size: 'default',
            state: 'default',
            variant: 'primary',
        },
    }
);

// Label variants
const labelVariants = cva(
    [
        'whitespace-nowrap px-1',
        'font-semibold',
        'transition-colors duration-200 ease-out',
    ],
    {
        variants: {
            state: {
                default: 'text-[var(--color-neutral-text-medium)]',
                hovered: 'text-[var(--color-neutral-text-strong)]',
                selected: '',
                disabled: 'text-[var(--color-neutral-text-disabled)]',
            },
            variant: {
                primary: '',
                neutral: '',
            },
        },
        compoundVariants: [
            {
                state: 'selected',
                variant: 'primary',
                className: 'text-[var(--color-brand-primary-strong)]',
            },
            {
                state: 'selected',
                variant: 'neutral',
                className: 'text-[var(--color-neutral-text-strong)]',
            },
        ],
        defaultVariants: {
            state: 'default',
            variant: 'primary',
        },
    }
);

export interface ContainerTabProps extends VariantProps<typeof containerVariants> {
    /** Orientation of the tab */
    orientation?: ContainerTabOrientation;
    /** Size of the tab */
    size?: ContainerTabSize;
    /** Style variant of the tab */
    variant?: ContainerTabVariant;
    /** Visual state (for demo purposes) */
    state?: ContainerTabState;
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
}

export function ContainerTab({
    orientation = 'horizontal',
    size = 'default',
    variant = 'primary',
    state = 'default',
    showIcon = true,
    leadingIcon,
    showBadge = true,
    badgeCount = 24,
    children,
    onClick,
    className = '',
    selected,
    disabled = false,
}: ContainerTabProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    // Derive actual state from props
    const actualState: ContainerTabState = disabled ? 'disabled' : (selected ? 'selected' : state);
    const isDisabled = disabled || actualState === 'disabled';

    // Derive visual state (includes hover)
    const visualState: ContainerTabState = isDisabled
        ? 'disabled'
        : actualState === 'selected'
            ? 'selected'
            : isHovered
                ? 'hovered'
                : actualState;

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
        if (actualState === 'selected') {
            return variant === 'neutral' ? 'default' : 'primary';
        }
        return 'default';
    };

    // Icon size based on size prop
    const iconSize = size === 'small' ? 16 : 20;
    const icon = leadingIcon || <CirclesThreeIcon size={iconSize} weight="regular" />;

    // Text class based on size prop
    const textClass = size === 'small' ? 'text-baseline-h9' : 'text-baseline-h8';

    // Label height based on size
    const labelHeight = size === 'small' ? 'h-4' : 'h-6';

    // Determine if we need a Material wrapper (neutral + selected)
    const useNeutralMaterial = variant === 'neutral' && visualState === 'selected';

    // Map ContainerTab size to Material props
    const materialCornerRadius = size === 'small'
        ? 'var(--corner-radius-thematic-small)'
        : 'var(--corner-radius-thematic-medium)';

    const tabContent = (
        <div
            role="tab"
            tabIndex={isDisabled ? -1 : 0}
            aria-selected={actualState === 'selected'}
            aria-disabled={isDisabled}
            className={clsx(containerVariants({ orientation, size, state: visualState, variant, disabled: isDisabled }), className)}
            style={{
                outline: isFocusVisible && !isDisabled ? '2px solid var(--color-brand-primary-subtler)' : 'none',
                outlineOffset: '0px',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...focusProps}
        >
            {/* Icon */}
            {showIcon && (
                <div className={iconWrapperVariants({ size, state: visualState, variant })}>
                    {icon}
                </div>
            )}

            {/* Label */}
            <div className={`${labelHeight} flex items-center`}>
                <span className={clsx(textClass, labelVariants({ state: visualState, variant }))}>
                    {children}
                </span>
            </div>

            {/* Badge */}
            {showBadge && (
                <Badge size="small" state={getBadgeState()} dot={false}>
                    {badgeCount}
                </Badge>
            )}
        </div>
    );

    if (useNeutralMaterial) {
        const materialEl = (
            <Material
                size="small"
                elevation="default"
                cornerRadiusType="thematic"
                cornerRadius={materialCornerRadius}
            >
                {tabContent}
            </Material>
        );

        // Vertical tabs need a full-width wrapper so the Material surface spans the container
        if (orientation === 'vertical') {
            return <div className="w-full">{materialEl}</div>;
        }

        return materialEl;
    }

    return tabContent;
}

export default ContainerTab;
