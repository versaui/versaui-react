'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';

export const CHECKBOX_SIZES = ['small', 'medium', 'large'] as const;
export const CHECKBOX_STYLES = ['square', 'circle'] as const;

export type CheckboxSize = (typeof CHECKBOX_SIZES)[number];
export type CheckboxStyle = (typeof CHECKBOX_STYLES)[number];

const SIZE_CONFIG: Record<CheckboxSize, { container: number; checkbox: number; borderRadius: number }> = {
    small: { container: 16, checkbox: 12, borderRadius: 2 },
    medium: { container: 20, checkbox: 15, borderRadius: 2 },
    large: { container: 24, checkbox: 18, borderRadius: 2 }
};

interface CheckboxProps {
    size?: CheckboxSize;
    checkboxStyle?: CheckboxStyle;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    onChange?: (checked: boolean) => void;
    className?: string;
    id?: string;
    name?: string;
}

const CheckedSvg: React.FC<{
    size: number;
    borderRadius: number;
    fillColor: string;
    isCircle: boolean;
    animate: boolean
}> = ({ size, borderRadius, fillColor, isCircle, animate }) => {
    const viewBox = `0 0 ${size} ${size}`;
    const radius = isCircle ? size / 2 : borderRadius;

    // Calculate scaled checkmark path positions
    const scale = size / 18;

    // Simplified checkmark path for stroke animation (scaled positions)
    const checkStart = { x: 4.5 * scale, y: 9 * scale };
    const checkMid = { x: 7.5 * scale, y: 12 * scale };
    const checkEnd = { x: 13.5 * scale, y: 6 * scale };

    const checkPath = `M${checkStart.x},${checkStart.y} L${checkMid.x},${checkMid.y} L${checkEnd.x},${checkEnd.y}`;

    // Calculate path length for stroke-dasharray
    const pathLength =
        Math.sqrt(Math.pow(checkMid.x - checkStart.x, 2) + Math.pow(checkMid.y - checkStart.y, 2)) +
        Math.sqrt(Math.pow(checkEnd.x - checkMid.x, 2) + Math.pow(checkEnd.y - checkMid.y, 2));

    return (
        <svg
            width={size}
            height={size}
            viewBox={viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', overflow: 'visible' }}
        >
            {/* Background */}
            <rect
                x="0"
                y="0"
                width={size}
                height={size}
                rx={radius}
                fill={fillColor}
            />
            {/* Animated Checkmark - stroke path animation from left to right */}
            <path
                d={checkPath}
                stroke="white"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                    strokeDasharray: pathLength,
                    strokeDashoffset: animate ? 0 : pathLength,
                    transition: 'stroke-dashoffset 200ms ease-out'
                }}
            />
        </svg>
    );
};

