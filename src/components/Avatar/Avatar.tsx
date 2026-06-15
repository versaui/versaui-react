'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { SealCheck as SealCheckIcon } from '@phosphor-icons/react';

// Demo Avatar Imports

import adamSmith from '../../assets/avatars/adam-smith.png';
import denverWhitman from '../../assets/avatars/denver-whitman.png';
import jacobWilson from '../../assets/avatars/jacob-wilson.png';
import xavierHernandez from '../../assets/avatars/xavier-hernandez.png';
import zakirKhan from '../../assets/avatars/zakir-khan.png';
import amandaBrooks from '../../assets/avatars/amanda-brooks.png';
import duriFujimara from '../../assets/avatars/duri-fujimara.png';
import lucyJohnson from '../../assets/avatars/lucy-johnson.png';
import jeniferWilliams from '../../assets/avatars/jenifer-williams.png';
import salmaSiddiqui from '../../assets/avatars/salma-siddiqui.png';

// Types & Constants

export const AVATAR_SIZES = ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'] as const;
export const AVATAR_TYPES = ['initials', 'placeholder', 'image'] as const;
export const AVATAR_COLORS = ['neutral', 'primary', 'secondary', 'tertiary', 'quaternary'] as const;
export const AVATAR_STATUS_TYPES = ['online', 'busy', 'offline', 'verified'] as const;

export type AvatarSize = (typeof AVATAR_SIZES)[number];
export type AvatarType = (typeof AVATAR_TYPES)[number];
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type AvatarStatusType = (typeof AVATAR_STATUS_TYPES)[number];

// Demo Person Map

/** 
 * Demo avatars for prototyping and testing.
 * Each key maps to a person's avatar image.
 */
export const PERSON_IMAGE_MAP = {
    'adam-smith': adamSmith,
    'denver-whitman': denverWhitman,
    'jacob-wilson': jacobWilson,
    'xavier-hernandez': xavierHernandez,
    'zakir-khan': zakirKhan,
    'amanda-brooks': amandaBrooks,
    'duri-fujimara': duriFujimara,
    'lucy-johnson': lucyJohnson,
    'jenifer-williams': jeniferWilliams,
    'salma-siddiqui': salmaSiddiqui,
} as const;

export const AVATAR_PERSONS = Object.keys(PERSON_IMAGE_MAP) as AvatarPerson[];
export type AvatarPerson = keyof typeof PERSON_IMAGE_MAP;

// Size Configuration

/**
 * Unified size configuration for all avatar variants.
 * All size-dependent values are defined here - no scattered conditionals.
 */
interface AvatarSizeConfig {
    /** Container size in pixels */
    container: number;
    /** Typography class for initials */
    fontClass: string;
    /** Outer outline width for placeholder type (small sizes: 1px, large: 2px) */
    outlineWidth: number;
    /** Illustration shadow token for placeholder inner effects */
    illustrationShadow: string;
    /** Status indicator size variant: 'default' for m–xxl, 'small' for xxxs–s */
    statusSize: 'default' | 'small';
}

const AVATAR_SIZE_CONFIG: Record<AvatarSize, AvatarSizeConfig> = {
    xxxs: { container: 16, fontClass: 'text-b6', outlineWidth: 1, illustrationShadow: 'var(--illustration-inset-small-shadow)', statusSize: 'small' },
    xxs: { container: 20, fontClass: 'text-b6', outlineWidth: 1, illustrationShadow: 'var(--illustration-inset-small-shadow)', statusSize: 'small' },
    xs: { container: 24, fontClass: 'text-b5', outlineWidth: 1, illustrationShadow: 'var(--illustration-inset-small-shadow)', statusSize: 'small' },
    s: { container: 32, fontClass: 'text-b4', outlineWidth: 2, illustrationShadow: 'var(--illustration-inset-medium-shadow)', statusSize: 'small' },
    m: { container: 40, fontClass: 'text-h8', outlineWidth: 2, illustrationShadow: 'var(--illustration-inset-medium-shadow)', statusSize: 'small' },
    l: { container: 48, fontClass: 'text-h6', outlineWidth: 2, illustrationShadow: 'var(--illustration-inset-medium-shadow)', statusSize: 'default' },
    xl: { container: 64, fontClass: 'text-h5', outlineWidth: 2, illustrationShadow: 'var(--illustration-inset-medium-shadow)', statusSize: 'default' },
    xxl: { container: 80, fontClass: 'text-h4', outlineWidth: 2, illustrationShadow: 'var(--illustration-inset-medium-shadow)', statusSize: 'default' },
};

// Color Configuration

interface AvatarColorTokens {
    /** Background color for initials type */
    bg: string;
    /** Text color for initials */
    text: string;
    /** Fill color for placeholder SVG */
    fill: string;
}

