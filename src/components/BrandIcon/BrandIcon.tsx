'use client';

import React, { useState } from 'react';

// Brand icon data URLs (generated from src/assets/brandIcons/*.svg)
// To regenerate: node scripts/generate-brand-icon-data.cjs
import { BRAND_ICON_DATA as BRAND_ICON_ASSETS } from '../../generated/brandIconData';


// Platform identifiers for brand icons
export type BrandPlatform =
    | 'adp' | 'airbnb' | 'amazon' | 'apple' | 'asana' | 'atlassian' | 'aws' | 'axus'
    | 'bitbucket' | 'box' | 'checkout' | 'coupa' | 'crowd-strike' | 'dribbble' | 'dropbox'
    | 'entra-id' | 'facebook' | 'figma' | 'framer' | 'github' | 'gitlab' | 'google'
    | 'google-calendar' | 'google-cloud' | 'google-meet' | 'hashicorp' | 'hubspot'
    | 'instagram' | 'jenkins' | 'jira' | 'ldap' | 'linkedin' | 'mastercard' | 'meridia'
    | 'microsoft' | 'microsoft-exchange' | 'microsoft-sql' | 'mongodb' | 'office365'
    | 'okta' | 'oracle' | 'palo-alto' | 'paypal' | 'pinterest' | 'postgresql' | 'reddit'
    | 'salesforce' | 'sap' | 'scim' | 'service-now' | 'slack' | 'snapchat' | 'splunk'
    | 'stripe' | 'strivo' | 'threads' | 'twitch' | 'versa-ui' | 'visa' | 'vox'
    | 'webflow' | 'whatapp' | 'workday' | 'x' | 'youtube';

// Style variants
export type BrandIconStyle = 'brand' | 'gray';

// Size options
export type BrandIconSize = 'small' | 'medium' | 'large' | number;

// Category groupings
export type BrandCategory = 'social' | 'productivity' | 'cloud' | 'identity' | 'finance' | 'mock';

export interface BrandIconProps {
    /** Platform identifier */
    platform: BrandPlatform;
    /** Style variant: 'brand' for colored icons, 'gray' for monochrome */
    style?: BrandIconStyle;
    /** Size: 'small' (16px), 'medium' (20px), 'large' (24px), or custom number */
    size?: BrandIconSize;
    /** Enable hover interaction for gray style (switches from default to hovered state) */
    interactive?: boolean;
    /** Optional CSS class */
    className?: string;
    /** Optional inline styles */
    inlineStyle?: React.CSSProperties;
    /** Accessible label for screen readers */
    'aria-label'?: string;
}

// Size mapping
const SIZE_MAP: Record<string, number> = {
    small: 16,
    medium: 20,
    large: 24,
};

// Platform to display name mapping
export const PLATFORM_NAMES: Record<BrandPlatform, string> = {
    'adp': 'ADP',
    'airbnb': 'Airbnb',
    'amazon': 'Amazon',
    'apple': 'Apple',
    'asana': 'Asana',
    'atlassian': 'Atlassian',
    'aws': 'AWS',
    'axus': 'Axus',
    'bitbucket': 'Bitbucket',
    'box': 'Box',
    'checkout': 'Checkout',
    'coupa': 'Coupa',
    'crowd-strike': 'CrowdStrike',
    'dribbble': 'Dribbble',
    'dropbox': 'Dropbox',
    'entra-id': 'Entra ID',
    'facebook': 'Facebook',
    'figma': 'Figma',
    'framer': 'Framer',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'google': 'Google',
    'google-calendar': 'Google Calendar',
    'google-cloud': 'Google Cloud',
    'google-meet': 'Google Meet',
    'hashicorp': 'HashiCorp',
    'hubspot': 'HubSpot',
    'instagram': 'Instagram',
    'jenkins': 'Jenkins',
    'jira': 'Jira',
    'ldap': 'LDAP',
    'linkedin': 'LinkedIn',
    'mastercard': 'Mastercard',
    'meridia': 'Meridia',
    'microsoft': 'Microsoft',
    'microsoft-exchange': 'Microsoft Exchange',
    'microsoft-sql': 'Microsoft SQL',
    'mongodb': 'MongoDB',
    'office365': 'Office 365',
    'okta': 'Okta',
    'oracle': 'Oracle',
    'palo-alto': 'Palo Alto',
    'paypal': 'PayPal',
    'pinterest': 'Pinterest',
    'postgresql': 'PostgreSQL',
    'reddit': 'Reddit',
    'salesforce': 'Salesforce',
    'sap': 'SAP',
    'scim': 'SCIM',
    'service-now': 'ServiceNow',
    'slack': 'Slack',
    'snapchat': 'Snapchat',
    'splunk': 'Splunk',
    'stripe': 'Stripe',
    'strivo': 'Strivo',
    'threads': 'Threads',
    'twitch': 'Twitch',
    'versa-ui': 'Versa UI',
    'visa': 'Visa',
    'vox': 'Vox',
    'webflow': 'Webflow',
    'whatapp': 'WhatsApp',
    'workday': 'Workday',
    'x': 'X',
    'youtube': 'YouTube',
};

