'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect, createContext, useContext } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { SliderHandle, type SliderHandleState } from './SliderHandle';

// Types
export type SliderType = 'default' | 'range';
export const SLIDER_TYPES = ['default', 'range'] as const;

// Context for compound component architecture
interface SliderContextValue {
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    draggingHandle: 'start' | 'end' | null;
    hoveredHandle: 'start' | 'end' | null;
}

const SliderContext = createContext<SliderContextValue | null>(null);

export const useSliderContext = () => {
    const context = useContext(SliderContext);
    if (!context) {
        throw new Error('Slider compound components must be used within a Slider');
    }
    return context;
};

// CVA for track background
const trackVariants = cva(
    'absolute left-0 right-0 h-1 rounded-full',
    {
        variants: {
            disabled: {
                true: 'cursor-not-allowed',
                false: 'cursor-pointer',
            },
        },
        defaultVariants: {
            disabled: false,
        },
    }
);

// CVA for progress/range fill
const progressVariants = cva(
    'absolute h-1 rounded-full pointer-events-none',
    {
        variants: {
            disabled: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            disabled: false,
        },
    }
);

export interface SliderProps {
    /** Single value or range type */
    type?: SliderType;
    /** Current value for single slider */
    value?: number;
    /** Current values for range slider [min, max] */
    values?: [number, number];
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step increment */
    step?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Show value indicator on hover/drag */
    showValueIndicator?: boolean;
    /** Show label above slider */
    label?: string;
    /** Show min/max range labels below slider */
    showMinMaxLabels?: boolean;
    /** Callback for single value changes */
    onChange?: (value: number) => void;
    /** Callback for range value changes */
    onRangeChange?: (values: [number, number]) => void;
    /** Additional class name */
    className?: string;
    /** Width of the slider */
    width?: number | string;
}

/**
 * Slider - Interactive slider for selecting single value or range.
 * 
 * Layout:
 * - Labels (0 and 100) are at container edges
 * - Track is inset by 10px from each side (half of handle width)
 * - Handles are positioned on the track, centered at their position
 * - This ensures handle edges align with labels at 0% and 100%
 */
