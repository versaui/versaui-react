'use client';

import React, { useState, useCallback, isValidElement, forwardRef } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const DROPDOWN_INPUT_SIZES = ['small', 'default', 'large'] as const;
export const DROPDOWN_INPUT_TYPES = ['default', 'prefixedLabel', 'inline'] as const;

export type DropdownInputSize = (typeof DROPDOWN_INPUT_SIZES)[number];
export type DropdownInputType = (typeof DROPDOWN_INPUT_TYPES)[number];

// Size configurations - matching TextInput patterns
const SIZE_CONFIG: Record<DropdownInputSize, {
    containerHeight: number;
    containerWidth: number;
    minWidth: number;
    prefixedMinWidth: number;
    leadingIconSize: number;
    dropdownIconSize: number;
    paddingX: number;
    paddingY: number;
    paddingLeft?: number;
    paddingLeftWithLeading?: number;
    paddingRight?: number;
    inputPx: number;
    prefixedLabelInputPaddingLeft: number;
    gap: number;
    cornerRadius: string;
    cornerRadiusValue: number;
    valueTypescale: string;
    floatLabelTypescale: string;
    floatingGap: number;
    inputHeight: number;
}> = {
    large: {
        containerHeight: 48,
        containerWidth: 200,
        minWidth: 200,
        prefixedMinWidth: 240,
        leadingIconSize: 24,
        dropdownIconSize: 24,
        paddingX: 12,
        paddingY: 10,
        paddingLeft: 12,
        paddingLeftWithLeading: 12,
        paddingRight: 12,
        inputPx: 4,
        prefixedLabelInputPaddingLeft: 8,
        gap: 8,
        cornerRadius: 'var(--corner-radius-thematic-large, 8px)',
        cornerRadiusValue: 8,
        valueTypescale: 'b3',
        floatLabelTypescale: 'b5',
        floatingGap: 0,
        inputHeight: 24,
    },
    default: {
        containerHeight: 40,
        containerWidth: 160,
        minWidth: 160,
        prefixedMinWidth: 200,
        leadingIconSize: 20,
        dropdownIconSize: 20,
        paddingX: 10,
        paddingY: 6,
        paddingLeft: 14,
        paddingLeftWithLeading: 10,
        paddingRight: 10,
        inputPx: 0,
        prefixedLabelInputPaddingLeft: 8,
        gap: 8,
        cornerRadius: 'var(--corner-radius-thematic-medium, 6px)',
        cornerRadiusValue: 6,
        valueTypescale: 'b4',
        floatLabelTypescale: 'b6',
        floatingGap: 0,
        inputHeight: 20,
    },
    small: {
        containerHeight: 32,
        containerWidth: 120,
        minWidth: 120,
        prefixedMinWidth: 160,
        leadingIconSize: 16,
        dropdownIconSize: 16,
        paddingX: 8,
        paddingY: 4,
        inputPx: 4,
        prefixedLabelInputPaddingLeft: 6,
        gap: 8,
        cornerRadius: 'var(--corner-radius-thematic-small, 4px)',
        cornerRadiusValue: 4,
        valueTypescale: 'b5',
        floatLabelTypescale: 'b5',
        floatingGap: 0,
        inputHeight: 16,
    },
};

// Color tokens
const COLORS = {
    background: {
        default: 'var(--color-neutral-surface-subtle, #F9FAFB)',
        hovered: 'var(--color-neutral-surface-medium, #F3F4F6)',
        focused: 'var(--color-neutral-surface-subtle, #F9FAFB)',
        disabled: 'var(--color-neutral-surface-disabled, #F3F4F6)',
    },
    border: {
        default: 'var(--color-neutral-outline-subtle, #E5E7EB)',
        hovered: 'var(--color-neutral-outline-default, #D1D5DC)',
        focused: 'var(--color-brand-primary-strong, #155DFC)',
        disabled: 'var(--color-neutral-outline-subtlest, #F3F4F6)',
    },
    text: {
        placeholder: 'var(--color-neutral-text-subtle, #6A7282)',
        value: 'var(--color-neutral-text-strong, #030712)',
        label: 'var(--color-neutral-text-subtle, #6A7282)',
        labelFocused: 'var(--color-neutral-text-medium, #6B7280)',
        disabled: 'var(--color-neutral-text-disabled, #99A1AF)',
    },
    icon: {
        default: 'var(--color-neutral-icon-subtle, #364153)',
        disabled: 'var(--color-neutral-icon-disabled, #99A1AF)',
    },
};

