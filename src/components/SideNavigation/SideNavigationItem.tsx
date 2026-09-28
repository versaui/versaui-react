'use client';

import React, { type ReactNode, useMemo, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useFocusRing } from '@react-aria/focus';
import { Button as AriaButton } from 'react-aria-components';
import { CaretDownIcon } from '@phosphor-icons/react';
import { Badge } from '../Badge/Badge';
import { Tooltip } from '../Tooltip/Tooltip';
import { Material } from '../Material/Material';
import { useSideNavigationContextSafe } from './SideNavigationContext';

// Types
export const SIDE_NAVIGATION_ITEM_TYPES = ['default', 'nested', 'icon-only'] as const;
export const SIDE_NAVIGATION_ITEM_VARIANTS = ['primary', 'neutral'] as const;
export const SIDE_NAVIGATION_ITEM_STYLES = ['simple', 'expressive'] as const;

export type SideNavigationItemType = (typeof SIDE_NAVIGATION_ITEM_TYPES)[number];
export type SideNavigationItemVariant = (typeof SIDE_NAVIGATION_ITEM_VARIANTS)[number];
export type SideNavigationItemStyle = (typeof SIDE_NAVIGATION_ITEM_STYLES)[number] | 'Simple' | 'Expressive';
type ItemState = 'default' | 'hovered' | 'selected';

export interface SideNavigationItemProps {
    /** Item type: default, nested (has children), or icon-only */
    type?: SideNavigationItemType;
    /** Style variant: primary uses brand colors, neutral uses Material surface */
    variant?: SideNavigationItemVariant;
    /** Visual style treatment: 'simple' | 'expressive' */
    style?: SideNavigationItemStyle;
    /** Label text */
    label?: string;
    /** Leading icon */
    leadingIcon?: ReactNode;
    /** Badge count or text */
    badge?: string | number;
    /** Whether to show the badge */
    showBadge?: boolean;
    /** Whether this item is selected/active */
    selected?: boolean;
    /** Whether nested children are expanded */
    expanded?: boolean;
    /** Whether sidebar is collapsed (can be provided via context) */
    collapsed?: boolean;
    /** Whether item is disabled */
    disabled?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Toggle handler for nested items */
    onToggle?: () => void;
    /** Nested navigation items */
    children?: ReactNode;
    /** Additional className */
    className?: string;
    /** ID for accessibility */
    id?: string;
    /** External link URL */
    href?: string;
}

// CVA Styles
const sideNavigationItemStyles = cva(
    [
        'flex items-center cursor-pointer select-none',
        'transition-[background-color,box-shadow,outline] duration-150 ease-out',
        'rounded-[var(--corner-radius-control-medium)]',
        'outline-none border border-transparent',
    ],
    {
        variants: {
            state: {
                default: 'bg-transparent',
                hovered: 'bg-[var(--color-neutral-surface-medium)]',
                selected: '',
            },
            variant: {
                primary: '',
                neutral: '',
            },
            style: {
                simple: '',
                expressive: '',
            },
            collapsed: {
                true: 'w-12 h-10 px-3.5 py-2.5 justify-center',
                false: 'w-full h-10 px-3 py-2 justify-start gap-2',
            },
            disabled: {
                true: 'opacity-50 cursor-not-allowed',
                false: '',
            },
        },
        compoundVariants: [
            // Primary selected + expressive
            {
                state: 'selected',
                variant: 'primary',
                style: 'expressive',
                className: [
                    'border-transparent',
                    'shadow-[var(--inset-subtle-medium)]',
                    '[background:var(--gradient-thematic-fill-primary-subtle)_padding-box,var(--gradient-thematic-outline-primary-subtle)_border-box]',
                    '[background-origin:border-box]',
                    '[background-clip:padding-box,border-box]',
                ],
            },
            // Primary selected + simple
            {
                state: 'selected',
                variant: 'primary',
                style: 'simple',
                className: [
                    'bg-[var(--color-brand-primary-subtlest)]',
                    'border-[var(--color-brand-primary-subtler)]',
                    'shadow-none',
                ],
            },
            // Neutral selected + expressive
            {
                state: 'selected',
                variant: 'neutral',
                style: 'expressive',
                className: [
                    'border-transparent',
                    'shadow-[var(--inset-subtle-medium)]',
                    '[background:var(--gradient-thematic-fill-neutral)_padding-box,var(--gradient-thematic-outline-neutral)_border-box]',
                    '[background-origin:border-box]',
                    '[background-clip:padding-box,border-box]',
                ],
            },
            // Neutral selected + simple — transparent; Material wrapper handles surface
            {
                state: 'selected',
                variant: 'neutral',
                style: 'simple',
                className: [
                    'bg-transparent',
                    'border-transparent',
                    'shadow-none',
                ],
            },
        ],
        defaultVariants: { state: 'default', variant: 'neutral', style: 'simple', collapsed: false, disabled: false },
    }
);

