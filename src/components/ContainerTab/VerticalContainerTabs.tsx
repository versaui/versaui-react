'use client';

import React, { useCallback, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { ContainerTab, type ContainerTabSize, type ContainerTabVariant } from './ContainerTab';

export interface ContainerTabItem {
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: number;
    disabled?: boolean;
}

export interface VerticalContainerTabsProps {
    /** Array of tab items to render */
    items: ContainerTabItem[];
    /** Currently selected tab ID */
    selectedId: string;
    /** Callback when a tab is selected */
    onChange: (id: string) => void;
    /** Whether to show icons (if provided in items) */
    showIcons?: boolean;
    /** Size of the tabs */
    size?: ContainerTabSize;
    /** Style variant of the tabs */
    variant?: ContainerTabVariant;
    /** Additional CSS class for the container */
    className?: string;
    /** Width of the container (default: 160px per Figma) */
    width?: string | number;
}

// Container variants
const containerVariants = cva([
    'relative flex flex-col items-start',
    'gap-[var(--spacing-4)]',
]);

export function VerticalContainerTabs({
    items,
    selectedId,
    onChange,
    showIcons = true,
    size = 'default',
    variant = 'primary',
    className = '',
    width = 160,
}: VerticalContainerTabsProps) {
    const handleTabClick = useCallback((id: string) => {
        onChange(id);
    }, [onChange]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const enabledItems = items.filter(item => !item.disabled);
        if (enabledItems.length === 0) return;

        const currentIndex = enabledItems.findIndex(item => item.id === selectedId);
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newIndex = currentIndex <= 0 ? enabledItems.length - 1 : currentIndex - 1;
                break;
            case 'ArrowDown':
                e.preventDefault();
                newIndex = currentIndex >= enabledItems.length - 1 ? 0 : currentIndex + 1;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = enabledItems.length - 1;
                break;
            default:
                return;
        }

        if (newIndex !== currentIndex) {
            onChange(enabledItems[newIndex].id);
        }
    }, [items, selectedId, onChange]);

    const widthValue = typeof width === 'number' ? `${width}px` : width;

    return (
        <div
            role="tablist"
            aria-orientation="vertical"
            className={clsx(containerVariants(), className)}
            style={{ width: widthValue }}
            onKeyDown={handleKeyDown}
        >
            {items.map((item) => (
                <ContainerTab
                    key={item.id}
                    orientation="vertical"
                    size={size}
                    variant={variant}
                    selected={item.id === selectedId}
                    disabled={item.disabled}
                    showIcon={showIcons && !!item.icon}
                    leadingIcon={item.icon}
                    showBadge={item.badge !== undefined && item.badge > 0}
                    badgeCount={item.badge}
                    onClick={() => handleTabClick(item.id)}
                >
                    {item.label}
                </ContainerTab>
            ))}
        </div>
    );
}

export default VerticalContainerTabs;
