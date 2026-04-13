'use client';

import React, { useState, useEffect } from 'react';

// Logo brand types
export type LogoBrand = 'versa-ui' | 'axus' | 'strivo' | 'meridia' | 'vox';

// Logo size variants
export type LogoSize = 'xs' | 's' | 'm' | 'l' | 'xl';

// Logo style variants
export type LogoStyle = 'icon-wordmark' | 'icon' | 'contained';

export interface LogoProps {
    /** Brand to display */
    brand?: LogoBrand;
    /** Size variant */
    size?: LogoSize;
    /** Style variant */
    style?: LogoStyle;
    /** Optional CSS class */
    className?: string;
    /** Optional inline styles */
    inlineStyle?: React.CSSProperties;
    /** Accessible label */
    'aria-label'?: string;
}

// Brand display names for accessibility
const BRAND_NAMES: Record<LogoBrand, string> = {
    'versa-ui': 'Versa UI',
    'axus': 'Axus',
    'strivo': 'Strivo',
    'meridia': 'Meridia',
    'vox': 'Vox',
};

// ── Size configuration from Figma specs ──
// Each size defines: inner icon dimension, container padding, border width,
// and which inset composite token to use (small vs medium).
//
// Figma specs (Contained Icon):
//   XL: icon=32, pad=8, border=1, inset=medium
//   L:  icon=28, pad=6, border=1, inset=medium
//   M:  icon=22, pad=5, border=1, inset=small
//   S:  icon=16, pad=4, border=1, inset=small
//   XS: icon=14, pad=3, border=0.5, inset=small

interface SizeSpec {
    iconSize: number;
    containerPadding: number;
    borderWidth: number;
    insetToken: string;
    /** Wordmark height for icon+wordmark style (proportionally scaled) */
    wordmarkHeight: number;
    /** Gap between icon container and wordmark */
    wordmarkGap: number;
    /** Icon-only overall size (width=height) */
    iconOnlySize: number;
    /** Icon-only padding from all sides */
    iconOnlyPadding: number;
}

const SIZE_SPECS: Record<LogoSize, SizeSpec> = {
    xs: {
        iconSize: 14,
        containerPadding: 3,
        borderWidth: 0.5,
        insetToken: 'var(--inset-default-small)',
        wordmarkHeight: 12,
        wordmarkGap: 6,
        iconOnlySize: 20,
        iconOnlyPadding: 2,
    },
    s: {
        iconSize: 16,
        containerPadding: 4,
        borderWidth: 1,
        insetToken: 'var(--inset-default-small)',
        wordmarkHeight: 14,
        wordmarkGap: 8,
        iconOnlySize: 24,
        iconOnlyPadding: 2,
    },
    m: {
        iconSize: 22,
        containerPadding: 5,
        borderWidth: 1,
        insetToken: 'var(--inset-default-small)',
        wordmarkHeight: 19,
        wordmarkGap: 8,
        iconOnlySize: 32,
        iconOnlyPadding: 3,
    },
    l: {
        iconSize: 28,
        containerPadding: 6,
        borderWidth: 1,
        insetToken: 'var(--inset-default-medium)',
        wordmarkHeight: 24,
        wordmarkGap: 8,
        iconOnlySize: 40,
        iconOnlyPadding: 4,
    },
    xl: {
        iconSize: 32,
        containerPadding: 8,
        borderWidth: 1,
        insetToken: 'var(--inset-default-medium)',
        wordmarkHeight: 28,
        wordmarkGap: 12,
        iconOnlySize: 48,
        iconOnlyPadding: 4,
    },
};

