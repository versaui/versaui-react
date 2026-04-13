'use client';

import { useMemo, type FC, type ReactNode, type CSSProperties } from 'react';

export const BADGE_SIZES = ['default', 'small'] as const;
export const BADGE_STATES = ['default', 'important', 'primary', 'secondary', 'success', 'disabled'] as const;

export type BadgeSize = (typeof BADGE_SIZES)[number];
export type BadgeState = (typeof BADGE_STATES)[number];

interface BadgeProps {
    size?: BadgeSize;
    state?: BadgeState;
    dot?: boolean;
    children?: ReactNode;
    className?: string;
}

const STATE_STYLES: Record<BadgeState, {
    background: string;
    border: string;
    dotColor: string;
    textColor: string;
}> = {
    default: {
        background: 'var(--color-neutral-surface-subtle)',
        border: 'var(--color-neutral-outline-subtle)',
        dotColor: 'var(--color-neutral-text-medium)',
        textColor: 'var(--color-neutral-text-medium)',
    },
    important: {
        background: 'var(--color-state-error-subtlest)',
        border: 'var(--color-state-error-subtler)',
        dotColor: 'var(--color-state-error-strong)',
        textColor: 'var(--color-state-error-strong)',
    },
    primary: {
        background: 'var(--color-brand-primary-subtlest)',
        border: 'var(--color-brand-primary-subtler)',
        dotColor: 'var(--color-brand-primary-strong)',
        textColor: 'var(--color-brand-primary-strong)',
    },
    secondary: {
        background: 'var(--color-brand-secondary-subtlest)',
        border: 'var(--color-brand-secondary-subtler)',
        dotColor: 'var(--color-brand-secondary-strong)',
        textColor: 'var(--color-brand-secondary-strong)',
    },
    success: {
        background: 'var(--color-state-success-subtlest)',
        border: 'var(--color-state-success-subtler)',
        dotColor: 'var(--color-state-success-strong)',
        textColor: 'var(--color-state-success-strong)',
    },
    disabled: {
        background: 'var(--color-neutral-surface-disabled)',
        border: 'var(--color-neutral-outline-subtlest)',
        dotColor: 'var(--color-neutral-text-disabled)',
        textColor: 'var(--color-neutral-text-disabled)',
    },
};

const SIZE_CONFIG: Record<BadgeSize, {
    height: string;
    minWidth: string;
    paddingX: string;
    gap: string;
    dotSize: string;
    textClass: string;
}> = {
    default: {
        height: '24px',
        minWidth: '24px',
        paddingX: '8px',
        gap: 'var(--spacing-2)', // 4px
        dotSize: '4px',
        textClass: 'text-baseline-b4',
    },
    small: {
        height: '16px',
        minWidth: '16px',
        paddingX: '6px', // spacing-3
        gap: 'var(--spacing-2)', // 4px
        dotSize: '4px',
        textClass: 'text-baseline-b6',
    },
};

export const Badge: FC<BadgeProps> = ({
    size = 'default',
    state = 'default',
    dot = true,
    children,
    className = '',
}) => {
    const stateStyles = STATE_STYLES[state];
    const sizeConfig = SIZE_CONFIG[size];

    const containerStyle: CSSProperties = useMemo(() => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: dot ? sizeConfig.gap : 0,
        height: sizeConfig.height,
        minWidth: sizeConfig.minWidth,
        paddingLeft: sizeConfig.paddingX,
        paddingRight: sizeConfig.paddingX,
        backgroundColor: stateStyles.background,
        border: `1px solid ${stateStyles.border}`,
        borderRadius: 'var(--corner-radius-default-fully-rounded)',
        boxSizing: 'border-box',
    }), [dot, sizeConfig, stateStyles]);

    const dotStyle: CSSProperties = useMemo(() => ({
        width: sizeConfig.dotSize,
        height: sizeConfig.dotSize,
        borderRadius: '50%',
        backgroundColor: stateStyles.dotColor,
        flexShrink: 0,
    }), [sizeConfig.dotSize, stateStyles.dotColor]);

    const textStyle: CSSProperties = useMemo(() => ({
        color: stateStyles.textColor,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        letterSpacing: '0px',
    }), [stateStyles.textColor]);

    // Determine aria-label for dot-only badges
    const ariaLabel = dot && !children ? `${state} status indicator` : undefined;

    return (
        <span
            className={className}
            style={containerStyle}
            role="status"
            aria-label={ariaLabel}
        >
            {dot && <span style={dotStyle} aria-hidden="true" />}
            {children && (
                <span className={sizeConfig.textClass} style={textStyle}>
                    {children}
                </span>
            )}
        </span>
    );
};

export default Badge;
