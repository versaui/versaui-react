/**
 * Core TypeScript types for the Versa UI Chart System.
 * Color references use Versa UI brand token keys — never raw hex.
 */

// --- Data ---

/** A single data point in a chart dataset. Keys are category/series names. */
export type ChartDataPoint = Record<string, string | number | null | undefined>;

/** Defines a data series rendered inside a chart. */
export interface ChartSeries {
    /** The key in each `ChartDataPoint` that holds this series' value. */
    dataKey: string;
    /** Human-readable name shown in legends and tooltips. */
    name: string;
    /** Brand color token key — maps to `--color-brand-{color}-subtle/medium`. */
    color: ChartColorToken;
}

// --- Tokens ---

/** Chart sizes matching Figma variants. */
export type ChartSize = 'large' | 'medium';

/**
 * Bar chart interaction mode.
 * - `'shared'` — entire bar group responds to hover; tooltip follows cursor.
 * - `'focused'` — only the directly hovered bar activates; tooltip anchored above bar with arrow.
 */
export type ChartInteractionMode = 'shared' | 'focused';

/** Marker shapes available for legend indicators. */
export type ChartLegendMarkerStyle = 'circle' | 'horizontal-line' | 'vertical-line';

/**
 * Brand color token keys used for chart series.
 * Maps to CSS variables: `--color-brand-{token}-subtle` / `--color-brand-{token}-medium`.
 */
export type ChartColorToken =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'error'
    | 'warning';

/** Ordered default palette when series don't specify explicit colors. */
export const CHART_COLOR_PALETTE: readonly ChartColorToken[] = [
    'primary',
    'secondary',
    'tertiary',
    'quaternary',
    'error',
    'warning',
] as const;

// --- Component Props ---

export interface ChartContainerProps {
    /** Chart size variant — controls container radius, padding, and legend size. */
    size?: ChartSize;
    /** Whether the chart is in a loading state. */
    loading?: boolean;
    /** Whether the dataset is empty (shows empty state). */
    empty?: boolean;
    /** Accessible label describing the chart content. */
    'aria-label'?: string;
    /** Additional CSS class names. */
    className?: string;
    /** Chart contents (Recharts components). */
    children: React.ReactNode;
    /** Minimum height for the chart container. Default: 300. */
    minHeight?: number;
    /** Aspect ratio (width/height). Default: responsive. */
    aspectRatio?: number;
}

export interface ChartGridProps {
    /** Show horizontal grid lines. Default: true. */
    horizontal?: boolean;
    /** Show vertical grid lines. Default: false. */
    vertical?: boolean;
    /** Additional CSS class names. */
    className?: string;
}

export interface ChartXAxisProps {
    /** Data key for x-axis category labels. */
    dataKey: string;
    /** Maximum label length before truncation. Default: 8. */
    maxLabelLength?: number;
    /** Custom tick formatter. */
    formatter?: (value: string | number) => string;
    /** Hide the axis entirely. Default: false. */
    hide?: boolean;
}

export interface ChartYAxisProps {
    /** Custom tick formatter (e.g. for currency, percentage). */
    formatter?: (value: number) => string;
    /** Fixed width for the y-axis. Default: 40. */
    width?: number;
    /** Hide the axis entirely. Default: false. */
    hide?: boolean;
}

export interface ChartTooltipProps {
    /** Custom tooltip content renderer. Overrides default rendering. */
    content?: React.ComponentType<ChartTooltipPayload>;
    /** Value formatter for tooltip display. */
    formatter?: (value: number, name: string) => string;
    /** Label formatter for the tooltip header. */
    labelFormatter?: (label: string) => string;
    /** Interaction mode — injected by VersaBarChart. Controls arrow and positioning behavior. */
    interactionMode?: ChartInteractionMode;
    /** Additional CSS class names. */
    className?: string;
}

/** Shape of data passed to custom tooltip renderers. */
export interface ChartTooltipPayload {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        dataKey: string;
        payload: ChartDataPoint;
    }>;
    label?: string;
}

export interface ChartLegendProps {
    /** Size variant. Default: 'default'. */
    size?: 'default' | 'small';
    /** Marker shape style. Default: 'circle'. */
    markerStyle?: ChartLegendMarkerStyle;
    /** Whether to show value next to each series. Default: false. */
    showValue?: boolean;
    /** Series definitions for rendering — auto-derived from chart if omitted. */
    series?: ChartSeries[];
    /** Callback when a series is toggled. */
    onToggle?: (dataKey: string) => void;
    /** Set of currently hidden series data keys. */
    hiddenSeries?: Set<string>;
    /** Additional CSS class names. */
    className?: string;
}

export interface ChartBarProps {
    /** The key in data for this bar's values. */
    dataKey: string;
    /** Brand color token. Default: auto from palette. */
    color?: ChartColorToken;
    /** Human-readable series name for legends/tooltips. */
    name?: string;
    /** Bar corner radius. Default: from design tokens. */
    radius?: number;
    /** Show active indicator dot on top-center of bar when hovered. Default: true. */
    showActiveDot?: boolean;
    /** Additional CSS class names. */
    className?: string;
}

