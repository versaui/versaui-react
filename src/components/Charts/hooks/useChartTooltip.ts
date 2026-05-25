/**
 * useChartTooltip — manages tooltip visibility and active state for charts.
 * Designed for use with Recharts' `onMouseMove` / `onMouseLeave` callbacks.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChartDataPoint } from '../types/ChartTypes';

export interface TooltipState {
    active: boolean;
    payload: ChartDataPoint | null;
    label: string | null;
    x: number;
    y: number;
}

const INITIAL_STATE: TooltipState = {
    active: false,
    payload: null,
    label: null,
    x: 0,
    y: 0,
};

export function useChartTooltip() {
    const [tooltip, setTooltip] = useState<TooltipState>(INITIAL_STATE);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear pending timeout on unmount to prevent setState on unmounted component.
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    const show = useCallback(
        (payload: ChartDataPoint, label: string, x: number, y: number) => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
            setTooltip({ active: true, payload, label, x, y });
        },
        [],
    );

    // Small delay prevents flicker when moving between adjacent bars.
    const hide = useCallback(() => {
        hideTimeoutRef.current = setTimeout(() => {
            setTooltip(INITIAL_STATE);
        }, 100);
    }, []);

    const hideImmediate = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setTooltip(INITIAL_STATE);
    }, []);

    return { tooltip, show, hide, hideImmediate } as const;
}