const iconStyles = cva('flex items-center justify-center shrink-0 transition-colors duration-150', {
    variants: {
        state: {
            default: 'text-[var(--color-neutral-icon-medium)]',
            hovered: 'text-[var(--color-neutral-icon-strong)]',
            selected: '',
        },
        variant: {
            primary: '',
            neutral: '',
        },
    },
    compoundVariants: [
        { state: 'selected', variant: 'primary', className: 'text-[var(--color-brand-primary-strong)]' },
        { state: 'selected', variant: 'neutral', className: 'text-[var(--color-neutral-icon-strong)]' },
    ],
    defaultVariants: { state: 'default', variant: 'neutral' },
});

const textStyles = cva(
    [
        'text-h8 whitespace-nowrap overflow-hidden text-ellipsis',
        'transition-all duration-150 ease-out',
    ],
    {
        variants: {
            state: {
                default: 'text-[var(--color-neutral-text-medium)]',
                hovered: 'text-[var(--color-neutral-text-strong)]',
                selected: '',
            },
            variant: {
                primary: '',
                neutral: '',
            },
            collapsed: {
                true: 'opacity-0',
                false: 'opacity-100',
            },
        },
        compoundVariants: [
            { state: 'selected', variant: 'primary', className: 'text-[var(--color-brand-primary-strong)]' },
            { state: 'selected', variant: 'neutral', className: 'text-[var(--color-neutral-text-strong)]' },
        ],
        defaultVariants: { state: 'default', variant: 'neutral', collapsed: false },
    }
);

export type SideNavigationItemStylesProps = VariantProps<typeof sideNavigationItemStyles>;

