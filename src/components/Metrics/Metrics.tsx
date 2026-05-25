'use client';

/**
 * Metrics — dashboard metric overview card component for Versa UI.
 * Supports custom icons, trend tags, and embedded sparkline charts.
 */

import React, { useMemo, type CSSProperties, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { Material } from '../Material/Material';
import { StatusTag } from '../Tag/StatusTag';
import { SparklineLine } from '../Charts/sparkline/SparklineLine';
import { SparklineBar } from '../Charts/sparkline/SparklineBar';
import type { SparklineDataPoint, SparklineSize } from '../Charts/sparkline/SparklineTypes';
import type { MaterialSize, MaterialElevation } from '../Material/Material';
import type { StatusTagSize, StatusTagStatus } from '../Tag/StatusTag';

// Types

export type MetricsSize = 'large' | 'medium' | 'small';
export type MetricsChartType = 'line' | 'bar' | 'none';
export type MetricsTrendType = 'positive' | 'negative';

export interface MetricsProps {
    /** Metric label/title (e.g. "Time spent", "Revenue") */
    label: string;
    /** Primary metric value (e.g. "24 hrs", "$12.4k") */
    value: string;
    /** Whether to render as elevated card surface via Material */
    card?: boolean;
    /** Component size variant */
    size?: MetricsSize;
    /** Which sparkline chart to render alongside the metric */
    chartType?: MetricsChartType;
    /** Trend direction — controls chart & badge color */
    trendType?: MetricsTrendType;
    /** Whether to show the trend overview badge row */
    showTrendOverview?: boolean;
    /** Trend percentage value (e.g. "8.25%") */
    trendValue?: string;
    /** Trend comparison label (e.g. "vs last month") */
    trendLabel?: string;
    /** Whether to show the decorative icon */
    showIcon?: boolean;
    /** Custom icon ReactNode — used for the icon slot */
    icon?: ReactNode;
    /** Sparkline data for line/bar chart */
    chartData?: SparklineDataPoint[];
    /** Additional CSS class */
    className?: string;
}

// Size and layout configurations

const MATERIAL_SIZE_MAP: Record<MetricsSize, MaterialSize> = {
    large: 'medium',
    medium: 'medium',
    small: 'small',
};

const MATERIAL_ELEVATION_MAP: Record<MetricsSize, MaterialElevation> = {
    large: 'elevated',
    medium: 'elevated',
    small: 'elevated',
};

const SPARKLINE_SIZE_MAP: Record<MetricsSize, SparklineSize> = {
    large: 'medium',
    medium: 'small',
    small: 'large',
};

const STATUS_TAG_SIZE_MAP: Record<MetricsSize, StatusTagSize> = {
    large: 'small',
    medium: 'small',
    small: 'small',
};

const TREND_STATUS_MAP: Record<MetricsTrendType, StatusTagStatus> = {
    positive: 'success',
    negative: 'error',
};

const ICON_CONTAINER_CONFIG: Record<MetricsSize, {
    size: number;
    padding: string;
}> = {
    large: { size: 24, padding: 'var(--spacing-4)' },
    medium: { size: 20, padding: '6px' },
    small: { size: 16, padding: '0' },
};

// Root layout variants

const metricsRootVariants = cva('relative w-full', {
    variants: {
        size: {
            large: 'flex flex-row items-end justify-between gap-4',
            medium: 'flex flex-row items-end justify-between gap-4',
            small: 'flex flex-col items-start overflow-hidden',
        },
    },
    defaultVariants: {
        size: 'large',
    },
});

const PADDING_MAP: Record<MetricsSize, CSSProperties> = {
    large: { paddingLeft: 'var(--spacing-6)', paddingRight: 'var(--spacing-5)', paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' },
    medium: { paddingLeft: 'var(--spacing-6)', paddingRight: 'var(--spacing-5)', paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' },
    small: { padding: '0' },
};

// Internal sub-components

const MetricsIcon: React.FC<{
    size: MetricsSize;
    icon: ReactNode;
}> = ({ size, icon }) => {
    const config = ICON_CONTAINER_CONFIG[size];

    if (size === 'small') {
        return (
            <div
                style={{
                    width: config.size,
                    height: config.size,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-brand-secondary-strong)',
                }}
            >
                {icon}
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: config.padding,
                borderRadius: 'var(--corner-radius-default-fully-rounded)',
                border: '1px solid var(--color-thematic-outline-secondary-top-subtle)',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: 'var(--elevation-medium-1-shadow)',
                backdropFilter: 'blur(var(--elevation-medium-blur))',
                WebkitBackdropFilter: 'blur(var(--elevation-medium-blur))',
            }}
        >
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'var(--color-brand-secondary-subtlest)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'relative',
                    width: config.size,
                    height: config.size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-brand-secondary-strong)',
                }}
            >
                {icon}
            </div>
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    boxShadow: [
                        'inset 0px var(--effects-inset-inner-shadow-y-bottom-medium) var(--effects-inset-inner-shadow-blur-medium) 0px var(--effects-inset-inner-shadow-color-bottom-subtle)',
                        'inset 0px var(--effects-inset-inner-shadow-y-top-medium) var(--effects-inset-inner-shadow-blur-medium) 0px var(--effects-inset-inner-shadow-color-top-subtle)',
                    ].join(', '),
                }}
            />
        </div>
    );
};

