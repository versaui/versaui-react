'use client';

import React, { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { LightningIcon } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { CircularProgressBar } from '../ProgressBar/CircularProgressBar';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { useSideNavigationContextSafe } from './SideNavigationContext';

// Types
export type FeatureCardWidget = 'upgrade' | 'usage' | 'custom';

export interface SideNavigationFeatureCardProps {
    /** Widget type: upgrade CTA, usage indicator, or custom content */
    widget?: FeatureCardWidget;
    /** Whether sidebar is collapsed (can be provided via context) */
    collapsed?: boolean;
    /** Upgrade widget text */
    upgradeText?: string;
    /** Button text */
    buttonText?: string;
    /** Button click handler */
    onButtonClick?: () => void;
    /** Usage widget title */
    usageTitle?: string;
    /** Usage widget status text */
    usageStatus?: string;
    /** Usage widget percentage (0-100) */
    usagePercentage?: number;
    /** Custom content for 'custom' widget type */
    customContent?: ReactNode;
    /** Additional className */
    className?: string;
}

// CVA Styles
const featureCardStyles = cva(
    [
        'rounded-lg overflow-hidden',
        'bg-[var(--color-brand-primary-subtlest)]',
        'outline outline-1 outline-offset-[-1px] outline-[var(--color-brand-primary-subtler)]',
        'shadow-[var(--elevation-small-1-shadow)]',
    ],
    {
        variants: {
            collapsed: {
                true: 'w-12',
                false: 'w-full',
            },
            widget: {
                upgrade: '',
                usage: '',
                custom: '',
            },
        },
        compoundVariants: [
            { collapsed: true, widget: 'upgrade', className: 'flex justify-center' },
            { collapsed: true, widget: 'usage', className: 'flex flex-col items-center gap-1.5 py-1.5 px-1' },
            { collapsed: false, className: 'flex flex-col items-stretch gap-3 p-3' },
        ],
        defaultVariants: { collapsed: false, widget: 'upgrade' },
    }
);

const collapsedUpgradeContainerStyles = cva('flex', {
    variants: {
        collapsed: {
            true: 'w-12 justify-center',
            false: 'w-full',
        },
    },
    defaultVariants: { collapsed: false },
});

export type FeatureCardStylesProps = VariantProps<typeof featureCardStyles>;

// Sub-components
interface UpgradeButtonProps {
    text?: string;
    onClick?: () => void;
    fullWidth?: boolean;
    iconOnly?: boolean;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ text, onClick, fullWidth, iconOnly }) => (
    <Button
        variant="primary"
        size="small"
        buttonStyle="thematic"
        leadingIcon={<LightningIcon size={16} weight="regular" />}
        onClick={onClick}
        aria-label={text}
        fullWidth={fullWidth}
    >
        {iconOnly ? undefined : text}
    </Button>
);

// Component
export const SideNavigationFeatureCard: React.FC<SideNavigationFeatureCardProps> = ({
    widget = 'upgrade',
    collapsed: collapsedProp,
    upgradeText = 'Upgrade to Business Plan for more users and projects.',
    buttonText = 'Upgrade Plan',
    onButtonClick,
    usageTitle = "You're almost out of Projects",
    usageStatus = '4/5 Projects',
    usagePercentage = 80,
    customContent,
    className = '',
}) => {
    // Get collapsed from context if not provided as prop
    const context = useSideNavigationContextSafe();
    const collapsed = collapsedProp ?? context?.collapsed ?? false;

    // Custom widget - render custom content
    if (widget === 'custom' && customContent) {
        return (
            <div className={cn(featureCardStyles({ collapsed, widget }), className)}>
                {customContent}
            </div>
        );
    }

    // Collapsed Upgrade - just the button, properly centered
    if (widget === 'upgrade' && collapsed) {
        return (
            <div className={cn(collapsedUpgradeContainerStyles({ collapsed }), className)}>
                <UpgradeButton text={buttonText} onClick={onButtonClick} iconOnly fullWidth />
            </div>
        );
    }

    // Collapsed Usage - circular progress + button, properly centered
    if (widget === 'usage' && collapsed) {
        return (
            <div className={cn(featureCardStyles({ collapsed, widget }), className)}>
                <CircularProgressBar size="small" value={usagePercentage} showLabel />
                <UpgradeButton text={buttonText} onClick={onButtonClick} iconOnly fullWidth />
            </div>
        );
    }

    // Expanded Upgrade
    if (widget === 'upgrade') {
        return (
            <div className={cn(featureCardStyles({ collapsed, widget }), className)}>
                <div className="text-b5 text-[var(--color-neutral-text-strong)]">{upgradeText}</div>
                <UpgradeButton text={buttonText} onClick={onButtonClick} fullWidth />
            </div>
        );
    }

    // Expanded Usage
    return (
        <div className={cn(featureCardStyles({ collapsed, widget }), className)}>
            <div className="flex flex-col gap-2">
                <div className="text-h8 text-[var(--color-neutral-text-strong)]">{usageTitle}</div>
                <div className="flex flex-col gap-1">
                    <ProgressBar size="small" value={usagePercentage} showLabel />
                    <div className="text-b6 text-[var(--color-neutral-text-medium)]">{usageStatus}</div>
                </div>
            </div>
            <UpgradeButton text={buttonText} onClick={onButtonClick} fullWidth />
        </div>
    );
};

export default SideNavigationFeatureCard;
