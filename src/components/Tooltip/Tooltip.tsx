'use client';

import React, { useState, useEffect } from 'react';
import {
    Tooltip as AriaTooltip,
    TooltipTrigger,
    OverlayArrow,
    Button,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Constants
export const TOOLTIP_TYPES = ['rich', 'plain'] as const;
export const TOOLTIP_PLACEMENTS = [
    'top',
    'top start',
    'top end',
    'bottom',
    'bottom start',
    'bottom end',
    'left',
    'right',
] as const;

export type TooltipType = (typeof TOOLTIP_TYPES)[number];
export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number];

// CVA: Tooltip container variants
const tooltipVariants = cva(
    [
        'outline-none',
        'shadow-[var(--elevation-medium-2-shadow)]',
        'backdrop-blur-[var(--elevation-medium-blur)]',
        'bg-[var(--color-neutral-surface-inverse)]',
    ],
    {
        variants: {
            type: {
                plain: 'w-fit p-2 rounded-[var(--corner-radius-default-small)]',
                rich: 'w-[248px] p-3 rounded-[var(--corner-radius-default-medium)]',
            },
        },
        defaultVariants: {
            type: 'plain',
        },
    }
);

// CVA: Title styles (rich tooltip only)
const tooltipTitleVariants = cva(
    'text-h9 text-[var(--color-neutral-text-inverse)] mb-1'
);

// CVA: Content text styles
const tooltipContentVariants = cva(
    'text-b5 text-[var(--color-neutral-text-inverse)]'
);

// Arrow fill color constant
const ARROW_FILL = 'var(--color-neutral-surface-inverse)';

// Shared fixed-position portal container for all Tooltip instances.
// Ensures React Aria's position: absolute overlays are always relative to the
// viewport, fixing top-placed tooltips in layouts where body has position: relative
// and a height taller than the viewport.
let portalContainerRef: HTMLDivElement | null = null;
let portalContainerRefCount = 0;

function getPortalContainer(): HTMLDivElement {
    if (!portalContainerRef) {
        const el = document.createElement('div');
        el.dataset.tooltipPortal = '';
        Object.assign(el.style, {
            position: 'fixed',
            inset: '0',
            pointerEvents: 'none',
            zIndex: '9999',
            overflow: 'visible',
        });
        document.body.appendChild(el);
        portalContainerRef = el;
    }
    portalContainerRefCount++;
    return portalContainerRef;
}

function releasePortalContainer(): void {
    portalContainerRefCount--;
    if (portalContainerRefCount <= 0 && portalContainerRef) {
        portalContainerRef.remove();
        portalContainerRef = null;
        portalContainerRefCount = 0;
    }
}

// Props Interface
export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
    type?: TooltipType;
    placement?: TooltipPlacement;
    title?: string;
    content?: string;
    maxWidth?: number;
    className?: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    offset?: number;
}

const DEFAULT_CONTENT = 'Tooltips are informative, specific, and action-oriented text labels that provide contextual support.';

export const Tooltip: React.FC<TooltipProps> = ({
    type = 'plain',
    placement = 'top',
    title = 'Title',
    content = DEFAULT_CONTENT,
    maxWidth,
    className = '',
    children,
    isOpen,
    offset = 8,
}) => {
    const isRich = type === 'rich';

    // Acquire / release the shared portal container
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
    useEffect(() => {
        const container = getPortalContainer();
        setPortalContainer(container);
        return () => releasePortalContainer();
    }, []);

    // Wrap custom children in a focusable span for React Aria compatibility
    const triggerElement = children ? (
        <span
            tabIndex={0}
            className="inline-block cursor-pointer"
        >
            {children}
        </span>
    ) : (
        <Button
            className="text-h8"
            style={{
                background: 'var(--color-neutral-surface-subtlest)',
                border: '1px solid var(--color-neutral-outline-subtle)',
                borderRadius: 'var(--corner-radius-thematic-medium)',
                padding: '0 8px',
                minWidth: 'auto',
                height: 24,
                cursor: 'pointer',
                color: 'var(--color-neutral-text-strong)',
            }}
        >
            Hover me
        </Button>
    );

    // Arrow SVG render function
    const renderArrow = (arrowPlacement: string | null) => {
        const isBottom = arrowPlacement?.startsWith('bottom');
        const isLeft = arrowPlacement === 'left';
        const isRight = arrowPlacement === 'right';

        // Paths with 2px rounded tip using quadratic bezier curves
        if (isLeft) {
            return (
                <svg width={8} height={16} viewBox="0 0 8 16">
                    <path d="M0 0 L6 6 Q8 8 6 10 L0 16 Z" fill={ARROW_FILL} />
                </svg>
            );
        }

        if (isRight) {
            return (
                <svg width={8} height={16} viewBox="0 0 8 16">
                    <path d="M8 0 L2 6 Q0 8 2 10 L8 16 Z" fill={ARROW_FILL} />
                </svg>
            );
        }

        if (isBottom) {
            return (
                <svg width={16} height={8} viewBox="0 0 16 8">
                    <path d="M0 8 L6 2 Q8 0 10 2 L16 8 Z" fill={ARROW_FILL} />
                </svg>
            );
        }

        // Default: top placement, arrow pointing down
        return (
            <svg width={16} height={8} viewBox="0 0 16 8">
                <path d="M0 0 L6 6 Q8 8 10 6 L16 0 Z" fill={ARROW_FILL} />
            </svg>
        );
    };

    return (
        <TooltipTrigger isOpen={isOpen} delay={0} closeDelay={0}>
            {triggerElement}
            <AriaTooltip
                placement={placement}
                offset={offset}
                shouldFlip={true}
                className={cn('react-aria-Tooltip', tooltipVariants({ type }), className)}
                UNSTABLE_portalContainer={portalContainer || undefined}
                style={({ isEntering, isExiting }) => ({
                    transition: 'opacity 150ms ease-out, transform 150ms ease-out',
                    opacity: isEntering || isExiting ? 0 : 1,
                    transform: isEntering || isExiting ? 'scale(0.97)' : 'scale(1)',
                })}
            >
                <OverlayArrow>
                    {({ placement: arrowPlacement }) => renderArrow(arrowPlacement)}
                </OverlayArrow>
                {isRich ? (
                    <>
                        <div className={tooltipTitleVariants()}>{title}</div>
                        <div className={tooltipContentVariants()}>{content}</div>
                    </>
                ) : (
                    <div
                        className={tooltipContentVariants()}
                        style={{ maxWidth: maxWidth || 232 }}
                    >
                        {content}
                    </div>
                )}
            </AriaTooltip>
        </TooltipTrigger>
    );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
