'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { AccordionContext, type AccordionContextValue } from './AccordionItem';

// Re-export types and components from AccordionItem for convenience
export { AccordionItem, ACCORDION_SIZES } from './AccordionItem';
export type { AccordionSize, AccordionItemProps } from './AccordionItem';

export interface AccordionProps {
    /** Child AccordionItems */
    children: React.ReactNode;
    /** Allow only one item open at a time */
    singleOpen?: boolean;
    /** Default open item IDs (uncontrolled) */
    defaultOpenItems?: string[];
    /** Controlled open item IDs */
    openItems?: string[];
    /** Callback when open items change */
    onOpenItemsChange?: (openItems: string[]) => void;
    /** Gap between items */
    gap?: number;
    /** Additional className */
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    children,
    singleOpen = false,
    defaultOpenItems = [],
    openItems: controlledOpenItems,
    onOpenItemsChange,
    gap = 0,
    className
}) => {
    const [internalOpenItems, setInternalOpenItems] = useState<Set<string>>(
        () => new Set(defaultOpenItems)
    );

    const isControlled = controlledOpenItems !== undefined;
    const openItems = isControlled ? new Set(controlledOpenItems) : internalOpenItems;

    const toggleItem = useCallback((id: string) => {
        const newOpenItems = new Set(openItems);

        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            if (singleOpen) {
                newOpenItems.clear();
            }
            newOpenItems.add(id);
        }

        if (!isControlled) {
            setInternalOpenItems(newOpenItems);
        }

        onOpenItemsChange?.(Array.from(newOpenItems));
    }, [openItems, singleOpen, isControlled, onOpenItemsChange]);

    const contextValue = useMemo<AccordionContextValue>(() => ({
        openItems,
        toggleItem,
        singleOpen
    }), [openItems, toggleItem, singleOpen]);

    return (
        <AccordionContext.Provider value={contextValue}>
            <div className={cn('flex flex-col', className)} style={{ gap }}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
};

export default Accordion;