export interface BarChartProps {
    /** Array of data points to render. */
    data: ChartDataPoint[];
    /** Chart size variant. Default: 'large'. */
    size?: ChartSize;
    /**
     * Interaction mode for hover behavior.
     * - `'shared'` (default) — group hover, cursor-following tooltip.
     * - `'focused'` — individual bar hover, anchored tooltip with arrow.
     */
    interactionMode?: ChartInteractionMode;
    /** Chart contents (axis, grid, bar, legend, tooltip). */
    children: React.ReactNode;
    /** Additional CSS class names. */
    className?: string;
}

// --- Line Chart ---

/** Line chart curve variant. */
export type LineChartVariant = 'curvy' | 'zigzag';

export interface ChartLineProps {
    /** The key in data for this line's values. */
    dataKey: string;
    /** Brand color token. Default: auto from palette. */
    color?: ChartColorToken;
    /** Human-readable series name for legends/tooltips. */
    name?: string;
    /** Whether to render a filled area beneath the line. Default: false. */
    showArea?: boolean;
    /** Line stroke width. Default: 2. */
    strokeWidth?: number;
    /** Show active marker dot on hovered point. Default: true. */
    showActiveDot?: boolean;
    /** Connect through null/undefined values. Default: true. */
    connectNulls?: boolean;
    /** Additional CSS class names. */
    className?: string;
}

export interface LineChartProps {
    /** Array of data points to render. */
    data: ChartDataPoint[];
    /** Line curve variant. Default: 'curvy'. */
    variant?: LineChartVariant;
    /** Chart size variant. Default: 'large'. */
    size?: ChartSize;
    /** Chart contents (axis, grid, line, legend, tooltip). */
    children: React.ReactNode;
    /** Additional CSS class names. */
    className?: string;
}

// --- Donut Chart ---

/** A single data segment in a donut/semi-donut chart. */
export interface DonutSegmentData {
    /** Human-readable segment name. */
    name: string;
    /** Numeric value for this segment. */
    value: number;
    /** Brand/state color token. Auto-assigned from palette if omitted. */
    color?: ChartColorToken;
}

export interface VersaDonutChartProps {
    /** Array of segment data. */
    data: DonutSegmentData[];
    /** Chart size variant. Default: 'large'. */
    size?: ChartSize;
    /** Whether to show the auto-generated legend. Default: true. */
    legend?: boolean;
    /** Show a gray background track arc (full 360°). Default: false. */
    showTrack?: boolean;
    /**
     * Explicit total value representing 100% of the track.
     * When provided (and > sum of visible data), the chart renders a proportional
     * arc so the filled segments don't cover the full circle.
     * Useful for partial-fill use cases (e.g. 680 out of 1000 tasks completed).
     * Ignored when `showTrack` is false.
     */
    total?: number;
    /** Render prop for custom center content (receives visible total value). */
    centerContent?: (total: number) => React.ReactNode;
    /** Additional CSS class names. */
    className?: string;
}

/** @deprecated Use `VersaDonutChartProps` instead. */
export type DonutChartProps = VersaDonutChartProps;

export interface VersaSemiDonutChartProps {
    /** Array of segment data. */
    data: DonutSegmentData[];
    /** Chart size variant. Default: 'large'. */
    size?: ChartSize;
    /** Whether to show the auto-generated legend. Default: true. */
    legend?: boolean;
    /** Show a gray background track (gauge / "out of 100" style). Default: false. */
    showTrack?: boolean;
    /**
     * Explicit total value representing 100% of the track.
     * When provided (and > sum of visible data), the chart renders a proportional
     * arc so the filled segments don't cover the full semi-circle.
     * Useful for partial-fill use cases (e.g. 680 out of 1000 tasks completed).
     * Ignored when `showTrack` is false.
     */
    total?: number;
    /** Render prop for custom center content (receives visible total value). */
    centerContent?: (total: number) => React.ReactNode;
    /** Additional CSS class names. */
    className?: string;
}

/** @deprecated Use `VersaSemiDonutChartProps` instead. */
export type SemiDonutChartProps = VersaSemiDonutChartProps;

// --- Gauge Chart ---

/** Gauge chart size variant matching Figma. */
export type GaugeChartSize = 'default' | 'large';

/** A single ring in a gauge chart. */
export interface GaugeRing {
    /** Numeric value (0–max). Clamped to [0, max]. */
    value: number;
    /** Maximum value for this ring. Default: 100. */
    max?: number;
    /** Human-readable ring label shown in legend and center. */
    label: string;
    /** Brand color token. Auto-assigned from palette if omitted. */
    color?: ChartColorToken;
}

export interface GaugeChartProps {
    /** Array of ring data. First ring = innermost. */
    rings: GaugeRing[];
    /** Chart size variant. Default: 'large'. */
    size?: GaugeChartSize;
    /** Whether to show the card-style legend below. Default: false. */
    legend?: boolean;
    /** Whether to show the default center label. Default: true. */
    showCenterLabel?: boolean;
    /** Override center value text (replaces auto-computed value). */
    centerValue?: string | number;
    /** Override center subtitle text (replaces first ring label). */
    centerSubtitle?: string;
    /** Render prop for fully custom center content. Receives rings array. */
    centerContent?: (rings: GaugeRing[]) => React.ReactNode;
    /** Whether to use rounded stroke caps. Default: true. */
    roundedCaps?: boolean;
    /** Whether the chart is in a loading state. */
    loading?: boolean;
    /** Whether to animate on mount and value changes. Default: true. */
    animated?: boolean;
    /** Accessible label for the chart. */
    'aria-label'?: string;
    /** Additional CSS class names. */
    className?: string;
}
