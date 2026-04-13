'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { BarTab } from './BarTab';

export interface TabItem {
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: number;
    disabled?: boolean;
}

export interface VerticalBarTabsProps {
    /** Array of tab items to render */
    items: TabItem[];
    /** Currently selected tab ID */
    selectedId: string;
    /** Callback when a tab is selected */
    onChange: (id: string) => void;
    /** Whether to show icons (if provided in items) */
    showIcons?: boolean;
    /** Whether to show the left neutral line (default: true) */
    showLeftLine?: boolean;
    /** Additional CSS class for the container */
    className?: string;
    /** Width of the container (default: 160px per Figma) */
    width?: string | number;
}

// Container variants
const containerVariants = cva(
    [
        'relative flex flex-col items-start',
        'gap-[var(--spacing-4)]',
    ],
    {
        variants: {
            showLeftLine: {
                true: 'border-l border-[var(--color-neutral-outline-subtle)]',
                false: 'border-l-0',
            },
        },
        defaultVariants: {
            showLeftLine: true,
        },
    }
);

// Sliding bar indicator classes (position is dynamic via style)
const slidingBarClasses = [
    'absolute left-0 w-0.5',
    'bg-[var(--color-brand-primary-strong)]',
    'rounded-[1px]',
    'transition-[top,height] duration-200 ease-out',
].join(' ');

export function VerticalBarTabs({
    items,
    selectedId,
    onChange,
    showIcons = true,
    showLeftLine = true,
    className = '',
    width = 160,
}: VerticalBarTabsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [barPosition, setBarPosition] = useState({ top: 0, height: 0 });

    // Update bar position when selected tab changes
    useEffect(() => {
        const updateBarPosition = () => {
            const selectedTab = tabRefs.current.get(selectedId);
            const container = containerRef.current;

            if (selectedTab && container) {
                const containerRect = container.getBoundingClientRect();
                const tabRect = selectedTab.getBoundingClientRect();

                setBarPosition({
                    top: tabRect.top - containerRect.top,
                    height: tabRect.height,
                });
            }
        };

        requestAnimationFrame(updateBarPosition);
    }, [selectedId, items]);

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

    const setTabRef = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) {
            tabRefs.current.set(id, el);
        } else {
            tabRefs.current.delete(id);
        }
    }, []);

    const widthValue = typeof width === 'number' ? `${width}px` : width;

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-orientation="vertical"
            className={clsx(containerVariants({ showLeftLine }), className)}
            style={{ width: widthValue }}
            onKeyDown={handleKeyDown}
        >
            {items.map((item) => (
                <div key={item.id} ref={(el) => setTabRef(item.id, el)}>
                    <BarTab
                        orientation="vertical"
                        selected={item.id === selectedId}
                        disabled={item.disabled}
                        showIcon={showIcons && !!item.icon}
                        leadingIcon={item.icon}
                        showBadge={item.badge !== undefined && item.badge > 0}
                        badgeCount={item.badge}
                        onClick={() => handleTabClick(item.id)}
                        hideBarIndicator={true}
                    >
                        {item.label}
                    </BarTab>
                </div>
            ))}

            {/* Sliding bar indicator */}
            <div
                className={slidingBarClasses}
                style={{ top: barPosition.top, height: barPosition.height }}
                aria-hidden="true"
            />
        </div>
    );
}

export default VerticalBarTabs;
