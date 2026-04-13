'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';

export const RADIO_SIZES = ['small', 'medium', 'large'] as const;

export type RadioSize = (typeof RADIO_SIZES)[number];

// Size configurations from Figma
// container: wrapper size for interactions and focus states
// outer: radio SVG size (centered in container)
// Active: inner circle is centered dot
// Inactive: inner circle creates "ring" appearance (larger inner circle)
const SIZE_CONFIG: Record<RadioSize, {
    container: number;
    outer: number;
    innerActive: number;
    innerInactive: number;
}> = {
    small: { container: 16, outer: 12, innerActive: 6, innerInactive: 8 },
    medium: { container: 20, outer: 16, innerActive: 8, innerInactive: 10 },
    large: { container: 24, outer: 20, innerActive: 10, innerInactive: 14 }
};

interface RadioProps {
    size?: RadioSize;
    selected?: boolean;
    disabled?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    onChange?: (selected: boolean) => void;
    className?: string;
    id?: string;
    name?: string;
    value?: string;
}

// Active/Selected Radio SVG - solid filled circle with centered dot
const SelectedSvg: React.FC<{
    outerSize: number;
    innerSize: number;
    outerColor: string;
    innerColor: string;
    showShadow: boolean;
    animate: boolean;
}> = ({ outerSize, innerSize, outerColor, innerColor, showShadow, animate }) => {

    return (
        <svg
            width={outerSize}
            height={outerSize}
            viewBox={`0 0 ${outerSize} ${outerSize}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', overflow: 'visible' }}
        >
            {/* Outer Circle - filled with brand color */}
            <circle
                cx={outerSize / 2}
                cy={outerSize / 2}
                r={outerSize / 2}
                fill={outerColor}
            />
            {/* Inner Circle - white dot with optional shadow */}
            <circle
                cx={outerSize / 2}
                cy={outerSize / 2}
                r={innerSize / 2}
                fill={innerColor}
                style={{
                    filter: showShadow ? 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.04))' : 'none',
                    transform: animate ? 'scale(1)' : 'scale(0)',
                    transformOrigin: 'center',
                    transition: 'transform 150ms ease-out'
                }}
            />
            {/* Inner glow overlay */}
            {showShadow && (
                <circle
                    cx={outerSize / 2}
                    cy={outerSize / 2}
                    r={outerSize / 2}
                    fill="none"
                    style={{
                        boxShadow: 'var(--glow-small)'
                    }}
                />
            )}
        </svg>
    );
};

// Inactive/Unselected Radio SVG - ring appearance (outline)
const UnselectedSvg: React.FC<{
    outerSize: number;
    innerSize: number;
    outerColor: string;
    innerColor: string;
}> = ({ outerSize, innerSize, outerColor, innerColor }) => {
    return (
        <svg
            width={outerSize}
            height={outerSize}
            viewBox={`0 0 ${outerSize} ${outerSize}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', overflow: 'visible' }}
        >
            {/* Outer Circle - creates the ring appearance */}
            <circle
                cx={outerSize / 2}
                cy={outerSize / 2}
                r={outerSize / 2}
                fill={outerColor}
            />
            {/* Inner Circle - background color creates the "hole" effect */}
            <circle
                cx={outerSize / 2}
                cy={outerSize / 2}
                r={innerSize / 2}
                fill={innerColor}
            />
        </svg>
    );
};

export const Radio: React.FC<RadioProps> = ({
    size = 'medium',
    selected: controlledSelected,
    disabled = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    onChange,
    className = '',
    id,
    name,
    value
}) => {
    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });

    const [internalSelected, setInternalSelected] = useState(controlledSelected ?? false);
    const [animateSelection, setAnimateSelection] = useState(false);
    const wasSelectedRef = useRef(false);

    const isControlled = controlledSelected !== undefined;
    const selected = isControlled ? controlledSelected : internalSelected;

    const isHovered = propIsHovered !== undefined ? propIsHovered : ariaIsHovered;
    const isFocused = propIsFocused !== undefined ? propIsFocused : isFocusVisible;

    const { container: containerSize, outer, innerActive, innerInactive } = SIZE_CONFIG[size];

    // Animate selection when it becomes selected
    useEffect(() => {
        if (selected && !wasSelectedRef.current) {
            // Becoming selected - trigger animation
            setAnimateSelection(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimateSelection(true);
                });
            });
        } else if (selected) {
            // Already selected (initial render or prop change)
            setAnimateSelection(true);
        } else {
            setAnimateSelection(false);
        }
        wasSelectedRef.current = selected;
    }, [selected]);

    // Compute colors based on state
    const colors = useMemo(() => {
        if (disabled) {
            if (selected) {
                return {
                    outerColor: 'var(--color-neutral-surface-disabled)',
                    innerColor: 'var(--color-neutral-surface-strong)',
                    showShadow: false
                };
            } else {
                return {
                    outerColor: 'var(--color-neutral-surface-disabled)',
                    innerColor: 'var(--color-neutral-background-default)',
                    showShadow: false
                };
            }
        }

        if (selected) {
            return {
                outerColor: isHovered
                    ? 'var(--color-brand-primary-stronger)'
                    : 'var(--color-brand-primary-medium)',
                innerColor: 'var(--color-neutral-surface-static-white)',
                showShadow: true
            };
        }

        // Unselected state
        return {
            outerColor: isHovered
                ? 'var(--color-neutral-icon-disabled)'
                : 'var(--color-neutral-surface-strongest)',
            innerColor: 'var(--color-neutral-background-default)',
            showShadow: false
        };
    }, [selected, disabled, isHovered]);

    // Focus state background color (same pattern as Checkbox)
    const focusBackgroundColor = useMemo(() => {
        if (isFocused && !disabled) {
            return selected
                ? 'var(--color-brand-primary-subtler)'
                : 'var(--color-neutral-surface-strong)';
        }
        return undefined;
    }, [isFocused, disabled, selected]);

    const containerStyles: React.CSSProperties = useMemo(() => ({
        width: containerSize,
        height: containerSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        // Focus state: fill wrapper with color instead of outline
        backgroundColor: focusBackgroundColor,
        borderRadius: '50%',
        transition: 'background-color 150ms ease-out',
        // Disable default browser focus ring - using custom focus fill instead
        outline: 'none',
        // Subtle elevation shadow for active state
        filter: disabled ? 'none' : 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.04))'
    }), [containerSize, disabled, focusBackgroundColor]);

    const handleClick = useCallback(() => {
        if (disabled) return;

        // Radio buttons typically only select, not deselect
        if (!selected) {
            if (!isControlled) {
                setInternalSelected(true);
            }
            onChange?.(true);
        }
    }, [disabled, selected, isControlled, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    // Render the appropriate SVG based on state
    const renderRadio = () => {
        if (selected) {
            return (
                <SelectedSvg
                    outerSize={outer}
                    innerSize={innerActive}
                    outerColor={colors.outerColor}
                    innerColor={colors.innerColor}
                    showShadow={colors.showShadow}
                    animate={animateSelection}
                />
            );
        }

        return (
            <UnselectedSvg
                outerSize={outer}
                innerSize={innerInactive}
                outerColor={colors.outerColor}
                innerColor={colors.innerColor}
            />
        );
    };

    return (
        <div
            className={className}
            style={containerStyles}
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            id={id}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            {...mergeProps(hoverProps, focusProps)}
        >
            <input
                type="radio"
                checked={selected}
                disabled={disabled}
                name={name}
                value={value}
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
            {renderRadio()}
        </div>
    );
};
