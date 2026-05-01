'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle, useId, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Dropdown } from '../Dropdown/Dropdown';
import { CountryFlag, COUNTRY_DIAL_CODES, COMMON_COUNTRIES, type CountryCode } from '../CountryFlag/CountryFlag';
import { Button } from '../Button/Button';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

// TYPES & CONSTANTS

export const TEXT_INPUT_SIZES = ['small', 'medium', 'large'] as const;
export const TEXT_INPUT_TYPES = ['default', 'leadingText', 'trailingText', 'country', 'button', 'inline'] as const;
export const TEXT_INPUT_STATES = ['default', 'error', 'success'] as const;

export type TextInputSize = (typeof TEXT_INPUT_SIZES)[number];
export type TextInputType = (typeof TEXT_INPUT_TYPES)[number];
export type TextInputState = (typeof TEXT_INPUT_STATES)[number];

// Size configuration
const SIZE = {
    large: { h: 48, px: 12, gap: 4, icon: 24, inputH: 24, inputPx: 4, supportPx: 12 },
    medium: { h: 40, px: 10, gap: 4, icon: 20, inputH: 20, inputPx: 4, supportPx: 8 },
    small: { h: 32, px: 8, gap: 2, icon: 16, inputH: 16, inputPx: 4, supportPx: 8 },
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
    divider: 'var(--color-neutral-outline-subtle)',
    section: 'var(--color-neutral-surface-subtlest)',
} as const;

// CVA VARIANTS

// Typography variants based on size
const labelStyles = cva('transition-all duration-150', {
    variants: {
        size: {
            large: 'text-b3',
            medium: 'text-b4',
            small: 'text-b5',
        },
        floating: {
            true: '',
            false: '',
        },
    },
    compoundVariants: [
        { size: 'large', floating: true, className: 'text-b5' },
        { size: 'medium', floating: true, className: 'text-b6' },
        { size: 'small', floating: true, className: 'text-b5' },
    ],
    defaultVariants: { size: 'medium', floating: false },
});

const inputStyles = cva('', {
    variants: {
        size: {
            large: 'text-b3',
            medium: 'text-b4',
            small: 'text-b5',
        },
    },
    defaultVariants: { size: 'medium' },
});

const supportStyles = cva('', {
    variants: {
        size: {
            large: 'text-b5',
            medium: 'text-b5',
            small: 'text-b6',
        },
    },
    defaultVariants: { size: 'medium' },
});



export type LabelStylesProps = VariantProps<typeof labelStyles>;
export type InputStylesProps = VariantProps<typeof inputStyles>;

// PROPS INTERFACE

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'placeholder'> {
    label?: string;
    helperText?: string;
    errorText?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    size?: TextInputSize;
    status?: TextInputState;
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
    onTrailingClick?: () => void;
    trailingAriaLabel?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    leadingText?: string;
    trailingText?: string;
    buttonIcon?: React.ReactNode;
    onButtonClick?: () => void;
    showLeadingIcon?: boolean;
    showTrailingIcon?: boolean;
    showFloatingLabel?: boolean;
    showSupportingText?: boolean;
    masked?: boolean;
    type?: 'text' | 'password' | 'email' | 'number';
    selectedCountry?: CountryCode;
    onCountryChange?: (countryCode: CountryCode) => void;
    isHovered?: boolean;
    isFocused?: boolean;
    className?: string;
    /** @deprecated Use `status` instead */
    state?: TextInputState;
    /** @deprecated Use `type` instead */
    htmlType?: React.InputHTMLAttributes<HTMLInputElement>['type'];
    /** @deprecated Use `helperText` instead */
    supportingText?: string;
    /** @deprecated Use `status` as 'default' | 'leadingText' etc. */
    inputType?: TextInputType;
    placeholder?: string;
}

// HELPERS

const flex = (dir: 'row' | 'column' = 'row', align = 'center'): React.CSSProperties => ({
    display: 'flex', flexDirection: dir, alignItems: align
});

const stopProp = {
    onMouseEnter: (e: React.MouseEvent) => e.stopPropagation(),
    onMouseLeave: (e: React.MouseEvent) => e.stopPropagation(),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
};

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
function getColors(disabled: boolean, isHover: boolean, isFocus: boolean, status: TextInputState, isFloat: boolean, readOnly: boolean = false) {
    const bg = disabled ? C.bg.disabled : readOnly ? C.bg.hover : isHover ? C.bg.hover : C.bg.default;
    const border = disabled ? 'transparent'
        : status === 'error' ? C.border.error
            : status === 'success' ? C.border.success
                : isFocus ? C.border.focus : C.border.default;
    const labelClr = disabled ? C.text.disabled
        : (status === 'error' && isFloat) ? C.text.error
            : (status === 'success' && isFloat) ? C.text.success
                : isFloat ? C.text.support : C.text.label;
    const inputClr = disabled ? C.text.disabled : readOnly ? C.text.label : C.text.input;
    const supportClr = disabled ? C.text.disabled
        : status === 'error' ? C.text.error
            : status === 'success' ? C.text.success : C.text.support;
    const iconClr = disabled ? C.icon.disabled : C.icon.default;
    const trailClr = status === 'error' ? C.text.error : status === 'success' ? C.text.success : iconClr;
    const sectionBg = disabled ? C.bg.disabled : C.section;
    return { bg, border, labelClr, inputClr, supportClr, iconClr, trailClr, sectionBg };
}

