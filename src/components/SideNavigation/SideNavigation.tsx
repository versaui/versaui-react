'use client';

import React, {
    type CSSProperties,
    type ReactNode,
    useCallback,
    useMemo,
    useState,
    useEffect,
    createContext,
    useContext,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { SidebarSimpleIcon } from '@phosphor-icons/react';
import { Logo, type LogoBrand } from '../Logo/Logo';
import { Button } from '../Button/Button';
import { Divider } from '../Divider/Divider';
import { SideNavigationItem, type SideNavigationItemVariant } from './SideNavigationItem';
import { SubNavigationItem } from './SubNavigationItem';
import { SideNavigationFeatureCard, type FeatureCardWidget } from './SideNavigationFeatureCard';
import { SideNavigationProvider, type SideNavigationContextValue } from './SideNavigationContext';

// Types
export interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    disabled?: boolean;
    href?: string;
    children?: { id: string; label: string; badge?: number; disabled?: boolean; href?: string }[];
}

export interface MenuSection {
    header?: string;
    items: MenuItem[];
}

export interface SideNavigationProps {
    /** Controlled collapsed state */
    collapsed?: boolean;
    /** Callback when collapsed state changes */
    onCollapsedChange?: (collapsed: boolean) => void;
    /** Currently selected navigation item ID */
    selectedId?: string;
    /** Callback when a navigation item is selected */
    onSelect?: (id: string) => void;
    /** Style variant for navigation items */
    variant?: SideNavigationItemVariant;
    /** Menu sections (data-driven API) */
    sections?: MenuSection[];
    /** Bottom navigation items (data-driven API) */
    bottomItems?: MenuItem[];
    /** Whether to show the logo slot */
    showLogo?: boolean;
    /** Custom logo for expanded state - accepts any ReactNode */
    logo?: ReactNode;
    /** Custom logo for collapsed state - accepts any ReactNode */
    collapsedLogo?: ReactNode;
    /** Show feature card at bottom */
    showFeatureCard?: boolean;
    /** Feature card widget type */
    featureCardWidget?: FeatureCardWidget;
    /** Feature card content text */
    featureCardContent?: string;
    /** Feature card button text */
    featureCardButtonText?: string;
    /** Callback when feature card button is clicked */
    onFeatureCardClick?: () => void;
    /** Usage widget title */
    usageTitle?: string;
    /** Usage widget status text */
    usageStatus?: string;
    /** Usage widget percentage */
    usagePercentage?: number;
    /** @deprecated Use `logo` prop instead */
    logoBrand?: LogoBrand;
    /** Height of the sidebar */
    height?: number | string;
    /** Whether to show the collapse/expand toggle button on desktop. Automatically hidden on mobile overlay drawers. */
    showCollapseButton?: boolean;
    /** Additional className for container */
    className?: string;
    /** Children for compound component usage */
    children?: ReactNode;
}

// CVA Styles
const sideNavigationStyles = cva(
    [
        'flex flex-col justify-between items-stretch',
        'border-r border-[var(--color-neutral-outline-subtlest)]',
        'bg-[var(--color-neutral-surface-subtle)]',
        'transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'box-border overflow-visible p-4',
    ],
    {
        variants: {
            collapsed: {
                true: 'w-20',
                false: 'w-[248px]',
            },
        },
        defaultVariants: { collapsed: false },
    }
);

const headerStyles = cva('flex items-center self-stretch shrink-0', {
    variants: {
        collapsed: {
            true: 'justify-center gap-4',
            false: 'justify-start gap-4',
        },
    },
    defaultVariants: { collapsed: false },
});

const menuContainerStyles = cva(
    [
        'flex flex-col items-stretch gap-3 flex-1 min-h-0',
        'overflow-y-auto overflow-x-visible',
        'scrollbar-thin scrollbar-thumb-[var(--color-neutral-outline-subtle)]',
        '-mr-3 pr-3',
    ],
    {
        variants: {
            collapsed: {
                true: 'pt-8 pb-8',
                false: 'pt-0 pb-0',
            },
        },
        defaultVariants: { collapsed: false },
    }
);

