'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, AVATAR_PERSONS } from './Avatar';
import { Material } from '../Material/Material';
import type { AvatarSize, AvatarPerson } from './Avatar';

// AvatarGroup supports sizes XXXS through L (not XL or XXL)
export const AVATAR_GROUP_SIZES = ['xxxs', 'xxs', 'xs', 's', 'm', 'l'] as const;
export type AvatarGroupSize = (typeof AVATAR_GROUP_SIZES)[number];

interface AvatarGroupSizeConfig {
    container: number;
    overlap: number;      // Negative margin (~25% of avatar size)
    borderWidth: number;
    fontClass: string;
}

const AVATAR_GROUP_SIZE_CONFIG: Record<AvatarGroupSize, AvatarGroupSizeConfig> = {
    xxxs: { container: 16, overlap: -4, borderWidth: 1, fontClass: 'text-b6' },
    xxs: { container: 20, overlap: -5, borderWidth: 1, fontClass: 'text-b6' },
    xs: { container: 24, overlap: -6, borderWidth: 1.5, fontClass: 'text-h9' },
    s: { container: 32, overlap: -8, borderWidth: 2, fontClass: 'text-h8' },
    m: { container: 40, overlap: -10, borderWidth: 2, fontClass: 'text-h8' },
    l: { container: 48, overlap: -12, borderWidth: 2, fontClass: 'text-h7' },
};

const avatarGroupContainerVariants = cva('flex items-center', {
    variants: {
        size: { xxxs: '', xxs: '', xs: '', s: '', m: '', l: '' },
    },
    defaultVariants: { size: 'm' },
});

export type AvatarGroupContainerVariants = VariantProps<typeof avatarGroupContainerVariants>;

export interface AvatarGroupProps {
    size?: AvatarGroupSize;
    persons?: AvatarPerson[];
    max?: number;
    'aria-label'?: string;
    className?: string;
}

/**
 * Overflow logic: shows +N where N = persons.length - max
 * If persons.length <= max, no overflow is shown.
 */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
    size = 'm',
    persons = AVATAR_PERSONS.slice(0, 5) as AvatarPerson[],
    max = 4,
    'aria-label': ariaLabel,
    className = '',
}) => {
    const config = AVATAR_GROUP_SIZE_CONFIG[size];
    const containerClasses = avatarGroupContainerVariants({ size });

    // Overflow: total - max (e.g., 8 persons with max 4 shows +4)
    const overflowCount = persons.length - max;
    const showOverflow = overflowCount > 0;
    const displayedPersons = showOverflow ? persons.slice(0, max) : persons;

    const groupLabel = ariaLabel || `Group of ${persons.length} avatars`;

    const getAvatarWrapperStyle = (index: number): React.CSSProperties => ({
        marginLeft: index === 0 ? 0 : config.overlap,
        position: 'relative',
        zIndex: index + 1,
    });

    const overflowWrapperStyle: React.CSSProperties = {
        marginLeft: config.overlap,
        position: 'relative',
        zIndex: displayedPersons.length + 1,
    };

    return (
        <div
            className={`${containerClasses} ${className}`}
            role="group"
            aria-label={groupLabel}
        >
            {displayedPersons.map((person, index) => (
                <div key={person} style={getAvatarWrapperStyle(index)}>
                    <Avatar
                        size={size as AvatarSize}
                        type="image"
                        person={person}
                        decorative
                    />
                </div>
            ))}

            {showOverflow && (
                <div style={overflowWrapperStyle}>
                    <Material
                        size="small"
                        elevation="flat"
                        className={`${config.fontClass} rounded-full flex items-center justify-center`}
                        style={{
                            minWidth: config.container,
                            height: config.container,
                            paddingInline: 6,
                            boxSizing: 'border-box',
                            backgroundColor: 'var(--color-neutral-surface-subtle)',
                            color: 'var(--color-neutral-text-medium)',
                            fontWeight: 600,
                        }}
                        aria-label={`${overflowCount} more avatars`}
                    >
                        <span>+{overflowCount}</span>
                    </Material>
                </div>
            )}
        </div>
    );
};

AvatarGroup.displayName = 'AvatarGroup';
export default AvatarGroup;
