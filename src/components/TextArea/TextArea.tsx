'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle, useId, useCallback, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { NotchesIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

// TYPES & CONSTANTS

export const TEXT_AREA_STATES = ['default', 'error', 'success'] as const;
export type TextAreaState = (typeof TEXT_AREA_STATES)[number];

// Size configuration
const SIZE = {
    minHeight: 96,
    maxHeight: 240,
    padding: 8,
    gap: 4,
    inputPadding: 4,
    iconSize: 20,
    counterSize: 12,
    resizeIconSize: 12,
    minTextareaHeight: 40,
    radius: 'var(--corner-radius-default-medium, 6px)',
} as const;

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

export interface TextAreaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
    label?: string;
    placeholder?: string;
    helperText?: string;
    errorText?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    status?: TextAreaState;
    /** Initial visible text lines when autoGrow is disabled */
    rows?: number;
    minRows?: number;
    maxRows?: number;
    resize?: 'none' | 'vertical';
    /** Whether the textarea automatically grows with its content up to maxHeight. Default: true */
    autoGrow?: boolean;
    /** Maximum height of the container in px before internal scrolling begins. Default: 240 */
    maxHeight?: number | string;
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
}

// HELPERS

function renderIcon(icon: React.ReactNode, sz: number, clr: string) {
    if (!icon) return null;
    return React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, {
              size: sz,
              weight: 'regular',
              color: clr,
              'aria-hidden': true,
          })
        : icon;
}

// Compute colors based on active interaction and validation state
function getColors(
    disabled: boolean,
    isHover: boolean,
    isFocus: boolean,
    status: TextAreaState,
    isFloating: boolean
) {
    const bg = disabled ? C.bg.disabled : isHover ? C.bg.hover : C.bg.default;
    const border = disabled
        ? 'transparent'
        : status === 'error'
          ? C.border.error
          : status === 'success'
            ? C.border.success
            : isFocus
              ? C.border.focus
              : C.border.default;
    const labelClr = disabled ? C.text.disabled : isFloating ? C.text.labelFloat : C.text.label;
    const inputClr = disabled ? C.text.disabled : C.text.input;
    const supportClr = disabled
        ? C.text.disabled
        : status === 'error'
          ? C.text.error
          : status === 'success'
            ? C.text.success
            : C.text.support;
    const iconClr = disabled
        ? C.icon.disabled
        : status === 'error'
          ? C.text.error
          : status === 'success'
            ? C.text.success
            : C.icon.default;
    return { bg, border, labelClr, inputClr, supportClr, iconClr };
}

// CSS to hide native WebKit resize handle when custom resizer icon is active
const RESIZER_STYLES = `
    .textarea-container::-webkit-resizer {
        display: none;
    }
`;

