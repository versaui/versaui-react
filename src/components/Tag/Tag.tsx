'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useFocusRing } from '@react-aria/focus';
import { TagSimpleIcon, XIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { Avatar, type AvatarPerson, type AvatarType } from '../Avatar/Avatar';
import { CountryFlag, type CountryCode } from '../CountryFlag/CountryFlag';
import { BrandIcon, type BrandPlatform } from '../BrandIcon/BrandIcon';

// Constants
export const TAG_SIZES = ['default', 'small'] as const;
export const TAG_STATES = ['default', 'hovered', 'selected', 'selected-hovered', 'disabled'] as const;
export const TAG_LEADING_ITEMS = ['none', 'icon', 'brand', 'avatar', 'image', 'country', 'color'] as const;

export type TagSize = (typeof TAG_SIZES)[number];
export type TagState = (typeof TAG_STATES)[number];
export type TagLeadingItem = (typeof TAG_LEADING_ITEMS)[number];

// CVA Variants for container
const tagVariants = cva(
    [
        'inline-flex items-center justify-start box-border rounded-full',
        'backdrop-blur-[var(--elevation-small-blur)]',
        'transition-colors duration-150',
        '-outline-offset-1',
    ],
    {
        variants: {
            state: {
                default: 'bg-[var(--color-neutral-surface-subtlest)] outline outline-1 outline-[var(--color-neutral-outline-subtle)]',
                hovered: 'bg-[var(--color-neutral-surface-medium)] outline outline-1 outline-[var(--color-neutral-outline-subtle)]',
                selected: 'bg-[var(--color-neutral-surface-subtle)] outline outline-1 outline-[var(--color-neutral-outline-strong)]',
                'selected-hovered': 'bg-[var(--color-neutral-surface-medium)] outline outline-1 outline-[var(--color-neutral-outline-strong)]',
                disabled: 'bg-[var(--color-neutral-surface-disabled)] outline-0',
            },
            hasShadow: {
                true: 'shadow-[var(--elevation-small-1-shadow)]',
                false: '',
            },
            isDisabled: {
                true: 'cursor-not-allowed',
                false: 'cursor-pointer',
            },
        },
        defaultVariants: {
            state: 'default',
            hasShadow: true,
            isDisabled: false,
        },
    }
);

// Size Configuration
const SIZE_CONFIG: Record<TagSize, {
    leadingItemSize: number;
    textHeight: number;
    textClass: string;
    avatarSize: 'xxxs' | 'xxs';
    countryFlagSize: 'small' | 'medium';
    brandIconSize: number;
}> = {
    default: {
        leadingItemSize: 20,
        textHeight: 20,
        textClass: 'text-b4',
        avatarSize: 'xxs',
        countryFlagSize: 'medium',
        brandIconSize: 20,
    },
    small: {
        leadingItemSize: 16,
        textHeight: 16,
        textClass: 'text-b5',
        avatarSize: 'xxxs',
        countryFlagSize: 'small',
        brandIconSize: 16,
    },
};

// State Colors
const STATE_COLORS: Record<TagState, {
    textColor: string;
    leadingIconColor: string;
    closeIconColor: string;
}> = {
    default: {
        textColor: 'var(--color-neutral-text-medium)',
        leadingIconColor: 'var(--color-neutral-icon-medium)',
        closeIconColor: 'var(--color-neutral-icon-subtle)',
    },
    hovered: {
        textColor: 'var(--color-neutral-text-medium)',
        leadingIconColor: 'var(--color-neutral-icon-medium)',
        closeIconColor: 'var(--color-neutral-icon-subtle)',
    },
    selected: {
        textColor: 'var(--color-neutral-text-strong)',
        leadingIconColor: 'var(--color-neutral-icon-medium)',
        closeIconColor: 'var(--color-neutral-icon-subtle)',
    },
    'selected-hovered': {
        textColor: 'var(--color-neutral-text-strong)',
        leadingIconColor: 'var(--color-neutral-icon-medium)',
        closeIconColor: 'var(--color-neutral-icon-subtle)',
    },
    disabled: {
        textColor: 'var(--color-neutral-text-disabled)',
        leadingIconColor: 'var(--color-neutral-icon-disabled)',
        closeIconColor: 'var(--color-neutral-icon-disabled)',
    },
};

// Padding helper - preserves exact original values
function getPadding(size: TagSize, leadingItem: TagLeadingItem): { top: number; bottom: number; left: number; right: number } {
    if (size === 'default') {
        if (leadingItem === 'none' || leadingItem === 'icon' || leadingItem === 'brand') {
            return { top: 6, bottom: 6, left: 8, right: 8 };
        }
        return { top: 6, bottom: 6, left: 6, right: 8 };
    }
    if (leadingItem === 'none' || leadingItem === 'brand') {
        return { top: 4, bottom: 4, left: 6, right: 6 };
    }
    if (leadingItem === 'icon') {
        return { top: 4, bottom: 4, left: 8, right: 6 };
    }
    return { top: 4, bottom: 4, left: 4, right: 6 };
}

// Gap helper - preserves exact original values
function getGap(size: TagSize, leadingItem: TagLeadingItem): number {
    if (size === 'default') {
        return (leadingItem === 'none' || leadingItem === 'icon') ? 2 : 4;
    }
    return 2;
}

// Props Interface
export interface TagProps extends VariantProps<typeof tagVariants> {
    size?: TagSize;
    state?: TagState;
    leadingItem?: TagLeadingItem;
    removable?: boolean;
    label?: string;
    iconComponent?: React.ReactNode;
    brandPlatform?: BrandPlatform;
    avatarPerson?: AvatarPerson;
    avatarInitials?: string;
    avatarType?: AvatarType;
    imageSrc?: string;
    countryCode?: CountryCode;
    colorValue?: string;
    onClick?: () => void;
    onRemove?: () => void;
    className?: string;
    'aria-label'?: string;
    id?: string;
    /** data attribute for TagInput integration */
    'data-tag'?: boolean;
}

// Component
export const Tag: React.FC<TagProps> = ({
    size = 'default',
    state = 'default',
    leadingItem = 'none',
    removable = true,
    label = 'Tag',
    iconComponent,
    brandPlatform = 'figma',
    avatarPerson = 'adam-smith',
    avatarInitials = 'PA',
    avatarType = 'image',
    imageSrc,
    countryCode = 'us',
    colorValue = 'var(--color-brand-primary-strong)',
    onClick,
    onRemove,
    className,
    'aria-label': ariaLabel,
    id,
    'data-tag': dataTag,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    const config = SIZE_CONFIG[size];
    const padding = getPadding(size, leadingItem);
    const gap = getGap(size, leadingItem);

    // Compute effective state
    const isDisabled = state === 'disabled';
    const isSelected = state === 'selected' || state === 'selected-hovered';
    const effectiveState = isDisabled ? 'disabled' : isHovered ? (isSelected ? 'selected-hovered' : 'hovered') : state;
    const hasShadow = effectiveState !== 'disabled';
    const colors = STATE_COLORS[effectiveState];

    // Container styles (dynamic values that can't be CVA)
    const containerStyle: React.CSSProperties = {
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        gap,
        boxShadow: isFocusVisible && !isDisabled ? 'var(--focus-ring-neutral)' : undefined,
    };

    // Event handlers
    const handleClick = useCallback(() => {
        if (!isDisabled && onClick) onClick();
    }, [isDisabled, onClick]);

    const handleRemove = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        if (!isDisabled && onRemove) onRemove();
    }, [isDisabled, onRemove]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (isDisabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                onClick?.();
                break;
            case 'Backspace':
            case 'Delete':
                if (removable && onRemove) {
                    e.preventDefault();
                    onRemove();
                }
                break;
        }
    }, [isDisabled, onClick, removable, onRemove]);

    const handleRemoveKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleRemove(e);
        }
    }, [handleRemove]);

    // Render leading item
    const renderLeadingItem = () => {
        const itemSize = config.leadingItemSize;
        const iconStyle = { display: 'block', flexShrink: 0 } as const;

        switch (leadingItem) {
            case 'icon':
                return iconComponent || (
                    <TagSimpleIcon
                        size={itemSize}
                        weight="regular"
                        color={colors.leadingIconColor}
                        style={iconStyle}
                        aria-hidden="true"
                    />
                );

            case 'brand':
                return (
                    <BrandIcon
                        platform={brandPlatform}
                        size={itemSize}
                        interactive={false}
                    />
                );

            case 'avatar':
                return (
                    <Avatar
                        size={config.avatarSize}
                        type={avatarType}
                        person={avatarPerson}
                        initials={avatarInitials}
                    />
                );

            case 'image':
                return (
                    <img
                        src={imageSrc || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                        alt=""
                        aria-hidden="true"
                        style={{
                            width: itemSize,
                            height: itemSize,
                            borderRadius: 200,
                            objectFit: 'cover',
                            flexShrink: 0,
                        }}
                    />
                );

            case 'country':
                return (
                    <CountryFlag
                        country={countryCode}
                        size={config.countryFlagSize}
                    />
                );

            case 'color':
                return (
                    <div
                        aria-hidden="true"
                        style={{
                            width: itemSize,
                            height: itemSize,
                            borderRadius: 200,
                            backgroundColor: isDisabled ? 'var(--color-neutral-surface-strong)' : colorValue,
                            flexShrink: 0,
                        }}
                    />
                );

            case 'none':
            default:
                return null;
        }
    };

    return (
        <div
            ref={containerRef}
            id={id}
            className={cn(tagVariants({ state: effectiveState, hasShadow, isDisabled }), className)}
            style={containerStyle}
            onClick={handleClick}
            onMouseEnter={() => !isDisabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-disabled={isDisabled}
            aria-pressed={isSelected}
            aria-label={ariaLabel || `${label}${removable ? ', press Delete to remove' : ''}`}
            data-tag={dataTag}
            {...focusProps}
        >
            {renderLeadingItem()}

            <div
                className="flex items-center justify-center"
                style={{ height: config.textHeight, padding: '0 4px' }}
            >
                <span
                    className={cn(config.textClass, 'whitespace-nowrap tracking-[0px]')}
                    style={{ color: colors.textColor }}
                >
                    {label}
                </span>
            </div>

            {removable && (
                <button
                    type="button"
                    onClick={handleRemove}
                    onKeyDown={handleRemoveKeyDown}
                    disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    className="flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Remove ${label}`}
                >
                    <XIcon
                        size={16}
                        weight="regular"
                        color={colors.closeIconColor}
                        className="block shrink-0"
                        aria-hidden="true"
                    />
                </button>
            )}
        </div>
    );
};

Tag.displayName = 'Tag';

export default Tag;
