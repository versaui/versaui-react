'use client';

import React, { isValidElement, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { InfoIcon, SparkleIcon, XCircleIcon, CheckCircleIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { CompactButton } from '../Button/CompactButton';

// Types
export const ALERT_SIZES = ['default', 'small'] as const;
export const ALERT_STYLES = ['simple', 'expressive'] as const;
export const ALERT_STATES = ['default', 'highlight', 'error', 'success', 'warning'] as const;

export type AlertSize = (typeof ALERT_SIZES)[number];
export type AlertStyle = (typeof ALERT_STYLES)[number];
export type AlertState = (typeof ALERT_STATES)[number];

export interface AlertProps {
    size?: AlertSize;
    style?: AlertStyle;
    variant?: AlertStyle;
    state?: AlertState;
    title?: ReactNode;
    description?: ReactNode | boolean;
    children?: ReactNode;
    action?: ReactNode;
    onDismiss?: () => void;
    dismissible?: boolean;
    showIcon?: boolean;
    /** Custom icon element. Replaces the default state icon while preserving state-consistent size, color, and weight. */
    icon?: React.ReactElement;
    className?: string;
}

// CVA Variants
const alertVariants = cva(
    [
        'inline-flex items-center justify-start box-border relative overflow-hidden w-full',
        'backdrop-blur-[var(--elevation-small-blur)]',
        '-outline-offset-1',
    ],
    {
        variants: {
            size: {
                default: 'max-w-[520px] py-2 pl-3 pr-1.5 gap-2 rounded-[var(--corner-radius-default-medium)]',
                small: 'max-w-[480px] py-1.5 pl-2 pr-1 gap-1.5 rounded-[var(--corner-radius-default-small)]',
            },
            style: {
                simple: '',
                expressive: '',
            },
            state: {
                default: '',
                highlight: '',
                error: '',
                success: '',
                warning: '',
            },
            dismissible: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            // Simple style background, outline, shadow
            { style: 'simple', size: 'default', class: 'shadow-[var(--elevation-medium-1-shadow)]' },
            { style: 'simple', size: 'small', class: 'shadow-[var(--elevation-small-1-shadow)]' },
            { style: 'simple', state: 'default', class: 'bg-[var(--color-neutral-surface-subtle)] outline outline-1 outline-[var(--color-neutral-outline-subtle)]' },
            { style: 'simple', state: 'highlight', class: 'bg-[var(--color-brand-secondary-subtlest)] outline outline-1 outline-[var(--color-brand-secondary-subtler)]' },
            { style: 'simple', state: 'error', class: 'bg-[var(--color-state-error-subtlest)] outline outline-1 outline-[var(--color-state-error-subtler)]' },
            { style: 'simple', state: 'success', class: 'bg-[var(--color-state-success-subtlest)] outline outline-1 outline-[var(--color-state-success-subtler)]' },
            { style: 'simple', state: 'warning', class: 'bg-[var(--color-state-warning-subtlest)] outline outline-1 outline-[var(--color-state-warning-subtler)]' },

            // Expressive style using composite fill & outline gradient tokens (top-middle-bottom)
            { style: 'expressive', size: 'default', class: 'shadow-[var(--expressive-inset-subtle-medium)]' },
            { style: 'expressive', size: 'small', class: 'shadow-[var(--expressive-inset-subtle-small)]' },
            {
                style: 'expressive',
                state: 'default',
                class: 'border border-transparent [background:var(--gradient-expressive-fill-neutral)_padding-box,var(--gradient-expressive-outline-neutral)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                state: 'highlight',
                class: 'border border-transparent [background:var(--gradient-expressive-fill-secondary-subtle)_padding-box,var(--gradient-expressive-outline-secondary-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                state: 'error',
                class: 'border border-transparent [background:var(--gradient-expressive-fill-error-subtle)_padding-box,var(--gradient-expressive-outline-error-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                state: 'success',
                class: 'border border-transparent [background:var(--gradient-expressive-fill-success-subtle)_padding-box,var(--gradient-expressive-outline-success-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },
            {
                style: 'expressive',
                state: 'warning',
                class: 'border border-transparent [background:var(--gradient-expressive-fill-warning-subtle)_padding-box,var(--gradient-expressive-outline-warning-subtle)_border-box] [background-origin:border-box] [background-clip:padding-box,border-box]',
            },

            { size: 'default', dismissible: false, class: 'pr-3' },
            { size: 'small', dismissible: false, class: 'pr-2' },
        ],
        defaultVariants: {
            size: 'default',
            style: 'simple',
            state: 'default',
            dismissible: true,
        },
    }
);

const textWrapperVariants = cva('flex-1 flex items-center justify-start min-w-0 px-1 z-10', {
    variants: {
        size: {
            default: 'min-h-[28px]',
            small: 'min-h-[24px]',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

// Constants
const SIZE_CONFIG: Record<AlertSize, { iconSize: number; closeButtonSize: 'default' | 'small'; textClass: string; titleClass: string; descriptionClass: string }> = {
    default: { iconSize: 20, closeButtonSize: 'default', textClass: 'text-b4', titleClass: 'text-h8', descriptionClass: 'text-b4' },
    small: { iconSize: 16, closeButtonSize: 'small', textClass: 'text-b5', titleClass: 'text-h9', descriptionClass: 'text-b5' },
};

const STATE_ICON_COLORS: Record<AlertStyle, Record<AlertState, string>> = {
    simple: {
        default: 'var(--color-neutral-icon-strong)',
        highlight: 'var(--color-brand-secondary-strong)',
        error: 'var(--color-state-error-strong)',
        success: 'var(--color-state-success-strong)',
        warning: 'var(--color-state-warning-strong)',
    },
    expressive: {
        default: 'var(--color-neutral-icon-strong)',
        highlight: 'var(--color-brand-secondary-strong)',
        error: 'var(--color-state-error-strong)',
        success: 'var(--color-state-success-strong)',
        warning: 'var(--color-state-warning-strong)',
    },
};

const DEFAULT_TEXTS: Record<AlertState, { title: string; description: string }> = {
    default: {
        title: 'General notification',
        description: 'This is a general notification to keep you updated.',
    },
    highlight: {
        title: 'New feature available',
        description: 'A new feature is now available! Explore it in settings.',
    },
    error: {
        title: 'Something went wrong',
        description: 'Please check your input and try again.',
    },
    success: {
        title: 'Action successful',
        description: 'Your action has been completed successfully.',
    },
    warning: {
        title: 'Caution required',
        description: 'Please review this action before proceeding.',
    },
};

// Icon Helper
const StateIcon: React.FC<{ state: AlertState; size: number; color: string; weight: 'regular' | 'duotone' }> = ({ state, size, color, weight }) => {
    const iconProps = { size, weight, color, className: 'block shrink-0 z-10' };

    switch (state) {
        case 'default':
            return <InfoIcon {...iconProps} />;
        case 'highlight':
            return <SparkleIcon {...iconProps} />;
        case 'error':
            return <XCircleIcon {...iconProps} />;
        case 'success':
            return <CheckCircleIcon {...iconProps} />;
        case 'warning':
            return <WarningIcon {...iconProps} />;
        default:
            return null;
    }
};

// Action Enforcer - Enforces Button for default size and CompactButton for small size
function enforceActionProps(action: ReactNode, alertSize: AlertSize): ReactNode {
    if (!action) return null;

    if (alertSize === 'small') {
        if (isValidElement(action)) {
            const childProps = action.props as Record<string, any>;
            const textContent = childProps.children ?? action;
            return (
                <CompactButton
                    size="small"
                    variant="outline"
                    onClick={childProps.onClick}
                >
                    {textContent}
                </CompactButton>
            );
        }
        return (
            <CompactButton size="small" variant="outline">
                {action}
            </CompactButton>
        );
    }

    if (isValidElement(action)) {
        const childProps = action.props as Record<string, any>;
        return (
            <Button
                size="small"
                variant="neutral"
                buttonStyle="outline"
                onClick={childProps.onClick}
            >
                {childProps.children ?? action}
            </Button>
        );
    }

    return (
        <Button size="small" variant="neutral" buttonStyle="outline">
            {action}
        </Button>
    );
}

// Component
export const Alert: React.FC<AlertProps> = ({
    size = 'default',
    style,
    variant,
    state = 'default',
    title,
    description,
    children,
    action,
    onDismiss,
    dismissible = true,
    showIcon = true,
    icon,
    className,
}) => {
    const activeStyle: AlertStyle = style || variant || 'simple';
    const config = SIZE_CONFIG[size];
    const iconColor = STATE_ICON_COLORS[activeStyle][state];
    const iconWeight: 'regular' | 'duotone' = activeStyle === 'expressive' ? 'duotone' : 'regular';
    const enforcedAction = action ? enforceActionProps(action, size) : null;

    // Extra right padding when both action and dismiss are hidden (default size only)
    const noButtonsStyle = size === 'default' && !action && !dismissible
        ? { paddingRight: 12 }
        : undefined;

    // Resolving title and description text
    const defaultText = DEFAULT_TEXTS[state];
    const hasExplicitTitle = title !== undefined && title !== null;
    const hasExplicitDesc = description !== undefined && description !== null && description !== false;

    const displayTitle = hasExplicitTitle
        ? title
        : (hasExplicitDesc ? defaultText.title : null);

    const displayDescription: ReactNode = typeof description === 'boolean'
        ? (description ? defaultText.description : null)
        : (description ?? (hasExplicitTitle ? children : null));

    const contentOnly = !displayTitle && !displayDescription ? children : null;

    // Render custom icon with enforced state-consistent props, or default state icon
    const renderIcon = () => {
        if (!showIcon) return null;
        if (icon && isValidElement(icon)) {
            return React.cloneElement(icon, {
                size: config.iconSize,
                weight: iconWeight,
                color: iconColor,
                className: 'block shrink-0 z-10',
            } as Record<string, unknown>);
        }
        return <StateIcon state={state} size={config.iconSize} color={iconColor} weight={iconWeight} />;
    };

    return (
        <div className={alertVariants({ size, style: activeStyle, state, dismissible, className })} style={noButtonsStyle}>
            {renderIcon()}

            <div className={textWrapperVariants({ size })}>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    {displayTitle && (
                        <div className={`${config.titleClass} font-semibold text-[var(--color-neutral-text-strong)] leading-snug break-words`}>
                            {displayTitle}
                        </div>
                    )}
                    {displayDescription && (
                        <div className={`${config.descriptionClass} font-normal text-[var(--color-neutral-text-medium)] leading-snug break-words ${displayTitle ? 'mt-[var(--spacing-1,2px)]' : ''}`}>
                            {displayDescription}
                        </div>
                    )}
                    {contentOnly && (
                        <div className={`text-[var(--color-neutral-text-strong)] break-words ${config.textClass}`}>
                            {contentOnly}
                        </div>
                    )}
                </div>
            </div>

            {enforcedAction && (
                <div className="relative z-10 shrink-0 flex items-center justify-center self-center">
                    {enforcedAction}
                </div>
            )}

            {dismissible && (
                <div className="relative z-10 shrink-0 flex items-center justify-center self-center">
                    <CompactButton
                        size={config.closeButtonSize}
                        variant="subtle"
                        icon={<XIcon weight="regular" />}
                        onClick={onDismiss}
                        aria-label="Dismiss"
                    />
                </div>
            )}
        </div>
    );
};

Alert.displayName = 'Alert';

export default Alert;
