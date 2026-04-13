'use client';

import React, { useMemo, useCallback } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';

export const LINK_BUTTON_SIZES = ['default', 'small'] as const;
export const LINK_BUTTON_TYPES = ['primary', 'neutral', 'error'] as const;

export type LinkButtonSize = (typeof LINK_BUTTON_SIZES)[number];
export type LinkButtonType = (typeof LINK_BUTTON_TYPES)[number];

interface LinkButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
    size?: LinkButtonSize;
    type?: LinkButtonType;
    disabled?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    children?: React.ReactNode;
}

const ICON_SIZES: Record<LinkButtonSize, number> = {
    default: 20,
    small: 16
};

// Composite text classes for heading typography
const TEXT_CLASSES: Record<LinkButtonSize, string> = {
    default: 'text-h8',
    small: 'text-h9'
};

const BORDER_RADIUS: Record<LinkButtonSize, string> = {
    default: '4px',
    small: '2px'
};

export const LinkButton: React.FC<LinkButtonProps> = ({
    size = 'default',
    type = 'primary',
    disabled = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    leadingIcon,
    trailingIcon,
    children,
    className = '',
    style,
    onClick,
    ...props
}) => {
    const linkRef = React.useRef<HTMLAnchorElement>(null);
    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });

    const isHovered = propIsHovered ?? ariaIsHovered;
    const isFocused = propIsFocused ?? isFocusVisible;
    const iconSize = ICON_SIZES[size];

    const isPrimary = type === 'primary';
    const isNeutral = type === 'neutral';
    const isError = type === 'error';

    const getColor = useCallback(() => {
        if (disabled) {
            return 'var(--color-neutral-text-disabled)';
        }
        if (isHovered) {
            if (isPrimary) return 'var(--color-brand-primary-stronger)';
            if (isNeutral) return 'var(--color-neutral-text-strong)';
            if (isError) return 'var(--color-state-error-strong)';
        }
        if (isPrimary) return 'var(--color-brand-primary-strong)';
        if (isNeutral) return 'var(--color-neutral-text-medium)';
        if (isError) return 'var(--color-state-error-medium)';
        return 'var(--color-brand-primary-strong)';
    }, [disabled, isHovered, isPrimary, isNeutral, isError]);

    const getIconColor = useCallback(() => {
        if (disabled) {
            return 'var(--color-neutral-icon-disabled)';
        }
        if (isHovered) {
            if (isPrimary) return 'var(--color-brand-primary-stronger)';
            if (isNeutral) return 'var(--color-neutral-icon-strong)';
            if (isError) return 'var(--color-state-error-strong)';
        }
        if (isPrimary) return 'var(--color-brand-primary-strong)';
        if (isNeutral) return 'var(--color-neutral-icon-medium)';
        if (isError) return 'var(--color-state-error-medium)';
        return 'var(--color-brand-primary-strong)';
    }, [disabled, isHovered, isPrimary, isNeutral, isError]);

    // Use focus ring tokens via boxShadow for keyboard navigation
    const getFocusRing = useCallback(() => {
        if (!isFocused || disabled) return 'none';
        if (isPrimary) return 'var(--focus-ring-primary)';
        if (isNeutral) return 'var(--focus-ring-neutral)';
        if (isError) return 'var(--focus-ring-error)';
        return 'var(--focus-ring-primary)';
    }, [isFocused, disabled, isPrimary, isNeutral, isError]);

    const styles = useMemo((): React.CSSProperties => ({
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        padding: 0,
        margin: 0,
        border: 'none',
        background: 'none',
        borderRadius: BORDER_RADIUS[size],
        outline: 'none',
        boxShadow: getFocusRing(),
        textDecoration: isHovered && !disabled ? 'underline' : 'none',
        color: getColor(),
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: disabled ? 'none' : 'auto',
        ...style
    }), [size, isHovered, disabled, getColor, getFocusRing, style]);

    // Icon props type for cloneElement
    interface IconProps {
        size?: number;
        weight?: string;
        color?: string;
    }

    const renderIcon = useCallback((icon: React.ReactNode) => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon as React.ReactElement<IconProps>, {
                size: iconSize,
                weight: 'regular',
                color: getIconColor()
            });
        }
        return icon;
    }, [iconSize, getIconColor]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };

    return (
        <a
            ref={linkRef}
            className={`${TEXT_CLASSES[size]} ${className}`}
            style={styles}
            onClick={handleClick}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            {...hoverProps}
            {...focusProps}
            {...props}
        >
            {leadingIcon && (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: iconSize,
                        height: iconSize
                    }}
                >
                    {renderIcon(leadingIcon)}
                </span>
            )}
            {children && (
                <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {children}
                </span>
            )}
            {trailingIcon && (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: iconSize,
                        height: iconSize
                    }}
                >
                    {renderIcon(trailingIcon)}
                </span>
            )}
        </a>
    );
};

export default LinkButton;
