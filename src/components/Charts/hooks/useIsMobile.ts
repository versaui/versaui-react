'use client';

/**
 * useIsMobile — reactive mobile breakpoint detection.
 *
 * Matches the 767px mobile breakpoint used in the docs layout (globals.css).
 * Returns `true` when the viewport is ≤ 767px wide.
 *
 * Usage:
 *   const isMobile = useIsMobile();
 *   const data = isMobile ? aggregateDataPairs(rawData, 'month') : rawData;
 */

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 767;

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
        setIsMobile(mql.matches);

        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isMobile;
}
