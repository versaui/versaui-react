'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Segment } from './Segment';
import { Material, type MaterialSize } from '../Material/Material';
import { Divider } from '../Divider/Divider';

export const SEGMENTED_CONTROL_TYPES = ['primary', 'neutral'] as const;
export const SEGMENTED_CONTROL_SIZES = ['small', 'medium', 'large'] as const;
export const SEGMENTED_CONTROL_STYLES = ['simple', 'expressive'] as const;
export const SEGMENTED_CONTROL_WIDTH_MODES = ['equal', 'content'] as const;

export type SegmentedControlType = (typeof SEGMENTED_CONTROL_TYPES)[number];
export type SegmentedControlSize = (typeof SEGMENTED_CONTROL_SIZES)[number];
export type SegmentedControlStyle = (typeof SEGMENTED_CONTROL_STYLES)[number] | 'Simple' | 'Expressive';
export type SegmentedControlWidthMode = (typeof SEGMENTED_CONTROL_WIDTH_MODES)[number];

export interface SegmentItem {
    id: string;
    label?: string;
    icon?: ReactNode;
}

export interface SegmentedControlProps {
    type?: SegmentedControlType;
    size?: SegmentedControlSize;
    style?: SegmentedControlStyle;
    items: SegmentItem[];
    selectedId: string;
    onChange: (id: string) => void;
    iconOnly?: boolean;
    showDividers?: boolean;
    widthMode?: SegmentedControlWidthMode;
    className?: string;
    containerStyle?: React.CSSProperties;
}

// Container heights for each size
const CONTAINER_HEIGHTS: Record<SegmentedControlSize, number> = {
    small: 32,
    medium: 40,
    large: 48
};

// Container padding for each size
const CONTAINER_PADDINGS: Record<SegmentedControlSize, number> = {
    small: 2,
    medium: 2,
    large: 2
};

// Border radius CSS var for each size — container uses one size larger
const BORDER_RADIUS_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--corner-radius-control-medium)',
    medium: 'var(--corner-radius-control-large)',
    large: 'var(--corner-radius-control-x-large)'
};

// Inner border radius (for mover/segments)
const INNER_BORDER_RADIUS_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--corner-radius-control-small)',
    medium: 'var(--corner-radius-control-medium)',
    large: 'var(--corner-radius-control-large)'
};

// Inset effect vars for each size (Primary Expressive type)
const INSET_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--expressive-inset-strong-small)',
    medium: 'var(--expressive-inset-strong-small)',
    large: 'var(--expressive-inset-strong-medium)'
};

// Inset effect vars for each size (Neutral Expressive type)
const NEUTRAL_INSET_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--expressive-inset-subtle-small)',
    medium: 'var(--expressive-inset-subtle-small)',
    large: 'var(--expressive-inset-subtle-medium)'
};

// Fixed divider heights per size variant
const DIVIDER_HEIGHTS: Record<SegmentedControlSize, number> = {
    small: 16,
    medium: 20,
    large: 24
};

