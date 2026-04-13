'use client';

import React, { useState, useCallback, useMemo, isValidElement, cloneElement, type ReactElement } from 'react';
import { useFocusRing } from '@react-aria/focus';

export const BUTTON_GROUP_ITEM_TYPES = ['default', 'error'] as const;
export const BUTTON_GROUP_ITEM_SIZES = ['default', 'small'] as const;
export const BUTTON_GROUP_ITEM_STATES = ['default', 'hovered', 'focused', 'disabled'] as const;

export type ButtonGroupItemType = (typeof BUTTON_GROUP_ITEM_TYPES)[number];
export type ButtonGroupItemSize = (typeof BUTTON_GROUP_ITEM_SIZES)[number];
export type ButtonGroupItemState = (typeof BUTTON_GROUP_ITEM_STATES)[number];

export interface ButtonGroupItemProps {
    /** Type variant - affects color scheme */
    type?: ButtonGroupItemType;
    /** Size variant */
    size?: ButtonGroupItemSize;
    /** Whether this item is active/selected */
    active?: boolean;
    /** Visual state (for demo/storybook) */
    state?: ButtonGroupItemState;
    /** Button label - if not provided, renders icon-only */
    children?: React.ReactNode;
    /** Leading icon */
    leadingIcon?: React.ReactNode;
    /** Trailing icon */
    trailingIcon?: React.ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS class */
    className?: string;
    /** Additional inline styles */
    style?: React.CSSProperties;
    /** Accessible label for screen readers */
    ariaLabel?: string;
}

// Size configurations
const SIZE_CONFIG = {
    default: {
        paddingWithText: { horizontal: 16, vertical: 10 },
        paddingIconOnly: 10,
        iconSize: 20,
        gap: 4,
        textGap: 8, // Gap inside text wrapper
        lineHeight: 20,
        textPaddingH: 4, // Text horizontal padding
        textClass: 'text-h8', // baseline/title/H8
    },
    small: {
        paddingWithText: { horizontal: 12, vertical: 8 },
        paddingIconOnly: 8,
        iconSize: 16,
        gap: 2,
        textGap: 8,
        lineHeight: 16,
        textPaddingH: 4,
        textClass: 'text-h9', // baseline/title/H9
    }
};

// Color configurations based on type, active state, and current state
const getColors = (
    type: ButtonGroupItemType,
    active: boolean,
    state: ButtonGroupItemState
): { background: string; textColor: string; iconColor: string; outline: string; outlineWidth: number } => {
    // Disabled state overrides everything
    if (state === 'disabled') {
        if (active) {
            return {
                background: 'var(--color-neutral-surface-disabled)',
                textColor: 'var(--color-neutral-text-disabled)',
                iconColor: 'var(--color-neutral-icon-disabled)',
                outline: 'none',
                outlineWidth: 0
            };
        } else {
            return {
                background: 'transparent',
                textColor: 'var(--color-neutral-text-disabled)',
                iconColor: 'var(--color-neutral-icon-disabled)',
                outline: '1px solid var(--color-neutral-outline-subtlest)',
                outlineWidth: 1
            };
        }
    }

    // Active states
    if (active) {
        if (type === 'default') {
            switch (state) {
                case 'hovered':
                    return {
                        background: 'var(--color-neutral-surface-strong)',
                        textColor: 'var(--color-neutral-text-strong)',
                        iconColor: 'var(--color-neutral-icon-strong)',
                        outline: '1px solid var(--color-neutral-outline-subtle)',
                        outlineWidth: 1
                    };
                case 'focused':
                    return {
                        background: 'var(--color-neutral-surface-medium)',
                        textColor: 'var(--color-neutral-text-strong)',
                        iconColor: 'var(--color-neutral-icon-strong)',
                        outline: '2px solid var(--color-neutral-surface-strong)',
                        outlineWidth: 2
                    };
                default: // default state
                    return {
                        background: 'var(--color-neutral-surface-medium)',
                        textColor: 'var(--color-neutral-text-strong)',
                        iconColor: 'var(--color-neutral-icon-strong)',
                        outline: '1px solid var(--color-neutral-outline-subtle)',
                        outlineWidth: 1
                    };
            }
        } else { // error type
            switch (state) {
                case 'hovered':
                    return {
                        background: 'var(--color-state-error-subtler)',
                        textColor: 'var(--color-state-error-strong)',
                        iconColor: 'var(--color-state-error-strong)',
                        outline: '1px solid var(--color-neutral-outline-subtle)',
                        outlineWidth: 1
                    };
                case 'focused':
                    return {
                        background: 'var(--color-state-error-subtlest)',
                        textColor: 'var(--color-state-error-strong)',
                        iconColor: 'var(--color-state-error-strong)',
                        outline: '2px solid var(--color-state-error-subtler)',
                        outlineWidth: 2
                    };
                default: // default state
                    return {
                        background: 'var(--color-state-error-subtlest)',
                        textColor: 'var(--color-state-error-strong)',
                        iconColor: 'var(--color-state-error-strong)',
                        outline: '1px solid var(--color-neutral-outline-subtle)',
                        outlineWidth: 1
                    };
            }
        }
    }

    // Inactive states
    if (type === 'default') {
        switch (state) {
            case 'hovered':
                return {
                    background: 'var(--color-neutral-surface-subtle)',
                    textColor: 'var(--color-neutral-text-medium)',
                    iconColor: 'var(--color-neutral-icon-medium)',
                    outline: '1px solid var(--color-neutral-outline-subtle)',
                    outlineWidth: 1
                };
            case 'focused':
                return {
                    background: 'var(--color-neutral-background-default)',
                    textColor: 'var(--color-neutral-text-medium)',
                    iconColor: 'var(--color-neutral-icon-medium)',
                    outline: '2px solid var(--color-neutral-surface-strong)',
                    outlineWidth: 2
                };
            default: // default state
                return {
                    background: 'var(--color-neutral-background-default)',
                    textColor: 'var(--color-neutral-text-medium)',
                    iconColor: 'var(--color-neutral-icon-medium)',
                    outline: '1px solid var(--color-neutral-outline-subtle)',
                    outlineWidth: 1
                };
        }
    } else { // error type, inactive
        switch (state) {
            case 'hovered':
                return {
                    background: 'var(--color-state-error-subtlest)',
                    textColor: 'var(--color-state-error-medium)',
                    iconColor: 'var(--color-state-error-medium)',
                    outline: '1px solid var(--color-neutral-outline-subtle)',
                    outlineWidth: 1
                };
            case 'focused':
                return {
                    background: 'var(--color-neutral-background-default)',
                    textColor: 'var(--color-state-error-medium)',
                    iconColor: 'var(--color-state-error-medium)',
                    outline: '2px solid var(--color-state-error-subtler)',
                    outlineWidth: 2
                };
            default: // default state
                return {
                    background: 'var(--color-neutral-background-default)',
                    textColor: 'var(--color-state-error-medium)',
                    iconColor: 'var(--color-state-error-medium)',
                    outline: '1px solid var(--color-neutral-outline-subtle)',
                    outlineWidth: 1
                };
        }
    }
};

