'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle, useId, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { NotchesIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

// TYPES & CONSTANTS

export const TEXT_AREA_STATES = ['default', 'error', 'success'] as const;
export type TextAreaState = (typeof TEXT_AREA_STATES)[number];

// Size configuration
const SIZE = {
    minHeight: 88,
    padding: 8,
    gap: 4,
    inputPadding: 4,
    iconSize: 20,
    counterSize: 12,
    resizeIconSize: 12,
    minTextareaHeight: 40,
    radius: 'var(--corner-radius-default-medium, 6px)',
};

// Color tokens
const C = {
    bg: {
        default: 'var(--color-neutral-surface-subtle)',
        hover: 'var(--color-neutral-surface-medium)',
        disabled: 'var(--color-neutral-surface-subtle)',
    },
    border: {
        default: 'var(--color-neutral-outline-subtle)',
        focus: 'var(--color-brand-primary-strong)',
        error: 'var(--color-state-error-strong)',
        success: 'var(--color-state-success-strong)',
    },
    text: {
        label: 'var(--color-neutral-text-subtle)',
        labelFloat: 'var(--color-neutral-text-medium)',
        input: 'var(--color-neutral-text-strong)',
        support: 'var(--color-neutral-text-medium)',
        disabled: 'var(--color-neutral-text-disabled)',
        error: 'var(--color-state-error-strong)',
        success: 'var(--color-state-success-strong)',
    },
    icon: {
        default: 'var(--color-neutral-icon-subtle)',
        disabled: 'var(--color-neutral-icon-disabled)',
    },
} as const;

// CVA VARIANTS

const labelStyles = cva('transition-all duration-150', {
    variants: {
        floating: {
            true: 'text-b6',
            false: 'text-b4',
        },
    },
    defaultVariants: { floating: false },
});

const inputStyles = cva('text-b4', { variants: {}, defaultVariants: {} });
const supportStyles = cva('text-b5', { variants: {}, defaultVariants: {} });

const containerStyles = cva('rounded-[var(--corner-radius-default-medium,6px)]', {
    variants: {
        status: {
            default: '',
            error: '',
            success: '',
        },
    },
    defaultVariants: { status: 'default' },
});

// PROPS INTERFACE

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
    label?: string;
    helperText?: string;
    errorText?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    status?: TextAreaState;
    rows?: number;
    minRows?: number;
    maxRows?: number;
    resize?: 'none' | 'vertical';
    trailing?: React.ReactNode;
    onTrailingClick?: () => void;
    trailingAriaLabel?: string;
    trailingIcon?: React.ReactNode;
    showCounter?: boolean;
    showResizeIcon?: boolean;
    showFloatingLabel?: boolean;
    showTrailingIcon?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    className?: string;
    /** @deprecated Use `status` instead */
    state?: TextAreaState;
    /** @deprecated Use `helperText` instead */
    supportingText?: string;
    placeholder?: string;
}

// HELPERS

function renderIcon(icon: React.ReactNode, sz: number, clr: string) {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement<any>, {
            size: sz, weight: 'regular', color: clr, 'aria-hidden': true,
        });
    }
    return icon;
}

// Compute colors based on state
function getColors(disabled: boolean, isHover: boolean, isFocus: boolean, status: TextAreaState, isFloating: boolean) {
    const bg = disabled ? C.bg.disabled : isHover ? C.bg.hover : C.bg.default;
    const border = disabled ? 'transparent'
        : status === 'error' ? C.border.error
            : status === 'success' ? C.border.success
                : isFocus ? C.border.focus : C.border.default;
    const labelClr = disabled ? C.text.disabled : isFloating ? C.text.labelFloat : C.text.label;
    const inputClr = disabled ? C.text.disabled : C.text.input;
    const supportClr = disabled ? C.text.disabled
        : status === 'error' ? C.text.error
            : status === 'success' ? C.text.success : C.text.support;
    const iconClr = disabled ? C.icon.disabled
        : status === 'error' ? C.text.error
            : status === 'success' ? C.text.success : C.icon.default;
    const counterClr = disabled ? C.text.disabled : C.text.label;
    const resizeClr = disabled ? C.icon.disabled : C.icon.default;
    return { bg, border, labelClr, inputClr, supportClr, iconClr, counterClr, resizeClr };
}

