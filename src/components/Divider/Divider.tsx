'use client';

import React, { useMemo } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerStyle = 'simple' | 'intrusion';
export type DividerContent = 'none' | 'text' | 'icon';

interface DividerProps {
    orientation?: DividerOrientation;
    style?: DividerStyle;
    content?: DividerContent;
    text?: string;
    icon?: React.ReactNode;
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    style = 'simple',
    content = 'none',
    text = 'OR',
    icon,
    className = '',
}) => {
    const isHorizontal = orientation === 'horizontal';
    const isIntrusion = style === 'intrusion';
    const hasContent = content !== 'none';

    const containerStyle: React.CSSProperties = useMemo(() =>
        isHorizontal
            ? {
                display: 'flex',
                alignItems: 'center',
                width: '100%',
            }
            : {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
            },
        [isHorizontal]
    );

    // Intrusion: 2px line with shadow effect
    const lineStyle: React.CSSProperties = useMemo(() =>
        isHorizontal
            ? {
                flex: 1,
                height: isIntrusion ? '2px' : '1px',
                backgroundColor: 'var(--color-neutral-divider-base)',
                minWidth: 0,
                // Use composite intrusion style from themes.css
                boxShadow: isIntrusion
                    ? 'var(--intrusion-divider-horizontal)'
                    : 'none',
            }
            : {
                flex: 1,
                width: isIntrusion ? '2px' : '1px',
                backgroundColor: 'var(--color-neutral-divider-base)',
                minHeight: 0,
                // Use composite intrusion style from themes.css
                boxShadow: isIntrusion
                    ? 'var(--intrusion-divider-vertical)'
                    : 'none',
            },
        [isHorizontal, isIntrusion]
    );

    const contentContainerStyle: React.CSSProperties = useMemo(() =>
        isHorizontal
            ? {
                padding: '0 var(--spacing-4)',
            }
            : {
                padding: 'var(--spacing-4) 0',
            },
        [isHorizontal]
    );

    const textStyle: React.CSSProperties = useMemo(() => ({
        letterSpacing: '0.72px',
        textTransform: 'uppercase',
        color: 'var(--color-neutral-text-subtle)',
        whiteSpace: 'nowrap',
    }), []);

    const iconWrapperStyle: React.CSSProperties = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-neutral-icon-subtle)',
    }), []);

    const renderContent = () => {
        if (content === 'text') {
            return (
                <div style={contentContainerStyle}>
                    <span className="text-b5" style={textStyle}>{text}</span>
                </div>
            );
        }
        if (content === 'icon' && icon) {
            return (
                <div style={{ ...contentContainerStyle, ...iconWrapperStyle }}>
                    {icon}
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={className}
            style={containerStyle}
            role="separator"
            aria-orientation={orientation}
        >
            {/* First divider line (with intrusion shadow if enabled) */}
            <div style={lineStyle} />

            {/* Content (if any) */}
            {hasContent && renderContent()}

            {/* Second divider line (only if there's content, with intrusion shadow if enabled) */}
            {hasContent && <div style={lineStyle} />}
        </div>
    );
};

export default Divider;
