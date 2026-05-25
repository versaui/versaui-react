/**
 * Chart utility functions — color helpers, formatting, and data inspection.
 * All color helpers resolve to CSS custom property strings.
 */

import { CHART_COLOR_PALETTE, type ChartColorToken, type ChartDataPoint, type DonutSegmentData } from '../types/ChartTypes';

// --- Color helpers ---

/**
 * Returns the CSS variable for a series color at a given interaction state.
 * State tokens (`error`, `warning`) use `--color-state-*`, brand tokens use `--color-brand-*`.
 */
export function getSeriesColor(
    token: ChartColorToken,
    state: 'subtle' | 'medium' | 'strong' = 'subtle',
): string {
    if (token === 'error' || token === 'warning') {
        return `var(--color-state-${token}-${state})`;
    }
    return `var(--color-brand-${token}-${state})`;
}

/**
 * Returns the color token for a series at a given index,
 * cycling through the default palette.
 */
export function getColorForIndex(index: number): ChartColorToken {
    return CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length];
}

/**
 * Returns the subtlest-shade CSS variable for a track ring background.
 * Used by gauge charts for the unfilled portion of each ring.
 */
export function getTrackColor(token: ChartColorToken): string {
    if (token === 'error' || token === 'warning') {
        return `var(--color-state-${token}-subtlest)`;
    }
    return `var(--color-brand-${token}-subtlest)`;
}

// --- Formatting ---

/** Formats an axis tick value using an optional custom formatter. */
export function formatAxisValue(
    value: string | number,
    formatter?: (v: string | number) => string,
): string {
    if (formatter) return formatter(value);
    return String(value);
}

/** Truncates a label string with an ellipsis if it exceeds `maxLength`. */
export function truncateLabel(label: string, maxLength: number = 8): string {
    if (!label || maxLength <= 0) return label || '';
    if (label.length <= maxLength) return label;
    return `${label.slice(0, maxLength)}…`;
}

/**
 * Formats a value as "123 (45.6%)" relative to a total.
 * Returns '0%' when total is zero.
 */
export function formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    const pct = ((value / total) * 100).toFixed(1);
    return `${value.toLocaleString()} (${pct}%)`;
}

// --- Data inspection ---

/**
 * Returns `true` when a dataset should be considered empty
 * (null, undefined, non-array, zero-length, or all-nullish values).
 */
export function isEmptyDataset(data: ChartDataPoint[] | null | undefined): boolean {
    if (!data || !Array.isArray(data) || data.length === 0) return true;

    return data.every((point) =>
        Object.values(point).every(
            (v) => v === null || v === undefined || v === '' || v === 0,
        ),
    );
}

let _prefersReducedMotionCache: boolean | null = null;

/** Checks whether the user has enabled `prefers-reduced-motion`. */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    if (_prefersReducedMotionCache !== null) return _prefersReducedMotionCache;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    _prefersReducedMotionCache = mediaQuery.matches;
    
    try {
        mediaQuery.addEventListener('change', (e) => {
            _prefersReducedMotionCache = e.matches;
        });
    } catch (err) {
        // Fallback for older browsers
        try {
            mediaQuery.addListener((e) => {
                _prefersReducedMotionCache = e.matches;
            });
        } catch (_) {}
    }
    
    return _prefersReducedMotionCache;
}

// --- Numeric helpers ---

/** Clamps a number to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// --- Donut/Gauge shared helpers ---

/** Resolves auto-assigned colors for donut/gauge segment data. */
export function resolveSegmentColors(
    data: DonutSegmentData[],
): (DonutSegmentData & { resolvedColor: ChartColorToken })[] {
    return data.map((d, i) => ({
        ...d,
        resolvedColor: d.color || getColorForIndex(i),
    }));
}

// --- Mobile data helpers ---

/**
 * Aggregates consecutive pairs of data points by **summing** numeric values.
 *
 * Useful for reducing data density on mobile viewports (e.g., 8 months → 4 groups).
 * Non-numeric values (labels) are taken from the first item in each pair.
 * An odd last item is kept as-is (no artificial pairing).
 *
 * @param data     Array of data points to aggregate.
 * @param labelKey The key used for category labels (preserved from first item).
 *
 * @example
 * ```ts
 * const mobile = aggregateDataPairs(monthlyData, 'month');
 * // Jan(4200)+Feb(5800) → { month: 'Jan', revenue: 10000 }
 * ```
 */
export function aggregateDataPairs<T extends Record<string, unknown>>(
    data: T[],
    labelKey: string,
): T[] {
    const result: T[] = [];
    for (let i = 0; i < data.length; i += 2) {
        const first = data[i];
        const second = data[i + 1];

        // Odd last item — keep as-is.
        if (!second) {
            result.push(first);
            continue;
        }

        const aggregated: Record<string, unknown> = {};
        for (const key of Object.keys(first)) {
            if (key === labelKey) {
                aggregated[key] = first[key];
            } else if (typeof first[key] === 'number' && typeof second[key] === 'number') {
                aggregated[key] = (first[key] as number) + (second[key] as number);
            } else {
                aggregated[key] = first[key];
            }
        }
        result.push(aggregated as T);
    }
    return result;
}
