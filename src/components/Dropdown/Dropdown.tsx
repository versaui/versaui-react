'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    size as floatingSize,
    FloatingPortal,
} from '@floating-ui/react';
import { CirclesFourIcon, GlobeIcon, BuildingsIcon, ImageIcon } from '@phosphor-icons/react';
import { DropdownInput } from './DropdownInput';
import type { DropdownInputSize, DropdownInputType } from './DropdownInput';
import { Menu } from '../Menu/Menu';
import type { MenuSize } from '../Menu/Menu';
import { MenuItem } from '../Menu/MenuItem';
import type { MenuItemSize, MenuItemLeadingType } from '../Menu/MenuItem';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarSize } from '../Avatar/Avatar';
import { cn } from '../../utils/cn';

// Export types
export const DROPDOWN_SIZES = ['small', 'default', 'large'] as const;
export type DropdownSize = (typeof DROPDOWN_SIZES)[number];

export const DROPDOWN_TYPES = ['default', 'prefixedLabel', 'inline'] as const;
export type DropdownType = (typeof DROPDOWN_TYPES)[number];

export const DROPDOWN_LEADING_TYPES = ['none', 'icon', 'avatar', 'brand', 'country', 'image'] as const;
export type DropdownLeadingType = (typeof DROPDOWN_LEADING_TYPES)[number];

// Option interface for dropdown items
export interface DropdownOption {
    value: string;
    label: string;
    leadingType?: DropdownLeadingType;
    leadingItem?: ReactNode;
    disabled?: boolean;
}

// Props interface
interface DropdownProps {
    size?: DropdownSize;
    type?: DropdownType;
    placeholder?: string;
    label?: string;
    options: DropdownOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string, option: DropdownOption) => void;
    disabled?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    fullWidth?: boolean;
    className?: string;
    menuMaxHeight?: number | string;
    floatingLabel?: boolean;
}

// Size mappings
const SIZE_MAP: Record<DropdownSize, {
    dropdownInput: DropdownInputSize;
    menu: MenuSize;
    menuItem: MenuItemSize;
    avatarSize: AvatarSize;
}> = {
    large: { dropdownInput: 'large', menu: 'large', menuItem: 'large', avatarSize: 'xs' },
    default: { dropdownInput: 'default', menu: 'default', menuItem: 'default', avatarSize: 'xxs' },
    small: { dropdownInput: 'small', menu: 'small', menuItem: 'small', avatarSize: 'xxxs' },
};

const TYPE_MAP: Record<DropdownType, DropdownInputType> = {
    default: 'default',
    prefixedLabel: 'prefixedLabel',
    inline: 'inline',
};

// MenuItem props mapping by leading type
const LEADING_PROPS_MAP: Record<DropdownLeadingType, (item?: ReactNode) => {
    leadingItem: MenuItemLeadingType;
    leadingIcon?: ReactNode;
    avatar?: ReactNode;
    brand?: ReactNode;
    countryFlag?: ReactNode;
}> = {
    icon: (item) => ({ leadingItem: 'icon', leadingIcon: item }),
    avatar: (item) => ({ leadingItem: 'avatar', avatar: item }),
    brand: (item) => ({ leadingItem: 'brand', brand: item }),
    country: (item) => ({ leadingItem: 'country', countryFlag: item }),
    image: (item) => ({ leadingItem: 'icon', leadingIcon: item }),
    none: () => ({ leadingItem: 'none' }),
};

// Gap between the dropdown input and the flyout menu (px)
const FLYOUT_GAP = 4;