const AVATAR_COLOR_MAP: Record<AvatarColor, AvatarColorTokens> = {
    neutral: {
        bg: 'var(--color-neutral-surface-subtle)',
        text: 'var(--color-neutral-text-medium)',
        fill: 'var(--color-neutral-surface-strong)',
    },
    primary: {
        bg: 'var(--color-brand-primary-subtlest)',
        text: 'var(--color-brand-primary-strong)',
        fill: 'var(--color-brand-primary-subtler)',
    },
    secondary: {
        bg: 'var(--color-brand-secondary-subtlest)',
        text: 'var(--color-brand-secondary-strong)',
        fill: 'var(--color-brand-secondary-subtler)',
    },
    tertiary: {
        bg: 'var(--color-brand-tertiary-subtlest)',
        text: 'var(--color-brand-tertiary-strong)',
        fill: 'var(--color-brand-tertiary-subtler)',
    },
    quaternary: {
        bg: 'var(--color-brand-quaternary-subtlest)',
        text: 'var(--color-brand-quaternary-strong)',
        fill: 'var(--color-brand-quaternary-subtler)',
    },
};

// CVA Variants

/**
 * Container variants for avatar geometry.
 * All sizing is handled via Tailwind classes - no inline pixels in JSX.
 */
const avatarContainerVariants = cva(
    'rounded-full flex items-center justify-center flex-shrink-0 relative',
    {
        variants: {
            size: {
                xxxs: 'w-4 h-4',     // 16px
                xxs: 'w-5 h-5',      // 20px
                xs: 'w-6 h-6',       // 24px
                s: 'w-8 h-8',        // 32px
                m: 'w-10 h-10',      // 40px
                l: 'w-12 h-12',      // 48px
                xl: 'w-16 h-16',     // 64px
                xxl: 'w-20 h-20',    // 80px
            },
        },
        defaultVariants: {
            size: 'm',
        },
    }
);

export type AvatarContainerVariants = VariantProps<typeof avatarContainerVariants>;

// Placeholder SVG Component

/**
 * Placeholder avatar silhouette SVG.
 * Memoized since it only depends on fillColor.
 */
const PlaceholderSvg = React.memo<{ fillColor: string }>(({ fillColor }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        overflow="visible"
        style={{ display: 'block' }}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
            fill={fillColor}
        />
        <circle cx="8" cy="4.8" r="3.2" fill="var(--color-neutral-background-default)" />
        <path
            d="M1.31762 12.4C2.7486 10.2311 5.20718 8.8 8 8.8C10.7928 8.8 13.2514 10.2311 14.6824 12.4C13.2514 14.5689 10.7928 16 8 16C5.20718 16 2.7486 14.5689 1.31762 12.4Z"
            fill="var(--color-neutral-background-default)"
        />
    </svg>
));

PlaceholderSvg.displayName = 'PlaceholderSvg';

// Avatar Status Indicator

/** Status dot/badge color mapping */
const STATUS_DOT_COLORS: Record<Exclude<AvatarStatusType, 'verified'>, string> = {
    online: 'var(--color-state-success-medium)',
    busy: 'var(--color-state-error-medium)',
    offline: 'var(--color-neutral-surface-strongest)',
};

/** Status indicator size configs */
const STATUS_SIZE_CONFIG = {
    default: { dot: 12, icon: 20, padding: 4 },
    small: { dot: 6, icon: 16, padding: 5 },
} as const;

interface AvatarStatusIndicatorProps {
    type: AvatarStatusType;
    sizeVariant: 'default' | 'small';
}

/** Renders a status dot or verified badge indicator */
const AvatarStatusIndicator = React.memo<AvatarStatusIndicatorProps>(({ type, sizeVariant }) => {
    const config = STATUS_SIZE_CONFIG[sizeVariant];

    if (type === 'verified') {
        const iconSize = config.icon;
        return (
            <div
                className="absolute flex items-center justify-center"
                style={{
                    width: iconSize,
                    height: iconSize,
                    bottom: sizeVariant === 'small' ? -3 : -2,
                    right: sizeVariant === 'small' ? -3 : -2,
                }}
                aria-label="Verified"
            >
                <SealCheckIcon weight="fill" size={iconSize} color="var(--color-brand-primary-medium)" />
            </div>
        );
    }

    const dotSize = config.dot;
    const dotColor = STATUS_DOT_COLORS[type];
    const borderWidth = sizeVariant === 'small' ? 1.5 : 2;

    return (
        <div
            className="absolute rounded-full"
            style={{
                width: dotSize,
                height: dotSize,
                bottom: sizeVariant === 'small' ? -1 : 0,
                right: sizeVariant === 'small' ? -1 : 0,
                backgroundColor: dotColor,
                border: `${borderWidth}px solid var(--color-neutral-background-default)`,
                boxSizing: 'content-box',
            }}
            aria-label={`Status: ${type}`}
        />
    );
});

AvatarStatusIndicator.displayName = 'AvatarStatusIndicator';

// Props Interface