export const Slider: React.FC<SliderProps> = ({
    type = 'default',
    value: controlledValue,
    values: controlledValues,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showValueIndicator = true,
    label,
    showMinMaxLabels = false,
    onChange,
    onRangeChange,
    className = '',
    width = 200
}) => {
    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState(controlledValue ?? 50);
    const [internalValues, setInternalValues] = useState<[number, number]>(
        controlledValues ?? [25, 75]
    );

    // Track which handle is being dragged (for range slider)
    const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);
    const [hoveredHandle, setHoveredHandle] = useState<'start' | 'end' | null>(null);

    const trackRef = useRef<HTMLDivElement>(null);

    // Determine controlled vs uncontrolled
    const isControlled = type === 'default'
        ? controlledValue !== undefined
        : controlledValues !== undefined;

    const currentValue = isControlled ? (controlledValue ?? 50) : internalValue;
    const currentValues: [number, number] = isControlled
        ? (controlledValues ?? [25, 75])
        : internalValues;

    // Convert value to percentage
    const valueToPercent = useCallback((val: number) => {
        return ((val - min) / (max - min)) * 100;
    }, [min, max]);

    // Convert percentage to value (snapped to step)
    const percentToValue = useCallback((percent: number) => {
        const rawValue = (percent / 100) * (max - min) + min;
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    }, [min, max, step]);

    // Get position from event (supports both mouse and touch)
    const getPositionFromEvent = useCallback((e: MouseEvent | TouchEvent): number | null => {
        if (!trackRef.current) return null;
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
        if (clientX === undefined) return null;
        return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    }, []);

    // Handle drag start (mouse)
    const handleMouseDown = useCallback((handle: 'start' | 'end') => (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        setDraggingHandle(handle);
    }, [disabled]);

    // Handle drag start (touch)
    const handleTouchStart = useCallback((handle: 'start' | 'end') => (e: React.TouchEvent) => {
        if (disabled) return;
        e.preventDefault();
        setDraggingHandle(handle);
    }, [disabled]);

    // Unified move handler for both mouse and touch
    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!draggingHandle) return;

        const percent = getPositionFromEvent(e);
        if (percent === null) return;

        const newValue = percentToValue(percent);

        if (type === 'default') {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue);
        } else {
            // Range slider
            const newValues: [number, number] = [...currentValues];

            if (draggingHandle === 'start') {
                newValues[0] = Math.min(newValue, currentValues[1] - step);
            } else {
                newValues[1] = Math.max(newValue, currentValues[0] + step);
            }

            if (!isControlled) {
                setInternalValues(newValues);
            }
            onRangeChange?.(newValues);
        }
    }, [draggingHandle, type, isControlled, percentToValue, getPositionFromEvent, currentValues, step, onChange, onRangeChange]);

    // Handle drag end
    const handleEnd = useCallback(() => {
        setDraggingHandle(null);
    }, []);

    // Attach global events for dragging (mouse + touch)
    useEffect(() => {
        if (draggingHandle) {
            // Mouse events
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            // Touch events
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
            window.addEventListener('touchcancel', handleEnd);

            return () => {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('mouseup', handleEnd);
                window.removeEventListener('touchmove', handleMove);
                window.removeEventListener('touchend', handleEnd);
                window.removeEventListener('touchcancel', handleEnd);
            };
        }
    }, [draggingHandle, handleMove, handleEnd]);

    // Handle track click (jump to position)
    const handleTrackClick = useCallback((e: React.MouseEvent) => {
        if (disabled || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        const newValue = percentToValue(percent);

        if (type === 'default') {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue);
        } else {
            const distToStart = Math.abs(newValue - currentValues[0]);
            const distToEnd = Math.abs(newValue - currentValues[1]);

            const newValues: [number, number] = [...currentValues];

            if (distToStart <= distToEnd) {
                newValues[0] = Math.min(newValue, currentValues[1] - step);
            } else {
                newValues[1] = Math.max(newValue, currentValues[0] + step);
            }

            if (!isControlled) {
                setInternalValues(newValues);
            }
            onRangeChange?.(newValues);
        }
    }, [disabled, type, isControlled, percentToValue, currentValues, step, onChange, onRangeChange]);

    // Keyboard handling
    const handleKeyDown = useCallback((handle: 'start' | 'end') => (e: React.KeyboardEvent) => {
        if (disabled) return;

        let delta = 0;
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                delta = step;
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                delta = -step;
                break;
            case 'Home':
                delta = min - (type === 'default' ? currentValue : (handle === 'start' ? currentValues[0] : currentValues[1]));
                break;
            case 'End':
                delta = max - (type === 'default' ? currentValue : (handle === 'start' ? currentValues[0] : currentValues[1]));
                break;
            default:
                return;
        }

        e.preventDefault();

        if (type === 'default') {
            const newValue = Math.max(min, Math.min(max, currentValue + delta));
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue);
        } else {
            const newValues: [number, number] = [...currentValues];

            if (handle === 'start') {
                newValues[0] = Math.max(min, Math.min(currentValues[1] - step, currentValues[0] + delta));
            } else {
                newValues[1] = Math.max(currentValues[0] + step, Math.min(max, currentValues[1] + delta));
            }

            if (!isControlled) {
                setInternalValues(newValues);
            }
            onRangeChange?.(newValues);
        }
    }, [disabled, type, step, min, max, currentValue, currentValues, isControlled, onChange, onRangeChange]);

    // Determine handle state
    const getHandleState = useCallback((handle: 'start' | 'end'): SliderHandleState => {
        if (disabled) return 'disabled';
        if (draggingHandle === handle) return 'pressed';
        if (hoveredHandle === handle) return 'hovered';
        return 'default';
    }, [disabled, draggingHandle, hoveredHandle]);

    // Calculate positions
    const singleValuePercent = valueToPercent(currentValue);
    const startPercent = valueToPercent(currentValues[0]);
    const endPercent = valueToPercent(currentValues[1]);

    // Context value
    const contextValue = useMemo(() => ({
        min,
        max,
        step,
        disabled,
        draggingHandle,
        hoveredHandle,
    }), [min, max, step, disabled, draggingHandle, hoveredHandle]);

    // Wrapper styles
    const wrapperStyles: React.CSSProperties = useMemo(() => ({
        position: 'relative',
        isolation: 'isolate',
        display: 'flex',
        flexDirection: 'column',
        width: typeof width === 'number' ? `${width}px` : width,
    }), [width]);

    // Label styles (B5 typography)
    const labelStyles: React.CSSProperties = useMemo(() => ({
        color: 'var(--color-neutral-text-medium)',
        paddingBottom: 'var(--spacing-2)',
    }), []);

    // Track container styles
    const trackContainerStyles: React.CSSProperties = useMemo(() => ({
        position: 'relative',
        width: '100%',
        height: 20,
        display: 'flex',
        alignItems: 'center',
    }), []);

    // Track background dynamic styles
    const trackBgStyles: React.CSSProperties = useMemo(() => ({
        backgroundColor: disabled
            ? 'var(--color-neutral-surface-disabled)'
            : 'var(--color-neutral-surface-strong)',
    }), [disabled]);

    // Progress dynamic styles
    const progressDynamicStyles: React.CSSProperties = useMemo(() => {
        const baseStyles = {
            backgroundColor: disabled
                ? 'var(--color-neutral-surface-stronger)'
                : 'var(--color-brand-primary-strong)',
        };

        if (type === 'default') {
            return {
                ...baseStyles,
                left: 0,
                width: `${singleValuePercent}%`,
            };
        } else {
            return {
                ...baseStyles,
                left: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
            };
        }
    }, [type, singleValuePercent, startPercent, endPercent, disabled]);

    // Glow overlay styles
    const glowStyles: React.CSSProperties = useMemo(() => ({
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        boxShadow: disabled ? 'none' : 'var(--glow-small)',
        pointerEvents: 'none',
    }), [disabled]);

    // Handle position calculation
    // Handle is 20px wide. At 0%: left edge at track left. At 100%: right edge at track right.
    const getHandlePositionStyle = useCallback((percent: number): React.CSSProperties => ({
        position: 'absolute',
        left: `calc(${percent}% - ${percent * 0.2}px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
    }), []);

    // Range labels styles
    const rangeLabelContainerStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--spacing-1)',
        color: 'var(--color-neutral-text-medium)',
    }), []);

    // Value indicator styles - positioned relative to handle, fixed gap
    const valueIndicatorBaseStyles: React.CSSProperties = useMemo(() => ({
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-neutral-surface-subtlest)',
        border: '1px solid var(--color-neutral-outline-subtle)',
        borderRadius: 'var(--corner-radius-default-fully-rounded)',
        paddingTop: 'var(--spacing-2)',
        paddingBottom: 'var(--spacing-2)',
        paddingLeft: 'var(--spacing-4)',
        paddingRight: 'var(--spacing-4)',
        boxShadow: 'var(--elevation-small-1-shadow)',
        backdropFilter: 'blur(var(--elevation-small-blur))',
        WebkitBackdropFilter: 'blur(var(--elevation-small-blur))',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 100,
        color: 'var(--color-neutral-text-medium)',
        animation: 'slideInFade 200ms ease-out',
        // Position: 4px gap above handle (handle center is at 50% of track container)
        // Handle is 20px tall, so top of handle is 10px above center
        // Indicator bottom should be 4px above handle top
        bottom: 'calc(50% + 10px + 4px)', // 50% + half handle + gap
        transform: 'translateX(-50%)',
    }), []);

    // Get indicator X position (same formula as handle)
    const getIndicatorXPosition = useCallback((percent: number): React.CSSProperties => ({
        left: `calc(${percent}% - ${percent * 0.2}px + 10px)`, // Same as handle + 10px to center
    }), []);

    // Get active indicator info for rendering
    const activeIndicator = useMemo(() => {
        if (!showValueIndicator) return null;

        if (type === 'default') {
            if (draggingHandle === 'end' || hoveredHandle === 'end') {
                return { value: Math.round(currentValue), percent: singleValuePercent };
            }
        } else {
            if (draggingHandle === 'start' || hoveredHandle === 'start') {
                return { value: Math.round(currentValues[0]), percent: startPercent };
            }
            if (draggingHandle === 'end' || hoveredHandle === 'end') {
                return { value: Math.round(currentValues[1]), percent: endPercent };
            }
        }
        return null;
    }, [showValueIndicator, type, draggingHandle, hoveredHandle, currentValue, currentValues, singleValuePercent, startPercent, endPercent]);

    return (
        <SliderContext.Provider value={contextValue}>
            <div className={className} style={wrapperStyles}>
                {/* Label above slider */}
                {label && (
                    <div className="text-b5" style={labelStyles}>
                        {label}
                    </div>
                )}

                {/* Track container */}
                <div
                    style={trackContainerStyles}
                    role="group"
                    aria-label={type === 'range' ? 'Range slider' : 'Slider'}
                >
                    {/* Track background */}
                    <div
                        ref={trackRef}
                        className={cn(trackVariants({ disabled }))}
                        style={trackBgStyles}
                        onClick={handleTrackClick}
                    >
                        {/* Progress fill */}
                        <div
                            className={cn(progressVariants({ disabled }))}
                            style={progressDynamicStyles}
                        >
                            <div style={glowStyles} />
                        </div>
                    </div>

                    {/* Handle(s) */}
                    {type === 'default' ? (
                        <div style={getHandlePositionStyle(singleValuePercent)}>
                            <SliderHandle
                                state={getHandleState('end')}
                                value={Math.round(currentValue)}
                                min={min}
                                max={max}
                                onMouseDown={handleMouseDown('end')}
                                onTouchStart={handleTouchStart('end')}
                                onMouseEnter={() => !disabled && setHoveredHandle('end')}
                                onMouseLeave={() => setHoveredHandle(null)}
                                onKeyDown={handleKeyDown('end')}
                            />
                        </div>
                    ) : (
                        <>
                            <div style={getHandlePositionStyle(startPercent)}>
                                <SliderHandle
                                    state={getHandleState('start')}
                                    value={Math.round(currentValues[0])}
                                    min={min}
                                    max={max}
                                    onMouseDown={handleMouseDown('start')}
                                    onTouchStart={handleTouchStart('start')}
                                    onMouseEnter={() => !disabled && setHoveredHandle('start')}
                                    onMouseLeave={() => setHoveredHandle(null)}
                                    onKeyDown={handleKeyDown('start')}
                                />
                            </div>
                            <div style={getHandlePositionStyle(endPercent)}>
                                <SliderHandle
                                    state={getHandleState('end')}
                                    value={Math.round(currentValues[1])}
                                    min={min}
                                    max={max}
                                    onMouseDown={handleMouseDown('end')}
                                    onTouchStart={handleTouchStart('end')}
                                    onMouseEnter={() => !disabled && setHoveredHandle('end')}
                                    onMouseLeave={() => setHoveredHandle(null)}
                                    onKeyDown={handleKeyDown('end')}
                                />
                            </div>
                        </>
                    )}

                    {/* Value Indicator - inside track container for consistent positioning */}
                    {activeIndicator && (
                        <div
                            className="text-b6"
                            style={{ ...valueIndicatorBaseStyles, ...getIndicatorXPosition(activeIndicator.percent) }}
                        >
                            {activeIndicator.value}
                        </div>
                    )}
                </div>

                {/* Min/Max range labels */}
                {showMinMaxLabels && (
                    <div className="text-b5" style={rangeLabelContainerStyles}>
                        <span>{min}</span>
                        <span>{max}</span>
                    </div>
                )}
            </div>
        </SliderContext.Provider>
    );
};

export default Slider;