export function SegmentedControl({
    type = 'primary',
    size = 'medium',
    style = 'simple',
    items,
    selectedId,
    onChange,
    iconOnly = false,
    showDividers = false,
    widthMode = 'equal',
    className = '',
    containerStyle,
}: SegmentedControlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const segmentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [moverStyle, setMoverStyle] = useState<{ left: number; width: number } | null>(null);
    const [moverReady, setMoverReady] = useState(false);
    const [enableTransition, setEnableTransition] = useState(false);

    const normalizedStyle: 'simple' | 'expressive' = (
        typeof style === 'string' ? style.toLowerCase() : 'simple'
    ) as 'simple' | 'expressive';

    const customInlineStyle: React.CSSProperties | undefined = (
        typeof style === 'object' ? style : containerStyle
    );

    const isPrimary = type === 'primary';
    const isNeutral = type === 'neutral';
    const isExpressive = normalizedStyle === 'expressive';
    const isSimple = normalizedStyle === 'simple';
    const useNeutralMaterial = isNeutral && isSimple;

    const selectedIndex = items.findIndex(item => item.id === selectedId);

    // Get the appropriate padding for this size (uniform across primary and neutral variants)
    const containerPadding = CONTAINER_PADDINGS[size];

    // Calculate mover position from actual segment DOM position
    const updateMoverPosition = useCallback(() => {
        const selectedSegment = segmentRefs.current.get(selectedId);
        const container = containerRef.current;

        if (selectedSegment && container) {
            const containerRect = container.getBoundingClientRect();
            const segmentRect = selectedSegment.getBoundingClientRect();

            // Get container's computed style
            const computedStyle = getComputedStyle(container);
            const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;

            // Mover left is segment left relative to container's padding box
            const moverLeft = segmentRect.left - containerRect.left - borderLeft;

            // Mover width is segment width
            const moverWidth = segmentRect.width;

            setMoverStyle({
                left: moverLeft,
                width: moverWidth
            });
        }
    }, [selectedId]);

    // Update mover position on mount and selection change
    useEffect(() => {
        const timer = setTimeout(() => {
            updateMoverPosition();
            if (!moverReady) {
                // Show the mover now that it has the correct position
                setMoverReady(true);
                // After the browser paints the mover at the correct position,
                // enable transitions for subsequent moves
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setEnableTransition(true);
                    });
                });
            }
        }, 10);
        return () => clearTimeout(timer);
    }, [selectedId, items, updateMoverPosition, moverReady]);

    // Update on resize
    useEffect(() => {
        window.addEventListener('resize', updateMoverPosition);

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            resizeObserver = new ResizeObserver(() => {
                updateMoverPosition();
            });
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateMoverPosition);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [updateMoverPosition]);

    // Register segment ref
    const registerSegmentRef = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) {
            segmentRefs.current.set(id, el);
        } else {
            segmentRefs.current.delete(id);
        }
    }, []);

    // Mover styles based on type and visual style
    const getMoverStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${containerPadding}px`,
            bottom: `${containerPadding}px`,
            left: moverStyle ? `${moverStyle.left}px` : '0px',
            width: moverStyle ? `${moverStyle.width}px` : '0px',
            borderRadius: INNER_BORDER_RADIUS_VARS[size],
            // Hidden until positioned, then instant show, then enable transitions
            opacity: moverReady ? 1 : 0,
            transition: enableTransition
                ? 'left 200ms ease-out, width 200ms ease-out'
                : 'none',
            pointerEvents: 'none' as const,
            zIndex: 1,
            boxSizing: 'border-box'
        };

        if (isPrimary && isExpressive) {
            return {
                ...baseStyle,
                background: 'var(--gradient-expressive-fill-primary-strong) padding-box, var(--gradient-expressive-outline-primary-strong) border-box',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '1px solid transparent',
                boxShadow: INSET_VARS[size]
            };
        } else if (isPrimary && isSimple) {
            return {
                ...baseStyle,
                background: 'var(--color-brand-primary-subtlest)',
                border: '1px solid var(--color-brand-primary-subtler)',
                boxShadow: 'none'
            };
        } else if (isNeutral && isExpressive) {
            return {
                ...baseStyle,
                background: 'var(--gradient-expressive-fill-neutral) padding-box, var(--gradient-expressive-outline-neutral) border-box',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '1px solid transparent',
                boxShadow: NEUTRAL_INSET_VARS[size]
            };
        } else {
            // Neutral Simple - Material component wrapper provides surface and default elevation
            return baseStyle;
        }
    };

    // Check if divider should be visible (hide if adjacent to selected)
    const shouldShowDivider = (index: number): boolean => {
        if (index === selectedIndex || index === selectedIndex + 1) {
            return false;
        }
        return true;
    };

    // Fixed divider height per size
    const dividerHeight = DIVIDER_HEIGHTS[size];

    const containerSurfaceColor = isPrimary
        ? 'var(--color-neutral-surface-subtlest)'
        : 'var(--color-neutral-surface-subtle)';

    const isEqualWidth = widthMode === 'equal';
    const materialSize: MaterialSize = (useNeutralMaterial && size === 'large') ? 'medium' : 'small';

    return (
        <Material
            ref={containerRef}
            elevation="flat"
            size={materialSize}
            cornerRadiusType="control"
            cornerRadius={BORDER_RADIUS_VARS[size]}
            surfaceColor={containerSurfaceColor}
            className={`inline-flex items-center ${className}`}
            style={{
                height: `${CONTAINER_HEIGHTS[size]}px`,
                padding: `${containerPadding}px`,
                ...customInlineStyle
            }}
        >
            {/* Overflow clip layer — clips content but lets Material's outset hairline show */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                }}
            />

            {/* Animated mover */}
            {useNeutralMaterial ? (
                <Material
                    size={materialSize}
                    elevation="default"
                    cornerRadiusType="control"
                    cornerRadius={INNER_BORDER_RADIUS_VARS[size]}
                    style={getMoverStyle()}
                />
            ) : (
                <div style={getMoverStyle()} />
            )}

            {/* Segments container — grid for equal-width (1fr equalizes to widest), flex for content-width */}
            <div
                className="relative w-full h-full"
                style={{
                    zIndex: 2,
                    ...(isEqualWidth
                        ? {
                            display: 'grid',
                            gridAutoFlow: 'column',
                            gridAutoColumns: '1fr',
                            alignItems: 'center',
                        }
                        : {
                            display: 'flex',
                            alignItems: 'center',
                        }),
                }}
            >
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {/* Segment wrapper — grid cell in equal mode, flex item in content mode */}
                        <div
                            ref={(el) => registerSegmentRef(item.id, el)}
                            className={`relative flex items-center justify-center ${isEqualWidth ? 'w-full h-full' : ''}`}
                        >
                            {/* Divider at left edge (inside wrapper so it doesn't become a grid column) */}
                            {showDividers && index > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '-1px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        height: `${dividerHeight}px`,
                                        width: '2px',
                                        opacity: shouldShowDivider(index) ? 1 : 0,
                                        transition: 'opacity 150ms ease-out',
                                        zIndex: 3,
                                    }}
                                >
                                    <Divider
                                        orientation="vertical"
                                        style="intrusion"
                                    />
                                </div>
                            )}

                            <Segment
                                type={type}
                                size={size}
                                style={normalizedStyle}
                                selected={item.id === selectedId}
                                icon={item.icon}
                                onClick={() => onChange(item.id)}
                                className={isEqualWidth ? 'w-full' : ''}
                            >
                                {!iconOnly && item.label}
                            </Segment>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </Material>
    );
}