// Static URL map — webpack 5 requires static string literals in new URL() for asset emission
const LOGO_URLS: Record<string, string> = {
    'versa-ui_icon': new URL('../../assets/logos/versa-ui_icon.svg', import.meta.url).href,
    'versa-ui_wordmark': new URL('../../assets/logos/versa-ui_wordmark.svg', import.meta.url).href,
    'axus_icon': new URL('../../assets/logos/axus_icon.svg', import.meta.url).href,
    'axus_wordmark': new URL('../../assets/logos/axus_wordmark.svg', import.meta.url).href,
    'axus_contained': new URL('../../assets/logos/axus_contained.svg', import.meta.url).href,
    'strivo_icon': new URL('../../assets/logos/strivo_icon.svg', import.meta.url).href,
    'strivo_wordmark': new URL('../../assets/logos/strivo_wordmark.svg', import.meta.url).href,
    'strivo_contained': new URL('../../assets/logos/strivo_contained.svg', import.meta.url).href,
    'meridia_icon': new URL('../../assets/logos/meridia_icon.svg', import.meta.url).href,
    'meridia_wordmark': new URL('../../assets/logos/meridia_wordmark.svg', import.meta.url).href,
    'meridia_contained': new URL('../../assets/logos/meridia_contained.svg', import.meta.url).href,
    'vox_icon': new URL('../../assets/logos/vox_icon.svg', import.meta.url).href,
    'vox_wordmark': new URL('../../assets/logos/vox_wordmark.svg', import.meta.url).href,
    'vox_contained': new URL('../../assets/logos/vox_contained.svg', import.meta.url).href,
};

const getLogoUrl = (brand: LogoBrand, type: 'icon' | 'wordmark' | 'contained'): string => {
    const key = `${brand}_${type}`;
    return LOGO_URLS[key] ?? '';
};

// Cache for loaded SVG content
const svgCache = new Map<string, string>();

/**
 * Fetches SVG content from a URL and caches it.
 */
function useSvgContent(url: string): string | null {
    const [svgContent, setSvgContent] = useState<string | null>(svgCache.get(url) || null);

    useEffect(() => {
        if (!url) return;
        if (svgCache.has(url)) {
            setSvgContent(svgCache.get(url)!);
            return;
        }

        const abortController = new AbortController();

        fetch(url, { signal: abortController.signal })
            .then(res => res.text())
            .then(svg => {
                svgCache.set(url, svg);
                setSvgContent(svg);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Failed to load logo SVG:', err);
                }
            });

        return () => abortController.abort();
    }, [url]);

    return svgContent;
}

/**
 * Renders an inline SVG from fetched content, fitting to a given dimension.
 */
function InlineSvg({ content, size, color }: { content: string | null; size: number; color?: string }) {
    if (!content) {
        return <div style={{ width: size, height: size, flexShrink: 0 }} />;
    }

    // Inject width/height/style into the SVG tag
    const styledSvg = content.replace(
        /<svg/,
        `<svg style="display:block;width:${size}px;height:${size}px;color:${color ?? 'currentColor'}"`
    );

    return (
        <div
            style={{ width: size, height: size, flexShrink: 0 }}
            dangerouslySetInnerHTML={{ __html: styledSvg }}
        />
    );
}

/**
 * Renders an inline SVG wordmark from fetched content, fitting to a given height.
 */
function InlineSvgWordmark({ content, height, color }: { content: string | null; height: number; color?: string }) {
    if (!content) {
        return <div style={{ height, flexShrink: 0 }} />;
    }

    const styledSvg = content.replace(
        /<svg/,
        `<svg style="display:block;height:${height}px;width:auto;color:${color ?? 'currentColor'}"`
    );

    return (
        <div
            style={{ height, flexShrink: 0, color: color ?? 'currentColor' }}
            dangerouslySetInnerHTML={{ __html: styledSvg }}
        />
    );
}


// ── Shared styles ──

/**
 * Icon container styles — the gradient circle with outline & inset effects.
 * Uses composite tokens:
 * - background: gradient-thematic-fill-primary (padding-box) + gradient-thematic-outline-primary (border-box)
 * - border: transparent (so background gradient shows through as the border)
 * - boxShadow: inset-default-{small|medium} (combines inner shadows + drop shadow)
 */
function getIconContainerStyle(spec: SizeSpec): React.CSSProperties {
    return {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spec.containerPadding,
        borderRadius: 'var(--corner-radius-default-fully-rounded)',
        border: `${spec.borderWidth}px solid transparent`,
        background:
            'var(--gradient-thematic-fill-primary) padding-box, var(--gradient-thematic-outline-primary) border-box',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: spec.insetToken,
        overflow: 'hidden',
        flexShrink: 0,
        color: '#F9FAFB', // white icon color on gradient
    };
}

/**
 * Logo Component
 *
 * Displays brand logos with support for:
 * - Multiple size variants (xs, s, m, l, xl)
 * - Three style variants: icon + wordmark, icon only, contained icon
 * - Five mock brand variants
 *
 * For Versa UI brand:
 * The icon is rendered as an inline SVG inside a CSS-constructed gradient
 * container with thematic outline gradient, inset shadows, and elevation.
 * Other brands use pre-composed SVGs.
 */
