/**
 * Sparkline Chart Types — Versa UI Design System.
 *
 * Lightweight micro-visualization types for compact trend indication
 * in metric cards, dashboard widgets, and overview surfaces.
 */

// Trend & size

/** Semantic trend direction — controls color mapping. */
export type SparklineTrend = 'positive' | 'negative';

/** Chart size — maps to fixed heights per Figma specs. */
export type SparklineSize = 'large' | 'medium' | 'small';

/** Line chart curve variant. */
export type SparklineVariant = 'curvy' | 'zigzag';

// Data

/** A single numeric data point. Null/undefined values are treated as gaps. */
export interface SparklineDataPoint {
    value: number | null | undefined;
}

// Component props

export interface SparklineBarProps {
    /** Array of data points to render as vertical bars. */
    data: SparklineDataPoint[];
    /** Semantic trend direction — maps to success/error tokens. @default 'positive' */
    trend?: SparklineTrend;
    /** Chart size — controls container height. @default 'large' */
    size?: SparklineSize;
    /** Whether to visually highlight the last bar. @default true */
    highlightLast?: boolean;
    /** Additional CSS class name for the root element. */
    className?: string;
}

export interface SparklineLineProps {
    /** Array of data points to render as a line/area. */
    data: SparklineDataPoint[];
    /** Semantic trend direction — maps to success/error tokens. @default 'positive' */
    trend?: SparklineTrend;
    /** Chart size — controls container height. @default 'large' */
    size?: SparklineSize;
    /** Curve interpolation variant. @default 'curvy' */
    variant?: SparklineVariant;
    /** Whether to show a gradient area fill beneath the line. @default false */
    showArea?: boolean;
    /** Additional CSS class name for the root element. */
    className?: string;
}
