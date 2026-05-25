'use client';

/**
 * SparklineLine — compact line/area micro-chart for Versa UI.
 *
 * Pure SVG implementation using a fixed viewBox coordinate system with
 * responsive container scaling. No Recharts dependency.
 *
 * Features:
 * - Smooth (`curvy`) and angular (`zigzag`) curve variants
 * - Token-driven trend coloring (success / error)
 * - Optional gradient area fill beneath the line
 * - Stroke-dasharray reveal animation with `prefers-reduced-motion` support
 * - Graceful handling of empty, null, and single-point datasets
 * - Responsive width, fixed height per size variant
 * - `vector-effect: non-scaling-stroke` for consistent line thickness
 */

import React, { useMemo, useRef, useEffect, useState, useId } from 'react';
import { prefersReducedMotion } from '../utils/ChartUtils';
import type { SparklineLineProps, SparklineSize, SparklineTrend } from './SparklineTypes';

// Constants

/** Uniform line thickness across all sizes (px). */
const STROKE_WIDTH = 2;

/** Internal viewBox width — points are mapped into this coordinate space. */
const VB_WIDTH = 200;

/** Vertical padding inside the viewBox (top & bottom) so the line doesn't clip. */
const VB_PAD_Y = 4;

/** Container heights per size variant (matches Figma). */
const SIZE_HEIGHTS: Record<SparklineSize, number> = {
    large: 104,
    medium: 88,
    small: 56,
};

/** Stroke color tokens per trend. */
const STROKE_TOKENS: Record<SparklineTrend, string> = {
    positive: 'var(--color-state-success-medium)',
    negative: 'var(--color-state-error-medium)',
};

/** Animation duration (ms). */
const ANIM_DURATION = 800;

// Path interpolation helpers

interface Point {
    x: number;
    y: number;
}

