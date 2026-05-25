'use client';

import React from 'react';

/**
 * Reads a CSS custom property value from :root and parses it as a number.
 * Re-reads on DOM attribute changes (theme switches) via MutationObserver.
 */
export function useCssVarNumber(varName: string, fallback: number): number {
    const [value, setValue] = React.useState(fallback);

    React.useEffect(() => {
        const read = () => {
            const raw = getComputedStyle(document.documentElement)
                .getPropertyValue(varName)
                .trim();
            const parsed = parseFloat(raw);
            if (!Number.isNaN(parsed)) setValue(parsed);
        };

        read();

        // Re-read when theme class/attribute changes on <html> or <body>.
        const observer = new MutationObserver(read);
        observer.observe(document.documentElement, { attributes: true });
        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, [varName]);

    return value;
}