const IndeterminateSvg: React.FC<{
    size: number;
    borderRadius: number;
    fillColor: string;
    isCircle: boolean
}> = ({ size, borderRadius, fillColor, isCircle }) => {
    const viewBox = `0 0 ${size} ${size}`;
    const radius = isCircle ? size / 2 : borderRadius;
    const scale = size / 18;

    // Minus line coordinates
    const minusY = size / 2;
    const minusStartX = 4.5 * scale;
    const minusEndX = 13.5 * scale;

    return (
        <svg
            width={size}
            height={size}
            viewBox={viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', overflow: 'visible' }}
        >
            {/* Background */}
            <rect
                x="0"
                y="0"
                width={size}
                height={size}
                rx={radius}
                fill={fillColor}
            />
            {/* Minus */}
            <line
                x1={minusStartX}
                y1={minusY}
                x2={minusEndX}
                y2={minusY}
                stroke="white"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
            />
        </svg>
    );
};

// Unchecked SVG - outlined background
const UncheckedSvg: React.FC<{
    size: number;
    borderRadius: number;
    backgroundColor: string;
    borderColor: string;
    isCircle: boolean
}> = ({ size, borderRadius, backgroundColor, borderColor, isCircle }) => {
    const viewBox = `0 0 ${size} ${size}`;
    const radius = isCircle ? size / 2 : borderRadius;

    return (
        <svg
            width={size}
            height={size}
            viewBox={viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', overflow: 'visible' }}
        >
            <rect
                x="0.5"
                y="0.5"
                width={size - 1}
                height={size - 1}
                rx={Math.max(0, radius - 0.5)}
                fill={backgroundColor}
                stroke={borderColor}
                strokeWidth="1"
            />
        </svg>
    );
};

export const Checkbox: React.FC<CheckboxProps> = ({
    size = 'medium',
    checkboxStyle = 'square',
    checked: controlledChecked,
    indeterminate = false,
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
    const [animateCheck, setAnimateCheck] = useState(false);
    const wasCheckedRef = useRef(false);

    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const isHovered = propIsHovered !== undefined ? propIsHovered : ariaIsHovered;
    const isFocused = propIsFocused !== undefined ? propIsFocused : isFocusVisible;
    const isCircle = checkboxStyle === 'circle';

    const { container: containerSize, checkbox: checkboxSize, borderRadius } = SIZE_CONFIG[size];

    // Animate check when transitioning from unchecked to checked
    useEffect(() => {
        if (checked && !wasCheckedRef.current) {
            // Becoming checked - trigger animation
            setAnimateCheck(false);
            // Small delay to reset the animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimateCheck(true);
                });
            });
        } else if (checked) {
            // Already checked (initial render or prop change)
            setAnimateCheck(true);
        } else {
            setAnimateCheck(false);
        }
        wasCheckedRef.current = checked;
    }, [checked]);

    // Compute colors based on state
    const colors = useMemo(() => {
        const isActive = checked || indeterminate;

        if (disabled) {
            if (isActive) {
                return {
                    fillColor: 'var(--color-neutral-surface-disabled)',
                    backgroundColor: 'var(--color-neutral-surface-disabled)',
                    borderColor: 'transparent'
                };
            } else {
                return {
                    fillColor: 'var(--color-neutral-surface-subtle)',
                    backgroundColor: 'var(--color-neutral-surface-subtle)',
                    borderColor: 'var(--color-neutral-outline-subtlest)'
                };
            }
        }

        if (isActive) {
            return {
                fillColor: isHovered
                    ? 'var(--color-brand-primary-stronger)'
                    : 'var(--color-brand-primary-strong)',
                backgroundColor: '',
                borderColor: ''
            };
        }

        // Unchecked state
        return {
            fillColor: '',
            backgroundColor: isHovered
                ? 'var(--color-neutral-surface-strong)'
                : 'var(--color-neutral-surface-subtle)',
            borderColor: 'var(--color-neutral-outline-medium)'
        };
    }, [checked, indeterminate, disabled, isHovered]);

    const containerStyles: React.CSSProperties = useMemo(() => {
        // Focus state background color
        let focusBackgroundColor: string | undefined = undefined;
        if (isFocused && !disabled) {
            // Active (checked/indeterminate): primary-subtler, Inactive: surface-strong
            focusBackgroundColor = (checked || indeterminate)
                ? 'var(--color-brand-primary-subtler)'
                : 'var(--color-neutral-surface-strong)';
        }

        return {
            width: containerSize,
            height: containerSize,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            // Focus state: fill wrapper with color instead of outline
            backgroundColor: focusBackgroundColor,
            // Corner radius: use x-small token for square, 50% for circle
            borderRadius: isCircle ? '50%' : 'var(--corner-radius-default-x-small)',
            transition: 'background-color 150ms ease-out',
            // Disable default browser focus ring - using custom focus fill instead
            outline: 'none',
            // Elevation shadow
            filter: disabled ? 'none' : 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.04))'
        };
    }, [containerSize, disabled, isFocused, isCircle, checked, indeterminate]);

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

    const renderCheckbox = () => {
        if (indeterminate) {
            return (
                <IndeterminateSvg
                    size={checkboxSize}
                    borderRadius={borderRadius}
                    fillColor={colors.fillColor}
                    isCircle={isCircle}
                />
            );
        }

        if (checked) {
            return (
                <CheckedSvg
                    size={checkboxSize}
                    borderRadius={borderRadius}
                    fillColor={colors.fillColor}
                    isCircle={isCircle}
                    animate={animateCheck}
                />
            );
        }

        return (
            <UncheckedSvg
                size={checkboxSize}
                borderRadius={borderRadius}
                backgroundColor={colors.backgroundColor}
                borderColor={colors.borderColor}
                isCircle={isCircle}
            />
        );
    };

    return (
        <div
            className={className}
            style={containerStyles}
            role="checkbox"
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            id={id}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...mergeProps(hoverProps, focusProps)}
        >
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
            {renderCheckbox()}
        </div>
    );
};