// CSS to hide native resize handle
const RESIZER_STYLES = `
    .textarea-container::-webkit-resizer {
        display: none;
    }
`;

// COMPONENT

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label = '',
    helperText,
    errorText,
    supportingText,
    disabled = false,
    readOnly = false,
    required = false,
    status,
    state,
    rows,
    minRows,
    maxRows,
    resize = 'vertical',
    maxLength = 200,
    trailing,
    trailingIcon,
    onTrailingClick,
    trailingAriaLabel,
    showCounter = true,
    showResizeIcon = true,
    showFloatingLabel = true,
    showTrailingIcon = true,
    isHovered: propHover,
    isFocused: propFocus,
    className = '',
    placeholder = 'Placeholder',
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    ...props
}, ref) => {
    const generatedId = useId();
    const fieldId = props.id || generatedId;
    const descriptionId = `${fieldId}-description`;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => textareaRef.current!);

    const [localHover, setLocalHover] = useState(false);
    const [localFocus, setLocalFocus] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() || '');

    // Resolve deprecated props
    const resolvedStatus = status || state || 'default';
    const resolvedHelperText = helperText || supportingText;

    // Derived state
    const isHover = propHover ?? localHover;
    const isFocus = propFocus ?? localFocus;
    const currentValue = value !== undefined ? String(value) : internalValue;
    const hasValue = currentValue.length > 0;
    const isFloating = showFloatingLabel && (isFocus || hasValue);
    const shouldShowLabel = showFloatingLabel;

    const s = SIZE;

    // Accessibility
    const hasDescription = !!(resolvedHelperText || errorText);
    const displayedHelperText = resolvedStatus === 'error' && errorText ? errorText : resolvedHelperText;
    const isInvalid = resolvedStatus === 'error';

    // Colors
    const colors = getColors(disabled, isHover, isFocus, resolvedStatus, isFloating);

    // Focus ring (only for keyboard focus)
    const focusRing = focusVisible && !disabled
        ? (resolvedStatus === 'error' ? 'var(--focus-ring-error)'
            : resolvedStatus === 'success' ? 'var(--focus-ring-success)'
                : 'var(--focus-ring-primary)')
        : 'none';

    // HANDLERS

    const handleContainerClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-resize-handle]')) return;
        if (!disabled && !readOnly && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [disabled, readOnly]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (value === undefined) setInternalValue(e.target.value);
        onChange?.(e);
    }, [onChange, value]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (!disabled) {
            setLocalFocus(true);
            setFocusVisible(e.target.matches(':focus-visible'));
        }
        onFocus?.(e);
    }, [disabled, onFocus]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        setLocalFocus(false);
        setFocusVisible(false);
        onBlur?.(e);
    }, [onBlur]);

    // RENDER

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: '100%',
                minWidth: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: s.gap,
            }}
        >
            <style>{RESIZER_STYLES}</style>
            {/* Text Field Container */}
            <div
                className={cn("textarea-container", containerStyles({ status: resolvedStatus }))}
                onClick={handleContainerClick}
                onMouseEnter={() => !disabled && setLocalHover(true)}
                onMouseLeave={() => setLocalHover(false)}
                style={{
                    alignSelf: 'stretch',
                    minHeight: s.minHeight,
                    padding: s.padding,
                    background: colors.bg,
                    borderRadius: s.radius,
                    border: disabled ? 'none' : `1px solid ${C.border.default}`,
                    outline: (isFocus || resolvedStatus !== 'default') && !disabled
                        ? `1px solid ${colors.border}`
                        : '1px solid transparent',
                    outlineOffset: -1,
                    boxShadow: focusRing,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch',
                    cursor: disabled ? 'not-allowed' : 'text',
                    boxSizing: 'border-box',
                    transition: 'outline-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
                    resize: resize === 'vertical' ? 'vertical' : 'none',
                    overflow: 'auto',
                }}
            >
                {/* Input + Trailing Icon Row */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: s.gap,
                    flex: '1 1 auto',
                    minHeight: 0,
                    width: '100%',
                }}>
                    {/* Input Area */}
                    <div style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        minHeight: s.minTextareaHeight + (shouldShowLabel ? 20 : 0),
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'stretch',
                        paddingLeft: s.inputPadding,
                        height: '100%',
                    }}>
                        {/* Label */}
                        {shouldShowLabel && (
                            <label
                                htmlFor={fieldId}
                                className={labelStyles({ floating: isFloating })}
                                style={{
                                    width: '100%',
                                    color: colors.labelClr,
                                    flexShrink: 0,
                                    cursor: disabled ? 'not-allowed' : 'text',
                                }}
                            >
                                {label}
                                {required && <span aria-hidden="true"> *</span>}
                            </label>
                        )}

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            id={fieldId}
                            disabled={disabled}
                            readOnly={readOnly}
                            required={required}
                            value={value}
                            defaultValue={defaultValue}
                            maxLength={maxLength}
                            rows={rows}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            aria-invalid={isInvalid || undefined}
                            aria-describedby={hasDescription ? descriptionId : undefined}
                            aria-required={required || undefined}
                            placeholder={!showFloatingLabel ? label : (isFloating ? placeholder : '')}
                            className={inputStyles()}
                            style={{
                                width: '100%',
                                flex: '1 1 auto',
                                minHeight: s.minTextareaHeight,
                                padding: 0,
                                margin: 0,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                resize: 'none',
                                color: (isFloating || !showFloatingLabel) ? colors.inputClr : 'transparent',
                                cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
                            }}
                            {...props}
                        />
                    </div>

                    {/* Trailing Icon */}
                    {showTrailingIcon && (trailingIcon || trailing) && (
                        onTrailingClick ? (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onTrailingClick(); }}
                                disabled={disabled}
                                aria-label={trailingAriaLabel || 'Trailing action'}
                                style={{
                                    width: s.iconSize,
                                    height: s.iconSize,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                }}
                            >
                                {renderIcon(trailing || trailingIcon, s.iconSize, colors.iconClr)}
                            </button>
                        ) : (
                            <div
                                style={{
                                    width: s.iconSize,
                                    height: s.iconSize,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                aria-hidden="true"
                            >
                                {renderIcon(trailing || trailingIcon, s.iconSize, colors.iconClr)}
                            </div>
                        )
                    )}
                </div>

                {/* Counter + Resize Icon */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: s.gap,
                    flexShrink: 0,
                    marginTop: s.gap,
                }}>
                    {showCounter && (
                        <div
                            className={supportStyles()}
                            style={{ color: colors.counterClr, whiteSpace: 'nowrap' }}
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {currentValue.length}/{maxLength}
                        </div>
                    )}

                    {showResizeIcon && resize === 'vertical' && (
                        <div
                            data-resize-handle
                            style={{
                                width: s.resizeIconSize,
                                height: s.resizeIconSize,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'ns-resize',
                            }}
                            aria-hidden="true"
                        >
                            <NotchesIcon
                                size={s.resizeIconSize}
                                weight="regular"
                                color={colors.resizeClr}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Helper/Error Text */}
            {displayedHelperText && (
                <p
                    id={descriptionId}
                    className={supportStyles()}
                    style={{
                        alignSelf: 'stretch',
                        paddingLeft: s.padding,
                        paddingRight: s.padding,
                        margin: 0,
                        color: colors.supportClr,
                    }}
                    role={isInvalid ? 'alert' : undefined}
                >
                    {displayedHelperText}
                </p>
            )}
        </div>
    );
});

TextArea.displayName = 'TextArea';
