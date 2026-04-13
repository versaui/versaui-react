'use client';

import React, { useMemo, useCallback, useState, useId } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import { Radio, type RadioSize } from './Radio';

export const RADIO_LABEL_SIZES = ['small', 'medium', 'large'] as const;

export type RadioLabelSize = (typeof RADIO_LABEL_SIZES)[number];

/**
 * Size configuration for RadioLabel
 * - radio: maps to Radio component size
 * - gap: horizontal gap between radio and text column (px)
 * - labelClass: typography class for label text
 * - supportingClass: typography class for supporting text
 */
const SIZE_CONFIG: Record<RadioLabelSize, {
    radio: RadioSize;
    gap: number;
    labelClass: string;
    supportingClass: string;
}> = {
    large: { radio: 'large', gap: 8, labelClass: 'text-b3', supportingClass: 'text-b4' },
    medium: { radio: 'medium', gap: 6, labelClass: 'text-b4', supportingClass: 'text-b5' },
    small: { radio: 'small', gap: 4, labelClass: 'text-b5', supportingClass: 'text-b6' }
};

export interface RadioLabelProps {
    /** Size variant */
    size?: RadioLabelSize;
    /** Required label text */
    label: string;
    /** Optional supporting text below the label */
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
 * RadioLabel Component
 * 
 * A radio button bundled with a label and optional supporting text to clarify
 * selection options or form settings.
 * 
 * @example
 * <RadioLabel
 *   size="medium"
 *   label="Option A"
 *   supportingText="This is the first option"
 *   onChange={(selected) => console.log(selected)}
 * />
 */
export const RadioLabel: React.FC<RadioLabelProps> = ({
    size = 'medium',
    label,
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

    const { radio, gap, labelClass, supportingClass } = SIZE_CONFIG[size];

    // Generate unique IDs for accessibility
    const generatedId = useId();
    const labelId = `${generatedId}-label`;
    const supportingId = supportingText ? `${generatedId}-supporting` : undefined;

    // Handle radio toggle
    const handleChange = useCallback((newSelected: boolean) => {
        if (!isControlled) {
            setInternalSelected(newSelected);
        }
        onChange?.(newSelected);
    }, [isControlled, onChange]);

    // Container styles - top-align text with radio
    const containerStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'flex-start', // Top-align text with radio
        gap: `${gap}px`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        userSelect: 'none'
    }), [gap, disabled]);

    // Keyboard handler for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled && !selected) handleChange(true);
        }
    }, [disabled, selected, handleChange]);

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

    // Supporting text color - using text-medium from Figma
    const supportingColor = disabled
        ? 'var(--color-neutral-text-disabled)'
        : 'var(--color-neutral-text-medium)';

    return (
        <div
            className={className}
            style={containerStyles}
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            aria-labelledby={labelId}
            aria-describedby={supportingId}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && !selected && handleChange(true)}
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

export default RadioLabel;
