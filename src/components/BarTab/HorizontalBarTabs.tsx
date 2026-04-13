'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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

export interface HorizontalBarTabsProps {
    /** Array of tab items to render */
    items: TabItem[];
    /** Currently selected tab ID */
    selectedId: string;
    /** Callback when a tab is selected */
    onChange: (id: string) => void;
    /** Whether to show icons (if provided in items) */
    showIcons?: boolean;
    /** Whether to show the bottom neutral line (default: true) */
    showBottomLine?: boolean;
    /** Additional CSS class for the container */
    className?: string;
}

// Container variants
const containerVariants = cva(
    [
        'relative flex items-start',
        'gap-[var(--spacing-7)]',
    ],
    {
        variants: {
            showBottomLine: {
                true: 'border-b border-[var(--color-neutral-outline-subtle)]',
                false: 'border-b-0',
            },
        },
        defaultVariants: {
            showBottomLine: true,
        },
    }
);

// Sliding bar indicator classes (position is dynamic via style)
const slidingBarClasses = [
    'absolute bottom-0 h-0.5',
    'bg-[var(--color-brand-primary-strong)]',
    'rounded-[1px]',
    'transition-[left,width] duration-200 ease-out',
].join(' ');

export function HorizontalBarTabs({
    items,
    selectedId,
    onChange,
    showIcons = true,
    showBottomLine = true,
    className = '',
}: HorizontalBarTabsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [barPosition, setBarPosition] = useState({ left: 0, width: 0 });

    // Update bar position when selected tab changes
    useEffect(() => {
        const updateBarPosition = () => {
            const selectedTab = tabRefs.current.get(selectedId);
            const container = containerRef.current;

            if (selectedTab && container) {
                const containerRect = container.getBoundingClientRect();
                const tabRect = selectedTab.getBoundingClientRect();

                setBarPosition({
                    left: tabRect.left - containerRect.left,
                    width: tabRect.width,
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
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = currentIndex <= 0 ? enabledItems.length - 1 : currentIndex - 1;
                break;
            case 'ArrowRight':
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

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-orientation="horizontal"
            className={clsx(containerVariants({ showBottomLine }), className)}
            onKeyDown={handleKeyDown}
        >
            {items.map((item) => (
                <div key={item.id} ref={(el) => setTabRef(item.id, el)}>
                    <BarTab
                        orientation="horizontal"
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
                style={{ left: barPosition.left, width: barPosition.width }}
                aria-hidden="true"
            />
        </div>
    );
}

export default HorizontalBarTabs;
