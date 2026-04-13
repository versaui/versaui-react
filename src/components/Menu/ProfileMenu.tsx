'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { UserCircleIcon, ScrollIcon, GearIcon, QuestionIcon, SignOutIcon, SparkleIcon } from '@phosphor-icons/react';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarPerson } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { MenuItem } from '../Menu/MenuItem';
import { Divider } from '../Divider/Divider';
import { Material } from '../Material/Material';
import { MenuContext } from './Menu';

// ─── Menu Item Configuration ──────────────────────────────────────────────────

export interface ProfileMenuItemConfig {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

/**
 * Default main menu items. Spread, filter, or extend when customising:
 * @example items={[...DEFAULT_PROFILE_MENU_ITEMS, { id: 'analytics', label: 'Analytics' }]}
 * @example items={DEFAULT_PROFILE_MENU_ITEMS.filter(i => i.id !== 'billing')}
 */
export const DEFAULT_PROFILE_MENU_ITEMS: ProfileMenuItemConfig[] = [
    { id: 'view-profile', label: 'View Profile', icon: <UserCircleIcon size={16} weight="regular" /> },
    { id: 'billing', label: 'Subscription & Billing', icon: <ScrollIcon size={16} weight="regular" /> },
    { id: 'settings', label: 'Settings', icon: <GearIcon size={16} weight="regular" /> },
    { id: 'support', label: 'Get Support', icon: <QuestionIcon size={16} weight="regular" /> },
];

/** Default footer items. Pass `footerItems={[]}` to hide. */
export const DEFAULT_PROFILE_FOOTER_ITEMS: ProfileMenuItemConfig[] = [
    { id: 'logout', label: 'Logout', icon: <SignOutIcon size={16} weight="regular" /> },
];

export interface ProfileMenuUpgradeConfig {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface ProfileMenuProps {
    name?: string;
    email?: string;
    person?: AvatarPerson;
    /** Main menu items. Overrides defaults when provided. */
    items?: ProfileMenuItemConfig[];
    /** Footer items below divider. Pass `[]` to hide. */
    footerItems?: ProfileMenuItemConfig[];
    /** Upgrade button. `false` to hide, object to customise. */
    upgrade?: boolean | ProfileMenuUpgradeConfig;
    /** @deprecated Use `items` prop */
    onViewProfile?: () => void;
    /** @deprecated Use `items` prop */
    onBilling?: () => void;
    /** @deprecated Use `items` prop */
    onSettings?: () => void;
    /** @deprecated Use `items` prop */
    onSupport?: () => void;
    /** @deprecated Use `footerItems` prop */
    onLogout?: () => void;
    /** @deprecated Use `upgrade` prop */
    onUpgrade?: () => void;
    /** @deprecated Use `upgrade` prop */
    showUpgradeButton?: boolean;
    className?: string;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
    name = 'Adam Smith',
    email = 'adam.smith@outlook.com',
    person = 'adam-smith',
    items,
    footerItems,
    upgrade,
    showUpgradeButton,
    onViewProfile,
    onBilling,
    onSettings,
    onSupport,
    onLogout,
    onUpgrade,
    className = '',
}) => {
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const itemsRef = useRef<Map<string, HTMLElement>>(new Map());
    const menuRef = useRef<HTMLDivElement>(null);

    // ── Resolve items ─────────────────────────────────────────────────────
    const resolvedItems: ProfileMenuItemConfig[] = items ?? [
        { ...DEFAULT_PROFILE_MENU_ITEMS[0], onClick: onViewProfile },
        { ...DEFAULT_PROFILE_MENU_ITEMS[1], onClick: onBilling },
        { ...DEFAULT_PROFILE_MENU_ITEMS[2], onClick: onSettings },
        { ...DEFAULT_PROFILE_MENU_ITEMS[3], onClick: onSupport },
    ];

    const resolvedFooter: ProfileMenuItemConfig[] = footerItems ?? [
        { ...DEFAULT_PROFILE_FOOTER_ITEMS[0], onClick: onLogout },
    ];

    // Combined list for keyboard navigation across both sections
    const allItems = useMemo(
        () => [...resolvedItems, ...resolvedFooter],
        [resolvedItems, resolvedFooter]
    );

    // ── Resolve upgrade button ────────────────────────────────────────────
    let showUpgrade = true;
    let upgradeLabel = 'Upgrade Plan';
    let upgradeIcon: React.ReactNode = <SparkleIcon size={16} weight="regular" />;
    let upgradeOnClick = onUpgrade;

    if (upgrade === false) {
        showUpgrade = false;
    } else if (upgrade === true || upgrade === undefined) {
        if (showUpgradeButton === false) showUpgrade = false;
    } else if (typeof upgrade === 'object') {
        showUpgrade = true;
        if (upgrade.label) upgradeLabel = upgrade.label;
        if (upgrade.icon) upgradeIcon = upgrade.icon;
        if (upgrade.onClick) upgradeOnClick = upgrade.onClick;
    }

    const hasItems = resolvedItems.length > 0;
    const hasFooter = resolvedFooter.length > 0;

    // ── Keyboard navigation (ArrowUp/Down/Home/End) ───────────────────────
    const registerItem = useCallback((id: string, ref: HTMLElement | null) => {
        if (ref) itemsRef.current.set(id, ref);
    }, []);

    const unregisterItem = useCallback((id: string) => {
        itemsRef.current.delete(id);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        const ids = allItems
            .map(i => i.id)
            .filter(id => {
                const el = itemsRef.current.get(id);
                return el && el.getAttribute('aria-disabled') !== 'true';
            });

        if (ids.length === 0) return;
        const currentIndex = focusedId ? ids.indexOf(focusedId) : -1;

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                const next = currentIndex < ids.length - 1 ? currentIndex + 1 : 0;
                setFocusedId(ids[next]);
                itemsRef.current.get(ids[next])?.focus();
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const prev = currentIndex > 0 ? currentIndex - 1 : ids.length - 1;
                setFocusedId(ids[prev]);
                itemsRef.current.get(ids[prev])?.focus();
                break;
            }
            case 'Home': {
                e.preventDefault();
                setFocusedId(ids[0]);
                itemsRef.current.get(ids[0])?.focus();
                break;
            }
            case 'End': {
                e.preventDefault();
                const last = ids[ids.length - 1];
                setFocusedId(last);
                itemsRef.current.get(last)?.focus();
                break;
            }
        }
    }, [allItems, focusedId]);

    const contextValue = useMemo(() => ({
        registerItem,
        unregisterItem,
        focusedId,
        setFocusedId,
    }), [registerItem, unregisterItem, focusedId]);

    return (
        <MenuContext.Provider value={contextValue}>
            <Material
                size="medium"
                elevation="floating"
                className={`w-[280px] p-3 inline-flex flex-col items-center self-start gap-3 ${className}`}
                role="menu"
                aria-label={`${name} profile menu`}
            >
                {/* Profile header */}
                <div className="self-stretch pt-1.5 flex flex-col items-center gap-3" role="presentation">
                    <Avatar size="l" type="image" person={person} />
                    <div className="self-stretch flex flex-col items-start gap-1">
                        <span className="text-h7 self-stretch text-center text-[var(--color-neutral-text-strong)]">
                            {name}
                        </span>
                        <span className="text-b4 self-stretch text-center text-[var(--color-neutral-text-medium)]">
                            {email}
                        </span>
                    </div>
                </div>

                {(showUpgrade || hasItems || hasFooter) && (
                    <Divider orientation="horizontal" style="intrusion" />
                )}

                {showUpgrade && (
                    <Button
                        variant="primary"
                        buttonStyle="thematic"
                        size="small"
                        leadingIcon={upgradeIcon}
                        onClick={upgradeOnClick}
                        fullWidth
                    >
                        {upgradeLabel}
                    </Button>
                )}

                {/* Menu items — keyboard nav spans main + footer items */}
                {(hasItems || hasFooter) && (
                    <div
                        ref={menuRef}
                        onKeyDown={handleKeyDown}
                        className="self-stretch flex flex-col gap-1"
                    >
                        {resolvedItems.map((item) => (
                            <MenuItem
                                key={item.id}
                                size="default"
                                leadingItem={item.icon ? 'icon' : 'none'}
                                leadingIcon={item.icon}
                                onClick={item.onClick}
                            >
                                {item.label}
                            </MenuItem>
                        ))}

                        {hasFooter && hasItems && (
                            <div className="py-1" role="separator">
                                <Divider orientation="horizontal" style="intrusion" />
                            </div>
                        )}

                        {resolvedFooter.map((item) => (
                            <MenuItem
                                key={item.id}
                                size="default"
                                leadingItem={item.icon ? 'icon' : 'none'}
                                leadingIcon={item.icon}
                                onClick={item.onClick}
                            >
                                {item.label}
                            </MenuItem>
                        ))}
                    </div>
                )}
            </Material>
        </MenuContext.Provider>
    );
};

ProfileMenu.displayName = 'ProfileMenu';

export default ProfileMenu;
