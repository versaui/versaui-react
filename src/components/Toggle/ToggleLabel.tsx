'use client';

import React, { useMemo, useCallback, useState, useId } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { Toggle, type ToggleSize, type ToggleStyle } from './Toggle';

export const TOGGLE_LABEL_SIZES = ['small', 'medium', 'large'] as const;

export type ToggleLabelSize = (typeof TOGGLE_LABEL_SIZES)[number];

/**
 * Size configuration for ToggleLabel
 * - toggle: maps to Toggle component size
 * - gap: horizontal gap between toggle and text column (px)
 * - labelClass: typography class for label text
 * - supportingClass: typography class for supporting text
 */
const SIZE_CONFIG: Record<ToggleLabelSize, {
    toggle: ToggleSize;
    gap: number;
    labelClass: string;
    supportingClass: string;
}> = {
    large: { toggle: 'large', gap: 8, labelClass: 'text-b3', supportingClass: 'text-b4' },
    medium: { toggle: 'medium', gap: 8, labelClass: 'text-b4', supportingClass: 'text-b5' },
    small: { toggle: 'small', gap: 8, labelClass: 'text-b5', supportingClass: 'text-b6' }
};

export interface ToggleLabelProps {
    /** Size variant */
    size?: ToggleLabelSize;
    /** Required label text */
    label: string;
    /** Optional supporting text below the label */
    supportingText?: string;
    /** Controlled checked state */
    checked?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Toggle style (default or pill) */
    toggleStyle?: ToggleStyle;
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
 * ToggleLabel Component
 * 
 * A toggle switch bundled with a label and optional supporting text to clarify
 * selection options or form settings.
 * 
 * @example
 * <ToggleLabel
 *   size="medium"
 *   label="Dark mode"
 *   supportingText="Enable dark theme across the app"
 *   onChange={(checked) => console.log(checked)}
 * />
 */
export const ToggleLabel: React.FC<ToggleLabelProps> = ({
    size = 'medium',
    label,
    supportingText,
    checked: controlledChecked,
    disabled = false,
    toggleStyle = 'default',
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

    const { toggle, gap, labelClass, supportingClass } = SIZE_CONFIG[size];

    // Generate unique IDs for accessibility
    const generatedId = useId();
    const labelId = `${generatedId}-label`;
    const supportingId = supportingText ? `${generatedId}-supporting` : undefined;

    // Handle toggle change
    const handleChange = useCallback((newChecked: boolean) => {
        if (!isControlled) {
            setInternalChecked(newChecked);
        }
        onChange?.(newChecked);
    }, [isControlled, onChange]);

    // Container styles - top-align text with toggle
    const containerStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'flex-start', // Top-align text with toggle
        gap: `${gap}px`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        userSelect: 'none'
    }), [gap, disabled]);

    // Keyboard handler for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled) handleChange(!checked);
        }
    }, [disabled, checked, handleChange]);

    // Text column styles - contains both label and supporting text
    const textColumnStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        flexDirection: 'column',
        gap: '2px' // var(--spacing/1)
    }), []);

    // Label text color
    const labelColor = disabled
        ? 'var(--color-neutral-text-disabled)'
        : 'var(--color-neutral-text-strong)';

    // Supporting text color
    const supportingColor = disabled
        ? 'var(--color-neutral-text-disabled)'
        : 'var(--color-neutral-text-medium)';

    return (
        <div
            className={className}
            style={containerStyles}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            aria-labelledby={labelId}
            aria-describedby={supportingId}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && handleChange(!checked)}
            onKeyDown={handleKeyDown}
            {...mergeProps(hoverProps, focusProps)}
        >
            <Toggle
                size={toggle}
                style={toggleStyle}
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
                    id={labelId}
                    className={labelClass}
                    style={{ color: labelColor }}
                >
                    {label}
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

export default ToggleLabel;
