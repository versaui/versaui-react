/**
 * Versa UI Chart System — barrel export.
 *
 * All chart components, types, and utilities are re-exported from here.
 *
 * Usage:
 *   import { ChartContainer, VersaBarChart, ChartBar } from '@versaui/ui/components/Charts';
 *   import { VersaLineChart, ChartLine } from '@versaui/ui/components/Charts';
 */

// Core primitives
export { ChartContainer } from './core/ChartContainer';
export type { ChartContainerProps } from './types/ChartTypes';

export { ChartGrid } from './core/ChartGrid';
export type { ChartGridProps } from './types/ChartTypes';

export { ChartXAxis, ChartYAxis } from './core/ChartAxis';
export type { ChartXAxisProps, ChartYAxisProps } from './types/ChartTypes';

export { ChartTooltip } from './core/ChartTooltip';
export type { ChartTooltipProps, ChartTooltipPayload } from './types/ChartTypes';

export { ChartLegend } from './core/ChartLegend';
export type { ChartLegendProps } from './types/ChartTypes';

export { ChartEmptyState } from './core/ChartEmptyState';
export type { ChartEmptyStateProps } from './core/ChartEmptyState';

export { ChartLoadingState } from './core/ChartLoadingState';
export type { ChartLoadingStateProps } from './core/ChartLoadingState';

// Bar chart
export { VersaBarChart } from './BarChart/BarChart';
export type { VersaBarChartProps } from './BarChart/BarChart';

export { ChartBar } from './BarChart/BarChart';
export type { ChartBarProps } from './types/ChartTypes';

// Line chart
export { VersaLineChart } from './LineChart/LineChart';
export type { VersaLineChartProps } from './LineChart/LineChart';

export { ChartLine } from './LineChart/LineChart';
export type { ChartLineProps, LineChartVariant } from './types/ChartTypes';

// Donut chart
export { VersaDonutChart } from './DonutChart/DonutChart';
export type { DonutChartProps, VersaDonutChartProps } from './types/ChartTypes';

export { VersaSemiDonutChart } from './DonutChart/SemiDonutChart';
export type { SemiDonutChartProps, VersaSemiDonutChartProps } from './types/ChartTypes';

export { DonutLegend } from './DonutChart/DonutLegend';
export type { DonutLegendProps, DonutLegendItem } from './DonutChart/DonutLegend';

// Gauge chart
export { VersaGaugeChart } from './GaugeChart/GaugeChart';
export { GaugeRingShape } from './GaugeChart/GaugeChart';

// Types & utilities
export type {
    ChartDataPoint,
    ChartSeries,
    ChartSize,
    ChartColorToken,
    ChartInteractionMode,
    ChartLegendMarkerStyle,
    BarChartProps,
    LineChartProps,
    DonutSegmentData,
    GaugeChartProps,
    GaugeRing,
    GaugeChartSize,
} from './types/ChartTypes';

export { CHART_COLOR_PALETTE } from './types/ChartTypes';

export {
    getSeriesColor,
    getColorForIndex,
    formatAxisValue,
    truncateLabel,
    isEmptyDataset,
    prefersReducedMotion,
    aggregateDataPairs,
} from './utils/ChartUtils';

// Hooks
export { useChartTooltip } from './hooks/useChartTooltip';
export type { TooltipState } from './hooks/useChartTooltip';

export { useIsMobile } from './hooks/useIsMobile';

// Sparkline charts (lightweight micro-visualizations)
export { SparklineBar } from './sparkline/SparklineBar';
export { SparklineLine } from './sparkline/SparklineLine';
export type {
    SparklineBarProps,
    SparklineLineProps,
    SparklineTrend,
    SparklineSize,
    SparklineVariant,
    SparklineDataPoint,
} from './sparkline/SparklineTypes';
