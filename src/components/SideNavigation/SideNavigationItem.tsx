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
export type SideNavigationItemType = 'default' | 'nested' | 'icon-only';
export type SideNavigationItemVariant = 'primary' | 'neutral';
type ItemState = 'default' | 'hovered' | 'selected';

export interface SideNavigationItemProps {
    /** Item type: default, nested (has children), or icon-only */
    type?: SideNavigationItemType;
    /** Style variant: primary uses brand colors, neutral uses Material surface */
    variant?: SideNavigationItemVariant;
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
        'transition-colors duration-150 ease-out',
        'rounded-[var(--corner-radius-thematic-medium)]',
        'outline-none border border-transparent',
    ],
    {
        variants: {
            state: {
                default: 'bg-transparent',
                hovered: 'bg-[var(--color-neutral-surface-medium)]',
                selected: '', // Handled separately due to gradient
            },
            variant: {
                primary: '',
                neutral: '',
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
            // Primary selected — shadow
            { state: 'selected', variant: 'primary', className: 'shadow-[var(--inset-subtle-medium)]' },
            // Neutral selected — transparent; Material wrapper handles surface
            { state: 'selected', variant: 'neutral', className: 'bg-transparent border-transparent shadow-none' },
        ],
        defaultVariants: { state: 'default', variant: 'primary', collapsed: false, disabled: false },
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
    defaultVariants: { state: 'default', variant: 'primary' },
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
        defaultVariants: { state: 'default', variant: 'primary', collapsed: false },
    }
);

export type SideNavigationItemStylesProps = VariantProps<typeof sideNavigationItemStyles>;

// Component
export const SideNavigationItem: React.FC<SideNavigationItemProps> = ({
    type = 'default',
    variant = 'primary',
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

    // Determine if we need a Material wrapper (neutral + selected)
    const useNeutralMaterial = variant === 'neutral' && state === 'selected';

    // Selected state uses gradient background (primary variant only)
    const selectedBackgroundStyle = useMemo(
        () =>
            state === 'selected' && variant === 'primary'
                ? {
                    background:
                        'linear-gradient(var(--color-brand-primary-subtlest), var(--color-brand-primary-subtlest)) padding-box, var(--gradient-thematic-outline-primary-subtle) border-box',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                }
                : {},
        [state, variant]
    );

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
                    sideNavigationItemStyles({ state, variant, collapsed: true, disabled }),
                    className
                )}
                style={{ ...selectedBackgroundStyle, ...focusRingStyle }}
                onPress={handleClick}
                onHoverStart={onEnter}
                onHoverEnd={onLeave}
                onKeyDown={handleKeyDown}
                isDisabled={disabled}
                aria-label={label}
            >
                <div className={cn(iconStyles({ state, variant }), 'w-5 h-5')}>{leadingIcon}</div>
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
                {leadingIcon && (
                    <div className={cn(iconStyles({ state, variant }), 'w-5 h-5')}>{leadingIcon}</div>
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
                className={cn(sideNavigationItemStyles({ state, variant, collapsed, disabled }), className)}
                style={{ ...selectedBackgroundStyle, ...focusRingStyle }}
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
            className={cn(sideNavigationItemStyles({ state, variant, collapsed, disabled }), className)}
            style={{ ...selectedBackgroundStyle, ...focusRingStyle }}
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
                cornerRadiusType="thematic"
                cornerRadius="var(--corner-radius-thematic-medium)"
            >
                {content}
            </Material>
        </div>
    ) : content;

    return (
        <div className="flex flex-col items-start w-full rounded-[var(--corner-radius-thematic-medium)]">
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
