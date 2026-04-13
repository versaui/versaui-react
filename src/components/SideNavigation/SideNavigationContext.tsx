'use client';

import { createContext, useContext } from 'react';

/**
 * Context value for the Side Navigation system.
 * Shared across SideNavigation, SideNavigationItem, SubNavigationItem, and SideNavigationFeatureCard.
 */
export interface SideNavigationContextValue {
    /** Whether the sidebar is in collapsed (icon-only) mode */
    collapsed: boolean;
    /** Currently active/selected navigation item ID */
    activeId: string | null;
    /** Set of expanded parent item IDs (for nested navigation) */
    expandedItems: Set<string>;
    /** Callback when a navigation item is selected */
    onNavigate: (id: string) => void;
    /** Callback to toggle expansion of a nested item */
    onToggleExpand: (id: string) => void;
}

const SideNavigationContext = createContext<SideNavigationContextValue | null>(null);

/**
 * Hook to access Side Navigation context.
 * Throws if used outside of SideNavigation provider.
 */
export function useSideNavigationContext(): SideNavigationContextValue {
    const context = useContext(SideNavigationContext);
    if (!context) {
        throw new Error('useSideNavigationContext must be used within a SideNavigation component');
    }
    return context;
}

/**
 * Hook to access Side Navigation context, returning null if not within provider.
 * Useful for components that can work both inside and outside the context.
 */
export function useSideNavigationContextSafe(): SideNavigationContextValue | null {
    return useContext(SideNavigationContext);
}

export const SideNavigationProvider = SideNavigationContext.Provider;
export default SideNavigationContext;
