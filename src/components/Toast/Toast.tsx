'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InfoIcon, SparkleIcon, XCircleIcon, CheckCircleIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { LinkButton } from '../Button/LinkButton';
import { CompactIconButton } from '../Button/CompactIconButton';

export const TOAST_SIZES = ['default', 'small'] as const;
export const TOAST_STATES = ['default', 'highlight', 'error', 'success', 'warning'] as const;

export type ToastSize = (typeof TOAST_SIZES)[number];
export type ToastState = (typeof TOAST_STATES)[number];

export interface ToastProps {
    size?: ToastSize;
    state?: ToastState;
    message?: string;
    buttonText?: string;
    onButtonClick?: () => void;
    onClose?: () => void;
    showButton?: boolean;
    showCloseIcon?: boolean;
    className?: string;
    /** Auto-dismiss duration in milliseconds. Set to 0 to disable. Default: 5000 */
    duration?: number;
    /** Whether the toast is visible. Controlled mode. */
    visible?: boolean;
}

// Size configurations - matches Alert component paddings/gaps
const SIZE_CONFIG: Record<ToastSize, {
    width: number;
    padding: { left: number; right: number };
    gap: number;
    borderRadius: number;
    boxShadow: string;
    blurToken: string;
    iconSize: number;
    closeButtonSize: 'default' | 'small';
    textClass: string;
    textPadding: { vertical: number };
}> = {
    default: {
        width: 560,
        padding: { left: 12, right: 6 },
        gap: 8,
        borderRadius: 8,
        boxShadow: 'var(--elevation-medium-3-shadow)',
        blurToken: 'var(--elevation-medium-blur)',
        iconSize: 20,
        closeButtonSize: 'default',
        textClass: 'text-b4',
        textPadding: { vertical: 10 },
    },
    small: {
        width: 480,
        padding: { left: 8, right: 4 },
        gap: 6,
        borderRadius: 4,
        boxShadow: 'var(--elevation-small-3-shadow)',
        blurToken: 'var(--elevation-small-blur)',
        iconSize: 16,
        closeButtonSize: 'small',
        textClass: 'text-b5',
        textPadding: { vertical: 8 },
    },
};

// State configurations
const STATE_STYLES: Record<ToastState, {
    background: string;
    iconColor: string;
}> = {
    default: {
        background: 'var(--color-neutral-surface-inverse)',
        iconColor: 'var(--color-neutral-icon-inverse)',
    },
    highlight: {
        background: 'var(--color-brand-secondary-stronger)',
        iconColor: 'var(--color-brand-secondary-subtlest)',
    },
    error: {
        background: 'var(--color-state-error-stronger)',
        iconColor: 'var(--color-state-error-subtlest)',
    },
    success: {
        background: 'var(--color-state-success-stronger)',
        iconColor: 'var(--color-state-success-subtlest)',
    },
    warning: {
        background: 'var(--color-state-warning-stronger)',
        iconColor: 'var(--color-state-warning-subtlest)',
    },
};

// Default messages per state
const DEFAULT_MESSAGES: Record<ToastState, string> = {
    default: 'This is a general notification to keep you updated.',
    highlight: 'A new feature is now available! Explore it in your settings.',
    error: 'Something went wrong. Please check your input and try again.',
    success: 'Your action was successful! Changes have been saved.',
    warning: 'Be cautious! This action might have unintended consequences.',
};

// Get the appropriate icon for each state
const getStateIcon = (state: ToastState, size: number, color: string): React.ReactNode => {
    const iconStyle = { display: 'block', flexShrink: 0 };

    switch (state) {
        case 'default':
            return <InfoIcon size={size} weight="duotone" color={color} style={iconStyle} />;
        case 'highlight':
            return <SparkleIcon size={size} weight="duotone" color={color} style={iconStyle} />;
        case 'error':
            return <XCircleIcon size={size} weight="duotone" color={color} style={iconStyle} />;
        case 'success':
            return <CheckCircleIcon size={size} weight="duotone" color={color} style={iconStyle} />;
        case 'warning':
            return <WarningIcon size={size} weight="duotone" color={color} style={iconStyle} />;
        default:
            return null;
    }
};

// CSS keyframes for animations (injected once)
const ANIMATION_STYLES = `
@keyframes toast-slide-in {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes toast-slide-out {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(100%);
        opacity: 0;
    }
}

/* Toast close button - inverse colors with hover state override */
.toast-close-button {
    color: var(--color-neutral-icon-inverse) !important;
}
.toast-close-button:hover {
    background: var(--color-neutral-surface-inverse) !important;
}
`;