export function ButtonGroupItem({
    type = 'default',
    size = 'default',
    active = false,
    state = 'default',
    children,
    leadingIcon,
    trailingIcon,
    onClick,
    disabled = false,
    className = '',
    style,
    ariaLabel,
}: ButtonGroupItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    const isDisabled = disabled || state === 'disabled';
    const hasText = React.Children.count(children) > 0;
    const isIconOnly = !hasText;

    // Determine the actual visual state
    const actualState: ButtonGroupItemState = useMemo(() => {
        if (isDisabled) return 'disabled';
        if (state !== 'default') return state; // Use prop state if explicitly set
        if (isFocusVisible) return 'focused';
        if (isHovered) return 'hovered';
        return 'default';
    }, [isDisabled, state, isFocusVisible, isHovered]);

    const sizeConfig = SIZE_CONFIG[size];
    const colors = getColors(type, active, actualState);

    const handleMouseEnter = useCallback(() => {
        if (!isDisabled && state === 'default') {
            setIsHovered(true);
        }
    }, [isDisabled, state]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const handleClick = useCallback(() => {
        if (!isDisabled && onClick) {
            onClick();
        }
    }, [isDisabled, onClick]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isDisabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    }, [isDisabled, onClick]);

    // Container styles
    const containerStyle: React.CSSProperties = useMemo(() => {
        const padding = isIconOnly
            ? `${sizeConfig.paddingIconOnly}px`
            : `${sizeConfig.paddingWithText.vertical}px ${sizeConfig.paddingWithText.horizontal}px`;

        // Handle outline offset correctly - align 2px focus ring inside
        const outlineOffset = colors.outlineWidth === 2 ? '-2px' : '-0.5px';

        return {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${sizeConfig.gap}px`,
            padding,
            background: colors.background,
            outline: colors.outline,
            outlineOffset,
            overflow: 'hidden',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 150ms ease-out, outline 150ms ease-out',
            boxSizing: 'border-box',
            ...style,
        };
    }, [sizeConfig, isIconOnly, colors, isDisabled, style]);

    // Icon wrapper styles
    const getIconWrapperStyle = (): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${sizeConfig.iconSize}px`,
        height: `${sizeConfig.iconSize}px`,
        flexShrink: 0,
        color: colors.iconColor,
    });

    // Text wrapper styles
    const textWrapperStyle: React.CSSProperties = {
        height: `${sizeConfig.lineHeight}px`,
        paddingLeft: `${sizeConfig.textPaddingH}px`,
        paddingRight: `${sizeConfig.textPaddingH}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: `${sizeConfig.textGap}px`,
    };

    // Text label styles
    const textLabelStyle: React.CSSProperties = {
        color: colors.textColor,
        whiteSpace: 'nowrap',
    };

    // Icon props type for cloneElement
    interface IconProps {
        size?: number;
        weight?: string;
    }

    // Render icon with proper sizing
    const renderIcon = (icon: React.ReactNode) => {
        if (isValidElement(icon)) {
            return cloneElement(icon as ReactElement<IconProps>, {
                size: sizeConfig.iconSize,
                weight: 'regular',
            });
        }
        return icon;
    };

    return (
        <div
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-disabled={isDisabled}
            aria-pressed={active}
            aria-label={ariaLabel}
            className={className}
            style={containerStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...focusProps}
        >
            {/* Leading Icon */}
            {leadingIcon && (
                <div style={getIconWrapperStyle()}>
                    {renderIcon(leadingIcon)}
                </div>
            )}

            {/* Text Label */}
            {hasText && (
                <div style={textWrapperStyle}>
                    <span className={sizeConfig.textClass} style={textLabelStyle}>{children}</span>
                </div>
            )}

            {/* Trailing Icon */}
            {trailingIcon && hasText && (
                <div style={getIconWrapperStyle()}>
                    {renderIcon(trailingIcon)}
                </div>
            )}
        </div>
    );
}

export default ButtonGroupItem;
