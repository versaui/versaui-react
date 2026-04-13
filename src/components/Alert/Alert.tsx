'use client';

import React, { isValidElement, cloneElement, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { InfoIcon, SparkleIcon, XCircleIcon, CheckCircleIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { CompactIconButton } from '../Button/CompactIconButton';

// Types
export const ALERT_SIZES = ['default', 'small'] as const;
export const ALERT_STATES = ['default', 'highlight', 'error', 'success', 'warning'] as const;

export type AlertSize = (typeof ALERT_SIZES)[number];
export type AlertState = (typeof ALERT_STATES)[number];

export interface AlertProps {
    size?: AlertSize;
    state?: AlertState;
    children: ReactNode;
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
        'inline-flex items-center justify-start box-border',
        'shadow-[var(--elevation-small-1-shadow)]',
        'backdrop-blur-[var(--elevation-small-blur)]',
        '-outline-offset-1',
    ],
    {
        variants: {
            size: {
                default: 'py-1 pl-3 pr-1.5 gap-2 rounded-[var(--corner-radius-default-medium)]',
                small: 'py-0 pl-2 pr-1 gap-1.5 rounded-[var(--corner-radius-default-small)]',
            },
            state: {
                default: 'bg-[var(--color-neutral-surface-subtle)] outline outline-1 outline-[var(--color-neutral-outline-subtle)]',
                highlight: 'bg-[var(--color-brand-secondary-subtlest)] outline outline-1 outline-[var(--color-brand-secondary-subtler)]',
                error: 'bg-[var(--color-state-error-subtlest)] outline outline-1 outline-[var(--color-state-error-subtler)]',
                success: 'bg-[var(--color-state-success-subtlest)] outline outline-1 outline-[var(--color-state-success-subtler)]',
                warning: 'bg-[var(--color-state-warning-subtlest)] outline outline-1 outline-[var(--color-state-warning-subtler)]',
            },
            dismissible: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            { size: 'default', dismissible: false, className: 'pr-2' },
            { size: 'small', dismissible: false, className: 'pr-2' },
        ],
        defaultVariants: {
            size: 'default',
            state: 'default',
            dismissible: true,
        },
    }
);

const textWrapperVariants = cva('flex-1 flex items-center justify-start', {
    variants: {
        size: {
            default: 'py-2.5',
            small: 'py-2',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

// Constants
const SIZE_CONFIG: Record<AlertSize, { iconSize: number; closeButtonSize: 'default' | 'small'; textClass: string }> = {
    default: { iconSize: 20, closeButtonSize: 'default', textClass: 'text-b4' },
    small: { iconSize: 16, closeButtonSize: 'small', textClass: 'text-b5' },
};

const STATE_ICON_COLORS: Record<AlertState, string> = {
    default: 'var(--color-neutral-icon-medium)',
    highlight: 'var(--color-brand-secondary-medium)',
    error: 'var(--color-state-error-medium)',
    success: 'var(--color-state-success-medium)',
    warning: 'var(--color-state-warning-medium)',
};

// Icon Helper
const StateIcon: React.FC<{ state: AlertState; size: number; color: string }> = ({ state, size, color }) => {
    const iconProps = { size, weight: 'duotone' as const, color, className: 'block shrink-0' };

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

// Action Enforcer - Ensures design system compliance
// For small alerts: applies LinkButton props (type: 'neutral', size: 'small')
// For default alerts: applies Button props (variant: 'neutral', buttonStyle: 'outline', size: 'small')
function enforceActionProps(action: ReactNode, alertSize: AlertSize): ReactNode {
    if (!isValidElement(action)) return action;

    const props = alertSize === 'small'
        ? { size: 'small', type: 'neutral' }
        : { size: 'small', variant: 'neutral', buttonStyle: 'outline' };

    return cloneElement(action, props as Record<string, unknown>);
}

// Component
export const Alert: React.FC<AlertProps> = ({
    size = 'default',
    state = 'default',
    children,
    action,
    onDismiss,
    dismissible = true,
    showIcon = true,
    icon,
    className,
}) => {
    const config = SIZE_CONFIG[size];
    const iconColor = STATE_ICON_COLORS[state];
    const enforcedAction = action ? enforceActionProps(action, size) : null;

    // Extra right padding when both action and dismiss are hidden (default size only)
    const noButtonsStyle = size === 'default' && !action && !dismissible
        ? { paddingRight: 12 } // 12px to match pl-3
        : undefined;

    // Render custom icon with enforced state-consistent props, or default state icon
    const renderIcon = () => {
        if (!showIcon) return null;
        if (icon && isValidElement(icon)) {
            return cloneElement(icon, {
                size: config.iconSize,
                weight: 'duotone',
                color: iconColor,
                className: 'block shrink-0',
            } as Record<string, unknown>);
        }
        return <StateIcon state={state} size={config.iconSize} color={iconColor} />;
    };

    return (
        <div className={alertVariants({ size, state, dismissible, className })} style={noButtonsStyle}>
            {renderIcon()}

            <div className={textWrapperVariants({ size })}>
                <div className={`flex-1 flex flex-col justify-center text-[var(--color-neutral-text-strong)] break-words ${config.textClass}`}>
                    {children}
                </div>
            </div>

            {enforcedAction}

            {dismissible && (
                <CompactIconButton
                    size={config.closeButtonSize}
                    variant="subtle"
                    icon={<XIcon weight="regular" />}
                    onClick={onDismiss}
                    aria-label="Dismiss"
                />
            )}
        </div>
    );
};

Alert.displayName = 'Alert';

export default Alert;
