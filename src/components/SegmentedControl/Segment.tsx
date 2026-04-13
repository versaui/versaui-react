'use client';

import { useState, useMemo, useCallback, isValidElement, cloneElement, Children, ReactNode, ReactElement } from 'react';
import { useFocusRing } from '@react-aria/focus';

export const SEGMENT_TYPES = ['primary', 'neutral'] as const;
export const SEGMENT_SIZES = ['small', 'medium', 'large'] as const;

export type SegmentType = (typeof SEGMENT_TYPES)[number];
export type SegmentSize = (typeof SEGMENT_SIZES)[number];

// Icon sizes per size variant
const ICON_SIZES: Record<SegmentSize, number> = {
    small: 16,
    medium: 20,
    large: 24
};

// Height for each size
const SIZE_HEIGHTS: Record<SegmentSize, number> = {
    small: 24,
    medium: 32,
    large: 40
};



// Horizontal padding per size variant
const PADDINGS: Record<SegmentSize, number> = {
    small: 12,
    medium: 16,
    large: 20
};

// Gap between icon and text
const GAPS: Record<SegmentSize, number> = {
    small: 4,
    medium: 4,
    large: 8
};

// Typography classes - use baseline font styles
const TYPOGRAPHY_CLASSES: Record<SegmentSize, string> = {
    small: 'text-baseline-h9',
    medium: 'text-baseline-h8',
    large: 'text-baseline-h7'
};

// Border radius classes
const BORDER_RADIUS_CLASSES: Record<SegmentSize, string> = {
    small: 'rounded-[var(--corner-radius-thematic-small)]',
    medium: 'rounded-[var(--corner-radius-thematic-medium)]',
    large: 'rounded-[var(--corner-radius-thematic-large)]'
};

interface SegmentProps {
    type?: SegmentType;
    size?: SegmentSize;
    selected?: boolean;
    isHovered?: boolean;
    icon?: ReactNode;
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export function Segment({
    type = 'primary',
    size = 'medium',
    selected = false,
    isHovered: propIsHovered,
    icon,
    children,
    onClick,
    className = '',
    disabled = false,
}: SegmentProps) {
    const [localIsHovered, setLocalIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    const isHovered = propIsHovered ?? localIsHovered;
    const hasChildren = Children.count(children) > 0;
    const isIconOnly = !hasChildren && !!icon;
    const isPrimary = type === 'primary';

    // Memoized styles computation
    const styles = useMemo(() => {
        let textColor: string;
        let iconColor: string;

        if (disabled) {
            textColor = 'var(--color-neutral-text-disabled)';
            iconColor = 'var(--color-neutral-icon-disabled)';
        } else if (selected) {
            if (isPrimary) {
                textColor = 'var(--color-neutral-text-inverse)';
                iconColor = 'var(--color-neutral-icon-inverse)';
            } else {
                textColor = 'var(--color-neutral-text-strong)';
                iconColor = 'var(--color-neutral-icon-strong)';
            }
        } else if (isHovered) {
            textColor = 'var(--color-neutral-text-medium)';
            iconColor = 'var(--color-neutral-icon-medium)';
        } else {
            textColor = 'var(--color-neutral-text-subtle)';
            iconColor = 'var(--color-neutral-icon-subtle)';
        }

        const height = SIZE_HEIGHTS[size];
        const padding = isIconOnly ? 0 : `0 ${PADDINGS[size]}px`;
        const gap = GAPS[size];

        return {
            container: {
                height: `${height}px`,
                width: isIconOnly ? `${height}px` : undefined,  // Square for icon-only
                minWidth: isIconOnly ? `${height}px` : undefined,  // Only icon-only has minWidth (square)
                padding,
                gap: `${gap}px`,
                color: textColor,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
            },
            icon: {
                color: iconColor,
                width: `${ICON_SIZES[size]}px`,
                height: `${ICON_SIZES[size]}px`,
            }
        };
    }, [type, size, selected, isHovered, disabled, isPrimary, isIconOnly]);

    // Focus ring styles using design tokens
    const focusRingStyle = useMemo((): React.CSSProperties => {
        if (!isFocusVisible || disabled) return {};
        const ring = isPrimary ? 'var(--focus-ring-primary)' : 'var(--focus-ring-neutral)';
        return { boxShadow: ring };
    }, [isFocusVisible, disabled, isPrimary]);

    const handleMouseEnter = useCallback(() => {
        if (!disabled) setLocalIsHovered(true);
    }, [disabled]);

    const handleMouseLeave = useCallback(() => {
        setLocalIsHovered(false);
    }, []);

    const handleClick = useCallback(() => {
        if (!disabled && onClick) {
            onClick();
        }
    }, [disabled, onClick]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
            e.preventDefault();
            onClick();
        }
    }, [disabled, onClick]);

    // Icon props type for cloneElement
    interface IconProps {
        size?: number;
        weight?: string;
    }

    // Render icon with proper size and weight
    const renderIcon = (iconElement: ReactNode) => {
        if (isValidElement(iconElement)) {
            return cloneElement(iconElement as ReactElement<IconProps>, {
                size: ICON_SIZES[size],
                weight: 'duotone'
            });
        }
        return iconElement;
    };

    const baseClasses = [
        'inline-flex items-center justify-center shrink-0',
        'transition-colors duration-150 ease-out',
        'font-semibold select-none',
        TYPOGRAPHY_CLASSES[size],
        BORDER_RADIUS_CLASSES[size],
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={baseClasses}
            style={{ ...styles.container, ...focusRingStyle, outline: 'none' }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-pressed={selected}
            {...focusProps}
        >
            {icon && (
                <span
                    className="flex items-center justify-center shrink-0"
                    style={styles.icon}
                >
                    {renderIcon(icon)}
                </span>
            )}
            {!isIconOnly && children && (
                <span className="whitespace-nowrap leading-none">
                    {children}
                </span>
            )}
        </div>
    );
}
