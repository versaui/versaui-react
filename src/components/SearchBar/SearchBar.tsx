'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useFocusRing } from '@react-aria/focus';
import { CompactIconButton } from '../Button/CompactIconButton';

export const SEARCH_BAR_SIZES = ['large', 'default', 'small'] as const;
export const SEARCH_BAR_STATES = ['default', 'hovered', 'focused', 'typing', 'filled', 'disabled'] as const;

export type SearchBarSize = (typeof SEARCH_BAR_SIZES)[number];
export type SearchBarState = (typeof SEARCH_BAR_STATES)[number];

/**
 * SearchBar Component
 * 
 * Variants: 18 total (3 sizes × 6 states)
 * - Sizes: Large (48px), Default (40px), Small (32px)
 * - States: Default, Hovered, Focused, Typing, Filled, Disabled
 */

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: SearchBarSize;
    shortcutKey?: boolean;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    onClear?: () => void;
    isHovered?: boolean;
    isFocused?: boolean;
    className?: string;
}

// Size specifications with asymmetric padding
const SIZE_CONFIG = {
    large: {
        h: 48,           // Container height
        icon: 24,        // Icon size
        clearIcon: 20,   // Clear (X) icon size
        gap: 8,          // Gap between elements (spacing/4)
        pxLeft: 12,      // Left padding (spacing/5)
        pxRight: 8,      // Right padding (spacing/4)
        inputH: 28,      // Input container height
        font: {
            size: 16,    // typescale/b3
            lh: 24,      // line-height
        },
        badge: {
            px: 8,       // spacing/4
            py: 2,       // spacing/1
            r: 'var(--corner-radius-thematic-medium, 6px)',
            font: { size: 16, lh: 24 },
        },
        r: 'var(--corner-radius-thematic-large, 8px)',
    },
    default: {
        h: 40,
        icon: 20,
        clearIcon: 16,
        gap: 8,          // spacing/4
        pxLeft: 10,      // Left padding
        pxRight: 6,     // Right padding (reduced by 4px total)
        inputH: 24,
        font: {
            size: 14,    // typescale/b4
            lh: 20,
        },
        badge: {
            px: 6,       // spacing/3
            py: 2,
            r: 'var(--corner-radius-thematic-small, 4px)',
            font: { size: 14, lh: 20 },
        },
        r: 'var(--corner-radius-thematic-medium, 6px)',
    },
    small: {
        h: 32,
        icon: 16,
        clearIcon: 12,
        gap: 6,          // spacing/3
        pxLeft: 6,       // Left padding (spacing/3)
        pxRight: 4,      // Right padding (reduced by 2px)
        inputH: 20,
        font: {
            size: 12,    // typescale/b5
            lh: 16,
        },
        badge: {
            px: 4,       // spacing/2
            py: 2,
            r: 'var(--corner-radius-thematic-x-small, 2px)',
            font: { size: 12, lh: 16 },
        },
        r: 'var(--corner-radius-thematic-small, 4px)',
    },
};

