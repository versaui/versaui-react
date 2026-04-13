'use client';

import React, { useMemo } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { useButton } from '@react-aria/button';

export const COMPACT_ICON_BUTTON_SIZES = ['default', 'small'] as const;
export const COMPACT_ICON_BUTTON_STYLES = ['filled', 'outline', 'subtle'] as const;

export type CompactIconButtonSize = (typeof COMPACT_ICON_BUTTON_SIZES)[number];
export type CompactIconButtonStyle = (typeof COMPACT_ICON_BUTTON_STYLES)[number];

const SIZE_CONFIG: Record<CompactIconButtonSize, { padding: number; iconSize: number }> = {
    default: { padding: 6, iconSize: 20 },
    small: { padding: 4, iconSize: 16 },
};

interface CompactIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: CompactIconButtonSize;
    variant?: CompactIconButtonStyle;
    icon: React.ReactNode;
    isHovered?: boolean;
    isFocused?: boolean;
}

export const CompactIconButton: React.FC<CompactIconButtonProps> = ({
    size = 'default',
    variant = 'filled',
    icon,
    disabled = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    className = '',
    onClick,
    ...props
}) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });
    const { buttonProps } = useButton(
        { isDisabled: disabled, onPress: onClick as any },
        buttonRef
    );

    const isHovered = propIsHovered ?? ariaIsHovered;
    const isFocused = propIsFocused ?? isFocusVisible;

    const { padding, iconSize } = SIZE_CONFIG[size];

    const styles = useMemo(() => {
        let background: string;
        let iconColor: string;
        let outline: string | undefined;
        let outlineOffset: string | undefined;
        let boxShadow: string | undefined;

        if (disabled) {
            // Disabled state
            switch (variant) {
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
            iconColor = 'var(--color-neutral-icon-disabled)';
        } else if (isFocused) {
            // Focused state - use neutral focus ring token (aligned to outside via box-shadow)
            switch (variant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-medium)';
                    iconColor = 'var(--color-neutral-icon-strong)';
                    break;
                case 'outline':
                    background = 'var(--color-neutral-surface-subtlest)';
                    iconColor = 'var(--color-neutral-icon-medium)';
                    outline = '1px solid var(--color-neutral-outline-subtle)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'transparent';
                    iconColor = 'var(--color-neutral-icon-medium)';
                    break;
            }
            // Use focus ring token - aligned to outside
            boxShadow = 'var(--focus-ring-neutral)';
        } else if (isHovered) {
            // Hovered state
            switch (variant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-strong)';
                    iconColor = 'var(--color-neutral-icon-strong)';
                    break;
                case 'outline':
                    background = 'var(--color-neutral-surface-subtlest)';
                    iconColor = 'var(--color-neutral-icon-strong)';
                    outline = '1px solid var(--color-neutral-outline-strong)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'var(--color-neutral-surface-subtle)';
                    iconColor = 'var(--color-neutral-icon-strong)';
                    break;
            }
        } else {
            // Default state
            switch (variant) {
                case 'filled':
                    background = 'var(--color-neutral-surface-medium)';
                    iconColor = 'var(--color-neutral-icon-strong)';
                    break;
                case 'outline':
                    background = 'var(--color-neutral-surface-subtlest)';
                    iconColor = 'var(--color-neutral-icon-medium)';
                    outline = '1px solid var(--color-neutral-outline-subtle)';
                    outlineOffset = '-1px';
                    break;
                case 'subtle':
                default:
                    background = 'transparent';
                    iconColor = 'var(--color-neutral-icon-medium)';
                    break;
            }
        }

        return {
            padding,
            background,
            borderRadius: 'var(--corner-radius-thematic-small)',
            outline: outline || 'none',
            outlineOffset,
            boxShadow: boxShadow || 'none',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: 'none',
            overflow: 'hidden',
            color: iconColor,
        };
    }, [variant, disabled, isHovered, isFocused, padding]);

    const renderIcon = () => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon as React.ReactElement, {
                size: iconSize,
                weight: 'regular',
            } as any);
        }
        return icon;
    };

    return (
        <button
            ref={buttonRef}
            className={className}
            style={styles}
            {...buttonProps}
            {...hoverProps}
            {...focusProps}
            {...props}
        >
            <span
                style={{
                    width: iconSize,
                    height: iconSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {renderIcon()}
            </span>
        </button>
    );
};