export const Logo: React.FC<LogoProps> = ({
    brand = 'versa-ui',
    size = 'm',
    style = 'icon-wordmark',
    className = '',
    inlineStyle,
    'aria-label': ariaLabel,
}) => {
    const spec = SIZE_SPECS[size];
    const brandName = BRAND_NAMES[brand];
    const isVersaUi = brand === 'versa-ui';

    // SVG content for Versa UI brand (CSS-composed container)
    const iconUrl = getLogoUrl(brand, 'icon');
    const wordmarkUrl = getLogoUrl(brand, 'wordmark');
    const iconSvg = useSvgContent(iconUrl);
    const wordmarkSvg = useSvgContent(wordmarkUrl);

    // For non-Versa-UI brands, use the legacy pre-composed SVGs
    const containedUrl = !isVersaUi ? getLogoUrl(brand, 'contained') : '';
    const containedSvg = useSvgContent(containedUrl || '');

    // ── Non-Versa-UI brands: use legacy flat SVG approach ──
    if (!isVersaUi) {
        const legacySrc = style === 'contained' ? containedUrl : style === 'icon' ? iconUrl : wordmarkUrl;
        const legacySvg = style === 'contained' ? containedSvg : style === 'icon' ? iconSvg : wordmarkSvg;
        const totalHeight = spec.iconSize + spec.containerPadding * 2;

        return (
            <div
                className={className}
                style={{
                    height: totalHeight,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: style === 'icon-wordmark' ? 'var(--color-neutral-icon-strong)' : undefined,
                    ...inlineStyle,
                }}
                role="img"
                aria-label={ariaLabel || `${brandName} logo`}
                dangerouslySetInnerHTML={
                    legacySvg
                        ? { __html: legacySvg.replace(/<svg/, `<svg style="height: 100%; width: auto;"`) }
                        : undefined
                }
            />
        );
    }

    // ── Versa UI: CSS-composed logo ──

    // Determine if all required SVGs are loaded
    const isReady =
        style === 'icon-wordmark' ? !!(iconSvg && wordmarkSvg) :
        style === 'contained' ? !!iconSvg :
        style === 'icon' ? !!iconSvg :
        true;

    // The contained icon container (gradient circle with effects)
    const containedIconContainer = (
        <div style={getIconContainerStyle(spec)}>
            <InlineSvg content={iconSvg} size={spec.iconSize} color="var(--color-neutral-icon-inverse)" />
        </div>
    );

    if (style === 'contained') {
        // Contained Icon — gradient circle with outline, inset, and elevation
        return (
            <div
                className={className}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    visibility: isReady ? 'visible' : 'hidden',
                    ...inlineStyle,
                }}
                role="img"
                aria-label={ariaLabel || `${brandName} logo`}
            >
                {containedIconContainer}
            </div>
        );
    }

    if (style === 'icon') {
        // Icon Only — raw icon SVG in primary-strong color, no container
        const iconOnlyIconSize = spec.iconOnlySize - spec.iconOnlyPadding * 2;
        return (
            <div
                className={className}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: spec.iconOnlySize,
                    height: spec.iconOnlySize,
                    padding: spec.iconOnlyPadding,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                    visibility: isReady ? 'visible' : 'hidden',
                    ...inlineStyle,
                }}
                role="img"
                aria-label={ariaLabel || `${brandName} logo`}
            >
                <InlineSvg content={iconSvg} size={iconOnlyIconSize} color="var(--color-brand-primary-strong)" />
            </div>
        );
    }

    // Icon + Wordmark — gradient circle + wordmark text side-by-side
    return (
        <div
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spec.wordmarkGap,
                paddingRight: 'var(--spacing-3)',
                flexShrink: 0,
                visibility: isReady ? 'visible' : 'hidden',
                ...inlineStyle,
            }}
            role="img"
            aria-label={ariaLabel || `${brandName} logo`}
        >
            {containedIconContainer}
            <InlineSvgWordmark
                content={wordmarkSvg}
                height={spec.wordmarkHeight}
                color="var(--color-neutral-icon-strong)"
            />
        </div>
    );
};

Logo.displayName = 'Logo';

export default Logo;