// Color tokens
const COLORS = {
    bg: {
        default: 'var(--color-neutral-surface-subtle, #F9FAFB)',
        hovered: 'var(--color-neutral-surface-medium, #F3F4F6)',
    },
    border: {
        default: 'var(--color-neutral-outline-subtle, #E5E7EB)',
        hovered: 'var(--color-neutral-outline-default, #D1D5DC)',
        focused: 'var(--color-brand-primary-strong, #155DFC)',
    },
    icon: {
        default: 'var(--color-neutral-icon-subtle, #364153)',
        disabled: 'var(--color-neutral-icon-disabled, #99A1AF)',
        clear: 'var(--color-neutral-text-subtle, #6A7282)',
    },
    text: {
        placeholder: 'var(--color-neutral-text-subtle, #6A7282)',
        input: 'var(--color-neutral-text-strong, #030712)',
        disabled: 'var(--color-neutral-text-disabled, #99A1AF)',
    },
    badge: {
        bg: 'var(--color-neutral-surface-medium, #F3F4F6)',
        border: 'var(--color-neutral-outline-subtle, #E5E7EB)',
        text: 'var(--color-neutral-text-subtle, #6A7282)',
    },
    cursor: 'var(--color-neutral-text-strong, #030712)',
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
    size = 'default',
    shortcutKey = true,
    placeholder = 'Search',
    disabled = false,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    onClear,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    className = '',
    ...props
}, ref) => {
    const [localIsHovered, setLocalIsHovered] = useState(false);
    const [localIsFocused, setLocalIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    const isHovered = propIsHovered ?? localIsHovered;
    const isFocused = propIsFocused ?? localIsFocused;
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue.length > 0;

    // Focus ring for keyboard navigation (focusProps passed to container for within focus)
    const { focusProps } = useFocusRing({ within: true });

    // Keyboard shortcut: Cmd/Ctrl + K to activate search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Determine visual state
    const getState = (): SearchBarState => {
        if (disabled) return 'disabled';
        if (hasValue && !isFocused) return 'filled';
        if (hasValue && isFocused) return 'typing';
        if (isFocused) return 'focused';
        if (isHovered) return 'hovered';
        return 'default';
    };

    const state = getState();
    const s = SIZE_CONFIG[size];

    // Computed styles based on state
    const bgColor = state === 'hovered' ? COLORS.bg.hovered : COLORS.bg.default;
    const borderColor = disabled ? 'transparent'
        : (state === 'focused' || state === 'typing') ? COLORS.border.focused
            : state === 'hovered' ? COLORS.border.hovered
                : COLORS.border.default;
    const iconColor = disabled ? COLORS.icon.disabled : COLORS.icon.default;


    // Show shortcut badge only in default/hovered states
    const showShortcutBadge = shortcutKey && (state === 'default' || state === 'hovered');
    // Show clear button when there's value (filled or typing states)
    const showClearButton = hasValue && !disabled;


    const handleContainerClick = () => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleClear = () => {
        if (!disabled) {
            setInternalValue('');
            onClear?.();
            // Also trigger onChange with empty string for controlled components
            if (onChange) {
                const syntheticEvent = {
                    target: { value: '' },
                    currentTarget: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            }
            inputRef.current?.focus();
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes searchBarCursorBlink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                `}
            </style>
            <div
                className={className}
                onClick={handleContainerClick}
                onMouseEnter={() => !disabled && setLocalIsHovered(true)}
                onMouseLeave={() => setLocalIsHovered(false)}
                role="search"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: s.gap,
                    width: '100%',
                    height: s.h,
                    // Left padding is always constant regardless of state
                    paddingLeft: s.pxLeft,
                    // Right padding is also constant to prevent position shifting
                    paddingRight: s.pxRight,
                    background: bgColor,
                    backdropFilter: 'blur(var(--elevation-medium-blur))',
                    WebkitBackdropFilter: 'blur(var(--elevation-medium-blur))',
                    border: disabled ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: s.r,
                    cursor: disabled ? 'not-allowed' : 'text',
                    boxSizing: 'border-box',
                    // Focus ring for focused/typing state with transition
                    boxShadow: isFocused && !disabled
                        ? (size === 'large' ? 'var(--focus-ring-primary-large)' : 'var(--focus-ring-primary)')
                        : 'none',
                    outline: 'none',
                    transition: 'box-shadow 0.15s ease',
                }}
                {...focusProps}
            >
                {/* Search Icon */}
                <div style={{
                    width: s.icon,
                    height: s.icon,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <MagnifyingGlassIcon size={s.icon} weight="regular" color={iconColor} />
                </div>

                {/* Input Container - always flex grow with min-width 0 to prevent overflow */}
                <div style={{
                    display: 'flex',
                    flex: '1 1 0',
                    minWidth: 0,
                    height: s.inputH,
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Input - native cursor is used */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentValue}
                        disabled={disabled}
                        onChange={(e) => {
                            if (value === undefined) {
                                setInternalValue(e.target.value);
                            }
                            onChange?.(e);
                        }}
                        onFocus={(e) => {
                            if (!disabled) setLocalIsFocused(true);
                            onFocus?.(e as React.FocusEvent<HTMLInputElement>);
                        }}
                        onBlur={(e) => {
                            setLocalIsFocused(false);
                            onBlur?.(e as React.FocusEvent<HTMLInputElement>);
                        }}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            flex: '1 1 0',
                            minWidth: 0,
                            padding: 0,
                            margin: 0,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontFamily: 'var(--typography-font-family-body, Manrope, sans-serif)',
                            fontWeight: 400,
                            fontSize: s.font.size,
                            lineHeight: `${s.font.lh}px`,
                            color: hasValue ? COLORS.text.input : COLORS.text.placeholder,
                            textAlign: 'left',
                            letterSpacing: 0,
                            cursor: disabled ? 'not-allowed' : 'text',
                        }}
                        {...props}
                    />
                </div>

                {/* Clear Button (Filled state) */}
                {showClearButton && (
                    <CompactIconButton
                        variant="subtle"
                        size={size === 'large' ? 'default' : 'small'}
                        icon={<XIcon />}
                        onClick={handleClear}
                        aria-label="Clear search"
                    />
                )}

                {/* Shortcut Key Badge (Default/Hovered states only) */}
                {showShortcutBadge && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: `${s.badge.py}px ${s.badge.px}px`,
                        background: COLORS.badge.bg,
                        border: `1px solid ${COLORS.badge.border}`,
                        borderRadius: s.badge.r,
                        boxSizing: 'border-box',
                    }}>
                        <span style={{
                            fontFamily: 'var(--typography-font-family-body, Manrope, sans-serif)',
                            fontWeight: 400,
                            fontSize: s.badge.font.size,
                            lineHeight: `${s.badge.font.lh}px`,
                            color: COLORS.badge.text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.96px',
                            whiteSpace: 'nowrap',
                        }}>⌘K</span>
                    </div>
                )}
            </div>
        </>
    );
});

SearchBar.displayName = 'SearchBar';
