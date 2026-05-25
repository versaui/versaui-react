'use client';

import React from 'react';

/**
 * Returns a counter that increments whenever the `data-theme` attribute on
 * `<html>` changes. Use as a React `key` on Recharts `<Pie>` to force
 * remount and replay the reveal animation after a theme switch.
 */
export function useThemeChangeKey(): number {
    const [key, setKey] = React.useState(0);

    React.useEffect(() => {
        const observer = new MutationObserver(() => {
            setKey((k) => k + 1);
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    return key;
}