// COMPONENT

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
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
            autoGrow = true,
            maxHeight = SIZE.maxHeight,
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
        },
        ref
    ) => {
        const generatedId = useId();
        const fieldId = props.id || generatedId;
        const descriptionId = `${fieldId}-description`;

        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const fieldContainerRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(ref, () => textareaRef.current!);

        const [localHover, setLocalHover] = useState(false);
        const [localFocus, setLocalFocus] = useState(false);
        const [focusVisible, setFocusVisible] = useState(false);
        const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '');

        // Resolve deprecated and fallback status/text props
        const resolvedStatus = status || state || 'default';
        const resolvedHelperText = helperText || supportingText;
        const displayedHelperText =
            resolvedStatus === 'error' && errorText ? errorText : resolvedHelperText;
        const isInvalid = resolvedStatus === 'error';

        // Derived interaction and value state
        const isHover = propHover ?? localHover;
        const isFocus = propFocus ?? localFocus;
        const currentValue = value !== undefined && value !== null ? String(value) : internalValue;
        const hasValue = currentValue.length > 0;
        const shouldShowLabel = showFloatingLabel && Boolean(label);
        const isFloating = shouldShowLabel && (isFocus || hasValue);

        const colors = getColors(disabled, isHover, isFocus, resolvedStatus, isFloating);

        // Focus ring (only shown on keyboard navigation or when forced via isFocused)
        const focusRing =
            (focusVisible || propFocus) && !disabled
                ? resolvedStatus === 'error'
                    ? 'var(--focus-ring-error)'
                    : resolvedStatus === 'success'
                      ? 'var(--focus-ring-success)'
                      : 'var(--focus-ring-primary)'
                : 'none';

        // Auto-grow height calculation: expands up to maxHeight, then enables internal scroll
        const adjustHeight = useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (!autoGrow) {
                textarea.style.height = '';
                textarea.style.overflowY = '';
                return;
            }

            // Clear manual container height override from previous vertical resize
            if (fieldContainerRef.current?.style.height) {
                fieldContainerRef.current.style.height = '';
            }

            // Reset textarea height to minTextareaHeight to accurately measure scrollHeight on text delete
            textarea.style.height = `${SIZE.minTextareaHeight}px`;
            const numericMax =
                typeof maxHeight === 'number'
                    ? maxHeight
                    : parseFloat(String(maxHeight)) || SIZE.maxHeight;
            const nonTextareaHeight =
                SIZE.padding * 2 +
                (shouldShowLabel ? 20 : 0) +
                (showCounter ? SIZE.counterSize + SIZE.gap : 0);
            const maxTextareaHeight = Math.max(SIZE.minTextareaHeight, numericMax - nonTextareaHeight);
            const scrollHeight = textarea.scrollHeight;

            if (scrollHeight > maxTextareaHeight) {
                textarea.style.height = `${maxTextareaHeight}px`;
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.height = `${Math.max(SIZE.minTextareaHeight, scrollHeight)}px`;
                textarea.style.overflowY = 'hidden';
            }
        }, [autoGrow, maxHeight, shouldShowLabel, showCounter]);

        useEffect(() => {
            adjustHeight();
        }, [currentValue, adjustHeight]);

        // Handlers
        const handleContainerClick = useCallback(
            (e: React.MouseEvent) => {
                if ((e.target as HTMLElement).closest('[data-resize-handle], button')) return;
                if (!disabled && !readOnly && textareaRef.current) {
                    textareaRef.current.focus();
                }
            },
            [disabled, readOnly]
        );

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                if (value === undefined) setInternalValue(e.target.value);
                adjustHeight();
                onChange?.(e);
            },
            [onChange, value, adjustHeight]
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLTextAreaElement>) => {
                if (!disabled) {
                    setLocalFocus(true);
                    setFocusVisible(e.target.matches(':focus-visible'));
                }
                onFocus?.(e);
            },
            [disabled, onFocus]
        );

        const handleBlur = useCallback(
            (e: React.FocusEvent<HTMLTextAreaElement>) => {
                setLocalFocus(false);
                setFocusVisible(false);
                onBlur?.(e);
            },
            [onBlur]
        );

        return (
            <div
                className={cn('w-full min-w-[200px] flex flex-col items-start justify-start', className)}
                style={{ gap: SIZE.gap }}
            >
                {!autoGrow && resize === 'vertical' && <style>{RESIZER_STYLES}</style>}

                {/* Text Field Container */}
                <div
                    ref={fieldContainerRef}
                    className={cn('textarea-container', containerStyles({ status: resolvedStatus }))}
                    onClick={handleContainerClick}
                    onMouseEnter={() => !disabled && setLocalHover(true)}
                    onMouseLeave={() => setLocalHover(false)}
                    style={{
                        alignSelf: 'stretch',
                        minHeight: SIZE.minHeight,
                        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
                        padding: SIZE.padding,
                        background: colors.bg,
                        borderRadius: SIZE.radius,
                        border: disabled ? 'none' : `1px solid ${C.border.default}`,
                        outline:
                            (isFocus || resolvedStatus !== 'default') && !disabled
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
                        transition:
                            'outline-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
                        resize: !autoGrow && resize === 'vertical' ? 'vertical' : 'none',
                        overflow: autoGrow ? 'hidden' : 'auto',
                    }}
                >
                    {/* Input + Trailing Icon Row */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            gap: SIZE.gap,
                            flex: '1 1 auto',
                            minHeight: 0,
                            width: '100%',
                        }}
                    >
                        {/* Input Area */}
                        <div
                            style={{
                                flex: '1 1 0',
                                minWidth: 0,
                                minHeight: SIZE.minTextareaHeight + (shouldShowLabel ? 20 : 0),
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'stretch',
                                paddingLeft: SIZE.inputPadding,
                                height: '100%',
                            }}
                        >
                            {/* Floating Label */}
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

                            {/* Native Textarea */}
                            <textarea
                                ref={textareaRef}
                                id={fieldId}
                                disabled={disabled}
                                readOnly={readOnly}
                                required={required}
                                value={value}
                                defaultValue={value === undefined ? defaultValue : undefined}
                                maxLength={maxLength}
                                rows={rows}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                aria-invalid={isInvalid || undefined}
                                aria-describedby={displayedHelperText ? descriptionId : undefined}
                                aria-required={required || undefined}
                                placeholder={
                                    !shouldShowLabel
                                        ? label || placeholder
                                        : isFloating
                                          ? placeholder
                                          : ''
                                }
                                className="text-b4"
                                style={{
                                    width: '100%',
                                    flex: '1 1 auto',
                                    minHeight: SIZE.minTextareaHeight,
                                    padding: 0,
                                    margin: 0,
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    resize: 'none',
                                    color:
                                        isFloating || !shouldShowLabel
                                            ? colors.inputClr
                                            : 'transparent',
                                    cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
                                    ...props.style,
                                }}
                                {...props}
                            />
                        </div>

                        {/* Trailing Icon or Action */}
                        {showTrailingIcon && (trailingIcon || trailing) && (
                            <div
                                style={{
                                    width: SIZE.iconSize,
                                    height: SIZE.iconSize,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {onTrailingClick ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTrailingClick();
                                        }}
                                        disabled={disabled}
                                        aria-label={trailingAriaLabel || 'Trailing action'}
                                        style={{
                                            width: SIZE.iconSize,
                                            height: SIZE.iconSize,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            background: 'transparent',
                                            border: 'none',
                                            padding: 0,
                                        }}
                                    >
                                        {renderIcon(trailing || trailingIcon, SIZE.iconSize, colors.iconClr)}
                                    </button>
                                ) : (
                                    renderIcon(trailing || trailingIcon, SIZE.iconSize, colors.iconClr)
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Row: Character Counter + Resize Icon */}
                    {(showCounter || (showResizeIcon && resize === 'vertical' && !autoGrow)) && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: SIZE.gap,
                                flexShrink: 0,
                                marginTop: SIZE.gap,
                            }}
                        >
                            {showCounter && (
                                <div
                                    className="text-b5"
                                    style={{
                                        color: disabled ? C.text.disabled : C.text.label,
                                        whiteSpace: 'nowrap',
                                    }}
                                    aria-live="polite"
                                    aria-atomic="true"
                                >
                                    {currentValue.length}/{maxLength}
                                </div>
                            )}

                            {showResizeIcon && resize === 'vertical' && !autoGrow && (
                                <div
                                    data-resize-handle
                                    style={{
                                        width: SIZE.resizeIconSize,
                                        height: SIZE.resizeIconSize,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'ns-resize',
                                    }}
                                    aria-hidden="true"
                                >
                                    <NotchesIcon
                                        size={SIZE.resizeIconSize}
                                        weight="regular"
                                        color={disabled ? C.icon.disabled : C.icon.default}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Helper / Error Text */}
                {displayedHelperText && (
                    <p
                        id={descriptionId}
                        className="text-b5"
                        style={{
                            alignSelf: 'stretch',
                            paddingLeft: SIZE.padding,
                            paddingRight: SIZE.padding,
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
    }
);

TextArea.displayName = 'TextArea';