// Helper to get baseline text class
const getBaselineTextClass = (typescale: string): string => `text-baseline-${typescale}`;

interface DropdownInputProps {
    size?: DropdownInputSize;
    type?: DropdownInputType;
    placeholder?: string;
    value?: string;
    label?: string;
    leadingItem?: ReactNode;
    dropdownIcon?: ReactNode;
    onClick?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    disabled?: boolean;
    isOpen?: boolean;
    className?: string;
    fullWidth?: boolean;
    floatingLabel?: boolean;
    id?: string;
}

const dropdownInputVariants = cva(
    'flex items-center box-border transition-all duration-150 ease-in-out outline-none select-none',
    {
        variants: {
            size: {
                small: 'h-8 px-2 gap-2 rounded-[var(--corner-radius-thematic-small,4px)] min-w-[120px]',
                default: 'h-10 px-[10px] gap-2 rounded-[var(--corner-radius-thematic-medium,6px)] min-w-[160px]',
                large: 'h-12 px-3 gap-2 rounded-[var(--corner-radius-thematic-large,8px)] min-w-[200px]',
            },
            type: {
                default: '',
                prefixedLabel: 'p-0 gap-0 items-stretch',
                inline: 'bg-transparent border-transparent min-w-0 shadow-none',
            },
            fullWidth: {
                true: 'w-full',
                false: 'w-auto',
            },
            disabled: {
                true: 'opacity-60 cursor-not-allowed bg-[var(--color-neutral-surface-disabled,#F3F4F6)] border-[var(--color-neutral-outline-subtlest,#F3F4F6)]',
                false: 'cursor-pointer',
            },
            isFocused: {
                true: 'border-[var(--color-brand-primary-strong,#155DFC)] bg-[var(--color-neutral-surface-subtle,#F9FAFB)]',
            },
            isHovered: {
                true: 'bg-[var(--color-neutral-surface-medium,#F3F4F6)] border-[var(--color-neutral-outline-default,#D1D5DC)]',
            },
        },
        compoundVariants: [
            // Default type styling
            {
                type: 'default',
                disabled: false,
                isFocused: false,
                isHovered: false,
                className: 'bg-[var(--color-neutral-surface-subtle,#F9FAFB)] border-[var(--color-neutral-outline-subtle,#E5E7EB)] border',
            },
            {
                type: 'default',
                isFocused: false,
                isHovered: true,
                disabled: false,
                className: 'bg-[var(--color-neutral-surface-medium,#F3F4F6)] border-[var(--color-neutral-outline-default,#D1D5DC)] border',
            },
            {
                type: 'default',
                isFocused: true,
                disabled: false,
                className: 'bg-[var(--color-neutral-surface-subtle,#F9FAFB)] border-[var(--color-brand-primary-strong,#155DFC)] border',
            },
            // Prefixed Label Outer Container
            {
                type: 'prefixedLabel',
                disabled: false,
                isFocused: false,
                isHovered: false,
                className: 'bg-[var(--color-neutral-surface-subtle,#F9FAFB)] border-[var(--color-neutral-outline-subtle,#E5E7EB)] border',
            },
            {
                type: 'prefixedLabel',
                isFocused: false,
                isHovered: true,
                disabled: false,
                className: 'bg-[var(--color-neutral-surface-medium,#F3F4F6)] border-[var(--color-neutral-outline-default,#D1D5DC)] border',
            },
            {
                type: 'prefixedLabel',
                isFocused: true,
                disabled: false,
                className: 'bg-[var(--color-neutral-surface-subtle,#F9FAFB)] border-[var(--color-brand-primary-strong,#155DFC)] border',
            },
            // Inline styling
            {
                type: 'inline',
                isHovered: true,
                isFocused: false,
                disabled: false,
                className: 'bg-[var(--color-neutral-surface-medium,#F3F4F6)] shadow-none',
            },
            // Size based min-widths for prefixed labels
            {
                size: 'large',
                type: 'prefixedLabel',
                className: 'min-w-[240px]',
            },
            {
                size: 'default',
                type: 'prefixedLabel',
                className: 'min-w-[200px]',
            },
            {
                size: 'small',
                type: 'prefixedLabel',
                className: 'min-w-[160px]',
            },
            // FullWidth overrides
            {
                fullWidth: true,
                className: 'min-w-0 w-full',
            },
            // Size-specific focus rings
            {
                isFocused: true,
                size: ['default', 'small'],
                className: 'shadow-[var(--focus-ring-primary)]',
            },
            {
                isFocused: true,
                size: 'large',
                className: 'shadow-[var(--focus-ring-primary-large)]',
            }
        ],
        defaultVariants: {
            size: 'default',
            type: 'default',
            fullWidth: false,
            disabled: false,
        },
    }
);

