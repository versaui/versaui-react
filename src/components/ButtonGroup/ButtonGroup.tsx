'use client';

import React, { type ReactNode, useCallback, useMemo, useRef } from 'react';
import { ButtonGroupItem } from './ButtonGroupItem';

export const BUTTON_GROUP_SIZES = ['default', 'small'] as const;

export type ButtonGroupSize = (typeof BUTTON_GROUP_SIZES)[number];

export interface ButtonGroupItemData {
    /** Unique identifier for this item */
    id: string;
    /** Label text - if not provided, renders icon-only */
    label?: string;
    /** Leading icon */
    leadingIcon?: ReactNode;
    /** Trailing icon (only used when label is provided) */
    trailingIcon?: ReactNode;
    /** Item type - 'default' or 'error' for individual item styling */
    type?: 'default' | 'error';
    /** Disabled state for this specific item */
    disabled?: boolean;
    /** Accessible label for screen readers (required if icon-only) */
    ariaLabel?: string;
}

export interface ButtonGroupProps {
    /** Size variant */
    size?: ButtonGroupSize;
    /** Array of button items to render */
    items: ButtonGroupItemData[];
    /** Currently active/selected item ID (optional for controlled selection) */
    activeId?: string;
    /** Callback when an item is clicked */
    onChange?: (id: string) => void;
    /** Accessible label for the button group */
    'aria-label'?: string;
    /** Additional CSS class */
    className?: string;
    /** Additional inline styles */
    style?: React.CSSProperties;
    /** Whether the entire group is disabled */
    disabled?: boolean;
}

// Border radius based on size (using thematic tokens)
const BORDER_RADIUS: Record<ButtonGroupSize, string> = {
    default: 'var(--corner-radius-thematic-medium)',
    small: 'var(--corner-radius-thematic-small)',
};

export function ButtonGroup({
    size = 'default',
    items,
    activeId,
    onChange,
    'aria-label': ariaLabel,
    className = '',
    style,
    disabled = false,
}: ButtonGroupProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleItemClick = useCallback((id: string) => {
        if (!disabled && onChange) {
            onChange(id);
        }
    }, [disabled, onChange]);

    // Keyboard navigation for arrow keys
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;

        const enabledItems = items.filter(item => !item.disabled);
        if (enabledItems.length === 0) return;

        const currentIndex = enabledItems.findIndex(item => item.id === activeId);
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                newIndex = currentIndex <= 0 ? enabledItems.length - 1 : currentIndex - 1;
                break;
            case 'ArrowRight':
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

        if (newIndex !== currentIndex && onChange) {
            onChange(enabledItems[newIndex].id);
        }
    }, [disabled, items, activeId, onChange]);

    // Container styles - using design token for shadow
    const containerStyle: React.CSSProperties = useMemo(() => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: BORDER_RADIUS[size],
        outline: '1px solid var(--color-neutral-outline-subtle)',
        outlineOffset: '-1px',
        boxShadow: 'var(--elevation-small-1-shadow)',
        overflow: 'hidden',
        backdropFilter: 'blur(var(--elevation-small-blur))',
        WebkitBackdropFilter: 'blur(var(--elevation-small-blur))',
        ...style,
    }), [size, style]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={containerStyle}
            role="group"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
        >
            {items.map((item) => {
                const isActive = activeId === item.id;
                const isIconOnly = !item.label;
                const isItemDisabled = disabled || item.disabled;

                return (
                    <ButtonGroupItem
                        key={item.id}
                        type={item.type || 'default'}
                        size={size}
                        active={isActive}
                        disabled={isItemDisabled}
                        leadingIcon={item.leadingIcon}
                        trailingIcon={!isIconOnly ? item.trailingIcon : undefined}
                        onClick={() => handleItemClick(item.id)}
                        ariaLabel={item.ariaLabel}
                    >
                        {item.label}
                    </ButtonGroupItem>
                );
            })}
        </div>
    );
}

export default ButtonGroup;

