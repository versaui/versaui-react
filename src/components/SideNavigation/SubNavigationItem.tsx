'use client';

import React, { useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useFocusRing } from '@react-aria/focus';
import { Badge } from '../Badge/Badge';
import { Material } from '../Material/Material';

// Types
type ItemState = 'default' | 'hovered' | 'selected';
export type SubNavigationItemVariant = 'primary' | 'neutral';

export interface SubNavigationItemProps {
    /** Label text */
    label: string;
    /** Style variant: primary uses brand colors, neutral uses Material surface */
    variant?: SubNavigationItemVariant;
    /** Whether this item is selected/active */
    selected?: boolean;
    /** Badge count or text */
    badge?: string | number;
    /** Whether to show the badge */
    showBadge?: boolean;
    /** Whether item is disabled */
    disabled?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional className */
    className?: string;
    /** ID for accessibility */
    id?: string;
    /** External link URL */
    href?: string;
}

// CVA Styles
const subNavigationItemStyles = cva(
    [
        'flex-1 h-10 flex items-center gap-2',
        'px-3 py-2',
        'rounded-[var(--corner-radius-thematic-medium)]',
        'transition-colors duration-150 ease-out',
        'outline-none border border-transparent',
        'cursor-pointer select-none',
    ],
    {
        variants: {
            state: {
                default: 'bg-transparent text-[var(--color-neutral-text-medium)]',
                hovered: 'bg-[var(--color-neutral-surface-medium)] text-[var(--color-neutral-text-strong)]',
                selected: '',
            },
            variant: {
                primary: '',
                neutral: '',
            },
            disabled: {
                true: 'opacity-50 cursor-not-allowed',
                false: '',
            },
        },
        compoundVariants: [
            { state: 'selected', variant: 'primary', className: 'text-[var(--color-brand-primary-strong)]' },
            { state: 'selected', variant: 'neutral', className: 'bg-transparent border-transparent shadow-none text-[var(--color-neutral-text-strong)]' },
        ],
        defaultVariants: { state: 'default', variant: 'primary', disabled: false },
    }
);

export type SubNavigationItemStylesProps = VariantProps<typeof subNavigationItemStyles>;

// Component
export const SubNavigationItem: React.FC<SubNavigationItemProps> = ({
    label,
    variant = 'primary',
    selected = false,
    badge,
    showBadge = true,
    disabled = false,
    onClick,
    className = '',
    id,
    href: _href,
}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { isFocusVisible, focusProps } = useFocusRing();

    // Determine visual state
    const state: ItemState = useMemo(() => {
        if (disabled) return 'default';
        if (selected) return 'selected';
        if (isHovered || isFocusVisible) return 'hovered';
        return 'default';
    }, [disabled, selected, isHovered, isFocusVisible]);

    const handleClick = useCallback(() => {
        if (!disabled) onClick?.();
    }, [disabled, onClick]);

    // Keyboard handler for Enter/Space
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [disabled, handleClick]);

    const onEnter = useCallback(() => !disabled && setIsHovered(true), [disabled]);
    const onLeave = useCallback(() => setIsHovered(false), []);

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
                    boxShadow: 'var(--inset-subtle-medium)',
                }
                : {},
        [state, variant]
    );

    // Focus ring style - use inset boxShadow to prevent clipping
    const focusRingStyle = useMemo(
        () =>
            isFocusVisible && !disabled
                ? {
                    boxShadow: selected
                        ? 'inset 0 0 0 2px var(--color-brand-primary-subtler)'
                        : 'inset 0 0 0 2px var(--color-neutral-surface-strong)',
                }
                : {},
        [isFocusVisible, disabled, selected]
    );

    // Build the sub-navigation item content
    const subNavContent = (
        <div
            className={cn('w-full flex items-center outline-none', className)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            {/* Vertical line indicator */}
            <div className="pl-[21px] pr-[5px] flex self-stretch -mt-px -mb-px">
                <div
                    className="w-px"
                    style={{
                        height: 'calc(100% + 2px)',
                        backgroundColor: 'var(--color-neutral-outline-subtle)',
                    }}
                />
            </div>

            {/* Menu item button */}
            <div
                id={id}
                className={subNavigationItemStyles({ state, variant, disabled })}
                style={{ ...selectedBackgroundStyle, ...focusRingStyle }}
                onClick={handleClick}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onKeyDown={handleKeyDown}
                role="menuitem"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-current={selected ? 'page' : undefined}
                {...focusProps}
            >
                <span className="text-h8 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-150">
                    {label}
                </span>
                {showBadge && badge !== undefined && (
                    <Badge size="default" state={state === 'selected' && variant === 'primary' ? 'primary' : 'default'} dot={false}>
                        {badge}
                    </Badge>
                )}
            </div>
        </div>
    );

    // Wrap the menu item button in Material for neutral selected
    if (useNeutralMaterial) {
        return (
            <div
                className={cn('w-full flex items-center outline-none', className)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
                {/* Vertical line indicator */}
                <div className="pl-[21px] pr-[5px] flex self-stretch -mt-px -mb-px">
                    <div
                        className="w-px"
                        style={{
                            height: 'calc(100% + 2px)',
                            backgroundColor: 'var(--color-neutral-outline-subtle)',
                        }}
                    />
                </div>

                {/* Material-wrapped menu item */}
                <div className="flex-1">
                    <Material
                        size="small"
                        elevation="default"
                        cornerRadiusType="thematic"
                        cornerRadius="var(--corner-radius-thematic-medium)"
                    >
                        <div
                            id={id}
                            className={subNavigationItemStyles({ state, variant, disabled })}
                            style={{ ...focusRingStyle }}
                            onClick={handleClick}
                            onMouseEnter={onEnter}
                            onMouseLeave={onLeave}
                            onKeyDown={handleKeyDown}
                            role="menuitem"
                            tabIndex={disabled ? -1 : 0}
                            aria-disabled={disabled}
                            aria-current={selected ? 'page' : undefined}
                            {...focusProps}
                        >
                            <span className="text-h8 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-150">
                                {label}
                            </span>
                            {showBadge && badge !== undefined && (
                                <Badge size="default" state="default" dot={false}>
                                    {badge}
                                </Badge>
                            )}
                        </div>
                    </Material>
                </div>
            </div>
        );
    }

    return subNavContent;
};

export default SubNavigationItem;
