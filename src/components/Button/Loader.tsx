'use client';

import React from 'react';

interface LoaderProps {
    size?: number | 'small' | 'default' | 'large';
    variant?: 'primary' | 'error' | 'neutral';
    className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'default',
    className = ''
}) => {
    const pixelSize = typeof size === 'number'
        ? size
        : size === 'small' ? 16 : size === 'large' ? 24 : 20;

    return (
        <div
            className={`flex items-center justify-center animate-spin ${className}`}
            style={{ width: pixelSize, height: pixelSize }}
            role="status"
            aria-label="Loading"
            aria-live="polite"
            data-layer="Infinite Loader"
        >
            <div
                className="rounded-full border-2 border-current border-t-transparent"
                style={{
                    width: pixelSize * 0.8,
                    height: pixelSize * 0.8,
                    borderWidth: Math.max(1.5, pixelSize * 0.1)
                }}
            ></div>
        </div>
    );
};