// Inject styles once
let stylesInjected = false;
const injectStyles = () => {
    if (stylesInjected || typeof document === 'undefined') return;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = ANIMATION_STYLES;
    document.head.appendChild(styleSheet);
    stylesInjected = true;
};

export const Toast: React.FC<ToastProps> = ({
    size = 'default',
    state = 'default',
    message,
    buttonText = 'Button',
    onButtonClick,
    onClose,
    showButton = true,
    showCloseIcon = true,
    className = '',
    duration = 5000,
    visible = true,
}) => {
    const [isVisible, setIsVisible] = useState(visible);
    const [isExiting, setIsExiting] = useState(false);

    // Inject animation styles
    useEffect(() => {
        injectStyles();
    }, []);

    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        // Wait for exit animation to complete
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    }, [onClose]);

    // Sync with controlled visible prop
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setIsExiting(false);
        } else {
            handleDismiss();
        }
    }, [visible, handleDismiss]);

    // Auto-dismiss timer
    useEffect(() => {
        if (duration > 0 && isVisible && !isExiting) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, isVisible, isExiting, handleDismiss]);

    const handleClose = () => {
        handleDismiss();
    };

    if (!isVisible) return null;

    const sizeConfig = SIZE_CONFIG[size];
    const stateStyles = STATE_STYLES[state];
    const displayMessage = message || DEFAULT_MESSAGES[state];

    // Determine right padding based on showCloseIcon (matches Alert dismissible logic)
    const paddingRight = showCloseIcon ? sizeConfig.padding.right : sizeConfig.padding.left;

    // Container styles with animation
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: sizeConfig.width,
        paddingLeft: sizeConfig.padding.left,
        paddingRight: paddingRight,
        backgroundColor: stateStyles.background,
        borderRadius: sizeConfig.borderRadius,
        boxShadow: `${sizeConfig.boxShadow}, 0 0 0 1.5px rgba(0, 0, 0, 0.1)`,
        gap: sizeConfig.gap,
        boxSizing: 'border-box',
        backdropFilter: `blur(${sizeConfig.blurToken})`,
        WebkitBackdropFilter: `blur(${sizeConfig.blurToken})`,
        animation: isExiting
            ? 'toast-slide-out 0.3s ease-in forwards'
            : 'toast-slide-in 0.3s ease-out forwards',
    };

    // Text wrapper styles
    const textWrapperStyle: React.CSSProperties = {
        flex: '1 1 0',
        paddingTop: sizeConfig.textPadding.vertical,
        paddingBottom: sizeConfig.textPadding.vertical,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
    };

    // Text styles
    const textStyle: React.CSSProperties = {
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'var(--color-neutral-text-inverse)',
        wordWrap: 'break-word',
    };



    return (
        <div className={className} style={containerStyle}>
            {/* State Icon */}
            {getStateIcon(state, sizeConfig.iconSize, stateStyles.iconColor)}

            {/* Text */}
            <div style={textWrapperStyle}>
                <div className={sizeConfig.textClass} style={textStyle}>{displayMessage}</div>
            </div>

            {/* Link Button */}
            {showButton && (
                <LinkButton
                    size={size === 'default' ? 'default' : 'small'}
                    type="neutral"
                    onClick={onButtonClick as unknown as (e: React.MouseEvent<HTMLAnchorElement>) => void}
                    style={{ color: 'var(--color-neutral-text-inverse)' }}
                >
                    {buttonText}
                </LinkButton>
            )}

            {/* Close Icon - CompactIconButton with inverse colors */}
            {showCloseIcon && (
                <CompactIconButton
                    size={sizeConfig.closeButtonSize}
                    variant="subtle"
                    icon={<XIcon weight="regular" />}
                    onClick={handleClose}
                    aria-label="Close"
                    className="toast-close-button"
                />
            )}
        </div>
    );
};

Toast.displayName = 'Toast';

// ToastContainer - Helper component for positioning toasts at bottom center
export interface ToastContainerProps {
    children: React.ReactNode;
    /** Bottom offset in pixels. Default: 24 */
    bottomOffset?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    children,
    bottomOffset = 24
}) => {
    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: bottomOffset,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
    };

    const childWrapperStyle: React.CSSProperties = {
        pointerEvents: 'auto',
    };

    return (
        <div style={containerStyle}>
            {React.Children.map(children, (child) => (
                <div style={childWrapperStyle}>{child}</div>
            ))}
        </div>
    );
};

ToastContainer.displayName = 'ToastContainer';

export default Toast;
