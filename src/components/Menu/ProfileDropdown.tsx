'use client';

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CaretDownIcon } from '@phosphor-icons/react';
import { Avatar } from '../Avatar/Avatar';
import type { AvatarPerson } from '../Avatar/Avatar';

export const PROFILE_DROPDOWN_STATES = ['default', 'hovered', 'selected'] as const;
export type ProfileDropdownState = (typeof PROFILE_DROPDOWN_STATES)[number];

// CVA for container - handles both avatarOnly variants and states
const containerVariants = cva(
    [
        'inline-flex items-center justify-start',
        'cursor-pointer outline-none',
        'transition-[background-color,border-color] duration-150 ease-out',
        'box-border',
    ],
    {
        variants: {
            avatarOnly: {
                true: 'gap-2 p-0 rounded-full',
                false: 'gap-1.5 py-1 pl-1 pr-1.5 rounded-[var(--corner-radius-thematic-small)]',
            },
            state: {
                default: '',
                hovered: '',
                selected: '',
            },
        },
        compoundVariants: [
            // Avatar Only = true: outline changes, bg stays same
            { avatarOnly: true, state: 'default', className: 'bg-[var(--color-neutral-surface-subtlest)] border border-[var(--color-neutral-outline-subtle)]' },
            { avatarOnly: true, state: 'hovered', className: 'bg-[var(--color-neutral-surface-subtlest)] border border-[var(--color-neutral-outline-strong)]' },
            { avatarOnly: true, state: 'selected', className: 'bg-[var(--color-neutral-surface-subtlest)] border border-[var(--color-neutral-outline-strongest)]' },
            // Avatar Only = false: bg changes on hover, outline subtle or strong
            { avatarOnly: false, state: 'default', className: 'bg-[var(--color-neutral-surface-subtlest)] border border-[var(--color-neutral-outline-subtle)]' },
            { avatarOnly: false, state: 'hovered', className: 'bg-[var(--color-neutral-surface-subtle)] border border-[var(--color-neutral-outline-subtle)]' },
            { avatarOnly: false, state: 'selected', className: 'bg-[var(--color-neutral-surface-subtlest)] border border-[var(--color-neutral-outline-strong)]' },
        ],
        defaultVariants: {
            avatarOnly: false,
            state: 'default',
        },
    }
);

interface ProfileDropdownProps extends VariantProps<typeof containerVariants> {
    /** 
     * Controls selected state. Hover is always handled internally. 
     * When true, shows selected styling. When false/undefined, shows default or hovered based on mouse.
     */
    selected?: boolean;
    avatarOnly?: boolean;
    name?: string;
    person?: AvatarPerson;
    onClick?: () => void;
    className?: string;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
    selected = false,
    avatarOnly = false,
    name = 'Adam',
    person = 'adam-smith',
    onClick,
    className = '',
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Determine visual state
    const state: ProfileDropdownState = selected ? 'selected' : (isHovered ? 'hovered' : 'default');

    return (
        <button
            className={containerVariants({ avatarOnly, state, className })}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            type="button"
        >
            <Avatar
                size={avatarOnly ? 's' : 'xs'}
                type="image"
                person={person}
            />
            {!avatarOnly && (
                <>
                    <span className="text-b4 text-[var(--color-neutral-text-medium)] whitespace-nowrap">
                        {name}
                    </span>
                    <CaretDownIcon
                        size={16}
                        weight="regular"
                        className="text-[var(--color-neutral-icon-medium)]"
                    />
                </>
            )}
        </button>
    );
};
