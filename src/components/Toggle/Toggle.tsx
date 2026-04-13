'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';

export const TOGGLE_STYLES = ['default', 'pill'] as const;
export const TOGGLE_SIZES = ['large', 'medium', 'small'] as const;

export type ToggleStyle = (typeof TOGGLE_STYLES)[number];
export type ToggleSize = (typeof TOGGLE_SIZES)[number];

// Size configurations from Figma - exact dimensions
// Default style: thumb is 80% of container height (square)
// Pill style: thumb is wider (20:16 aspect ratio)
// wrapperPadding: padding around the toggle for focus states
const SIZE_CONFIG: Record<
    ToggleSize,
    {
        wrapperPadding: number;
        default: {
            containerWidth: number;
            containerHeight: number;
            thumbSize: number; // square thumb
            thumbPadding: number;
        };
        pill: {
            containerWidth: number;
            containerHeight: number;
            thumbWidth: number;
            thumbHeight: number;
            thumbPadding: number;
        };
    }
> = {
    large: {
        wrapperPadding: 2,
        default: {
            containerWidth: 32,
            containerHeight: 20,
            thumbSize: 16, // 80% of 20
            thumbPadding: 2
        },
        pill: {
            containerWidth: 36,
            containerHeight: 20,
            thumbWidth: 20,
            thumbHeight: 16,
            thumbPadding: 2
        }
    },
    medium: {
        wrapperPadding: 2,
        default: {
            containerWidth: 26,
            containerHeight: 16,
            thumbSize: 12.8, // 80% of 16
            thumbPadding: 1.6
        },
        pill: {
            containerWidth: 29,
            containerHeight: 16,
            thumbWidth: 16,
            thumbHeight: 12.8,
            thumbPadding: 1.6
        }
    },
    small: {
        wrapperPadding: 1,
        default: {
            containerWidth: 22,
            containerHeight: 14,
            thumbSize: 11.2, // 80% of 14
            thumbPadding: 1.4
        },
        pill: {
            containerWidth: 25,
            containerHeight: 14,
            thumbWidth: 14, // aspect 20:16 = 14 * (20/16) but capped to fit
            thumbHeight: 11.2,
            thumbPadding: 1.4
        }
    }
};

