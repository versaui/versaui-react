'use client';

import React, { useMemo } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { BrandIcon, PLATFORM_NAMES } from '../BrandIcon/BrandIcon';
import type { BrandPlatform } from '../BrandIcon/BrandIcon';

export const SOCIAL_BUTTON_SIZES = ['large', 'default', 'small'] as const;
export type SocialButtonSize = (typeof SOCIAL_BUTTON_SIZES)[number];

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: SocialButtonSize;
    showText?: boolean;
    platform?: BrandPlatform;
    isHovered?: boolean;
    isFocused?: boolean;
}

const SIZE_CONFIG: Record<SocialButtonSize, {
    paddingH: number;
    paddingV: number;
    iconOnlyPadding: number;
    gap: number;
    iconSize: 'small' | 'medium' | 'large';
    fontStyle: React.CSSProperties;
    borderRadius: string;
    shadow: string;
}> = {
    large: {
        paddingH: 20,
        paddingV: 12,
        iconOnlyPadding: 12,
        gap: 12,
        iconSize: 'large',
        fontStyle: {
            fontSize: 'var(--typescale-H7-size)',
            fontFamily: 'var(--typography-font-family-title)',
            fontWeight: 'var(--typography-font-weight-title)',
            lineHeight: 'var(--typescale-H7-line-height)'
        },
        borderRadius: 'var(--corner-radius-thematic-large)',
        shadow: 'var(--elevation-medium-1-shadow)'
    },
    default: {
        paddingH: 16,
        paddingV: 10,
        iconOnlyPadding: 10,
        gap: 8,
        iconSize: 'medium',
        fontStyle: {
            fontSize: 'var(--typescale-H8-size)',
            fontFamily: 'var(--typography-font-family-title)',
            fontWeight: 'var(--typography-font-weight-title)',
            lineHeight: 'var(--typescale-H8-line-height)'
        },
        borderRadius: 'var(--corner-radius-thematic-medium)',
        shadow: 'var(--elevation-small-1-shadow)'
    },
    small: {
        paddingH: 12,
        paddingV: 8,
        iconOnlyPadding: 8,
        gap: 8,
        iconSize: 'small',
        fontStyle: {
            fontSize: 'var(--typescale-H9-size)',
            fontFamily: 'var(--typography-font-family-title)',
            fontWeight: 'var(--typography-font-weight-title)',
            lineHeight: 'var(--typescale-H9-line-height)'
        },
        borderRadius: 'var(--corner-radius-thematic-small)',
        shadow: 'var(--elevation-small-1-shadow)'
    }
};

export const SocialButton: React.FC<SocialButtonProps> = ({
    size = 'default',
    showText = true,
    platform = 'google',
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    disabled,
    className = '',
    style,
    children,
    ...props
}) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });

    const isHovered = propIsHovered ?? ariaIsHovered;
    const isFocused = propIsFocused ?? isFocusVisible;

    const config = SIZE_CONFIG[size];
    const platformName = PLATFORM_NAMES[platform] || platform;
    const buttonText = children || `Continue with ${platformName}`;

    const styles = useMemo((): React.CSSProperties => {
        const padding = showText
            ? `${config.paddingV}px ${config.paddingH}px`
            : `${config.iconOnlyPadding}px`;

        let background: string;
        let boxShadow: string | undefined;
        let outline: string;

        // Focus ring token based on size
        const focusRingToken = size === 'large'
            ? 'var(--focus-ring-neutral-large)'
            : 'var(--focus-ring-neutral)';

        if (isFocused && !disabled) {
            background = 'var(--color-neutral-surface-subtlest)';
            boxShadow = focusRingToken;
            outline = '1px solid var(--color-neutral-outline-subtle)';
        } else if (isHovered && !disabled) {
            background = 'var(--color-neutral-surface-subtlest)';
            const elevationSize = size === 'large' ? 'medium' : 'small';
            boxShadow = `var(--elevation-${elevationSize}-2-shadow)`;
            outline = '1px solid var(--color-neutral-outline-strong)';
        } else {
            background = 'var(--color-neutral-surface-subtlest)';
            boxShadow = config.shadow;
            outline = '1px solid var(--color-neutral-outline-subtle)';
        }

        if (disabled) {
            background = 'var(--color-neutral-surface-disabled)';
            boxShadow = undefined;
        }

        return {
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: showText ? config.gap : 0,
            padding,
            background,
            boxShadow,
            borderRadius: config.borderRadius,
            outline,
            outlineOffset: '-1px',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backdropFilter: `blur(var(--elevation-${size === 'large' ? 'medium' : 'small'}-blur))`,
            WebkitBackdropFilter: `blur(var(--elevation-${size === 'large' ? 'medium' : 'small'}-blur))`,
            opacity: disabled ? 0.5 : 1,
            transition: 'background 150ms ease-out, box-shadow 150ms ease-out, outline 150ms ease-out, transform 150ms ease-out',
            ...style
        };
    }, [size, showText, isHovered, isFocused, disabled, config, style]);

    const textStyle = useMemo((): React.CSSProperties => ({
        textAlign: 'center',
        whiteSpace: 'nowrap',
        color: disabled ? 'var(--color-neutral-text-disabled)' : 'var(--color-neutral-text-strong)',
        ...config.fontStyle
    }), [config.fontStyle, disabled]);

    return (
        <button
            ref={buttonRef}
            className={`active:scale-[0.98] active:duration-75 ${className}`}
            style={styles}
            disabled={disabled}
            {...hoverProps}
            {...focusProps}
            {...props}
        >
            <BrandIcon
                platform={platform}
                size={config.iconSize}
                style="brand"
                interactive={false}
            />
            {showText && (
                <span style={textStyle}>
                    {buttonText}
                </span>
            )}
        </button>
    );
};

export default SocialButton;
