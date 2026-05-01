'use client';

import React, { useMemo, useCallback, useState, useId } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { Radio, type RadioSize } from './Radio';

export const RADIO_CONTAINER_SIZES = ['small', 'medium', 'large'] as const;

export type RadioContainerSize = (typeof RADIO_CONTAINER_SIZES)[number];

/**
 * Size configuration for RadioContainer
 * - radio: maps to Radio component size
 * - gap: horizontal gap between radio and text column (px)
 * - padding: container inner padding (px)
 * - titleClass: typography class for title text
 * - supportingClass: typography class for supporting text
 * - borderRadius: corner radius token for container
 */
const SIZE_CONFIG: Record<RadioContainerSize, {
    radio: RadioSize;
    gap: number;
    padding: number;
    titleClass: string;
    supportingClass: string;
    borderRadius: string;
}> = {
    large: { radio: 'large', gap: 8, padding: 8, titleClass: 'text-h7', supportingClass: 'text-b4', borderRadius: 'var(--corner-radius-default-medium)' },
    medium: { radio: 'medium', gap: 6, padding: 8, titleClass: 'text-h8', supportingClass: 'text-b5', borderRadius: 'var(--corner-radius-default-medium)' },
    small: { radio: 'small', gap: 4, padding: 6, titleClass: 'text-h9', supportingClass: 'text-b6', borderRadius: 'var(--corner-radius-default-small)' }
};

export interface RadioContainerProps {
    /** Size variant */
    size?: RadioContainerSize;
    /** Required title text */
    title: string;
    /** Optional supporting text below the title */
    supportingText?: string;
    /** Controlled selected state */
    selected?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Callback when selected state changes */
    onChange?: (selected: boolean) => void;
    /** Additional CSS class name */
    className?: string;
    /** Unique identifier */
    id?: string;
    /** Form field name */
    name?: string;
    /** Form field value */
    value?: string;
}

/**
 * RadioContainer Component
 * 
 * A selectable card containing a radio button with a title and optional
 * supporting text, used for choosing one option with additional context.
 * 
 * @example
 * <RadioContainer
 *   size="medium"
 *   title="Premium Plan"
 *   supportingText="$29/month with all features"
 *   onChange={(selected) => console.log(selected)}
 * />
 */
export const RadioContainer: React.FC<RadioContainerProps> = ({
    size = 'medium',
    title,
    supportingText,
    selected: controlledSelected,
    disabled = false,
    onChange,
    className = '',
    id,
    name,
    value
}) => {
    const { isHovered, hoverProps } = useHover({ isDisabled: disabled });
    const { isFocusVisible, focusProps } = useFocusRing();
    const [internalSelected, setInternalSelected] = useState(controlledSelected ?? false);

    const isControlled = controlledSelected !== undefined;
    const selected = isControlled ? controlledSelected : internalSelected;
    const isFocused = isFocusVisible;

    const { radio, gap, padding, titleClass, supportingClass, borderRadius } = SIZE_CONFIG[size];

    // Generate unique IDs for accessibility
    const generatedId = useId();
    const titleId = `${generatedId}-title`;
    const supportingId = supportingText ? `${generatedId}-supporting` : undefined;

    // Handle radio toggle
    const handleChange = useCallback((newSelected: boolean) => {
        if (!isControlled) {
            setInternalSelected(newSelected);
        }
        onChange?.(newSelected);
    }, [isControlled, onChange]);

    // Container click handler
    const handleClick = useCallback(() => {
        if (!disabled && !selected) {
            handleChange(true);
        }
    }, [disabled, selected, handleChange]);

    // Keyboard handler for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    // Container styles
    const containerStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'flex-start', // Top-align text with radio
        gap: `${gap}px`,
        padding: `${padding}px`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        // Background fill - surface-medium on hover, primary-subtlest when selected, surface-subtlest default
        backgroundColor: disabled
            ? 'var(--color-neutral-surface-subtlest)'
            : selected
                ? 'var(--color-brand-primary-subtlest)'
                : isHovered
                    ? 'var(--color-neutral-surface-medium)'
                    : 'var(--color-neutral-surface-subtlest)',
        // Border radius from SIZE_CONFIG based on size
        borderRadius: borderRadius,
        // Border: outline-subtle in default state, brand-primary-subtle when active
        border: selected && !disabled
            ? '1px solid var(--color-brand-primary-subtle)'
            : '1px solid var(--color-neutral-outline-subtle)',
        // Elevation shadow
        boxShadow: 'var(--elevation-small-1-shadow)',
        backdropFilter: 'blur(var(--elevation-small-blur))',
        WebkitBackdropFilter: 'blur(var(--elevation-small-blur))',
        transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
        userSelect: 'none'
    }), [gap, padding, selected, disabled, isHovered, borderRadius]);

    // Text column styles - contains both title and supporting text
    const textColumnStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        flexDirection: 'column',
        gap: '2px', // var(--spacing/1)
        flex: 1,
        minWidth: 0 // Allow text truncation if needed
    }), []);

    // Title text color
    const titleColor = disabled
        ? 'var(--color-neutral-text-disabled)'
        : 'var(--color-neutral-text-strong)';

    // Supporting text color
    const supportingColor = disabled
        ? 'var(--color-neutral-text-disabled)'
        : 'var(--color-neutral-text-medium)';

    return (
        <div
            className={className}
            style={{ ...containerStyles, outline: 'none' }}
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            aria-labelledby={titleId}
            aria-describedby={supportingId}
            tabIndex={disabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...mergeProps(hoverProps, focusProps)}
        >
            <Radio
                size={radio}
                selected={selected}
                disabled={disabled}
                isHovered={isHovered}
                isFocused={isFocused}
                onChange={handleChange}
                id={id}
                name={name}
                value={value}
            />
            <div style={textColumnStyles}>
                <span
                    id={titleId}
                    className={titleClass}
                    style={{ color: titleColor }}
                >
                    {title}
                </span>
                {supportingText && (
                    <span
                        id={supportingId}
                        className={supportingClass}
                        style={{ color: supportingColor }}
                    >
                        {supportingText}
                    </span>
                )}
            </div>
        </div>
    );
};

export default RadioContainer;
