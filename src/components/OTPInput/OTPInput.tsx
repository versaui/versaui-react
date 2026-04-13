'use client';

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cva } from 'class-variance-authority';
import { OTPInputBlock, type OTPInputBlockState } from './OTPInputBlock';
import { cn } from '../../utils/cn';

// =============================================================================
// Types
// =============================================================================

export const OTP_INPUT_SIZES = ['default', 'large'] as const;
export type OTPInputSize = (typeof OTP_INPUT_SIZES)[number];

export interface OTPInputProps {
    /** Number of input slots (4 or 6) */
    length?: 4 | 6;
    /** Position after which to show separator (e.g., 3 for "XXX-XXX") */
    separator?: number;
    /** Controlled value */
    value?: string;
    /** Default value for uncontrolled mode */
    defaultValue?: string;
    /** Called on every change */
    onChange?: (value: string) => void;
    /** Called when all slots are filled */
    onComplete?: (value: string) => void;
    /** Auto-focus first slot on mount */
    autoFocus?: boolean;
    /** Disable all inputs */
    disabled?: boolean;
    /** Read-only mode */
    readOnly?: boolean;
    /** Input mode for mobile keyboards */
    inputMode?: 'numeric' | 'text';
    /** Mask input values (password-style) */
    mask?: boolean;
    /** Error state with optional message */
    error?: boolean | string;
    /** Size variant */
    size?: OTPInputSize;
    /** Show supporting text below the input */
    supportingText?: boolean;
    /** Additional className */
    className?: string;
    /** Accessible label for the group */
    'aria-label'?: string;
}

export interface OTPInputRef {
    focus: () => void;
    clear: () => void;
    getValue: () => string;
}

// =============================================================================
// CVA Variants
// =============================================================================

/** Container styling - wrapper for all slots */
const containerVariants = cva('inline-flex items-center', {
    variants: { size: { default: 'gap-2', large: 'gap-3' } },
    defaultVariants: { size: 'default' },
});

/** Supporting text styling */
const supportingTextVariants = cva('mt-2 text-b5', {
    variants: {
        error: {
            true: 'text-[var(--color-state-error-strong)]',
            false: 'text-[var(--color-neutral-text-subtle)]'
        }
    },
    defaultVariants: { error: false },
});

/** Separator styling */
const separatorVariants = cva(
    'flex items-center justify-center text-[var(--color-neutral-surface-strongest)] font-bold select-none',
    {
        variants: {
            size: {
                default: 'w-4 text-h5',
                large: 'w-5 text-h4'
            }
        },
        defaultVariants: { size: 'default' },
    }
);

// =============================================================================
// Component
// =============================================================================

