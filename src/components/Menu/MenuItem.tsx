'use client';

import { useState, useCallback, useEffect, useRef, useMemo, isValidElement, cloneElement, useId } from 'react';
import type { ReactNode, ReactElement, KeyboardEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { CheckIcon } from '@phosphor-icons/react';
import { useFocusRing } from '@react-aria/focus';
import { Checkbox, type CheckboxSize } from '../Checkbox/Checkbox';
import { useMenuContext } from './Menu';

// Types
export const MENU_ITEM_SIZES = ['small', 'default', 'large'] as const;
export const MENU_ITEM_LEADING_TYPES = ['none', 'icon', 'checkbox', 'avatar', 'image', 'brand', 'country'] as const;

export type MenuItemSize = (typeof MENU_ITEM_SIZES)[number];
export type MenuItemLeadingType = (typeof MENU_ITEM_LEADING_TYPES)[number];

// Size configuration: height, padding, gaps, and slot dimensions
const SIZE_CONFIG = {
    small: { height: 24, padding: 6, gap: 4, visualGap: 6, icon: 16, avatar: 16, brand: 16, country: 16 },
    default: { height: 28, padding: 8, gap: 6, visualGap: 8, icon: 16, avatar: 20, brand: 16, country: 16 },
    large: { height: 32, padding: 10, gap: 8, visualGap: 8, icon: 20, avatar: 24, brand: 20, country: 20 },
} as const;

const CHECKBOX_SIZE_MAP: Record<MenuItemSize, CheckboxSize> = {
    small: 'small',
    default: 'medium',
    large: 'large',
};

// Styles with CVA for size, state, and disabled variants
const menuItemStyles = cva(
    'inline-flex items-center w-full transition-colors duration-150 ease-out select-none outline-none',
    {
        variants: {
            size: {
                small: 'text-b5 rounded-[var(--corner-radius-default-x-small)]',
                default: 'text-b4 rounded-[var(--corner-radius-default-x-small)]',
                large: 'text-b3 rounded-[var(--corner-radius-default-small)]',
            },
            state: {
                default: 'bg-transparent',
                hovered: 'bg-[var(--color-neutral-surface-subtle)]',
                selected: 'bg-[var(--color-brand-primary-subtlest)]',
                selectedHovered: 'bg-[var(--color-brand-primary-subtler)]',
            },
            disabled: {
                true: 'cursor-not-allowed opacity-50',
                false: 'cursor-pointer',
            },
        },
        defaultVariants: { size: 'default', state: 'default', disabled: false },
    }
);

export type MenuItemStylesProps = VariantProps<typeof menuItemStyles>;

// Helper to determine background state
function getState(selected: boolean, isHovered: boolean, disabled: boolean): 'default' | 'hovered' | 'selected' | 'selectedHovered' {
    if (disabled) return 'default';
    if (selected && isHovered) return 'selectedHovered';
    if (selected) return 'selected';
    if (isHovered) return 'hovered';
    return 'default';
}

// Clone icon with correct size
function cloneIcon(icon: ReactNode, size: number): ReactNode {
    if (!isValidElement(icon)) return icon;
    return cloneElement(icon as ReactElement<{ size?: number; weight?: string }>, { size, weight: 'regular' });
}

interface MenuItemProps {
    size?: MenuItemSize;
    leadingItem?: MenuItemLeadingType;
    selected?: boolean;
    isHovered?: boolean;
    leadingIcon?: ReactNode;
    avatar?: ReactNode;
    image?: string;
    brand?: ReactNode;
    countryFlag?: ReactNode;
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export function MenuItem({
    size = 'default',
    leadingItem = 'none',
    selected = false,
    isHovered: propIsHovered,
    leadingIcon,
    avatar,
    image,
    brand,
    countryFlag,
    children,
    onClick,
    className,
    disabled = false,
}: MenuItemProps) {
    const [localIsHovered, setLocalIsHovered] = useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();
    const itemRef = useRef<HTMLDivElement>(null);
    const itemId = useId();
    const menuContext = useMenuContext();

    const isHovered = propIsHovered ?? localIsHovered;
    const config = SIZE_CONFIG[size];
    const state = getState(selected, isHovered, disabled);

    // Visual leading types (avatar, image, country) use larger gap
    const isVisualLeading = leadingItem === 'avatar' || leadingItem === 'image' || leadingItem === 'country';
    const gap = isVisualLeading ? config.visualGap : config.gap;
    const iconColor = disabled ? 'var(--color-neutral-icon-disabled)' : 'var(--color-neutral-icon-medium)';

    // Register with menu context for keyboard navigation
    useEffect(() => {
        if (menuContext && itemRef.current) {
            menuContext.registerItem(itemId, itemRef.current);
            return () => menuContext.unregisterItem(itemId);
        }
    }, [menuContext, itemId]);

    const containerStyle = useMemo(() => ({
        height: config.height,
        minHeight: config.height,
        flexShrink: 0,
        padding: `0 ${config.padding}px`,
        gap,
        color: disabled ? 'var(--color-neutral-text-disabled)' : 'var(--color-neutral-text-strong)',
        boxShadow: isFocusVisible && !disabled
            ? (selected ? 'var(--focus-ring-primary)' : 'var(--focus-ring-neutral)')
            : 'none',
    }), [config, gap, disabled, isFocusVisible, selected]);

    const handleMouseEnter = useCallback(() => {
        if (!disabled) setLocalIsHovered(true);
    }, [disabled]);

    const handleMouseLeave = useCallback(() => setLocalIsHovered(false), []);

    const handleClick = useCallback(() => {
        if (!disabled) onClick?.();
    }, [disabled, onClick]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
        }
    }, [disabled, onClick]);

    // Leading slot renderer
    const leadingSlot = useMemo((): ReactNode => {
        const baseClasses = 'flex items-center justify-center shrink-0';
        const roundedClasses = cn(baseClasses, 'rounded-full overflow-hidden');

        switch (leadingItem) {
            case 'icon':
                return leadingIcon ? (
                    <span className={baseClasses} style={{ width: config.icon, height: config.icon, color: iconColor }}>
                        {cloneIcon(leadingIcon, config.icon)}
                    </span>
                ) : null;

            case 'checkbox':
                return <Checkbox size={CHECKBOX_SIZE_MAP[size]} checked={selected} isHovered={isHovered} />;

            case 'avatar':
                return avatar ? (
                    <span className={roundedClasses} style={{ width: config.avatar, height: config.avatar }}>
                        {avatar}
                    </span>
                ) : null;

            case 'image':
                return image ? (
                    <span className={roundedClasses} style={{ width: config.avatar, height: config.avatar }}>
                        <img src={image} alt="" className="w-full h-full object-cover" />
                    </span>
                ) : null;

            case 'brand':
                return brand ? (
                    <span className={baseClasses} style={{ width: config.brand, height: config.brand }}>
                        {brand}
                    </span>
                ) : null;

            case 'country':
                return countryFlag ? (
                    <span className={roundedClasses} style={{ width: config.country, height: config.country }}>
                        {countryFlag}
                    </span>
                ) : null;

            default:
                return null;
        }
    }, [leadingItem, leadingIcon, config, iconColor, size, selected, isHovered, avatar, image, brand, countryFlag]);

    // Trailing checkmark for selected state (not shown with checkbox leading)
    const trailingSlot = useMemo((): ReactNode => {
        if (!selected || leadingItem === 'checkbox') return null;
        return (
            <span
                className="flex items-center justify-center shrink-0"
                style={{ width: config.icon, height: config.icon, color: 'var(--color-brand-primary-strong)' }}
            >
                <CheckIcon size={config.icon} weight="bold" />
            </span>
        );
    }, [selected, leadingItem, config.icon]);

    return (
        <div
            ref={itemRef}
            className={cn(menuItemStyles({ size, state, disabled }), className)}
            style={containerStyle}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            role="menuitem"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-selected={selected}
            {...focusProps}
        >
            {leadingSlot}
            <span className="flex-1 min-w-0 truncate">{children}</span>
            {trailingSlot}
        </div>
    );
}

MenuItem.displayName = 'MenuItem';
export default MenuItem;
