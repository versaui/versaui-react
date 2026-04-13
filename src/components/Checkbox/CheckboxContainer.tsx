'use client';

import React, { useMemo, useCallback, useState, useId } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { Checkbox, type CheckboxSize, type CheckboxStyle } from './Checkbox';

export const CHECKBOX_CONTAINER_SIZES = ['small', 'medium', 'large'] as const;

export type CheckboxContainerSize = (typeof CHECKBOX_CONTAINER_SIZES)[number];

/**
 * Size configuration for CheckboxContainer
 * - checkbox: maps to Checkbox component size
 * - gap: horizontal gap between checkbox and text column (px)
 * - padding: container inner padding (px)
 * - titleClass: typography class for title text
 * - supportingClass: typography class for supporting text
 * - borderRadius: corner radius token for container
 */
const SIZE_CONFIG: Record<CheckboxContainerSize, {
    checkbox: CheckboxSize;
    gap: number;
    padding: number;
    paddingRight: number;
    titleClass: string;
    supportingClass: string;
    borderRadius: string;
}> = {
    large: { checkbox: 'large', gap: 8, padding: 8, paddingRight: 12, titleClass: 'text-h7', supportingClass: 'text-b4', borderRadius: 'var(--corner-radius-default-medium)' },
    medium: { checkbox: 'medium', gap: 6, padding: 8, paddingRight: 12, titleClass: 'text-h8', supportingClass: 'text-b5', borderRadius: 'var(--corner-radius-default-medium)' },
    small: { checkbox: 'small', gap: 4, padding: 6, paddingRight: 8, titleClass: 'text-h9', supportingClass: 'text-b6', borderRadius: 'var(--corner-radius-default-small)' }
};

export interface CheckboxContainerProps {
    /** Size variant */
    size?: CheckboxContainerSize;
    /** Required title text */
    title: string;
    /** Optional supporting text below the title */
    supportingText?: string;
    /** Controlled checked state */
    checked?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Checkbox style (square or circle) */
    checkboxStyle?: CheckboxStyle;
    /** Callback when checked state changes */
    onChange?: (checked: boolean) => void;
    /** Additional CSS class name */
    className?: string;
    /** Unique identifier */
    id?: string;
    /** Form field name */
    name?: string;
}

/**
 * CheckboxContainer Component
 * 
 * A selectable card containing a checkbox with a title and optional
 * supporting text, used for choosing multiple options with additional context.
 * 
 * @example
 * <CheckboxContainer
 *   size="medium"
 *   title="Email notifications"
 *   supportingText="Receive updates about your account"
 *   onChange={(checked) => console.log(checked)}
 * />
 */
export const CheckboxContainer: React.FC<CheckboxContainerProps> = ({
    size = 'medium',
    title,
    supportingText,
    checked: controlledChecked,
    disabled = false,
    checkboxStyle = 'square',
    onChange,
    className = '',
    id,
    name
}) => {
    const { isHovered, hoverProps } = useHover({ isDisabled: disabled });
    const { isFocusVisible, focusProps } = useFocusRing();
    const [internalChecked, setInternalChecked] = useState(controlledChecked ?? false);

    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;
    const isFocused = isFocusVisible;

    const { checkbox, gap, padding, paddingRight, titleClass, supportingClass, borderRadius } = SIZE_CONFIG[size];

    // Generate unique IDs for accessibility
    const generatedId = useId();
    const titleId = `${generatedId}-title`;
    const supportingId = supportingText ? `${generatedId}-supporting` : undefined;

    // Handle checkbox toggle
    const handleChange = useCallback((newChecked: boolean) => {
        if (!isControlled) {
            setInternalChecked(newChecked);
        }
        onChange?.(newChecked);
    }, [isControlled, onChange]);

    // Container click handler
    const handleClick = useCallback(() => {
        if (!disabled) {
            handleChange(!checked);
        }
    }, [disabled, checked, handleChange]);

    // Keyboard handler for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    // Container styles - applying Figma specs directly
    const containerStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'flex-start', // Top-align text with checkbox
        gap: `${gap}px`,
        padding: `${padding}px`,
        paddingRight: `${paddingRight}px`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        // Background fill - surface-medium on hover, primary-subtlest when checked, surface-subtlest default
        backgroundColor: disabled
            ? 'var(--color-neutral-surface-subtlest)'
            : checked
                ? 'var(--color-brand-primary-subtlest)'
                : isHovered
                    ? 'var(--color-neutral-surface-medium)'
                    : 'var(--color-neutral-surface-subtlest)',
        // Border radius from SIZE_CONFIG based on size
        borderRadius: borderRadius,
        // Border: outline-subtle in default state, brand-primary-subtle when active
        border: checked && !disabled
            ? '1px solid var(--color-brand-primary-subtle)'
            : '1px solid var(--color-neutral-outline-subtle)',
        // Elevation shadow from Figma
        boxShadow: 'var(--elevation-small-1-shadow)',
        backdropFilter: 'blur(var(--elevation-small-blur))',
        WebkitBackdropFilter: 'blur(var(--elevation-small-blur))',
        transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
        userSelect: 'none'
    }), [gap, padding, checked, disabled, isHovered]);

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

    // Supporting text color - using text-medium from Figma
    const supportingColor = disabled
        ? 'var(--color-neutral-text-disabled)'
        : 'var(--color-neutral-text-medium)';

    // Helper for aria-checked
    const getAriaChecked = useCallback(() => {
        if (checked === true) return 'true';
        if (checked === false) return 'false';
        return 'mixed'; // Or 'undefined' if tri-state is not supported
    }, [checked]);

    return (
        <div
            className={className}
            style={{ ...containerStyles, outline: 'none' }}
            role="checkbox"
            aria-checked={getAriaChecked()}
            aria-disabled={disabled}
            aria-labelledby={titleId}
            aria-describedby={supportingId}
            tabIndex={disabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...mergeProps(hoverProps, focusProps)}
        >
            <Checkbox
                size={checkbox}
                checkboxStyle={checkboxStyle}
                checked={checked}
                disabled={disabled}
                isHovered={isHovered}
                isFocused={isFocused}
                onChange={handleChange}
                id={id}
                name={name}
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

export default CheckboxContainer;