export const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
    (
        {
            length = 6,
            separator,
            value: controlledValue,
            defaultValue = '',
            onChange,
            onComplete,
            autoFocus = false,
            disabled = false,
            readOnly = false,
            inputMode = 'numeric',
            mask = false,
            error = false,
            size = 'default',
            supportingText,
            className = '',
            'aria-label': ariaLabel = 'Verification code',
        },
        ref
    ) => {
        // =========================================================================
        // State & Refs
        // =========================================================================

        const isControlled = controlledValue !== undefined;
        const [internalValue, setInternalValue] = useState(defaultValue);
        const currentValue = isControlled ? controlledValue : internalValue;
        const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
        const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

        // Generate unique ID for supporting text accessibility
        const supportingId = supportingText
            ? `otp-input-supporting-${Math.random().toString(36).substr(2, 9)}`
            : undefined;

        // Convert value string to array for rendering
        const valueArray = Array.from({ length }, (_, i) => currentValue[i] || '');

        // =========================================================================
        // Value Management
        // =========================================================================

        /** Update value and trigger callbacks */
        const updateValue = useCallback((newValue: string) => {
            const trimmed = newValue.slice(0, length);
            if (!isControlled) setInternalValue(trimmed);
            onChange?.(trimmed);

            // Trigger onComplete when all slots are filled
            if (trimmed.length === length && !trimmed.includes(' ')) {
                onComplete?.(trimmed);
            }
        }, [isControlled, length, onChange, onComplete]);

        /** Focus a specific slot by index */
        const focusSlot = useCallback((index: number) => {
            inputRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
        }, [length]);

        /** Read current values directly from DOM inputs */
        const getValuesFromDOM = useCallback(() => {
            return inputRefs.current.map(input => input?.value || '');
        }, []);

        /** Sync DOM inputs with React state when controlled value changes */
        useEffect(() => {
            inputRefs.current.forEach((input, index) => {
                if (input) {
                    const expectedValue = valueArray[index] === ' ' ? '' : valueArray[index];
                    if (input.value !== expectedValue) {
                        input.value = expectedValue;
                    }
                }
            });
        }, [currentValue, valueArray]);

        // =========================================================================
        // Imperative Handle
        // =========================================================================

        useImperativeHandle(ref, () => ({
            focus: () => focusSlot(0),
            clear: () => { updateValue(''); focusSlot(0); },
            getValue: () => currentValue,
        }), [currentValue, focusSlot, updateValue]);

        // =========================================================================
        // Effects
        // =========================================================================

        /** Auto-focus first slot on mount if enabled */
        useEffect(() => {
            if (autoFocus && !disabled) focusSlot(0);
        }, [autoFocus, disabled, focusSlot]);

        // =========================================================================
        // Event Handlers
        // =========================================================================

        /** Handle character input - filters by inputMode and auto-advances */
        const handleChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled || readOnly) return;

            // Filter input based on mode (numeric vs text)
            const char = inputMode === 'numeric'
                ? e.target.value.replace(/\D/g, '').slice(-1)
                : e.target.value.slice(-1);

            if (!char) {
                e.target.value = '';
                return;
            }

            // Update DOM and state
            e.target.value = char;
            const allValues = getValuesFromDOM();
            allValues[index] = char;
            updateValue(allValues.join(''));

            // Auto-advance to next slot
            if (index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }, [disabled, readOnly, inputMode, getValuesFromDOM, updateValue, length]);

        /** Handle keyboard navigation (Backspace, Delete, Arrow keys, Home, End) */
        const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled || readOnly) return;
            const input = e.target as HTMLInputElement;

            switch (e.key) {
                case 'Backspace': {
                    e.preventDefault();
                    if (input.value) {
                        // Clear current slot
                        input.value = '';
                        updateValue(getValuesFromDOM().join(''));
                    } else if (index > 0) {
                        // Move to previous slot and clear it
                        const prev = inputRefs.current[index - 1];
                        if (prev) {
                            prev.value = '';
                            prev.focus();
                            updateValue(getValuesFromDOM().join(''));
                        }
                    }
                    break;
                }
                case 'Delete':
                    e.preventDefault();
                    input.value = '';
                    updateValue(getValuesFromDOM().join(''));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (index > 0) inputRefs.current[index - 1]?.focus();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (index < length - 1) inputRefs.current[index + 1]?.focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    inputRefs.current[0]?.focus();
                    break;
                case 'End':
                    e.preventDefault();
                    inputRefs.current[length - 1]?.focus();
                    break;
            }
        }, [disabled, readOnly, getValuesFromDOM, updateValue, length]);

        /** Handle paste - strips spaces, filters by mode, distributes across slots */
        const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
            if (disabled || readOnly) return;
            e.preventDefault();

            let data = e.clipboardData.getData('text').replace(/\s/g, '');
            if (inputMode === 'numeric') data = data.replace(/\D/g, '');
            data = data.slice(0, length);

            if (data) {
                updateValue(data);
                focusSlot(Math.min(data.length, length - 1));
            }
        }, [disabled, readOnly, inputMode, length, updateValue, focusSlot]);

        // =========================================================================
        // State Helpers
        // =========================================================================

        /** Determine visual state for a slot based on focus, error, and value */
        const getSlotState = (index: number): OTPInputBlockState => {
            if (disabled) return 'disabled';
            if (error && focusedIndex === index) return 'error'; // Error + focused
            if (error) return 'error';
            if (focusedIndex === index) return 'active';
            if (valueArray[index]?.trim()) return 'filled';
            return 'default';
        };

        // =========================================================================
        // Render
        // =========================================================================

        return (
            <div className={cn("inline-flex flex-col", className)}>
                {/* Input slots container */}
                <div
                    role="group"
                    aria-label={ariaLabel}
                    aria-invalid={!!error}
                    aria-describedby={supportingId}
                    className={containerVariants({ size })}
                >
                    {Array.from({ length }).map((_, index) => (
                        <React.Fragment key={index}>
                            {/* Separator after specified position */}
                            {separator && index === separator && (
                                <span className={separatorVariants({ size })}>-</span>
                            )}
                            <OTPInputBlock
                                ref={(el) => { inputRefs.current[index] = el; }}
                                size={size}
                                state={getSlotState(index)}
                                type={mask ? 'password' : 'text'}
                                inputMode={inputMode}
                                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                value={valueArray[index] === ' ' ? '' : valueArray[index]}
                                disabled={disabled}
                                readOnly={readOnly}
                                aria-label={`Digit ${index + 1} of ${length}`}
                                aria-invalid={!!error}
                                onChange={(e) => handleChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                onFocus={() => { setFocusedIndex(index); inputRefs.current[index]?.select(); }}
                                onBlur={() => setFocusedIndex(null)}
                            />
                        </React.Fragment>
                    ))}
                </div>

                {/* Supporting text / Error message */}
                {(supportingText || (typeof error === 'string' && error)) && (
                    <p
                        id={supportingId}
                        className={supportingTextVariants({ error: !!error })}
                        role={error ? 'alert' : undefined}
                    >
                        {typeof error === 'string' ? error : 'Supporting text'}
                    </p>
                )}
            </div>
        );
    }
);

OTPInput.displayName = 'OTPInput';
export default OTPInput;
