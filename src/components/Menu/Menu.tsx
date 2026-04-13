'use client';

import React, { useState, useMemo, useCallback, useRef, createContext, useContext } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { SearchBar, type SearchBarSize } from '../SearchBar/SearchBar';
import { Material, type MaterialSize } from '../Material/Material';

// Types
export const MENU_SIZES = ['small', 'default', 'large'] as const;
export type MenuSize = (typeof MENU_SIZES)[number];

// Size mappings
const SEARCH_SIZE_MAP: Record<MenuSize, SearchBarSize> = {
    small: 'small',
    default: 'default',
    large: 'default'
};

const MATERIAL_SIZE_MAP: Record<MenuSize, MaterialSize> = {
    small: 'small',
    default: 'medium',
    large: 'large'
};

// Spacing configuration per size
const SIZE_CONFIG = {
    large: { width: 240, searchPadding: 12, listPadding: 8, itemGap: 8 },
    default: { width: 200, searchPadding: 12, listPadding: 6, itemGap: 6 },
    small: { width: 160, searchPadding: 8, listPadding: 4, itemGap: 4 }
} as const;

// Context for keyboard navigation
interface MenuContextValue {
    registerItem: (id: string, ref: HTMLElement | null) => void;
    unregisterItem: (id: string) => void;
    focusedId: string | null;
    setFocusedId: (id: string | null) => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);
export function useMenuContext() {
    return useContext(MenuContext);
}

// Styles
const listContainerStyles = cva('flex flex-col flex-1 min-h-0 overflow-hidden');
const menuListStyles = cva('flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0');

interface MenuProps {
    /** Menu size variant */
    size?: MenuSize;
    /** Show search bar at top */
    showSearch?: boolean;
    /** Show scroll bar indicator (visual only) */
    showScrollBar?: boolean;
    /** Search placeholder text */
    searchPlaceholder?: string;
    /** Callback when search input changes */
    onSearch?: (value: string) => void;
    /** Max height for scrollable area */
    maxHeight?: number | string;
    /** Custom width override */
    width?: number | string;
    /** Menu items slot */
    children: ReactNode;
    /** Additional CSS class */
    className?: string;
    /** Fixed search value for controlled mode */
    searchValue?: string;
    /** Callback when escape is pressed */
    onEscape?: () => void;
    /** ID for accessibility */
    id?: string;
}

export function Menu({
    size = 'default',
    showSearch = true,
    searchPlaceholder = 'Search',
    onSearch,
    maxHeight,
    width,
    children,
    className,
    searchValue,
    onEscape,
    id,
}: MenuProps) {
    const [internalSearchValue, setInternalSearchValue] = useState('');
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const itemsRef = useRef<Map<string, HTMLElement>>(new Map());
    const menuRef = useRef<HTMLDivElement>(null);

    const config = SIZE_CONFIG[size];

    // Register/unregister menu items for keyboard navigation
    const registerItem = useCallback((id: string, ref: HTMLElement | null) => {
        if (ref) itemsRef.current.set(id, ref);
    }, []);

    const unregisterItem = useCallback((id: string) => {
        itemsRef.current.delete(id);
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInternalSearchValue(value);
        onSearch?.(value);
    }, [onSearch]);

    const handleSearchClear = useCallback(() => {
        setInternalSearchValue('');
        onSearch?.('');
    }, [onSearch]);


    // Keyboard navigation for arrow keys, home, end, escape
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(itemsRef.current.entries())
            .filter(([, el]) => el.getAttribute('aria-disabled') !== 'true')
            .map(([id]) => id);

        if (items.length === 0) return;

        const currentIndex = focusedId ? items.indexOf(focusedId) : -1;

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                setFocusedId(items[nextIndex]);
                itemsRef.current.get(items[nextIndex])?.focus();
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                setFocusedId(items[prevIndex]);
                itemsRef.current.get(items[prevIndex])?.focus();
                break;
            }
            case 'Home': {
                e.preventDefault();
                setFocusedId(items[0]);
                itemsRef.current.get(items[0])?.focus();
                break;
            }
            case 'End': {
                e.preventDefault();
                const lastId = items[items.length - 1];
                setFocusedId(lastId);
                itemsRef.current.get(lastId)?.focus();
                break;
            }
            case 'Escape': {
                e.preventDefault();
                onEscape?.();
                break;
            }
        }
    }, [focusedId, onEscape]);

    const contextValue = useMemo<MenuContextValue>(() => ({
        registerItem,
        unregisterItem,
        focusedId,
        setFocusedId
    }), [registerItem, unregisterItem, focusedId]);

    const wrapperStyles: React.CSSProperties = useMemo(() => ({
        width: width ?? config.width,
        maxHeight,
    }), [width, maxHeight, config]);

    const searchContainerStyles: React.CSSProperties = useMemo(() => ({
        padding: config.searchPadding,
    }), [config]);

    const menuListInlineStyles: React.CSSProperties = useMemo(() => ({
        paddingTop: showSearch ? 0 : config.listPadding,
        paddingBottom: config.listPadding,
        paddingLeft: config.listPadding,
        paddingRight: config.listPadding,
        gap: config.itemGap,
    }), [config, showSearch]);

    return (
        <MenuContext.Provider value={contextValue}>
            <Material
                id={id}
                size={MATERIAL_SIZE_MAP[size]}
                elevation="elevated"
                className={cn('flex flex-col', className)}
                style={wrapperStyles}
                role="listbox"
                aria-orientation="vertical"
            >
                <div
                    ref={menuRef}
                    onKeyDown={handleKeyDown}
                    className="flex flex-col flex-1 min-h-0"
                >
                    {showSearch && (
                        <div
                            className="flex flex-col items-stretch shrink-0 z-[2]"
                            style={searchContainerStyles}
                        >
                            <SearchBar
                                size={SEARCH_SIZE_MAP[size]}
                                placeholder={searchPlaceholder}
                                value={searchValue ?? internalSearchValue}
                                onChange={handleSearchChange}
                                onClear={handleSearchClear}
                                shortcutKey={false}
                            />
                        </div>
                    )}

                    <div className={cn(listContainerStyles())}>
                        <div
                            className={cn(menuListStyles())}
                            style={menuListInlineStyles}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </Material>
        </MenuContext.Provider>
    );
}

Menu.displayName = 'Menu';
export default Menu;