export function Dropdown({
    size = 'default',
    type = 'default',
    placeholder = 'Select...',
    label = 'Label',
    options,
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = false,
    showSearch = true,
    searchPlaceholder = 'Search',
    fullWidth = false,
    className = '',
    menuMaxHeight = 300,
    floatingLabel = true,
}: DropdownProps) {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
    const selectedValue = isControlled ? controlledValue : internalValue;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const flyoutRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const listboxId = `listbox-${id}`;
    const sizeConfig = SIZE_MAP[size];

    const maxH = typeof menuMaxHeight === 'number' ? menuMaxHeight : 300;

    // Floating UI: handles positioning, flipping, and auto-updates
    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        placement: 'bottom-start',
        middleware: [
            offset(FLYOUT_GAP),
            flip({ padding: 8 }),
            floatingSize({
                apply({ availableHeight, elements }) {
                    // Constrain the flyout height to available space
                    const constrainedMax = Math.min(maxH, availableHeight - 8);
                    elements.floating.style.maxHeight = `${Math.max(constrainedMax, 100)}px`;
                },
                padding: 8,
            }),
        ],
        whileElementsMounted: autoUpdate,
    });

    // Find selected option and leading type
    const selectedOption = useMemo(
        () => options.find(opt => opt.value === selectedValue),
        [options, selectedValue]
    );

    const optionsLeadingType = useMemo((): DropdownLeadingType => {
        const first = options.find(opt => opt.leadingType && opt.leadingType !== 'none');
        return first?.leadingType || 'none';
    }, [options]);

    // Leading item for input (selected item or placeholder icon)
    const inputLeadingItem = useMemo(() => {
        if (selectedOption?.leadingItem) return selectedOption.leadingItem;
        switch (optionsLeadingType) {
            case 'icon': return <CirclesFourIcon />;
            case 'avatar': return <Avatar size={sizeConfig.avatarSize} type="placeholder" color="neutral" />;
            case 'brand': return <BuildingsIcon />;
            case 'country': return <GlobeIcon />;
            case 'image': return <ImageIcon />;
            default: return undefined;
        }
    }, [selectedOption, optionsLeadingType, sizeConfig.avatarSize]);

    // Filtered options based on search
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(opt => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery]);

    // Handlers
    const handleInputClick = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => !prev);
            if (!isOpen) setSearchQuery('');
        }
    }, [disabled, isOpen]);

    const handleSelect = useCallback((option: DropdownOption) => {
        if (option.disabled) return;
        if (!isControlled) setInternalValue(option.value);
        onChange?.(option.value, option);
        setIsOpen(false);
        setSearchQuery('');
    }, [isControlled, onChange]);

    const handleSearch = useCallback((value: string) => setSearchQuery(value), []);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setSearchQuery('');
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                // Menu is open but focus is still on input — move it into the menu
                if (flyoutRef.current) {
                    const searchInput = flyoutRef.current.querySelector('input[type="text"]') as HTMLElement;
                    if (searchInput) {
                        searchInput.focus();
                    } else {
                        const firstItem = flyoutRef.current.querySelector('[role="menuitem"]') as HTMLElement;
                        firstItem?.focus();
                    }
                }
            }
        } else if (e.key === 'Tab' && isOpen) {
            // Tab while open: move focus into menu instead of away
            e.preventDefault();
            if (flyoutRef.current) {
                const searchInput = flyoutRef.current.querySelector('input[type="text"]') as HTMLElement;
                if (searchInput) {
                    searchInput.focus();
                } else {
                    const firstItem = flyoutRef.current.querySelector('[role="menuitem"]') as HTMLElement;
                    firstItem?.focus();
                }
            }
        }
    }, [disabled, isOpen]);

    // Click outside: close when clicking outside both the container and the flyout
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideContainer = containerRef.current?.contains(target);
            const insideFlyout = flyoutRef.current?.contains(target);
            if (!insideContainer && !insideFlyout) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchQuery('');
                inputRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Scroll to selected item and handle initial focus when flyout mounts
    useEffect(() => {
        if (!isOpen || !flyoutRef.current) return;

        const timer = setTimeout(() => {
            if (!flyoutRef.current) return;

            // 1. Initial Focus Management
            const searchInput = flyoutRef.current.querySelector('input[type="text"]') as HTMLElement;
            if (searchInput) {
                // Focus search bar if present (ArrowDown from here bubbles to Menu's key handler)
                searchInput.focus();
            } else {
                // Otherwise focus the selected item, or first available item
                let targetToFocus = flyoutRef.current.querySelector('[aria-selected="true"]') as HTMLElement;
                if (!targetToFocus) {
                    targetToFocus = flyoutRef.current.querySelector('[role="menuitem"]') as HTMLElement;
                }
                if (targetToFocus) {
                    targetToFocus.focus();
                }
            }

            // 2. Scroll Management
            if (selectedValue) {
                const selectedElement = flyoutRef.current.querySelector('[aria-selected="true"]') as HTMLElement;
                if (selectedElement) {
                    let scrollableParent = selectedElement.parentElement;
                    while (scrollableParent && scrollableParent !== flyoutRef.current) {
                        const style = window.getComputedStyle(scrollableParent);
                        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                            break;
                        }
                        scrollableParent = scrollableParent.parentElement;
                    }

                    if (scrollableParent && scrollableParent !== flyoutRef.current) {
                        const itemTop = selectedElement.offsetTop;
                        const itemHeight = selectedElement.offsetHeight;
                        const containerHeight = scrollableParent.clientHeight;
                        scrollableParent.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
                    }
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [isOpen, selectedValue]);

    // Merge floating ref with our flyout ref
    const setFloatingRef = useCallback((node: HTMLDivElement | null) => {
        flyoutRef.current = node;
        refs.setFloating(node);
    }, [refs]);

    return (
        <>
            <div
                ref={(node) => {
                    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    refs.setReference(node);
                }}
                className={cn("relative inline-block self-start", fullWidth ? "w-full" : "w-auto", className)}
            >
                <DropdownInput
                    ref={inputRef as any}
                    size={sizeConfig.dropdownInput}
                    type={TYPE_MAP[type]}
                    placeholder={placeholder}
                    label={label}
                    value={selectedOption?.label}
                    leadingItem={inputLeadingItem}
                    isOpen={isOpen}
                    disabled={disabled}
                    fullWidth={fullWidth}
                    floatingLabel={floatingLabel}
                    onClick={handleInputClick}
                    onKeyDown={handleInputKeyDown}
                    aria-controls={isOpen ? listboxId : undefined}
                />
            </div>

            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={setFloatingRef}
                        data-react-aria-top-layer
                        style={{
                            ...floatingStyles,
                            zIndex: 9999,
                            width: containerRef.current?.getBoundingClientRect().width,
                        }}
                    >
                        <Menu
                            id={listboxId}
                            size={sizeConfig.menu}
                            width="100%"
                            showSearch={showSearch && options.length > 5}
                            searchPlaceholder={searchPlaceholder}
                            onSearch={handleSearch}
                            searchValue={searchQuery}
                            maxHeight={menuMaxHeight}
                            onEscape={() => {
                                setIsOpen(false);
                                inputRef.current?.focus();
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => {
                                    const props = LEADING_PROPS_MAP[option.leadingType || 'none'](option.leadingItem);
                                    return (
                                        <MenuItem
                                            key={option.value}
                                            size={sizeConfig.menuItem}
                                            {...props}
                                            selected={option.value === selectedValue}
                                            disabled={option.disabled}
                                            onClick={() => handleSelect(option)}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    );
                                })
                            ) : (
                                <div className="text-b4 p-3 text-center text-[var(--color-neutral-text-subtle)]">
                                    No options found
                                </div>
                            )}
                        </Menu>
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}

Dropdown.displayName = 'Dropdown';

export default Dropdown;
