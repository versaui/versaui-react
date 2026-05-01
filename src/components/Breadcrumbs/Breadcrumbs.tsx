'use client';

import React, { useMemo } from 'react';
import { CaretRightIcon } from '@phosphor-icons/react';
import { Breadcrumb, type BreadcrumbState } from './Breadcrumb';

export const BREADCRUMB_SEPARATORS = ['slash', 'arrow'] as const;

export type BreadcrumbSeparator = (typeof BREADCRUMB_SEPARATORS)[number];

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: boolean;
    iconComponent?: React.ReactNode;
    onClick?: () => void;
}

export interface BreadcrumbsProps {
    separator?: BreadcrumbSeparator;
    items: BreadcrumbItem[];
    className?: string;
}

// Slash separator component
const SlashSeparator: React.FC = () => (
    <div
        style={{
            width: 20,
            height: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        }}
    >
        <span
            className="text-b3"
            style={{
                color: 'var(--color-neutral-text-subtle)',
                textAlign: 'center',
            }}
        >
            /
        </span>
    </div>
);

// Arrow separator component (CaretRight icon)
const ArrowSeparator: React.FC = () => (
    <div
        style={{
            width: 20,
            height: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        }}
    >
        <CaretRightIcon
            size={16}
            weight="regular"
            style={{
                color: 'var(--color-neutral-icon-subtle)',
                display: 'block',
            }}
        />
    </div>
);

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    separator = 'slash',
    items,
    className = '',
}) => {
    // Container styles - reset list styles
    const containerStyle: React.CSSProperties = useMemo(() => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 2,
        gap: 2,
        margin: 0,
        listStyle: 'none',
    }), []);

    // List item styles
    const listItemStyle: React.CSSProperties = useMemo(() => ({
        display: 'inline-flex',
        alignItems: 'center',
    }), []);

    // Render separator based on type
    const renderSeparator = (index: number) => {
        if (index === items.length - 1) return null;

        return (
            <li
                key={`sep-${index}`}
                style={listItemStyle}
                aria-hidden="true"
            >
                {separator === 'slash' ? <SlashSeparator /> : <ArrowSeparator />}
            </li>
        );
    };

    return (
        <nav
            className={className}
            aria-label="Breadcrumb"
        >
            <ol style={containerStyle}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const state: BreadcrumbState = isLast ? 'current' : 'previous';

                    return (
                        <React.Fragment key={`item-${index}`}>
                            <li style={listItemStyle}>
                                <Breadcrumb
                                    state={state}
                                    icon={item.icon}
                                    iconComponent={item.iconComponent}
                                    label={item.label}
                                    href={item.href}
                                    onClick={item.onClick}
                                />
                            </li>
                            {renderSeparator(index)}
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
