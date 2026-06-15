'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';

// SSR-safe wrapper: useLayoutEffect warns on the server, so fall back to useEffect
const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { cva } from 'class-variance-authority';
import {
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    User as UserIcon,
    Shield as ShieldIcon,
    CreditCard as CreditCardIcon,
    Envelope as EnvelopeIcon,
    Buildings as BuildingsIcon
} from '@phosphor-icons/react';
import { Logo } from '../Logo/Logo';
import { HorizontalContainerTabs } from '../ContainerTab/HorizontalContainerTabs';
import type { ContainerTabItem } from '../ContainerTab/HorizontalContainerTabs';
import { SearchBar } from '../SearchBar/SearchBar';
import { CompactIconButton } from '../Button/CompactIconButton';
import { NotificationIcon } from '../Notification/NotificationIcon';
import { ProfileDropdown } from '../Menu/ProfileDropdown';
import { BrandIcon } from '../BrandIcon/BrandIcon';
import { ProfileMenu, DEFAULT_PROFILE_MENU_ITEMS, DEFAULT_PROFILE_FOOTER_ITEMS } from '../Menu/ProfileMenu';
import type { ProfileMenuItemConfig } from '../Menu/ProfileMenu';
import { NotificationDropdown, type NotificationData } from '../Notification/NotificationDropdown';
import type { AvatarPerson } from '../Avatar/Avatar';

export const TOPBAR_TYPES = ['default', 'title'] as const;
export const TOPBAR_SEARCH_TYPES = ['bar', 'icon'] as const;

export type TopbarType = (typeof TOPBAR_TYPES)[number];
export type TopbarSearchType = (typeof TOPBAR_SEARCH_TYPES)[number];

// Re-export NotificationData type for consumers
export type { NotificationData };

/**
 * Allowed component types for each slot.
 * 
 * Left Slot:
 * - Logo, BrandIcon, Button, CompactIconButton, Title (text), Breadcrumbs, HorizontalContainerTabs, HorizontalBarTabs
 * 
 * Center Slot:
 * - Title (text), Breadcrumbs, HorizontalContainerTabs, HorizontalBarTabs, SearchBar
 * 
 * Right Slot:
 * - SearchBar, CompactIconButton, Button, ProfileDropdown, NotificationIcon
 */
export type LeftSlotContent = React.ReactNode;
export type CenterSlotContent = React.ReactNode;
export type RightSlotContent = React.ReactNode;

export interface ProfileMenuCallbacks {
    onViewProfile?: () => void;
    onBilling?: () => void;
    onSettings?: () => void;
    onSupport?: () => void;
    onLogout?: () => void;
    onUpgrade?: () => void;
    onSecurity?: () => void;
    onEmail?: () => void;
    onAccount?: () => void;
}

export interface TopNavigationProps {
    type?: TopbarType;
    searchType?: TopbarSearchType;
    tabs?: ContainerTabItem[];
    selectedTabId?: string;
    onTabChange?: (id: string) => void;
    pageTitle?: string;
    userName?: string;
    userEmail?: string;
    userPerson?: AvatarPerson;
    /** Notification data - required for notifications to appear */
    notifications?: NotificationData[];
    /** Callback when a notification is clicked */
    onNotificationClick?: (id: string) => void;
    /** Callback when "Mark all as Read" is clicked */
    onMarkAllAsRead?: () => void;
    /** Callback when "View All" is clicked */
    onViewAll?: () => void;
    notificationSelected?: boolean;
    showBackButton?: boolean;
    showUpgradeButton?: boolean;
    onBackClick?: () => void;
    onSearchClick?: () => void;
    profileMenuCallbacks?: ProfileMenuCallbacks;
    width?: number | string;
    className?: string;
    /**
     * Slot for custom left section content (replaces logo + tabs).
     * Allowed components: Logo, BrandIcon, Button, CompactIconButton, Title (text),
     * Breadcrumbs, HorizontalContainerTabs, HorizontalBarTabs
     */
    leftSlot?: LeftSlotContent;
    /**
     * Slot for custom center section content.
     * Allowed components: Title (text), Breadcrumbs, HorizontalContainerTabs,
     * HorizontalBarTabs, SearchBar
     */
    centerSlot?: CenterSlotContent;
    /**
     * Slot for custom right section content (replaces search, notifications, profile).
     * Allowed components: SearchBar, CompactIconButton, Button, ProfileDropdown, NotificationIcon
     */
    rightSlot?: RightSlotContent;
}