const MetricsTrend: React.FC<{
    size: MetricsSize;
    trendType: MetricsTrendType;
    trendValue?: string;
    trendLabel?: string;
}> = ({ size, trendType, trendValue = '0%', trendLabel = 'vs last month' }) => {
    const tagSize = STATUS_TAG_SIZE_MAP[size];
    const tagStatus = TREND_STATUS_MAP[trendType];
    const trendTextClass = size === 'small' ? 'text-b6' : 'text-b5';

    const trendIcon: boolean | ReactNode = size === 'small'
        ? false
        : trendType === 'positive'
            ? <TrendUp weight="regular" />
            : <TrendDown weight="regular" />;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                width: '100%',
            }}
        >
            <StatusTag
                size={tagSize}
                status={tagStatus}
                icon={trendIcon}
                label={trendValue}
            />
            <span
                className={trendTextClass}
                style={{
                    color: 'var(--color-neutral-text-medium)',
                    flex: '1 0 0',
                    minWidth: 1,
                }}
            >
                {trendLabel}
            </span>
        </div>
    );
};

// Main Component

export const Metrics: React.FC<MetricsProps> = ({
    label,
    value,
    card = true,
    size = 'large',
    chartType = 'none',
    trendType = 'positive',
    showTrendOverview = true,
    trendValue,
    trendLabel,
    showIcon = true,
    icon,
    chartData,
    className,
}) => {
    const isSmall = size === 'small';
    const hasChart = chartType !== 'none';

    const labelClass = size === 'large' ? 'text-h7' : size === 'medium' ? 'text-h8' : 'text-h9';
    const valueClass = size === 'large' ? 'text-h3' : size === 'medium' ? 'text-h4' : 'text-h5';

    const sparklineElement = useMemo(() => {
        if (chartType === 'none' || !chartData || chartData.length === 0) return null;

        const sparkSize = SPARKLINE_SIZE_MAP[size];
        const trend = trendType;

        if (chartType === 'line') {
            return (
                <SparklineLine
                    data={chartData}
                    size={sparkSize}
                    trend={trend}
                    variant="curvy"
                    showArea
                />
            );
        }

        return (
            <SparklineBar
                data={chartData}
                size={sparkSize}
                trend={trend}
                highlightLast
            />
        );
    }, [chartType, chartData, size, trendType]);

    const detailsContent = (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-4)',
                alignItems: 'flex-start',
                justifyContent: 'center',
                position: 'relative',
                ...(isSmall
                    ? {
                          width: '100%',
                          flexShrink: 0,
                          padding: hasChart
                              ? 'var(--spacing-5) var(--spacing-5) var(--spacing-4) var(--spacing-5)'
                              : 'var(--spacing-5)',
                      }
                    : {
                          flex: '1 1 0%',
                          minWidth: 0,
                      }),
            }}
        >
            {!isSmall && showIcon && icon && (
                <MetricsIcon size={size} icon={icon} />
            )}

            {isSmall ? (
                <>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--spacing-2)',
                            width: '100%',
                        }}
                    >
                        {showIcon && icon && (
                            <MetricsIcon size={size} icon={icon} />
                        )}
                        <p
                            className={labelClass}
                            style={{
                                color: 'var(--color-neutral-text-medium)',
                                whiteSpace: 'nowrap',
                                margin: 0,
                            }}
                        >
                            {label}
                        </p>
                    </div>
                    <p
                        className={valueClass}
                        style={{
                            color: 'var(--color-neutral-text-strong)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            margin: 0,
                        }}
                    >
                        {value}
                    </p>
                </>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)',
                        alignItems: 'flex-start',
                        width: '100%',
                    }}
                >
                    <p
                        className={labelClass}
                        style={{
                            color: 'var(--color-neutral-text-medium)',
                            width: '100%',
                            margin: 0,
                        }}
                    >
                        {label}
                    </p>
                    <p
                        className={valueClass}
                        style={{
                            color: 'var(--color-neutral-text-strong)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            margin: 0,
                        }}
                    >
                        {value}
                    </p>
                    {showTrendOverview && (
                        <MetricsTrend
                            size={size}
                            trendType={trendType}
                            trendValue={trendValue}
                            trendLabel={trendLabel}
                        />
                    )}
                </div>
            )}

            {isSmall && showTrendOverview && (
                <MetricsTrend
                    size={size}
                    trendType={trendType}
                    trendValue={trendValue}
                    trendLabel={trendLabel}
                />
            )}
        </div>
    );

    const chartSection = sparklineElement ? (
        <div
            style={{
                flexShrink: 0,
                position: 'relative',
                ...(isSmall
                    ? { width: '100%' }
                    : {
                          width: size === 'large' ? 120 : 80,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          justifyContent: 'flex-end',
                      }),
            }}
        >
            {sparklineElement}
        </div>
    ) : null;

    const padding = PADDING_MAP[size];
    const rootContent = (
        <div
            className={cn(
                metricsRootVariants({ size }),
                !card && className,
            )}
            style={padding}
        >
            {detailsContent}
            {chartSection}
        </div>
    );

    if (card) {
        return (
            <Material
                size={MATERIAL_SIZE_MAP[size]}
                elevation={MATERIAL_ELEVATION_MAP[size]}
                className={cn('transition-shadow duration-200 hover:shadow-[var(--elevation-medium-2-shadow)]', className)}
            >
                {rootContent}
            </Material>
        );
    }

    return rootContent;
};

Metrics.displayName = 'Metrics';