interface DropdownInputProps extends VariantProps<typeof dropdownInputVariants> {
    placeholder?: string;
    value?: string;
    label?: string;
    leadingItem?: ReactNode;
    dropdownIcon?: ReactNode;
    onClick?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    isOpen?: boolean;
    isFocused?: boolean;
    className?: string;
    floatingLabel?: boolean;
    'aria-controls'?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const DropdownInput = forwardRef<HTMLDivElement, DropdownInputProps>(({
    size = 'default',
    type = 'default',
    placeholder = 'Select',
    value,
    label = 'Label',
    leadingItem,
    dropdownIcon,
    onClick,
    onFocus,
    onBlur,
    disabled = false,
    isOpen = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    className = '',
    fullWidth = false,
    floatingLabel = true,
    'aria-controls': ariaControls,
    onKeyDown,
}, ref) => {
    const [localIsHovered, setLocalIsHovered] = useState(false);
    const [localIsFocused, setLocalIsFocused] = useState(false);

    const isHovered = propIsHovered ?? localIsHovered;
    const isFocused = propIsFocused ?? localIsFocused;
    const hasValue = !!value;
    const config = SIZE_CONFIG[size];

    // Colors derived from state
    const iconColor = disabled ? COLORS.icon.disabled : COLORS.icon.default;
    const textColor = disabled
        ? COLORS.text.disabled
        : (hasValue ? COLORS.text.value : COLORS.text.placeholder);

    // Event handlers
    const handleMouseEnter = useCallback(() => !disabled && setLocalIsHovered(true), [disabled]);
    const handleMouseLeave = useCallback(() => setLocalIsHovered(false), []);
    const handleClick = useCallback(() => !disabled && onClick?.(), [disabled, onClick]);
    const handleFocus = useCallback(() => {
        if (!disabled) {
            setLocalIsFocused(true);
            onFocus?.();
        }
    }, [disabled, onFocus]);
    const handleBlur = useCallback(() => {
        setLocalIsFocused(false);
        onBlur?.();
    }, [onBlur]);

    const containerProps = {
        ref,
        onClick: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown,
        tabIndex: disabled ? -1 : 0,
        role: 'combobox' as const,
        'aria-expanded': isOpen,
        'aria-disabled': disabled,
        'aria-haspopup': 'listbox' as const,
        'aria-controls': ariaControls,
    };

    const renderLeadingItem = () => {
        if (!leadingItem) return null;

        let item = leadingItem;
        if (isValidElement(leadingItem)) {
            const componentType = (leadingItem as ReactElement).type;
            const typeName = typeof componentType === 'function'
                ? (componentType as { displayName?: string; name?: string }).displayName ||
                (componentType as { displayName?: string; name?: string }).name || ''
                : '';

            if (!['Avatar', 'CountryFlag', 'BrandIcon', 'Checkbox'].includes(typeName)) {
                try {
                    item = (leadingItem as ReactElement).type ? React.cloneElement(leadingItem as ReactElement<{ size?: number }>, {
                        size: config.leadingIconSize
                    }) : leadingItem;
                } catch (e) {
                    item = leadingItem;
                }
            }
        }

        return (
            <span
                className="flex items-center justify-center shrink-0 [&_svg]:size-full"
                style={{
                    width: config.leadingIconSize,
                    height: config.leadingIconSize,
                    minWidth: config.leadingIconSize,
                    minHeight: config.leadingIconSize,
                    color: iconColor,
                }}
            >
                {item}
            </span>
        );
    };

    const renderDropdownIcon = () => (
        <span
            className="flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out"
            style={{
                width: config.dropdownIconSize,
                height: config.dropdownIconSize,
                color: iconColor,
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
        >
            {dropdownIcon || <CaretDownIcon size={config.dropdownIconSize} weight="regular" />}
        </span>
    );

    // Layout Rendering
    if (type === 'prefixedLabel') {
        return (
            <div
                {...containerProps}
                className={cn(
                    dropdownInputVariants({ size, type, fullWidth, disabled, isFocused, isHovered }),
                    className
                )}
            >
                <div
                    className={cn(
                        "flex items-center justify-center shrink-0 bg-[var(--color-neutral-surface-subtlest,white)] border-r border-[var(--color-neutral-outline-subtle,#E5E7EB)]",
                        size === 'large' ? 'px-3' : 'px-[10px]'
                    )}
                    style={{
                        borderRadius: `calc(${config.cornerRadius} - 1px) 0 0 calc(${config.cornerRadius} - 1px)`
                    }}
                >
                    <span
                        className={cn(getBaselineTextClass(config.valueTypescale), "whitespace-nowrap")}
                        style={{ color: COLORS.text.label }}
                    >
                        {label}
                    </span>
                </div>
                <div className={cn(
                    "flex items-center flex-1 min-w-0",
                    size === 'large' ? 'pl-3' : (size === 'default' ? 'pl-[10px]' : (leadingItem ? 'pl-2' : 'pl-[10px]')),
                    size === 'large' ? 'pr-3' : (size === 'default' ? 'pr-[10px]' : (size === 'small' ? 'pr-2' : `pr-[${config.paddingX}px]`)),
                    size === 'small' && leadingItem ? 'gap-2' : `gap-[${config.gap}px]`
                )}>
                    {renderLeadingItem()}
                    <span
                        className={cn(getBaselineTextClass(config.valueTypescale), "flex-1 min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap")}
                        style={{ color: textColor }}
                    >
                        {hasValue ? value : placeholder}
                    </span>
                    {renderDropdownIcon()}
                </div>
            </div>
        );
    }

    const isFloating = floatingLabel && type === 'default' && size !== 'small' && (isFocused || hasValue);
    const showFloatingLayout = floatingLabel && type === 'default' && size !== 'small';

    if (showFloatingLayout) {
        const leftPadding = leadingItem ? config.paddingLeftWithLeading : config.paddingLeft;
        const rightPadding = config.paddingRight ?? config.paddingX;
        const labelClass = isFloating ? `text-${config.floatLabelTypescale}` : `text-${config.valueTypescale}`;
        const labelColor = disabled ? COLORS.text.disabled : (isFloating ? COLORS.text.labelFocused : COLORS.text.label);

        return (
            <div
                {...containerProps}
                className={cn(
                    dropdownInputVariants({ size, type, fullWidth, disabled, isFocused, isHovered }),
                    className
                )}
                style={{
                    paddingLeft: leftPadding,
                    paddingRight: rightPadding,
                }}
            >
                {renderLeadingItem()}
                <div className="flex flex-col items-start justify-center flex-1 self-stretch min-w-0 gap-0 overflow-visible" style={{ padding: `0 ${config.inputPx}px` }}>
                    <p
                        className={cn(labelClass, "m-0 p-0 w-full overflow-x-hidden overflow-y-visible text-ellipsis whitespace-nowrap transition-all duration-150")}
                        style={{ color: labelColor, margin: 0, padding: 0 }}
                    >
                        {label}
                    </p>
                    <div
                        className="flex w-full overflow-x-hidden overflow-y-visible transition-all duration-150"
                        style={{
                            height: isFloating ? config.inputHeight : 0,
                            opacity: isFloating ? 1 : 0,
                        }}
                    >
                        <span
                            className={cn(`text-${config.valueTypescale}`, "flex-1 min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap")}
                            style={{ color: hasValue ? COLORS.text.value : COLORS.text.placeholder }}
                        >
                            {hasValue ? value : placeholder}
                        </span>
                    </div>
                </div>
                {renderDropdownIcon()}
            </div>
        );
    }

    return (
        <div
            {...containerProps}
            className={cn(
                dropdownInputVariants({ size, type, fullWidth, disabled, isFocused, isHovered }),
                className
            )}
        >
            {renderLeadingItem()}
            <span
                className={cn(getBaselineTextClass(config.valueTypescale), "flex-1 min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap")}
                style={{ color: textColor }}
            >
                {hasValue ? value : placeholder}
            </span>
            {renderDropdownIcon()}
        </div>
    );
});

DropdownInput.displayName = 'DropdownInput';

export default DropdownInput;
