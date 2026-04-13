'use client';

import React, { useState, useMemo, useCallback, useEffect, useId, createContext, useContext } from 'react';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { PlusIcon, MinusIcon } from '@phosphor-icons/react';

export const ACCORDION_SIZES = ['large', 'default'] as const;
export type AccordionSize = (typeof ACCORDION_SIZES)[number];

const SIZE_CONFIG = {
    large: {
        titleClass: 'text-h6',
        titleMinHeight: 40,
        bodyClass: 'text-b3',
        iconSize: 20,
        iconPadding: 10,
        padding: { top: 12, bottom: 12, bottomOpen: 16, left: 16, right: 12 },
        containerGap: 16,
        textGap: 8,
        borderRadius: 'var(--corner-radius-default-medium)',
        iconBorderRadius: 'var(--corner-radius-thematic-medium)',
        nonContainer: { height: 64, paddingLeft: 4, paddingRight: 0, paddingVertical: 12 }
    },
    default: {
        titleClass: 'text-h7',
        titleMinHeight: 32,
        bodyClass: 'text-b4',
        iconSize: 16,
        iconPadding: 8,
        padding: { top: 8, bottom: 8, bottomOpen: 12, left: 12, right: 8 },
        containerGap: 12,
        textGap: 8,
        borderRadius: 'var(--corner-radius-default-medium)',
        iconBorderRadius: 'var(--corner-radius-thematic-small)',
        nonContainer: { height: 48, paddingLeft: 4, paddingRight: 0, paddingVertical: 8 }
    }
} as const;

// Context for Accordion group coordination
export interface AccordionContextValue {
    openItems: Set<string>;
    toggleItem: (id: string) => void;
    singleOpen: boolean;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);
export const useAccordionContext = () => useContext(AccordionContext);

const accordionItemVariants = cva('flex items-start w-full transition-colors duration-150 ease-out', {
    variants: {
        disabled: {
            true: 'opacity-50 cursor-not-allowed',
            false: 'cursor-pointer'
        }
    },
    defaultVariants: { disabled: false }
});

export interface AccordionItemProps {
    id?: string;
    size?: AccordionSize;
    container?: boolean;
    isOpen?: boolean;
    defaultOpen?: boolean;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
    id: propId,
    size = 'default',
    container = true,
    isOpen: controlledIsOpen,
    defaultOpen = false,
    title,
    children,
    disabled = false,
    isHovered: propIsHovered,
    isFocused: propIsFocused,
    onOpenChange,
    className = ''
}) => {
    const { isFocusVisible, focusProps } = useFocusRing();
    const { isHovered: ariaIsHovered, hoverProps } = useHover({ isDisabled: disabled });
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const accordionCtx = useAccordionContext();
    const generatedId = useId();
    const itemId = propId ?? generatedId;
    const buttonId = `${itemId}-button`;
    const panelId = `${itemId}-panel`;

    // Determine open state: controlled > group > internal
    const isOpen = controlledIsOpen ?? (accordionCtx?.openItems.has(itemId) ?? internalOpen);
    const isHovered = propIsHovered ?? ariaIsHovered;
    const isFocused = propIsFocused ?? isFocusVisible;
    const config = SIZE_CONFIG[size];

    // SSR-safe reduced motion detection
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const handleToggle = useCallback(() => {
        if (disabled) return;
        const newOpen = !isOpen;

        if (accordionCtx) {
            accordionCtx.toggleItem(itemId);
        } else if (controlledIsOpen === undefined) {
            setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
    }, [disabled, isOpen, accordionCtx, itemId, controlledIsOpen, onOpenChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        }
    }, [handleToggle]);

    // Compute container styles
    const hoverBg = isHovered && !disabled ? 'var(--color-neutral-surface-subtle)' : undefined;
    const { padding: p, nonContainer: nc } = config;

    const containerStyles: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'flex-start',
        gap: config.containerGap,
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 150ms ease-out',
        ...(container ? {
            padding: `${p.top}px ${p.right}px ${isOpen ? p.bottomOpen : p.bottom}px ${p.left}px`,
            backgroundColor: hoverBg || 'var(--color-neutral-surface-subtlest)',
            border: '1px solid var(--color-neutral-outline-subtle)',
            borderRadius: config.borderRadius
        } : {
            minHeight: isOpen ? undefined : nc.height,
            padding: `${nc.paddingVertical}px ${nc.paddingRight}px ${isOpen ? p.bottomOpen : nc.paddingVertical}px ${nc.paddingLeft}px`,
            backgroundColor: hoverBg || 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--color-neutral-outline-subtle)',
            borderRadius: 0
        })
    }), [container, config, p, nc, hoverBg, disabled, isOpen]);

    const focusStyles: React.CSSProperties = isFocused && !disabled
        ? { outline: '2px solid var(--color-brand-primary-subtler)', outlineOffset: container ? 0 : 2 }
        : {};

    const IconComponent = isOpen ? MinusIcon : PlusIcon;
    const transition = prefersReducedMotion ? 'none' : 'grid-template-rows 0.35s linear(0, 0.75 30%, 1.04 60%, 0.98 80%, 1)';

    return (
        <div
            className={cn(accordionItemVariants({ disabled: false }), className)}
            style={{ ...containerStyles, ...focusStyles }}
            role="button"
            id={buttonId}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            {...hoverProps}
            {...focusProps}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: isOpen ? config.textGap : 0, flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: config.titleMinHeight }}>
                    <p className={config.titleClass} style={{ color: 'var(--color-neutral-text-strong)', margin: 0, userSelect: 'none' }}>
                        {title}
                    </p>
                </div>
                <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    style={{
                        display: 'grid',
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        transition
                    }}
                >
                    <div
                        className={cn(config.bodyClass, '[&>*]:m-0')}
                        style={{
                            color: 'var(--color-neutral-text-medium)',
                            overflow: 'hidden',
                            userSelect: 'none',
                            opacity: isOpen ? 1 : 0,
                            transition: prefersReducedMotion ? 'none' : 'opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) 0.06s'
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: config.iconPadding,
                borderRadius: config.iconBorderRadius,
                flexShrink: 0
            }}>
                <IconComponent size={config.iconSize} weight="regular" color="var(--color-neutral-icon-medium)" />
            </div>
        </div>
    );
};

export default AccordionItem;