const DEFAULT_TABS: ContainerTabItem[] = [
    { id: 'tab1', label: 'Tab' },
    { id: 'tab2', label: 'Tab' },
    { id: 'tab3', label: 'Tab' },
    { id: 'tab4', label: 'Tab' },
    { id: 'tab5', label: 'Tab' },
];

// CVA for left section gap based on type (visual only)
const leftSectionVariants = cva('flex items-center', {
    variants: {
        type: {
            default: 'gap-6',
            title: 'gap-2',
        },
    },
    defaultVariants: {
        type: 'default',
    },
});

// CVA for overlay dropdown visibility and animation (visual only)
const overlayVariants = cva(
    [
        'absolute z-10',
        'origin-top-right',
        'transition-[opacity,transform] duration-200 ease-out',
    ],
    {
        variants: {
            open: {
                true: 'opacity-100 scale-100 pointer-events-auto visible',
                false: 'opacity-0 scale-[0.98] pointer-events-none invisible',
            },
        },
        defaultVariants: {
            open: false,
        },
    }
);

interface OverlayPosition {
    top: number;
    right: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
    type = 'default',
    searchType = 'bar',
    tabs = DEFAULT_TABS,
    selectedTabId,
    onTabChange,
    pageTitle = 'Page Title',
    userName = 'Adam',
    userEmail = 'adam.smith@outlook.com',
    userPerson = 'adam-smith',
    notifications = [],
    onNotificationClick,
    onMarkAllAsRead,
    onViewAll,
    notificationSelected = false,
    showBackButton = false,
    showUpgradeButton = true,
    onBackClick,
    onSearchClick,
    profileMenuCallbacks = {},
    width = '100%',
    className = '',
    leftSlot,
    centerSlot,
    rightSlot,
}) => {
    // Controlled/uncontrolled tabs pattern
    const isControlled = selectedTabId !== undefined;
    const [internalSelectedTab, setInternalSelectedTab] = useState(tabs[0]?.id || '');

    // Reset internal state when tabs array changes (uncontrolled mode only)
    const tabsKey = useMemo(() => tabs.map(t => t.id).join(','), [tabs]);
    useEffect(() => {
        if (!isControlled && tabs.length > 0) {
            setInternalSelectedTab(tabs[0].id);
        }
    }, [tabsKey, isControlled, tabs]);

    const currentTab = isControlled ? selectedTabId : internalSelectedTab;
    const handleTabChange = useCallback((id: string) => {
        if (!isControlled) {
            setInternalSelectedTab(id);
        }
        onTabChange?.(id);
    }, [isControlled, onTabChange]);

    // Overlay state
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    // Refs for positioning and focus management
    const wrapperRef = useRef<HTMLDivElement>(null);
    const notificationTriggerRef = useRef<HTMLDivElement>(null);
    const profileTriggerRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Dynamic overlay positioning state
    const [notificationPosition, setNotificationPosition] = useState<OverlayPosition>({ top: 64, right: 0 });
    const [profilePosition, setProfilePosition] = useState<OverlayPosition>({ top: 64, right: 0 });

    // Compute if there are any unread notifications
    const hasUnreadNotifications = useMemo(() => {
        return notifications.some(n => n.unread);
    }, [notifications]);

    // Calculate overlay positions from trigger bounds
    const updatePositions = useCallback(() => {
        if (wrapperRef.current) {
            const wrapperRect = wrapperRef.current.getBoundingClientRect();

            if (notificationTriggerRef.current) {
                const triggerRect = notificationTriggerRef.current.getBoundingClientRect();
                setNotificationPosition({
                    top: triggerRect.bottom - wrapperRect.top + 8,
                    right: wrapperRect.right - triggerRect.right,
                });
            }

            if (profileTriggerRef.current) {
                const triggerRect = profileTriggerRef.current.getBoundingClientRect();
                setProfilePosition({
                    top: triggerRect.bottom - wrapperRect.top + 8,
                    right: wrapperRect.right - triggerRect.right,
                });
            }
        }
    }, []);

    // Update positions on mount and when overlays open
    useIsomorphicLayoutEffect(() => {
        updatePositions();
    }, [updatePositions, menuOpen, notificationOpen]);

    // Update positions on resize
    useEffect(() => {
        window.addEventListener('resize', updatePositions);
        return () => window.removeEventListener('resize', updatePositions);
    }, [updatePositions]);

    // Click outside to close menus
    useEffect(() => {
        if (!menuOpen && !notificationOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
                setNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen, notificationOpen]);

    // Escape key handler for accessibility
    useEffect(() => {
        if (!menuOpen && !notificationOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (menuOpen) {
                    setMenuOpen(false);
                    // Return focus to profile trigger
                    const triggerButton = profileTriggerRef.current?.querySelector('button');
                    triggerButton?.focus();
                }
                if (notificationOpen) {
                    setNotificationOpen(false);
                    // Return focus to notification trigger
                    const triggerButton = notificationTriggerRef.current?.querySelector('button');
                    triggerButton?.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [menuOpen, notificationOpen]);

    // Focus management: move focus into dropdown when opened
    useEffect(() => {
        if (notificationOpen && notificationDropdownRef.current) {
            const firstFocusable = notificationDropdownRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }
    }, [notificationOpen]);

    useEffect(() => {
        if (menuOpen && profileMenuRef.current) {
            const firstFocusable = profileMenuRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }
    }, [menuOpen]);

    // Wrap menu callbacks to close menu after action
    const wrapCallback = useCallback((fn?: () => void) => () => {
        fn?.();
        setMenuOpen(false);
    }, []);

    // Handle notification icon click
    const handleNotificationIconClick = useCallback(() => {
        setNotificationOpen(prev => !prev);
        setMenuOpen(false);
    }, []);

    // Handle profile button click
    const handleProfileButtonClick = useCallback(() => {
        setMenuOpen(prev => !prev);
        setNotificationOpen(false);
    }, []);

    // Handle view all - close dropdown and call callback
    const handleViewAll = useCallback(() => {
        setNotificationOpen(false);
        onViewAll?.();
    }, [onViewAll]);

    // Default left section content
    const defaultLeftContent = (
        <div className={leftSectionVariants({ type })}>
            {showBackButton && type === 'title' && (
                <CompactIconButton
                    size="default"
                    variant="subtle"
                    icon={<ArrowLeftIcon size={20} weight="regular" />}
                    onClick={onBackClick}
                    aria-label="Go back"
                />
            )}
            {type === 'title' ? (
                <>
                    <BrandIcon platform="versa-ui" style="brand" size="large" />
                    <span className="text-h6 text-[var(--color-neutral-text-strong)]">
                        {pageTitle}
                    </span>
                </>
            ) : (
                <>
                    <Logo brand="versa-ui" size="s" style="icon-wordmark" />
                    <HorizontalContainerTabs
                        items={tabs}
                        selectedId={currentTab}
                        onChange={handleTabChange}
                        showIcons={false}
                        size="small"
                        variant="neutral"
                    />
                </>
            )}
        </div>
    );

    // Default right section content
    const defaultRightContent = (
        <div className="flex items-center gap-3">
            {searchType === 'bar' ? (
                <div className="w-[200px] shrink-0">
                    <SearchBar size="small" shortcutKey placeholder="Search" />
                </div>
            ) : (
                <div className="flex items-center gap-1.5">
                    <CompactIconButton
                        size="default"
                        variant="subtle"
                        icon={<MagnifyingGlassIcon />}
                        onClick={onSearchClick}
                        aria-label="Search"
                    />
                    <div ref={notificationTriggerRef} className="w-8 h-8 shrink-0">
                        <NotificationIcon
                            notificationDot={hasUnreadNotifications}
                            selected={notificationOpen || notificationSelected}
                            onClick={handleNotificationIconClick}
                            aria-expanded={notificationOpen}
                            aria-haspopup="true"
                        />
                    </div>
                </div>
            )}
            {searchType === 'bar' && (
                <div ref={notificationTriggerRef} className="w-8 h-8 shrink-0">
                    <NotificationIcon
                        notificationDot={hasUnreadNotifications}
                        selected={notificationOpen || notificationSelected}
                        onClick={handleNotificationIconClick}
                        aria-expanded={notificationOpen}
                        aria-haspopup="true"
                    />
                </div>
            )}

            {/* Profile Button */}
            <div ref={profileTriggerRef} className="shrink-0">
                <ProfileDropdown
                    avatarOnly={false}
                    name={userName}
                    person={userPerson}
                    selected={menuOpen}
                    onClick={handleProfileButtonClick}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                />
            </div>
        </div>
    );

    const profileMenuItems = useMemo<ProfileMenuItemConfig[]>(() => [
        { id: 'profile', label: 'Profile Information', icon: React.createElement(UserIcon, { size: 16, weight: 'regular' }) },
        { id: 'security', label: 'Security', icon: React.createElement(ShieldIcon, { size: 16, weight: 'regular' }) },
        { id: 'billing', label: 'Subscription & Billing', icon: React.createElement(CreditCardIcon, { size: 16, weight: 'regular' }) },
        { id: 'email', label: 'Email Preferences', icon: React.createElement(EnvelopeIcon, { size: 16, weight: 'regular' }) },
        { id: 'account', label: 'Account Information', icon: React.createElement(BuildingsIcon, { size: 16, weight: 'regular' }) },
    ], []);

    return (
        <div ref={wrapperRef} className={`relative ${className}`} style={{ width }}>
            <nav
                className="w-full h-16 px-6 md:px-8 py-4 bg-[var(--color-neutral-surface-subtlest)] border-b border-[var(--color-neutral-outline-subtlest)] flex justify-between items-center box-border"
                role="navigation"
                aria-label="Main navigation"
            >
                {/* Left Section (slot or default) */}
                {leftSlot ?? defaultLeftContent}

                {/* Center Section (optional slot) */}
                {centerSlot && (
                    <div className="flex-1 flex justify-center">
                        {centerSlot}
                    </div>
                )}

                {/* Right Section (slot or default) */}
                {rightSlot ?? defaultRightContent}
            </nav>

            {/* Notification Dropdown - positioned relative to trigger */}
            {notifications.length > 0 && (
                <div
                    ref={notificationDropdownRef}
                    className={overlayVariants({ open: notificationOpen })}
                    style={{
                        top: notificationPosition.top,
                        right: notificationPosition.right,
                    }}
                    role="dialog"
                    aria-label="Notifications"
                    aria-modal="true"
                >
                    <NotificationDropdown
                        size="default"
                        notifications={notifications}
                        onNotificationClick={onNotificationClick}
                        onMarkAllAsRead={onMarkAllAsRead}
                        onViewAll={handleViewAll}
                    />
                </div>
            )}

            {/* Profile Menu - positioned relative to trigger */}
            <div
                ref={profileMenuRef}
                className={overlayVariants({ open: menuOpen })}
                style={{
                    top: profilePosition.top,
                    right: profilePosition.right,
                }}
                role="dialog"
                aria-label="Profile menu"
                aria-modal="true"
            >
                <ProfileMenu
                    name={userName}
                    email={userEmail}
                    avatarProps={{ size: 'l', type: 'image', person: userPerson }}
                    upgrade={showUpgradeButton}
                    items={profileMenuItems.map(item => {
                        const callbackMap: Record<string, (() => void) | undefined> = {
                            'profile': profileMenuCallbacks.onViewProfile,
                            'security': profileMenuCallbacks.onSecurity,
                            'billing': profileMenuCallbacks.onBilling,
                            'email': profileMenuCallbacks.onEmail,
                            'account': profileMenuCallbacks.onAccount,
                        };
                        return { ...item, onClick: wrapCallback(callbackMap[item.id]) };
                    })}
                    footerItems={DEFAULT_PROFILE_FOOTER_ITEMS.map(item => ({
                        ...item,
                        onClick: item.id === 'logout' ? wrapCallback(profileMenuCallbacks.onLogout) : item.onClick,
                    }))}
                />
            </div>
        </div>
    );
};

TopNavigation.displayName = 'TopNavigation';
export default TopNavigation;
