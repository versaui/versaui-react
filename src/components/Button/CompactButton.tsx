'use client';

import React, { useMemo } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { useButton } from '@react-aria/button';

export const COMPACT_BUTTON_SIZES = ['default', 'small'] as const;
export const COMPACT_BUTTON_STYLES = ['filled', 'outline', 'subtle'] as const;

export type CompactButtonSize = (typeof COMPACT_BUTTON_SIZES)[number];
export type CompactButtonStyle = (typeof COMPACT_BUTTON_STYLES)[number];

const SIZE_CONFIG: Record<CompactButtonSize, {
    padding: number;
    iconSize: number;
    gap: number;
    textClass: string;
    textPaddingX: number;
}> = {
    default: {
        padding: 6,
        iconSize: 20,
        gap: 4,
        textClass: 'text-h8 font-semibold',
        textPaddingX: 4,
    },
    small: {
        padding: 4,
        iconSize: 16,
        gap: 2,
        textClass: 'text-h9 font-semibold',
        textPaddingX: 4,
    },
};

export interface CompactButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
    /** Size variant: 'default' (32px) or 'small' (24px). Default: 'default' */
    size?: CompactButtonSize;
    /** Visual style variant: 'filled', 'outline', or 'subtle'. Default: 'filled' */
    variant?: CompactButtonStyle;
    /** Alias for variant prop matching Figma 'style' property */
    buttonStyle?: CompactButtonStyle;
    /** Leading icon element or boolean */
    leadingIcon?: React.ReactNode | boolean;
    /** Trailing icon element or boolean */
    trailingIcon?: React.ReactNode | boolean;
    /** Icon prop for icon-only button or backward compatibility */
    icon?: React.ReactNode;
    /** Explicitly control icon-only mode. Default: auto-detected based on children */
    iconOnly?: boolean;
    /** Force hovered state for testing/docs */
    isHovered?: boolean;
    /** Force focused state for testing/docs */
    isFocused?: boolean;
    /** Button text label or children element */
    children?: React.ReactNode;
}

export type CompactIconButtonProps = CompactButtonProps;

export const CompactButton: React.FC<CompactButtonProps> = ({
    size = 'default',
    variant = 'filled',
    buttonStyle,
    leadingIcon,
    trailingIcon,
    icon,
    iconOnly: propIconOnly,
    disabled = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    className = '',
    onClick,
    children,
    ...props
}) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const activeVariant = buttonStyle || variant;
    const isIconOnly = propIconOnly ?? (!children && Boolean(icon || leadingIcon));

    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });
    const { buttonProps } = useButton(
        { isDisabled: disabled, onPress: onClick as any },
        buttonRef
    );

    const isHovered = propIsHovered ?? ariaIsHovered;
    const isFocused = propIsFocused ?? isFocusVisible;

    const sizeConfig = SIZE_CONFIG[size];

    const styles = useMemo(() => {
        let background: string;
        let color: string;
        let outline: string | undefined;
        let outlineOffset: string | undefined;
        let boxShadow: string | undefined;

        if (disabled) {
            switch (activeVariant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-disabled)';
                    break;
                case 'outline':
                    background = 'transparent';
                    outline = '1px solid var(--color-neutral-outline-subtlest)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'transparent';
                    break;
            }
            color = 'var(--color-neutral-text-disabled)';
        } else if (isFocused) {
            switch (activeVariant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-medium)';
                    color = 'var(--color-neutral-text-strong)';
                    break;
                case 'outline':
                    background = 'var(--color-neutral-surface-subtlest)';
                    color = 'var(--color-neutral-text-strong)';
                    outline = '1px solid var(--color-neutral-outline-subtle)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'transparent';
                    color = 'var(--color-neutral-text-strong)';
                    break;
            }
            boxShadow = 'var(--focus-ring-neutral)';
        } else if (isHovered) {
            switch (activeVariant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-strong)';
                    color = 'var(--color-neutral-text-strong)';
                    break;
                case 'outline':
                    background = 'var(--color-neutral-surface-subtlest)';
                    color = 'var(--color-neutral-text-strong)';
                    outline = '1px solid var(--color-neutral-outline-strong)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'var(--color-neutral-surface-subtle)';
                    color = 'var(--color-neutral-text-strong)';
                    break;
            }
        } else {
            switch (activeVariant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-medium)';
                    color = 'var(--color-neutral-text-strong)';
                    break;
                case 'outline':
                    background = 'var(--color-neutral-surface-subtlest)';
                    color = 'var(--color-neutral-text-strong)';
                    outline = '1px solid var(--color-neutral-outline-subtle)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'transparent';
                    color = 'var(--color-neutral-text-strong)';
                    break;
            }
        }

        return {
            padding: sizeConfig.padding,
            background,
            borderRadius: 'var(--corner-radius-control-small)',
            outline: outline || 'none',
            outlineOffset,
            boxShadow: boxShadow || 'none',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isIconOnly ? 0 : sizeConfig.gap,
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: 'none',
            overflow: 'hidden',
            color,
            backdropFilter: activeVariant === 'outline' ? 'blur(var(--elevation-small-blur))' : 'none',
            WebkitBackdropFilter: activeVariant === 'outline' ? 'blur(var(--elevation-small-blur))' : 'none',
            boxSizing: 'border-box' as const,
        };
    }, [activeVariant, disabled, isHovered, isFocused, sizeConfig, isIconOnly]);

    const renderIconNode = (iconNode: React.ReactNode) => {
        if (!iconNode || typeof iconNode === 'boolean') return null;
        if (React.isValidElement(iconNode)) {
            return React.cloneElement(iconNode as React.ReactElement, {
                size: sizeConfig.iconSize,
                weight: 'regular',
            } as any);
        }
        return iconNode;
    };

    const effectiveLeadingIcon = leadingIcon ?? icon;

    return (
        <button
            ref={buttonRef}
            className={`shrink-0 box-border ${className}`}
            style={styles}
            {...buttonProps}
            {...hoverProps}
            {...focusProps}
            {...props}
        >
            {/* Leading Icon */}
            {Boolean(effectiveLeadingIcon) && (
                <span
                    style={{
                        width: sizeConfig.iconSize,
                        height: sizeConfig.iconSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {renderIconNode(effectiveLeadingIcon)}
                </span>
            )}

            {/* Text / Content */}
            {!isIconOnly && Boolean(children) && (
                <span
                    className={`${sizeConfig.textClass} flex items-center justify-center shrink-0`}
                    style={{
                        paddingLeft: sizeConfig.textPaddingX,
                        paddingRight: sizeConfig.textPaddingX,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {children}
                </span>
            )}

            {/* Trailing Icon */}
            {!isIconOnly && Boolean(trailingIcon) && (
                <span
                    style={{
                        width: sizeConfig.iconSize,
                        height: sizeConfig.iconSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {renderIconNode(trailingIcon)}
                </span>
            )}
        </button>
    );
};

CompactButton.displayName = 'CompactButton';

export default CompactButton;