export type SideNavigationStylesProps = VariantProps<typeof sideNavigationStyles>;

// Internal Context for compound components
interface SideNavigationInternalContextValue {
    collapsed: boolean;
    headerHovered: boolean;
    setHeaderHovered: (hovered: boolean) => void;
    handleCollapseToggle: () => void;
    showLogo: boolean;
    shouldShowCollapseButton: boolean;
    logo: ReactNode;
    collapsedLogo: ReactNode;
    logoBrand?: LogoBrand;
}

const SideNavigationInternalContext = createContext<SideNavigationInternalContextValue | null>(null);

function useSideNavigationInternal() {
    const ctx = useContext(SideNavigationInternalContext);
    if (!ctx) throw new Error('SideNavigation sub-components must be used within SideNavigation');
    return ctx;
}

// Compound Sub-components
/** Logo slot - renders appropriate logo based on collapsed state */
function SideNavigationLogo({ children }: { children?: ReactNode }) {
    const { collapsed, headerHovered, handleCollapseToggle, showLogo, shouldShowCollapseButton, logo, collapsedLogo, logoBrand } =
        useSideNavigationInternal();

    if (!showLogo && !children) return null;

    if (children) {
        return <>{children}</>;
    }

    if (collapsed) {
        if (shouldShowCollapseButton && headerHovered) {
            return (
                <Button
                    variant="neutral"
                    size="small"
                    buttonStyle="thematic"
                    leadingIcon={<SidebarSimpleIcon size={16} weight="regular" />}
                    onClick={handleCollapseToggle}
                    aria-label="Expand sidebar"
                />
            );
        }
        if (collapsedLogo) return <>{collapsedLogo}</>;
        return <Logo brand={logoBrand || 'versa-ui'} size="m" style="contained" />;
    }

    if (logo) return <>{logo}</>;
    return <Logo brand={logoBrand || 'versa-ui'} size="m" style="icon-wordmark" />;
}

/** Section wrapper with optional header label */
function SideNavigationSection({ label, children }: { label?: string; children: ReactNode }) {
    const { collapsed } = useSideNavigationInternal();

    return (
        <div className="flex flex-col items-stretch gap-1 shrink-0 self-stretch">
            {label && !collapsed && (
                <div className="px-2 py-1">
                    <span
                        className={cn('text-b5 uppercase tracking-[0.72px]')}
                        style={{ color: 'var(--color-neutral-text-medium)' }}
                    >
                        {label}
                    </span>
                </div>
            )}
            <div className="flex flex-col items-stretch gap-1">{children}</div>
        </div>
    );
}

/** Footer section for feature card and bottom items */
function SideNavigationFooter({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col items-stretch gap-1.5 shrink-0 pt-4">
            <Divider orientation="horizontal" style="intrusion" />
            {children}
        </div>
    );
}