// Component
export const SideNavigationItem: React.FC<SideNavigationItemProps> = ({
    type = 'default',
    variant = 'neutral',
    style = 'simple',
    label,
    leadingIcon,
    badge,
    showBadge = true,
    selected = false,
    expanded = false,
    collapsed: collapsedProp,
    disabled = false,
    onClick,
    onToggle,
    children,
    className = '',
    id,
    href: _href,
}) => {
    // Get collapsed from context if not provided as prop
    const context = useSideNavigationContextSafe();
    const collapsed = collapsedProp ?? context?.collapsed ?? false;

    const [isHovered, setIsHovered] = React.useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    const isNested = type === 'nested';
    const isIconOnly = type === 'icon-only';

    const normalizedStyle = (style ? String(style).toLowerCase() : 'simple') as 'simple' | 'expressive';

    // Determine visual state
    const state: ItemState = useMemo(() => {
        if (disabled) return 'default';
        if (selected && !isNested) return 'selected';
        if (isHovered || isFocusVisible || (isNested && expanded)) return 'hovered';
        return 'default';
    }, [disabled, selected, isNested, isHovered, isFocusVisible, expanded]);

    const handleClick = useCallback(() => {
        if (disabled) return;
        if (isNested) {
            onToggle?.();
        } else {
            onClick?.();
        }
    }, [disabled, isNested, onToggle, onClick]);

    const onEnter = useCallback(() => !disabled && setIsHovered(true), [disabled]);
    const onLeave = useCallback(() => setIsHovered(false), []);

    // Keyboard handler for Enter/Space
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [disabled, handleClick]);

    // Determine if we need a Material wrapper (neutral + simple + selected)
    const useNeutralMaterial = variant === 'neutral' && normalizedStyle === 'simple' && state === 'selected';

    // Icon weight based on style prop (duotone for expressive, regular for simple)
    const iconWeight: 'regular' | 'duotone' = normalizedStyle === 'expressive' ? 'duotone' : 'regular';

    const icon = leadingIcon
        ? (React.isValidElement(leadingIcon)
            ? React.cloneElement(leadingIcon as React.ReactElement<any>, {
                size: (leadingIcon.props as any)?.size ?? 20,
                weight: iconWeight,
            })
            : leadingIcon)
        : null;

    // Focus ring style - use inset boxShadow to prevent clipping
    const focusRingStyle = useMemo(
        () =>
            isFocusVisible && !disabled
                ? {
                    boxShadow:
                        selected && !isNested
                            ? 'inset 0 0 0 2px var(--color-brand-primary-subtler)'
                            : 'inset 0 0 0 2px var(--color-neutral-surface-strong)',
                }
                : {},
        [isFocusVisible, disabled, selected, isNested]
    );

    // Icon-only variant
    if (isIconOnly) {
        const iconOnlyContent = (
            <AriaButton
                id={id}
                className={cn(
                    sideNavigationItemStyles({ state, variant, style: normalizedStyle, collapsed: true, disabled }),
                    className
                )}
                style={focusRingStyle}
                onPress={handleClick}
                onHoverStart={onEnter}
                onHoverEnd={onLeave}
                onKeyDown={handleKeyDown}
                isDisabled={disabled}
                aria-label={label}
            >
                {icon && <div className={cn(iconStyles({ state, variant }), 'w-5 h-5')}>{icon}</div>}
            </AriaButton>
        );

        // Wrap with tooltip if label is provided
        if (label) {
            return (
                <Tooltip type="plain" placement="right" content={label} offset={12}>
                    {iconOnlyContent}
                </Tooltip>
            );
        }

        return iconOnlyContent;
    }

    // Sub-navigation style for nested items
    const subMenuExpanded = expanded && !collapsed;

    // Common content for inside the item
    const itemInnerContent = (
        <>
            {/* Content wrapper */}
            <div
                className={cn(
                    'flex items-center gap-2 overflow-hidden',
                    collapsed ? 'flex-none' : 'flex-1 h-6'
                )}
            >
                {icon && (
                    <div className={cn(iconStyles({ state, variant }), 'w-5 h-5')}>{icon}</div>
                )}
                {label && !collapsed && (
                    <>
                        <span className={textStyles({ state, variant, collapsed })}>{label}</span>
                        {showBadge && badge !== undefined && type === 'default' && (
                            <Badge size="default" state={selected && variant === 'primary' ? 'primary' : 'default'} dot={false}>
                                {badge}
                            </Badge>
                        )}
                    </>
                )}
            </div>

            {/* Caret for nested items */}
            {isNested && !collapsed && (
                <div
                    className={cn(
                        'w-5 h-5 flex items-center justify-center shrink-0',
                        'text-[var(--color-neutral-icon-subtle)]',
                        'transition-transform duration-200',
                        expanded && 'rotate-180'
                    )}
                >
                    <CaretDownIcon size={20} weight="regular" />
                </div>
            )}
        </>
    );

    // When collapsed with label, use AriaButton for tooltip compatibility
    // Otherwise use div for regular items
    const content = collapsed && label ? (
        <Tooltip type="plain" placement="right" content={label} offset={12}>
            <AriaButton
                id={id}
                className={cn(sideNavigationItemStyles({ state, variant, style: normalizedStyle, collapsed, disabled }), className)}
                style={focusRingStyle}
                onPress={handleClick}
                onHoverStart={onEnter}
                onHoverEnd={onLeave}
                onKeyDown={handleKeyDown}
                isDisabled={disabled}
                aria-label={label}
                aria-expanded={isNested ? expanded : undefined}
            >
                {itemInnerContent}
            </AriaButton>
        </Tooltip>
    ) : (
        <div
            id={id}
            className={cn(sideNavigationItemStyles({ state, variant, style: normalizedStyle, collapsed, disabled }), className)}
            style={focusRingStyle}
            onClick={handleClick}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onKeyDown={handleKeyDown}
            role="menuitem"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-expanded={isNested ? expanded : undefined}
            aria-current={selected && !isNested ? 'page' : undefined}
            {...focusProps}
        >
            {itemInnerContent}
        </div>
    );

    // Wrap in Material for neutral selected state
    const wrappedContent = useNeutralMaterial ? (
        <div className="w-full">
            <Material
                size="small"
                elevation="default"
                cornerRadiusType="control"
                cornerRadius="var(--corner-radius-control-medium)"
            >
                {content}
            </Material>
        </div>
    ) : content;

    return (
        <div className="flex flex-col items-start w-full rounded-[var(--corner-radius-control-medium)]">
            {wrappedContent}
            {/* Sub-navigation for nested items */}
            {isNested && (
                <div
                    className={cn(
                        'flex flex-col gap-0.5 self-stretch overflow-hidden transition-all duration-300',
                        subMenuExpanded ? 'max-h-[1000px] opacity-100 mt-2 pt-0.5 pb-0.5' : 'max-h-0 opacity-0'
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default SideNavigationItem;
