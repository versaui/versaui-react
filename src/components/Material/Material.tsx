'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Size and elevation variants
export const MATERIAL_SIZES = ['small', 'medium', 'large'] as const;
export const MATERIAL_ELEVATIONS = ['flat', 'default', 'elevated', 'floating'] as const;
export const MATERIAL_CORNER_RADIUS_TYPES = ['default', 'thematic'] as const;

export type MaterialSize = (typeof MATERIAL_SIZES)[number];
export type MaterialElevation = (typeof MATERIAL_ELEVATIONS)[number];
export type MaterialCornerRadiusType = (typeof MATERIAL_CORNER_RADIUS_TYPES)[number];

/**
 * CVA variant configuration for Material component
 *
 * Maps size × elevation combinations to CSS classes that apply:
 * - Background color (surface-subtlest)
 * - Corner radius (per size — default tokens; overridable via cornerRadiusType prop)
 * - Box shadow (per size × elevation)
 * - Gradient outline (thematic-outline-surface)
 */
const materialVariants = cva(
    // Base classes - presentational only, no layout
    [
        'relative',
        'bg-[var(--color-neutral-surface-subtlest)]',
        'material-outline',
    ],
    {
        variants: {
            size: {
                small: [
                    'rounded-[var(--corner-radius-default-small)]',
                    'material-small',
                ],
                medium: [
                    'rounded-[var(--corner-radius-default-medium)]',
                    'material-medium',
                ],
                large: [
                    'rounded-[var(--corner-radius-default-large)]',
                    'material-large',
                ],
            },
            elevation: {
                flat: 'material-elevation-flat',
                default: 'material-elevation-default',
                elevated: 'material-elevation-elevated',
                floating: 'material-elevation-floating',
            },
        },
        defaultVariants: {
            size: 'medium',
            elevation: 'default',
        },
    }
);

// Corner radius token maps per size
const DEFAULT_CORNER_RADIUS: Record<MaterialSize, string> = {
    small: 'var(--corner-radius-default-small)',
    medium: 'var(--corner-radius-default-medium)',
    large: 'var(--corner-radius-default-large)',
};

const THEMATIC_CORNER_RADIUS: Record<MaterialSize, string> = {
    small: 'var(--corner-radius-thematic-small)',
    medium: 'var(--corner-radius-thematic-medium)',
    large: 'var(--corner-radius-thematic-large)',
};

export interface MaterialProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof materialVariants> {
    /** Size variant controlling corner-radius and blur intensity */
    size?: MaterialSize;
    /** Elevation level controlling shadow depth */
    elevation?: MaterialElevation;
    /** Corner radius type: 'default' uses default tokens, 'thematic' uses thematic tokens */
    cornerRadiusType?: MaterialCornerRadiusType;
    /** Explicit corner radius CSS value. When provided with cornerRadiusType='thematic',
     *  overrides the default thematic size map. e.g. 'var(--corner-radius-thematic-large)' */
    cornerRadius?: string;
    /** Custom surface background color. Defaults to var(--color-neutral-surface-subtlest) */
    surfaceColor?: string;
    /** Content to render inside the material surface */
    children?: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Material Component
 *
 * A foundational visual layer that applies composite surface styles:
 * - Background color (surface-subtlest, or custom via surfaceColor prop)
 * - Corner radius (default or thematic tokens, per size)
 * - Elevation shadow (flat/default/elevated/floating)
 * - Gradient outline (thematic-outline-surface)
 *
 * This component is purely presentational - it does NOT control:
 * - Layout (no flex, grid, absolute)
 * - Spacing (no padding, margin)
 * - Size (adapts to parent container)
 *
 * @example
 * // Basic usage
 * <Material size="medium" elevation="elevated">
 *   <CardContent />
 * </Material>
 *
 * @example
 * // With thematic corner radius and custom surface
 * <Material size="medium" elevation="flat" cornerRadiusType="thematic" cornerRadius="var(--corner-radius-thematic-large)" surfaceColor="var(--color-neutral-surface-subtle)">
 *   <TabContent />
 * </Material>
 */
export const Material = forwardRef<HTMLDivElement, MaterialProps>(
    ({ size = 'medium', elevation = 'default', cornerRadiusType = 'default', cornerRadius, surfaceColor, className = '', children, style, ...props }, ref) => {
        // Resolve effective corner radius:
        // 1. rounded-full className → 9999px
        // 2. Explicit cornerRadius prop → use directly
        // 3. Otherwise → use size-based map (default or thematic)
        const radiusMap = cornerRadiusType === 'thematic' ? THEMATIC_CORNER_RADIUS : DEFAULT_CORNER_RADIUS;
        const effectiveRadius = className.includes('rounded-full') ? '9999px'
            : cornerRadius || radiusMap[size];

        // Build inline style overrides (only when non-default values are used)
        // These override the CVA Tailwind classes via higher-specificity inline styles
        const overrideStyle: React.CSSProperties = {};
        if (cornerRadiusType !== 'default' || className.includes('rounded-full')) {
            overrideStyle.borderRadius = effectiveRadius;
        }
        if (surfaceColor) {
            overrideStyle.backgroundColor = surfaceColor;
        }

        // Merge: overrides first, then consumer's style (consumer wins for conflicts)
        const mergedStyle = (Object.keys(overrideStyle).length > 0 || style)
            ? { ...overrideStyle, ...style }
            : undefined;

        return (
            <div
                ref={ref}
                className={materialVariants({ size, elevation, className })}
                style={mergedStyle}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Material.displayName = 'Material';

export default Material;