// Category groupings
export const PLATFORM_CATEGORIES: Record<BrandCategory, BrandPlatform[]> = {
    social: [
        'facebook', 'instagram', 'linkedin', 'google', 'youtube', 'apple',
        'snapchat', 'pinterest', 'dribbble', 'reddit', 'x', 'slack', 'whatapp',
        'threads', 'twitch', 'airbnb', 'microsoft'
    ],
    productivity: [
        'github', 'figma', 'webflow', 'atlassian', 'asana', 'framer', 'gitlab',
        'jira', 'hubspot', 'google-calendar', 'google-meet', 'dropbox', 'box',
        'workday', 'service-now', 'salesforce', 'coupa', 'adp', 'office365'
    ],
    cloud: [
        'aws', 'google-cloud', 'bitbucket', 'oracle', 'mongodb', 'jenkins',
        'hashicorp', 'postgresql', 'sap', 'splunk'
    ],
    identity: [
        'entra-id', 'okta', 'ldap', 'scim', 'palo-alto',
        'crowd-strike', 'microsoft-exchange', 'microsoft-sql'
    ],
    finance: [
        'amazon', 'paypal', 'visa', 'mastercard', 'stripe', 'checkout'
    ],
    mock: ['versa-ui', 'vox', 'meridia', 'axus', 'strivo']
};

// All platforms list
export const ALL_PLATFORMS = Object.keys(PLATFORM_NAMES) as BrandPlatform[];

// Platforms whose brand SVGs use `currentColor` and need icon/strong in brand style
const CURRENT_COLOR_BRAND_PLATFORMS: Set<BrandPlatform> = new Set([
    'apple', 'github', 'x', 'threads', 'framer', 'hashicorp', 'okta', 'scim',
]);

// Resolve icon URL from statically imported assets (works in any bundler environment)
const getIconUrl = (platform: BrandPlatform, style: BrandIconStyle, isHovered: boolean): string => {
    const key = style === 'brand'
        ? `${platform}_brand`
        : `${platform}_gray_${isHovered ? 'hovered' : 'default'}`;
    return BRAND_ICON_ASSETS[key] || '';
};

/** Decode a `data:image/svg+xml,...` URI into raw SVG markup, making it scalable */
function decodeSvgDataUri(dataUri: string): string {
    // Strip prefix "data:image/svg+xml,"
    const prefix = 'data:image/svg+xml,';
    if (!dataUri.startsWith(prefix)) return '';
    const raw = decodeURIComponent(dataUri.slice(prefix.length));
    // Replace fixed width/height with 100% so the SVG scales with its container
    return raw
        .replace(/(<svg[^>]*)\bwidth="[^"]*"/, '$1width="100%"')
        .replace(/(<svg[^>]*)\bheight="[^"]*"/, '$1height="100%"');
}

/**
 * BrandIcon Component
 * 
 * Displays brand icons for various platforms with support for:
 * - Brand colored style and gray monochrome style
 * - Hover state transitions for gray style (interactive mode)
 * - Proportional 1:1 scaling at any size
 */
export const BrandIcon: React.FC<BrandIconProps> = ({
    platform,
    style = 'brand',
    size = 'large',
    interactive = true,
    className = '',
    inlineStyle,
    'aria-label': ariaLabel,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Calculate pixel size
    const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 24;

    // Get the appropriate icon source
    const iconSrc = getIconUrl(platform, style, style === 'gray' && interactive && isHovered);

    const shouldEnableHover = style === 'gray' && interactive;

    // Determine if this brand icon uses currentColor and needs inline rendering
    const useInlineSvg = style === 'brand' && (CURRENT_COLOR_BRAND_PLATFORMS.has(platform) || platform === 'versa-ui');
    const inlineColor = style === 'brand' && platform === 'versa-ui'
        ? 'var(--color-brand-primary-strong)'
        : style === 'brand' && CURRENT_COLOR_BRAND_PLATFORMS.has(platform)
            ? 'var(--color-neutral-icon-strong)'
            : undefined;

    return (
        <div
            className={className}
            style={{
                width: pixelSize,
                height: pixelSize,
                position: 'relative',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: shouldEnableHover ? 'pointer' : 'default',
                color: inlineColor,
                ...inlineStyle,
            }}
            onMouseEnter={shouldEnableHover ? () => setIsHovered(true) : undefined}
            onMouseLeave={shouldEnableHover ? () => setIsHovered(false) : undefined}
            title={PLATFORM_NAMES[platform] || platform}
            role="img"
            aria-label={ariaLabel || `${PLATFORM_NAMES[platform] || platform} icon`}
        >
            {useInlineSvg ? (
                <div
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: decodeSvgDataUri(iconSrc) }}
                />
            ) : (
                <img
                    src={iconSrc}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                    draggable={false}
                />
            )}
        </div>
    );
};

BrandIcon.displayName = 'BrandIcon';

export default BrandIcon;
