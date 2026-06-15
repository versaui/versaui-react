'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Segment } from './Segment';
import { Material } from '../Material/Material';
import { Divider } from '../Divider/Divider';

export const SEGMENTED_CONTROL_TYPES = ['primary', 'neutral'] as const;
export const SEGMENTED_CONTROL_SIZES = ['small', 'medium', 'large'] as const;
export const SEGMENTED_CONTROL_WIDTH_MODES = ['equal', 'content'] as const;

export type SegmentedControlType = (typeof SEGMENTED_CONTROL_TYPES)[number];
export type SegmentedControlSize = (typeof SEGMENTED_CONTROL_SIZES)[number];
export type SegmentedControlWidthMode = (typeof SEGMENTED_CONTROL_WIDTH_MODES)[number];

export interface SegmentItem {
    id: string;
    label?: string;
    icon?: ReactNode;
}

interface SegmentedControlProps {
    type?: SegmentedControlType;
    size?: SegmentedControlSize;
    items: SegmentItem[];
    selectedId: string;
    onChange: (id: string) => void;
    iconOnly?: boolean;
    showDividers?: boolean;
    widthMode?: SegmentedControlWidthMode;
    className?: string;
    style?: React.CSSProperties;
}

// Container heights for each size
const CONTAINER_HEIGHTS: Record<SegmentedControlSize, number> = {
    small: 32,
    medium: 40,
    large: 48
};

// Container padding for each size
const CONTAINER_PADDINGS: Record<SegmentedControlSize, { primary: number; neutral: number }> = {
    small: { primary: 2, neutral: 2 },
    medium: { primary: 4, neutral: 2 },
    large: { primary: 4, neutral: 2 }
};

// Border radius CSS var for each size — container uses one size larger
const BORDER_RADIUS_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--corner-radius-thematic-medium)',
    medium: 'var(--corner-radius-thematic-large)',
    large: 'var(--corner-radius-thematic-x-large)'
};

// Inner border radius (for mover/segments)
const INNER_BORDER_RADIUS_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--corner-radius-thematic-small)',
    medium: 'var(--corner-radius-thematic-medium)',
    large: 'var(--corner-radius-thematic-large)'
};

// Inset effect vars for each size (Primary type)
const INSET_VARS: Record<SegmentedControlSize, string> = {
    small: 'var(--inset-default-small)',
    medium: 'var(--inset-default-small)',
    large: 'var(--inset-default-small)'
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
    items,
    selectedId,
    onChange,
    iconOnly = false,
    showDividers = false,
    widthMode = 'equal',
    className = '',
    style: customStyle
}: SegmentedControlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const segmentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [moverStyle, setMoverStyle] = useState<{ left: number; width: number } | null>(null);
    const [moverReady, setMoverReady] = useState(false);
    const [enableTransition, setEnableTransition] = useState(false);

    const isPrimary = type === 'primary';
    const selectedIndex = items.findIndex(item => item.id === selectedId);

    // Get the appropriate padding for this type and size (moved here for use in updateMoverPosition)
    const containerPadding = isPrimary ? CONTAINER_PADDINGS[size].primary : CONTAINER_PADDINGS[size].neutral;

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
        return () => window.removeEventListener('resize', updateMoverPosition);
    }, [updateMoverPosition]);

    // Register segment ref
    const registerSegmentRef = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) {
            segmentRefs.current.set(id, el);
        } else {
            segmentRefs.current.delete(id);
        }
    }, []);

    // Mover styles based on type
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

        if (isPrimary) {
            return {
                ...baseStyle,
                background: 'var(--gradient-thematic-fill-primary) padding-box, var(--gradient-thematic-outline-primary) border-box',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '1px solid transparent',
                boxShadow: INSET_VARS[size]
            };
        } else {
            return {
                ...baseStyle,
                background: 'var(--color-neutral-surface-subtlest)',
                border: '1px solid var(--color-neutral-outline-subtle)',
                boxShadow: 'var(--elevation-medium-1-shadow)',
                backdropFilter: 'blur(var(--elevation-medium-blur))',
                WebkitBackdropFilter: 'blur(var(--elevation-medium-blur))'
            };
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

    const isEqualWidth = widthMode === 'equal';

    return (
        <Material
            ref={containerRef}
            elevation="flat"
            size="medium"
            cornerRadiusType="thematic"
            cornerRadius={BORDER_RADIUS_VARS[size]}
            surfaceColor="var(--color-neutral-surface-subtle)"
            className={`inline-flex items-center ${className}`}
            style={{
                height: `${CONTAINER_HEIGHTS[size]}px`,
                padding: `${containerPadding}px`,
                ...customStyle
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
            <div style={getMoverStyle()} />

            {/* Segments container — grid for equal-width (1fr equalizes to widest), flex for content-width */}
            <div
                className="relative"
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
                            className="relative flex items-center justify-center"
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