/** Builds a linear (zigzag) SVG path. */
function buildLinearPath(points: Point[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

/**
 * Solves for first Bézier control points via the Thomas algorithm (tridiagonal system).
 * Produces C2-continuous natural cubic spline interpolation matching Recharts' 'natural' curve.
 */
function solveControlPoints(K: number[]): number[] {
    const n = K.length - 1;
    if (n === 1) return [(2 * K[0] + K[1]) / 3];

    // Build tridiagonal system coefficients
    const a = new Array(n).fill(0); // lower diagonal
    const b = new Array(n).fill(0); // main diagonal
    const c = new Array(n).fill(0); // upper diagonal
    const r = new Array(n).fill(0); // right-hand side

    a[0] = 0; b[0] = 2; c[0] = 1; r[0] = K[0] + 2 * K[1];
    for (let i = 1; i < n - 1; i++) {
        a[i] = 1; b[i] = 4; c[i] = 1;
        r[i] = 4 * K[i] + 2 * K[i + 1];
    }
    a[n - 1] = 2; b[n - 1] = 7; c[n - 1] = 0;
    r[n - 1] = 8 * K[n - 1] + K[n];

    // Forward sweep
    for (let i = 1; i < n; i++) {
        const m = a[i] / b[i - 1];
        b[i] -= m * c[i - 1];
        r[i] -= m * r[i - 1];
    }

    // Back substitution
    const x = new Array(n);
    x[n - 1] = r[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        x[i] = (r[i] - c[i] * x[i + 1]) / b[i];
    }

    return x;
}

/** Builds a smooth cubic Bézier SVG path using natural cubic spline interpolation. */
function buildSmoothPath(points: Point[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;
    if (points.length === 2) return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;

    const n = points.length - 1;
    const p1x = solveControlPoints(points.map(p => p.x));
    const p1y = solveControlPoints(points.map(p => p.y));

    let d = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < n; i++) {
        const p2x = i < n - 1 ? 2 * points[i + 1].x - p1x[i + 1] : (p1x[n - 1] + points[n].x) / 2;
        const p2y = i < n - 1 ? 2 * points[i + 1].y - p1y[i + 1] : (p1y[n - 1] + points[n].y) / 2;
        d += ` C${p1x[i]},${p1y[i]} ${p2x},${p2y} ${points[i + 1].x},${points[i + 1].y}`;
    }

    return d;
}

/** Extends the line path into a closed area shape for gradient fill. */
function buildAreaPath(linePath: string, points: Point[], bottomY: number): string {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${last.x},${bottomY} L${first.x},${bottomY} Z`;
}

// Component

export const SparklineLine: React.FC<SparklineLineProps> = ({
    data,
    trend = 'positive',
    size = 'large',
    variant = 'curvy',
    showArea = false,
    className,
}) => {
    const noMotion = prefersReducedMotion();
    const chartHeight = SIZE_HEIGHTS[size];
    const strokeColor = STROKE_TOKENS[trend];
    const instanceId = useId().replace(/:/g, '');

    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    // Compute valid data points — filter out null/undefined.
    const validValues = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data
            .map((d, i) => ({
                index: i,
                value: typeof d.value === 'number' && isFinite(d.value) ? d.value : null,
            }))
            .filter((d): d is { index: number; value: number } => d.value !== null);
    }, [data]);

    // ViewBox height matches the container height so stroke scales properly.
    const vbHeight = chartHeight;

    // Compute SVG points in viewBox coordinate space.
    const points = useMemo(() => {
        if (validValues.length === 0) return [] as Point[];

        const dataCount = data?.length || 0;
        const usableHeight = vbHeight - VB_PAD_Y * 2;

        const minVal = Math.min(...validValues.map((v) => v.value));
        const maxVal = Math.max(...validValues.map((v) => v.value));
        const range = maxVal - minVal || 1;

        return validValues.map((d) => ({
            x: dataCount > 1
                ? (d.index / (dataCount - 1)) * VB_WIDTH
                : VB_WIDTH / 2,
            y: VB_PAD_Y + usableHeight - ((d.value - minVal) / range) * usableHeight,
        }));
    }, [validValues, data, vbHeight]);

    // Build path strings.
    const linePath = useMemo(
        () => variant === 'curvy' ? buildSmoothPath(points) : buildLinearPath(points),
        [points, variant],
    );

    const areaPath = useMemo(
        () => showArea ? buildAreaPath(linePath, points, vbHeight) : '',
        [linePath, points, vbHeight, showArea],
    );

    const gradientId = `sparkline-area-${instanceId}`;

    // Measure path length for stroke-dasharray reveal animation.
    useEffect(() => {
        if (pathRef.current && !noMotion) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [linePath, noMotion]);

    // Empty state.
    if (validValues.length === 0) {
        return (
            <div
                className={className}
                style={{ width: '100%', height: chartHeight }}
                role="img"
                aria-label="Empty sparkline line chart"
            />
        );
    }

    // Single data point — render a dot.
    if (validValues.length === 1) {
        return (
            <div
                className={className}
                style={{ width: '100%', height: chartHeight }}
                role="img"
                aria-label={`Sparkline line chart showing ${trend} trend`}
            >
                <svg
                    width="100%"
                    height={chartHeight}
                    viewBox={`0 0 ${VB_WIDTH} ${vbHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: 'block' }}
                >
                    <circle
                        cx={points[0].x}
                        cy={points[0].y}
                        r={3}
                        fill={strokeColor}
                    />
                </svg>
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{ width: '100%', height: chartHeight }}
            role="img"
            aria-label={`Sparkline line chart showing ${trend} trend`}
        >
            <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${VB_WIDTH} ${vbHeight}`}
                preserveAspectRatio="none"
                style={{ display: 'block', overflow: 'visible' }}
            >
                {/* Gradient definition for area fill */}
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* Area fill — always defined, toggled by showArea */}
                {showArea && areaPath && (
                    <path
                        d={areaPath}
                        fill={`url(#${gradientId})`}
                        style={{
                            animation: noMotion
                                ? 'none'
                                : `sparkline-area-fade ${ANIM_DURATION}ms ease-out 200ms both`,
                        }}
                    />
                )}

                {/* Line stroke — uses non-scaling-stroke so thickness stays constant */}
                <path
                    ref={pathRef}
                    d={linePath}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={
                        !noMotion && pathLength > 0
                            ? {
                                  strokeDasharray: pathLength,
                                  strokeDashoffset: pathLength,
                                  animation: `sparkline-line-draw ${ANIM_DURATION}ms ease-out forwards`,
                              }
                            : undefined
                    }
                />
            </svg>

            {/* Animation keyframes — injected once per component */}
            {!noMotion && (
                <style>{`
                    @keyframes sparkline-line-draw {
                        to { stroke-dashoffset: 0; }
                    }
                    @keyframes sparkline-area-fade {
                        from { opacity: 0; }
                        to   { opacity: 1; }
                    }
                `}</style>
            )}
        </div>
    );
};

SparklineLine.displayName = 'SparklineLine';