export interface AvatarProps {
    /** Size variant (xxxs-xxl) */
    size?: AvatarSize;
    /** 
     * Avatar type determines what is rendered:
     * - image: Person photograph
     * - initials: 2-letter text
     * - placeholder: Generic silhouette SVG
     */
    type?: AvatarType;
    /** Color theme for initials/placeholder */
    color?: AvatarColor;
    /** Person key for image type (required when type="image") */
    person?: AvatarPerson;
    /** Initials text for initials type (max 2 characters used) */
    initials?: string;
    /** Alt text for image type. Defaults to person name if not provided. */
    alt?: string;
    /** Aria label for non-image types. Required for accessibility if not decorative. */
    'aria-label'?: string;
    /** If true, avatar is decorative and hidden from screen readers */
    decorative?: boolean;
    /** Show a status indicator on the bottom-right of the avatar */
    status?: boolean;
    /** Type of status indicator to display */
    statusType?: AvatarStatusType;
    /** Additional className */
    className?: string;
}

// Utility Functions

/** Convert person key to readable name (e.g., "adam-smith" → "Adam Smith") */
const formatPersonName = (person: AvatarPerson): string => {
    return person
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/** Get initials from person key (e.g., "adam-smith" → "AS") */
const getInitialsFromPerson = (person: AvatarPerson): string => {
    return person
        .split('-')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
};

// Avatar Component

/** Avatar Component */
export const Avatar: React.FC<AvatarProps> = ({
    size = 'm',
    type = 'initials',
    color = 'neutral',
    person = 'adam-smith',
    initials,
    alt,
    'aria-label': ariaLabel,
    decorative = false,
    status = false,
    statusType = 'online',
    className = '',
}) => {
    const config = AVATAR_SIZE_CONFIG[size];
    const colorTokens = AVATAR_COLOR_MAP[color];
    const containerClasses = avatarContainerVariants({ size });

    // Accessibility attributes
    const a11yProps = decorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const };

    // Type: Image
    if (type === 'image') {
        const imageData = PERSON_IMAGE_MAP[person];
        // Robust image source resolution for various bundlers (Vite, Webpack, Next.js)
        const imageSrc = imageData && typeof imageData === 'object'
            ? ((imageData as any).src || (imageData as any).default || imageData)
            : imageData;

        const imageAlt = alt || formatPersonName(person);

        return (
            <div
                className={`${containerClasses} ${className}`}
                style={{
                    boxShadow: `0 0 0 ${config.outlineWidth}px var(--color-neutral-surface-subtlest)`,
                }}
                {...(decorative ? { 'aria-hidden': true } : {})}
            >
                <img
                    src={imageSrc}
                    alt={decorative ? '' : imageAlt}
                    className="w-full h-full object-cover rounded-full"
                />
                {status && (
                    <AvatarStatusIndicator type={statusType} sizeVariant={config.statusSize} />
                )}
            </div>
        );
    }

    // Type: Placeholder
    if (type === 'placeholder') {
        const placeholderLabel = ariaLabel || 'User avatar';

        return (
            <div
                className={`${containerClasses} ${className}`}
                style={{
                    boxShadow: `0 0 0 ${config.outlineWidth}px var(--color-neutral-surface-subtlest)`,
                }}
                {...a11yProps}
                aria-label={decorative ? undefined : placeholderLabel}
            >
                {/* Gradient border ring — mask-composite renders only the ring */}
                <div
                    className="absolute inset-0 rounded-full thematic-surface-outline"
                    style={{
                        border: '0.5px solid var(--color-neutral-outline-subtle)',
                        pointerEvents: 'none',
                    }}
                />
                {/* Content container */}
                <div className="w-full h-full rounded-full overflow-hidden relative box-border">
                    <PlaceholderSvg fillColor={colorTokens.fill} />
                    {/* Illustration inset effect overlay */}
                    <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ boxShadow: config.illustrationShadow }}
                    />
                </div>
                {status && (
                    <AvatarStatusIndicator type={statusType} sizeVariant={config.statusSize} />
                )}
            </div>
        );
    }

    // Type: Initials (default)
    const derivedInitials = initials || getInitialsFromPerson(person);
    const displayInitials = derivedInitials.slice(0, 2).toUpperCase();
    const initialsLabel = ariaLabel || formatPersonName(person);

    return (
        <div
            className={`${containerClasses} ${config.fontClass} ${className}`}
            style={{
                backgroundColor: colorTokens.bg,
                color: colorTokens.text,
                letterSpacing: '0.06em',
                fontWeight: 600,
                boxShadow: `0 0 0 ${config.outlineWidth}px var(--color-neutral-surface-subtlest)`,
            }}
            {...a11yProps}
            aria-label={decorative ? undefined : initialsLabel}
        >
            <span className="leading-none flex items-center justify-center uppercase">
                {displayInitials}
            </span>
            {status && (
                <AvatarStatusIndicator type={statusType} sizeVariant={config.statusSize} />
            )}
        </div>
    );
};

Avatar.displayName = 'Avatar';
export default Avatar;