// Main Component
export const SideNavigation: React.FC<SideNavigationProps> & {
    Logo: typeof SideNavigationLogo;
    Section: typeof SideNavigationSection;
    Footer: typeof SideNavigationFooter;
} = ({
    collapsed = false,
    onCollapsedChange,
    selectedId = '',
    onSelect,
    variant = 'primary',
    sections = [],
    bottomItems = [],
    showLogo = true,
    logo,
    collapsedLogo,
    showFeatureCard = true,
    featureCardWidget = 'upgrade',
    featureCardContent = 'Upgrade to Business Plan for more users and projects.',
    featureCardButtonText = 'Upgrade Plan',
    onFeatureCardClick,
    usageTitle = "You're almost out of Projects",
    usageStatus = '4/5 Projects',
    usagePercentage = 80,
    logoBrand = 'versa-ui',
    height = '100%',
    showCollapseButton = true,
    className = '',
    children,
}) => {
        // Mobile breakpoint detection — hides collapse button on overlay drawers
        const [isMobile, setIsMobile] = useState(false);
        useEffect(() => {
            const mql = window.matchMedia('(max-width: 767px)');
            setIsMobile(mql.matches);
            const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
            mql.addEventListener('change', handler);
            return () => mql.removeEventListener('change', handler);
        }, []);

        const shouldShowCollapseButton = showCollapseButton && !isMobile;
        const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
        const [headerHovered, setHeaderHovered] = useState(false);

        const toggleExpanded = useCallback((id: string) => {
            setExpandedItems((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        }, []);

        const handleSelect = useCallback((id: string) => onSelect?.(id), [onSelect]);
        const handleCollapseToggle = useCallback(
            () => onCollapsedChange?.(!collapsed),
            [onCollapsedChange, collapsed]
        );

        // Keyboard handler for arrow key navigation
        const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
            const focusableSelector = '[role="menuitem"]';
            const nav = e.currentTarget;
            const items = Array.from(nav.querySelectorAll(focusableSelector)) as HTMLElement[];
            const currentIndex = items.indexOf(document.activeElement as HTMLElement);

            if (currentIndex === -1) return;

            let nextIndex = currentIndex;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % items.length;
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                    break;
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    nextIndex = items.length - 1;
                    break;
                default:
                    return;
            }

            items[nextIndex]?.focus();
        }, []);

        // Context value for sub-components
        const contextValue: SideNavigationContextValue = useMemo(
            () => ({
                collapsed,
                activeId: selectedId,
                expandedItems,
                onNavigate: handleSelect,
                onToggleExpand: toggleExpanded,
            }),
            [collapsed, selectedId, expandedItems, handleSelect, toggleExpanded]
        );

        // Internal context for compound components
        const internalContextValue: SideNavigationInternalContextValue = useMemo(
            () => ({
                collapsed,
                headerHovered,
                setHeaderHovered,
                handleCollapseToggle,
                showLogo,
                shouldShowCollapseButton,
                logo,
                collapsedLogo,
                logoBrand,
            }),
            [collapsed, headerHovered, handleCollapseToggle, showLogo, shouldShowCollapseButton, logo, collapsedLogo, logoBrand]
        );

        // Render a menu item (data-driven API)
        const renderMenuItem = useCallback(
            (item: MenuItem) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.has(item.id);
                const isSelected = selectedId === item.id;
                const isChildSelected = hasChildren && item.children!.some((c) => selectedId === c.id);

                if (hasChildren) {
                    return (
                        <SideNavigationItem
                            key={item.id}
                            type="nested"
                            variant={variant}
                            label={item.label}
                            leadingIcon={item.icon}
                            badge={item.badge}
                            expanded={isExpanded}
                            collapsed={collapsed}
                            onToggle={() => toggleExpanded(item.id)}
                        >
                            {item.children!.map((child) => (
                                <SubNavigationItem
                                    key={child.id}
                                    variant={variant}
                                    label={child.label}
                                    badge={child.badge}
                                    selected={selectedId === child.id}
                                    onClick={() => handleSelect(child.id)}
                                />
                            ))}
                        </SideNavigationItem>
                    );
                }

                return (
                    <SideNavigationItem
                        key={item.id}
                        type="default"
                        variant={variant}
                        label={item.label}
                        leadingIcon={item.icon}
                        badge={item.badge}
                        selected={isSelected || isChildSelected}
                        collapsed={collapsed}
                        onClick={() => handleSelect(item.id)}
                    />
                );
            },
            [collapsed, expandedItems, selectedId, handleSelect, toggleExpanded, variant]
        );

        // Determine if using compound component pattern (children) or data-driven props
        const isCompoundPattern = !!children;

        // Container style for height
        const containerStyle: CSSProperties = useMemo(() => ({ height }), [height]);

        return (
            <SideNavigationProvider value={contextValue}>
                <SideNavigationInternalContext.Provider value={internalContextValue}>
                    <nav
                        className={cn(sideNavigationStyles({ collapsed }), className)}
                        style={containerStyle}
                        onMouseEnter={collapsed ? () => setHeaderHovered(true) : undefined}
                        onMouseLeave={collapsed ? () => setHeaderHovered(false) : undefined}
                        onKeyDown={handleKeyDown}
                        aria-label="Side navigation"
                    >
                        {isCompoundPattern ? (
                            children
                        ) : (
                            <>
                                <div
                                    className={cn(
                                        'flex flex-col items-stretch flex-1 min-h-0 overflow-visible',
                                        collapsed ? 'gap-4' : 'gap-8'
                                    )}
                                >
                                    {/* Header with logo and toggle */}
                                    <div className={headerStyles({ collapsed })}>
                                        {collapsed ? (
                                            showLogo ? (
                                                <div className="flex justify-center items-center min-h-[32px]">
                                                    {shouldShowCollapseButton && headerHovered ? (
                                                        <Button
                                                            variant="neutral"
                                                            size="small"
                                                            buttonStyle="thematic"
                                                            leadingIcon={
                                                                <SidebarSimpleIcon size={16} weight="regular" />
                                                            }
                                                            onClick={handleCollapseToggle}
                                                            aria-label="Expand sidebar"
                                                        />
                                                    ) : collapsedLogo ? (
                                                        collapsedLogo
                                                    ) : (
                                                        <Logo brand={logoBrand} size="m" style="contained" />
                                                    )}
                                                </div>
                                            ) : shouldShowCollapseButton ? (
                                                <Button
                                                    variant="neutral"
                                                    size="small"
                                                    buttonStyle="thematic"
                                                    leadingIcon={<SidebarSimpleIcon size={16} weight="regular" />}
                                                    onClick={handleCollapseToggle}
                                                    aria-label="Expand sidebar"
                                                />
                                            ) : null
                                        ) : (
                                            <>
                                                {showLogo && (
                                                    <div className="flex flex-1">
                                                        {logo ? (
                                                            logo
                                                        ) : (
                                                            <Logo
                                                                brand={logoBrand}
                                                                size="m"
                                                                style="icon-wordmark"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {shouldShowCollapseButton && (
                                                    <Button
                                                        variant="neutral"
                                                        size="small"
                                                        buttonStyle="thematic"
                                                        leadingIcon={<SidebarSimpleIcon size={16} weight="regular" />}
                                                        onClick={handleCollapseToggle}
                                                        aria-label="Collapse sidebar"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Menu sections */}
                                    <div className={menuContainerStyles({ collapsed })}>
                                        {sections.map((section, i) => (
                                            <React.Fragment key={i}>
                                                {i > 0 && <Divider orientation="horizontal" style="intrusion" />}
                                                <div className="flex flex-col items-stretch gap-1 shrink-0 self-stretch">
                                                    {section.header && !collapsed && (
                                                        <div className="px-2 py-1">
                                                            <span
                                                                className="text-b5 uppercase tracking-[0.72px]"
                                                                style={{
                                                                    color: 'var(--color-neutral-text-medium)',
                                                                }}
                                                            >
                                                                {section.header}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col items-stretch gap-1">
                                                        {section.items.map(renderMenuItem)}
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom section */}
                                <div className="flex flex-col items-stretch gap-1.5 shrink-0 pt-4">
                                    <Divider orientation="horizontal" style="intrusion" />
                                    {bottomItems.length > 0 && (
                                        <div className="flex flex-col items-stretch gap-1">
                                            {bottomItems.map(renderMenuItem)}
                                        </div>
                                    )}
                                    {showFeatureCard && (
                                        <SideNavigationFeatureCard
                                            widget={featureCardWidget}
                                            collapsed={collapsed}
                                            upgradeText={featureCardContent}
                                            buttonText={featureCardButtonText}
                                            onButtonClick={onFeatureCardClick}
                                            usageTitle={usageTitle}
                                            usageStatus={usageStatus}
                                            usagePercentage={usagePercentage}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </nav>
                </SideNavigationInternalContext.Provider>
            </SideNavigationProvider>
        );
    };

// Attach sub-components
SideNavigation.Logo = SideNavigationLogo;
SideNavigation.Section = SideNavigationSection;
SideNavigation.Footer = SideNavigationFooter;

export default SideNavigation;