interface ToggleProps {
    style?: ToggleStyle;
    size?: ToggleSize;
    checked?: boolean;
    disabled?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    onChange?: (checked: boolean) => void;
    className?: string;
    id?: string;
    name?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    style = 'default',
    size = 'large',
    checked: controlledChecked,
    disabled = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    onChange,
    className = '',
    id,
    name
}) => {
    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });

    const [internalChecked, setInternalChecked] = useState(controlledChecked ?? false);
    const [mounted, setMounted] = useState(false);
    const prevCheckedRef = useRef<boolean | undefined>(undefined);

    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const isHovered = propIsHovered !== undefined ? propIsHovered : ariaIsHovered;
    const isFocused = propIsFocused !== undefined ? propIsFocused : isFocusVisible;

    // Track mounted state for animations
    useEffect(() => {
        setMounted(true);
    }, []);

    // Track previous checked state to enable animations only on change
    useEffect(() => {
        prevCheckedRef.current = checked;
    }, [checked]);

    const sizeConfig = SIZE_CONFIG[size];
    const isPill = style === 'pill';

    // Container dimensions
    const containerWidth = isPill
        ? sizeConfig.pill.containerWidth
        : sizeConfig.default.containerWidth;
    const containerHeight = isPill
        ? sizeConfig.pill.containerHeight
        : sizeConfig.default.containerHeight;

    // Thumb dimensions
    const thumbWidth = isPill
        ? sizeConfig.pill.thumbWidth
        : sizeConfig.default.thumbSize;
    const thumbHeight = isPill
        ? sizeConfig.pill.thumbHeight
        : sizeConfig.default.thumbSize;

    const thumbPadding = isPill
        ? sizeConfig.pill.thumbPadding
        : sizeConfig.default.thumbPadding;

    // Calculate thumb position
    const thumbLeftOn = containerWidth - thumbWidth - thumbPadding;
    const thumbLeftOff = thumbPadding;
    const thumbLeft = checked ? thumbLeftOn : thumbLeftOff;

    const colors = useMemo(() => {
        if (disabled) {
            return {
                containerBg: 'var(--color-neutral-surface-disabled)',
                thumbBg: 'var(--color-neutral-surface-strongest)'
            };
        }

        if (checked) {
            return {
                containerBg: isHovered
                    ? 'var(--color-brand-primary-strong)'
                    : 'var(--color-brand-primary-medium)',
                thumbBg: 'var(--color-neutral-surface-static-white)'
            };
        }

        // Off state
        return {
            containerBg: isHovered
                ? 'var(--color-neutral-outline-strong)'
                : 'var(--color-neutral-surface-strongest)',
            thumbBg: 'var(--color-neutral-surface-static-white)'
        };
    }, [checked, disabled, isHovered]);

    const containerStyles: React.CSSProperties = useMemo(() => {
        return {
            position: 'relative',
            width: containerWidth,
            height: containerHeight,
            borderRadius: 'var(--corner-radius-default-fully-rounded)',
            backgroundColor: colors.containerBg,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 150ms ease-out',
            flexShrink: 0
        };
    }, [containerWidth, containerHeight, colors.containerBg, disabled]);

    // Wrapper padding from SIZE_CONFIG
    const wrapperPadding = sizeConfig.wrapperPadding;

    // Focus background color (same pattern as Radio/Checkbox)
    const focusBackgroundColor = useMemo(() => {
        if (isFocused && !disabled) {
            return checked
                ? 'var(--color-brand-primary-subtler)'
                : 'var(--color-neutral-surface-strong)';
        }
        return undefined;
    }, [isFocused, disabled, checked]);

    const wrapperStyles: React.CSSProperties = useMemo(() => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wrapperPadding,
        borderRadius: 'var(--corner-radius-default-fully-rounded)',
        backgroundColor: focusBackgroundColor,
        transition: 'background-color 150ms ease-out',
        outline: 'none' // Remove default browser outline since we handle focus with background
    }), [wrapperPadding, focusBackgroundColor]);

    const thumbStyles: React.CSSProperties = useMemo(() => {
        // Animate only after mount - prevCheckedRef is set in effect after first render
        const shouldAnimate = mounted;

        return {
            position: 'absolute',
            width: thumbWidth,
            height: thumbHeight,
            top: '50%',
            left: thumbLeft,
            transform: 'translateY(-50%)',
            borderRadius: 'var(--corner-radius-default-fully-rounded)',
            backgroundColor: colors.thumbBg,
            boxShadow: disabled ? 'none' : 'var(--elevation-medium-1-shadow)',
            backdropFilter: disabled ? 'none' : 'blur(var(--elevation-medium-blur))',
            WebkitBackdropFilter: disabled ? 'none' : 'blur(var(--elevation-medium-blur))',
            transition: shouldAnimate ? 'left 150ms ease-out' : 'none'
        };
    }, [thumbWidth, thumbHeight, thumbLeft, colors.thumbBg, disabled, mounted]);

    const glowOverlayStyles: React.CSSProperties = useMemo(() => ({
        position: 'absolute',
        inset: 0,
        borderRadius: 'var(--corner-radius-default-fully-rounded)',
        boxShadow: checked && !disabled ? 'var(--glow-medium)' : 'none',
        pointerEvents: 'none'
    }), [checked, disabled]);

    const handleClick = useCallback(() => {
        if (disabled) return;

        const newChecked = !checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        onChange?.(newChecked);
    }, [disabled, checked, isControlled, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    return (
        <div
            className={className}
            style={wrapperStyles}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            id={id}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            {...mergeProps(hoverProps, focusProps)}
        >
            {/* Hidden input for form submission */}
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                name={name}
                onChange={() => { }} // Handled by onClick
                style={{
                    position: 'absolute',
                    opacity: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: 'none'
                }}
                tabIndex={-1}
                aria-hidden="true"
            />

            {/* Toggle container with focus outline */}
            <div style={containerStyles}>
                {/* Thumb */}
                <div style={thumbStyles} />

                {/* Glow overlay (only when on and not disabled) */}
                <div style={glowOverlayStyles} />
            </div>
        </div>
    );
};