// COMPONENT

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
    label = '',
    helperText,
    errorText,
    supportingText,
    disabled = false,
    readOnly = false,
    required = false,
    size = 'medium',
    status,
    state,
    inputType = 'default',
    leading,
    trailing,
    onTrailingClick,
    trailingAriaLabel,
    leadingIcon,
    trailingIcon,
    leadingText,
    trailingText,
    buttonIcon,
    onButtonClick,
    showLeadingIcon = true,
    showTrailingIcon = true,
    showFloatingLabel = true,
    showSupportingText = true,
    masked = false,
    type = 'text',
    htmlType,
    selectedCountry = 'us',
    onCountryChange,
    isHovered: propHover,
    isFocused: propFocus,
    className = '',
    placeholder,
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

    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    const [hover, setHover] = useState(false);
    const [focus, setFocus] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const [val, setVal] = useState(defaultValue?.toString() || '');
    const [country, setCountry] = useState<CountryCode>(selectedCountry);
    const [showPassword, setShowPassword] = useState(false);

    // Resolve deprecated props
    const resolvedStatus = status || state || 'default';
    const resolvedType = htmlType || type;
    const resolvedHelperText = helperText || supportingText;

    // Derived state
    const isHover = propHover ?? hover;
    const isFocus = propFocus ?? focus;
    const hasVal = value !== undefined ? String(value).length > 0 : val.length > 0;
    const s = SIZE[size];
    const isInline = inputType === 'inline';
    const isFloat = showFloatingLabel && !isInline && size !== 'small' && (isFocus || hasVal);
    const hasLead = inputType === 'leadingText' || inputType === 'country';
    const hasTrail = inputType === 'trailingText' || inputType === 'button';
    const showLabel = size !== 'small' && showFloatingLabel && !(isInline && hasVal);
    const showInput = isFloat || size === 'small' || isInline || hasVal || isFocus || !showFloatingLabel;

    // Accessibility
    const hasDescription = !!(resolvedHelperText || errorText);
    const displayedHelperText = resolvedStatus === 'error' && errorText ? errorText : resolvedHelperText;
    const isInvalid = resolvedStatus === 'error';

    // Colors
    const colors = getColors(disabled, isHover, isFocus, resolvedStatus, isFloat, readOnly);

    // Focus ring (only for keyboard focus) - large uses large focus ring
    const focusRing = focusVisible && !disabled
        ? (resolvedStatus === 'error' ? 'var(--focus-ring-error)'
            : resolvedStatus === 'success' ? 'var(--focus-ring-success)'
                : size === 'large' ? 'var(--focus-ring-primary-large)'
                    : 'var(--focus-ring-primary)')
        : 'none';

    // Radius based on size
    const radius = size === 'large' ? 'var(--corner-radius-thematic-large, 8px)'
        : size === 'small' ? 'var(--corner-radius-thematic-small, 4px)'
            : 'var(--corner-radius-thematic-medium, 6px)';

    // HANDLERS

    const focusInput = useCallback(() => {
        if (!disabled && !readOnly) inputRef.current?.focus();
    }, [disabled, readOnly]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (value === undefined) setVal(e.target.value);
        onChange?.(e);
    }, [onChange, value]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (!disabled) {
            setFocus(true);
            setFocusVisible(e.target.matches(':focus-visible'));
        }
        onFocus?.(e);
    }, [disabled, onFocus]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setFocus(false);
        setFocusVisible(false);
        onBlur?.(e);
    }, [onBlur]);

    const handlePasswordToggle = useCallback(() => {
        if (disabled) return;
        const input = inputRef.current;
        const cursorPos = input?.selectionStart ?? 0;
        setShowPassword(prev => !prev);
        requestAnimationFrame(() => input?.setSelectionRange(cursorPos, cursorPos));
    }, [disabled]);

    // STYLES

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: 0, margin: 0, border: 'none', outline: 'none',
        background: 'transparent', color: colors.inputClr, textAlign: 'left',
        cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
    };

    const iconStyle = (sz: number): React.CSSProperties => ({
        width: sz, height: sz, flexShrink: 0, ...flex(), justifyContent: 'center',
    });

    const divider: React.CSSProperties = { width: 1, background: C.divider, flexShrink: 0 };

    const sectionStyle = (isLeft: boolean): React.CSSProperties => ({
        ...flex(), alignSelf: 'stretch', gap: s.gap, background: colors.sectionBg,
        paddingLeft: s.px, paddingRight: s.px,
        ...(isLeft
            ? { borderTopLeftRadius: radius, borderBottomLeftRadius: radius }
            : { borderTopRightRadius: radius, borderBottomRightRadius: radius }),
    });

    const countryOptions = COMMON_COUNTRIES.map(code => ({
        value: code,
        label: COUNTRY_DIAL_CODES[code] || code.toUpperCase(),
        leadingType: 'country' as const,
        leadingItem: <CountryFlag country={code} size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium'} />,
    }));

    // RENDER

    return (
        <div className={className} style={{ ...flex('column', 'flex-start'), gap: 6, position: 'relative', width: '100%', paddingBottom: 1 }}>
            {/* Main Field */}
            <div style={{
                ...flex(), justifyContent: 'flex-start', gap: s.gap, width: '100%', height: s.h,
                position: 'relative',
                paddingLeft: isInline || hasLead ? 0 : s.px,
                paddingRight: isInline || hasTrail ? 0 : s.px,
                background: isInline ? (isHover ? C.bg.hover : 'transparent') : colors.bg,
                borderWidth: isInline ? 0 : disabled ? 0 : 1,
                borderStyle: 'solid', borderColor: disabled ? 'transparent' : C.border.default,
                borderBottomWidth: isInline ? 1 : disabled ? 0 : 1,
                borderBottomColor: isInline ? ((isFocus || resolvedStatus !== 'default') && !disabled ? colors.border : 'transparent') : (disabled ? 'transparent' : C.border.default),
                borderRadius: isInline ? 0 : radius,
                outline: 'none',
                boxShadow: focusRing,
                cursor: disabled ? 'not-allowed' : 'text',
                boxSizing: 'border-box',
                overflow: inputType === 'country' ? 'visible' : 'hidden',
                transition: 'border-color 150ms, background-color 150ms, border-bottom-color 150ms, box-shadow 150ms',
            }}>
                {/* Leading Section */}
                {hasLead && (
                    <div {...stopProp} style={{ ...flex(), alignItems: 'stretch', alignSelf: 'stretch', flexShrink: 0 }}>
                        {inputType === 'country' ? (<>
                            <div onClick={e => e.stopPropagation()} style={{ ...flex(), alignSelf: 'stretch', padding: 0, background: colors.sectionBg, borderTopLeftRadius: radius, borderBottomLeftRadius: radius }}>
                                <Dropdown
                                    size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'}
                                    type="inline" value={country} placeholder="+1"
                                    floatingLabel={false} showSearch={false}
                                    options={countryOptions}
                                    onChange={v => { setCountry(v as CountryCode); onCountryChange?.(v as CountryCode); }}
                                    disabled={disabled}
                                />
                            </div>
                            <div style={divider} />
                        </>) : (<>
                            <div style={sectionStyle(true)}>
                                <span className={inputStyles({ size })} style={{ color: colors.inputClr, whiteSpace: 'nowrap' }}>{leadingText}</span>
                            </div>
                            <div style={divider} />
                        </>)}
                    </div>
                )}

                {/* Input Area */}
                <div
                    onClick={focusInput}
                    onMouseEnter={() => !disabled && setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{ ...flex(), flex: 1, gap: isInline ? s.gap + 2 : s.gap, alignSelf: 'stretch', paddingLeft: hasLead ? s.gap : 0, paddingRight: hasTrail ? s.gap : 0, minWidth: 0 }}
                >
                    {/* Leading Icon */}
                    {showLeadingIcon && (leadingIcon || leading) && inputType !== 'country' && inputType !== 'leadingText' && (
                        <div style={iconStyle(s.icon)} aria-hidden="true">
                            {renderIcon(leading || leadingIcon, s.icon, colors.iconClr)}
                        </div>
                    )}

                    {isInline ? (
                        <div style={{ flex: 1, position: 'relative', ...flex(), minWidth: 0 }}>
                            {!hasVal && (
                                <span className={labelStyles({ size, floating: false })} style={{ position: 'absolute', left: 0, color: colors.labelClr, pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {label}
                                </span>
                            )}
                            <input
                                ref={inputRef}
                                id={fieldId}
                                type={masked ? (showPassword ? 'text' : 'password') : resolvedType}
                                disabled={disabled}
                                readOnly={readOnly}
                                required={required}
                                value={value}
                                defaultValue={defaultValue}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                aria-invalid={isInvalid || undefined}
                                aria-describedby={hasDescription ? descriptionId : undefined}
                                aria-required={required || undefined}
                                className={inputStyles({ size })}
                                style={inputStyle}
                                placeholder=""
                                {...props}
                            />
                        </div>
                    ) : (
                        <div style={{ ...flex('column', 'flex-start'), justifyContent: 'center', flex: 1, alignSelf: 'stretch', minWidth: 0, padding: `0 ${s.inputPx}px`, gap: 0 }}>
                            {showLabel && (
                                <label
                                    htmlFor={fieldId}
                                    className={labelStyles({ size, floating: isFloat })}
                                    style={{ margin: 0, padding: 0, width: '100%', color: colors.labelClr, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'text' }}
                                >
                                    {label}
                                    {required && <span aria-hidden="true"> *</span>}
                                </label>
                            )}
                            <div style={{ ...flex(), width: '100%', height: showInput ? s.inputH : 0, overflow: 'hidden', opacity: showInput ? 1 : 0, transition: 'height 150ms, opacity 150ms' }}>
                                <input
                                    ref={inputRef}
                                    id={fieldId}
                                    type={masked ? (showPassword ? 'text' : 'password') : resolvedType}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    required={required}
                                    value={value}
                                    defaultValue={defaultValue}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    aria-invalid={isInvalid || undefined}
                                    aria-describedby={hasDescription ? descriptionId : undefined}
                                    aria-required={required || undefined}
                                    placeholder={(size === 'small' || !showFloatingLabel) ? label : (placeholder || 'Placeholder')}
                                    className={inputStyles({ size })}
                                    style={inputStyle}
                                    {...props}
                                />
                            </div>
                        </div>
                    )}

                    {/* Trailing Icon or Password Toggle */}
                    {masked ? (
                        <button
                            type="button"
                            onClick={handlePasswordToggle}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={disabled}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showPassword}
                            style={{ ...iconStyle(s.icon), cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', border: 'none', padding: 0 }}
                        >
                            {showPassword
                                ? <EyeSlashIcon size={s.icon} weight="regular" color={colors.iconClr} aria-hidden="true" />
                                : <EyeIcon size={s.icon} weight="regular" color={colors.iconClr} aria-hidden="true" />
                            }
                        </button>
                    ) : showTrailingIcon && (trailingIcon || trailing) && (
                        onTrailingClick || onButtonClick ? (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); (onTrailingClick || onButtonClick)?.(); }}
                                disabled={disabled}
                                aria-label={trailingAriaLabel || 'Trailing action'}
                                style={{ ...iconStyle(s.icon), cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', border: 'none', padding: 0 }}
                            >
                                {renderIcon(trailing || trailingIcon, s.icon, colors.trailClr)}
                            </button>
                        ) : (
                            <div style={iconStyle(s.icon)} aria-hidden="true">
                                {renderIcon(trailing || trailingIcon, s.icon, colors.trailClr)}
                            </div>
                        )
                    )}
                </div>

                {/* Trailing Section */}
                {hasTrail && (
                    <div {...stopProp} style={{ ...flex(), alignItems: 'stretch', alignSelf: 'stretch', flexShrink: 0 }}>
                        <div style={divider} />
                        {inputType === 'button' ? (
                            <div style={{ ...flex(), alignSelf: 'stretch', padding: 0, background: C.section, borderTopRightRadius: radius, borderBottomRightRadius: radius, position: 'relative', zIndex: 1 }}>
                                <Button
                                    variant="neutral" buttonStyle="subtle" size={size} leadingIcon={buttonIcon}
                                    onClick={e => { e.stopPropagation(); if (!disabled) onButtonClick?.(); }}
                                    disabled={disabled}
                                />
                            </div>
                        ) : (
                            <div style={sectionStyle(false)}>
                                <span className={inputStyles({ size })} style={{ color: colors.inputClr, whiteSpace: 'nowrap' }}>{trailingText}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Focus/status border overlay — renders above all children (including Button with position:relative) */}
                {!isInline && !readOnly && (isFocus || resolvedStatus !== 'default') && !disabled && (
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: radius,
                        border: `1px solid ${colors.border}`,
                        pointerEvents: 'none', zIndex: 2,
                    }} />
                )}
            </div>

            {/* Helper/Error Text */}
            {showSupportingText && displayedHelperText && (
                <p
                    id={descriptionId}
                    className={supportStyles({ size })}
                    style={{ margin: 0, padding: isInline ? 0 : `0 ${s.supportPx}px`, color: colors.supportClr, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    role={isInvalid ? 'alert' : undefined}
                >
                    {displayedHelperText}
                </p>
            )}
        </div>
    );
});

TextInput.displayName = 'TextInput';
