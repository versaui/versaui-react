'use client';

import React, { useState, useMemo } from 'react';
import { CirclesThreeIcon } from '@phosphor-icons/react';
import { useFocusRing } from '@react-aria/focus';

export const BREADCRUMB_STATES = ['previous', 'current', 'hovered'] as const;

export type BreadcrumbState = (typeof BREADCRUMB_STATES)[number];

export interface BreadcrumbProps {
    state?: BreadcrumbState;
    icon?: boolean;
    iconComponent?: React.ReactNode;
    label?: string;
    href?: string;
    onClick?: () => void;
    className?: string;
}

// State-based color configuration
const STATE_STYLES: Record<BreadcrumbState, {
    textColor: string;
    iconColor: string;
    textDecoration: string;
}> = {
    previous: {
        textColor: 'var(--color-brand-primary-strong)',
        iconColor: 'var(--color-brand-primary-strong)',
        textDecoration: 'none',
    },
    hovered: {
        textColor: 'var(--color-brand-primary-stronger)',
        iconColor: 'var(--color-brand-primary-stronger)',
        textDecoration: 'underline',
    },
    current: {
        textColor: 'var(--color-neutral-text-medium)',
        iconColor: 'var(--color-neutral-text-medium)',
        textDecoration: 'none',
    },
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    state = 'current',
    icon = false,
    iconComponent,
    label = 'Breadcrumb',
    href,
    onClick,
    className = '',
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    // Determine effective state (apply hover effect for previous items)
    const isCurrent = state === 'current';
    let effectiveState: BreadcrumbState = state;
    if (!isCurrent && isHovered) {
        effectiveState = 'hovered';
    }

    const stateStyles = STATE_STYLES[effectiveState];
    const isClickable = !isCurrent;

    // Container styles
    const containerStyle: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 6,
        cursor: isCurrent ? 'default' : 'pointer',
        outline: 'none',
        borderRadius: 2,
        boxShadow: isClickable && isFocusVisible ? 'var(--focus-ring-primary)' : 'none',
    }), [isCurrent, isClickable, isFocusVisible]);

    // Text styles - H8 typography
    const textStyle: React.CSSProperties = useMemo(() => ({
        color: stateStyles.textColor,
        whiteSpace: 'nowrap',
        textDecoration: stateStyles.textDecoration,
    }), [stateStyles]);

    const handleClick = () => {
        if (!isCurrent && onClick) {
            onClick();
        }
    };

    const handleMouseEnter = () => {
        if (!isCurrent) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const content = (
        <div
            className={className}
            style={containerStyle}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-icon={icon}
            data-state={state}
            aria-current={isCurrent ? 'page' : undefined}
            tabIndex={isClickable && !href ? 0 : -1}
            {...(isClickable && !href ? focusProps : {})}
        >
            {icon && (
                <span style={{ color: stateStyles.iconColor, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {iconComponent || <CirclesThreeIcon size={16} weight="regular" />}
                </span>
            )}
            <span className="text-h8" style={textStyle}>{label}</span>
        </div>
    );

    // If href is provided, wrap in anchor tag
    if (href && !isCurrent) {
        return (
            <a
                href={href}
                style={{
                    textDecoration: 'none',
                    outline: 'none',
                    borderRadius: 2,
                    boxShadow: isFocusVisible ? 'var(--focus-ring-primary)' : 'none',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...focusProps}
            >
                {content}
            </a>
        );
    }

    return content;
};

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;

