'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Info as InfoIcon,
    Sparkle as SparkleIcon,
    XCircle as XCircleIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    X as XIcon,
} from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { CompactButton } from '../Button/CompactButton';
import { Material, type MaterialSize } from '../Material/Material';

export const TOAST_SIZES = ['default', 'small'] as const;
export const TOAST_STYLES = ['simple', 'expressive'] as const;
export const TOAST_STATES = ['default', 'highlight', 'error', 'success', 'warning'] as const;
export const TOAST_POSITIONS = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'] as const;

export type ToastSize = (typeof TOAST_SIZES)[number];
export type ToastStyle = (typeof TOAST_STYLES)[number];
export type ToastState = (typeof TOAST_STATES)[number];
export type ToastPosition = (typeof TOAST_POSITIONS)[number];

export interface ToastProps {
    /** Size of the toast container. Default: 'default' */
    size?: ToastSize;
    /** Visual style treatment: 'simple' (solid surface) or 'expressive' (gradient surface). Default: 'simple' */
    style?: ToastStyle;
    /** Semantic state controlling color scheme and icon. Default: 'default' */
    state?: ToastState;
    /** Primary title text or ReactNode */
    title?: React.ReactNode;
    /** Secondary description text, ReactNode, or boolean to toggle default description */
    description?: React.ReactNode | boolean;
    /** Backward compatible message prop. Acts as primary text when title is not provided */
    message?: string;
    /** State icon visibility or custom icon node. Default: true */
    icon?: boolean | React.ReactNode;
    /** Custom default state icon */
    defaultIcon?: React.ReactNode;
    /** Custom highlight state icon */
    highlightIcon?: React.ReactNode;
    /** Custom error state icon */
    errorIcon?: React.ReactNode;
    /** Custom success state icon */
    successIcon?: React.ReactNode;
    /** Custom warning state icon */
    warningIcon?: React.ReactNode;
    /** Action button visibility. Default: true */
    button?: boolean;
    /** Alias for button prop */
    showButton?: boolean;
    /** Action button label */
    buttonText?: string;
    /** Action button click handler */
    onButtonClick?: () => void;
    /** Close icon button visibility. Default: true */
    dismissible?: boolean;
    /** Alias for dismissible prop */
    showCloseIcon?: boolean;
    /** Dismiss/close handler */
    onClose?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Auto-dismiss duration in milliseconds. Set to 0 to disable. Default: 5000 */
    duration?: number;
    /** Controlled visibility state */
    visible?: boolean;
}

// Default text and labels per state matching design system
const DEFAULT_TEXTS: Record<ToastState, { title: string; description: string; buttonText: string }> = {
    default: {
        title: 'General notification',
        description: 'This is a general notification to keep you updated.',
        buttonText: 'Dismiss',
    },
    highlight: {
        title: 'New feature available',
        description: 'A new feature is now available! Explore it in settings.',
        buttonText: 'Explore',
    },
    error: {
        title: 'Something went wrong',
        description: 'Please check your input and try again.',
        buttonText: 'Retry',
    },
    success: {
        title: 'Action successful',
        description: 'Your action has been completed successfully.',
        buttonText: 'Undo',
    },
    warning: {
        title: 'Caution required',
        description: 'Please review this action before proceeding.',
        buttonText: 'Review',
    },
};

// Layout and sizing tokens per size variant
const SIZE_TOKENS: Record<ToastSize, {
    widthClass: string;
    paddingClass: string;
    noIconPaddingClass: string;
    gapClass: string;
    borderRadiusToken: string;
    iconSize: number;
    titleClass: string;
    descriptionClass: string;
    simpleShadowToken: string;
    expressiveShadowToken: string;
    expressiveInsetShadow: string;
    compactButtonSize: 'default' | 'small';
    materialSize: MaterialSize;
}> = {
    default: {
        widthClass: 'w-full max-w-[520px]',
        paddingClass: 'pl-[var(--spacing-5)] pr-[var(--spacing-5)] py-[var(--spacing-4)]',
        noIconPaddingClass: 'pl-[var(--spacing-6)] pr-[var(--spacing-5)] py-[var(--spacing-4)]',
        gapClass: 'gap-[var(--spacing-4)]',
        borderRadiusToken: 'var(--corner-radius-control-large)',
        iconSize: 20,
        titleClass: 'text-h8',
        descriptionClass: 'text-b4',
        simpleShadowToken: 'var(--elevation-medium-3-shadow)',
        expressiveShadowToken: 'var(--expressive-inset-subtle-medium)',
        expressiveInsetShadow: 'inset 0px var(--effects-expressive-inset-inner-shadow-y-top-medium, 2px) var(--effects-expressive-inset-inner-shadow-blur-medium, 1px) 0px var(--effects-expressive-inset-inner-shadow-color-top-subtle, rgba(255, 255, 255, 0.96)), inset 0px var(--effects-expressive-inset-inner-shadow-y-bottom-medium, -2px) var(--effects-expressive-inset-inner-shadow-blur-medium, 1px) 0px var(--effects-expressive-inset-inner-shadow-color-bottom-subtle, rgba(0, 0, 0, 0.1))',
        compactButtonSize: 'default',
        materialSize: 'medium',
    },
    small: {
        widthClass: 'w-full max-w-[480px]',
        paddingClass: 'pl-[var(--spacing-4)] pr-[var(--spacing-4)] py-[var(--spacing-3)]',
        noIconPaddingClass: 'pl-[var(--spacing-5)] pr-[var(--spacing-4)] py-[var(--spacing-3)]',
        gapClass: 'gap-[var(--spacing-3)]',
        borderRadiusToken: 'var(--corner-radius-control-medium)',
        iconSize: 16,
        titleClass: 'text-h9',
        descriptionClass: 'text-b5',
        simpleShadowToken: 'var(--elevation-small-3-shadow)',
        expressiveShadowToken: 'var(--expressive-inset-subtle-small)',
        expressiveInsetShadow: 'inset 0px var(--effects-expressive-inset-inner-shadow-y-top-small, 1.5px) var(--effects-expressive-inset-inner-shadow-blur-small, 1px) 0px var(--effects-expressive-inset-inner-shadow-color-top-subtle, rgba(255, 255, 255, 0.96)), inset 0px var(--effects-expressive-inset-inner-shadow-y-bottom-small, -1.5px) var(--effects-expressive-inset-inner-shadow-blur-small, 1px) 0px var(--effects-expressive-inset-inner-shadow-color-bottom-subtle, rgba(0, 0, 0, 0.1))',
        compactButtonSize: 'small',
        materialSize: 'small',
    },
};

// State icons helper
const getStateIcon = (
    state: ToastState,
    size: number,
    color: string,
    customIcon?: React.ReactNode,
    weight: 'duotone' | 'regular' = 'regular'
): React.ReactNode => {
    if (customIcon) {
        if (React.isValidElement(customIcon)) {
            return React.cloneElement(customIcon as React.ReactElement, {
                size: (customIcon.props as any).size ?? size,
                weight: (customIcon.props as any).weight ?? weight,
                color: (customIcon.props as any).color ?? color,
                style: { display: 'block', flexShrink: 0, ...(customIcon.props as any).style },
            } as any);
        }
        return customIcon;
    }

    const iconStyle = { display: 'block', flexShrink: 0 };

    switch (state) {
        case 'default':
            return <InfoIcon size={size} weight={weight} color={color} style={iconStyle} />;
        case 'highlight':
            return <SparkleIcon size={size} weight={weight} color={color} style={iconStyle} />;
        case 'error':
            return <XCircleIcon size={size} weight={weight} color={color} style={iconStyle} />;
        case 'success':
            return <CheckCircleIcon size={size} weight={weight} color={color} style={iconStyle} />;
        case 'warning':
            return <WarningIcon size={size} weight={weight} color={color} style={iconStyle} />;
        default:
            return null;
    }
};

// Color and background tokens per state and style
interface StateTokens {
    simple: {
        background: string;
        border: string;
        iconColor: string;
    };
    expressive: {
        fillGradient: string;
        outlineGradient: string;
        iconColor: string;
    };
}

const STATE_STYLE_TOKENS: Record<ToastState, StateTokens> = {
    default: {
        simple: {
            background: 'var(--color-neutral-surface-subtlest)',
            border: '1px solid var(--color-neutral-outline-subtle)',
            iconColor: 'var(--color-neutral-icon-strong)',
        },
        expressive: {
            fillGradient: 'var(--gradient-expressive-fill-neutral)',
            outlineGradient: 'var(--gradient-expressive-outline-neutral)',
            iconColor: 'var(--color-neutral-icon-strong)',
        },
    },
    highlight: {
        simple: {
            background: 'var(--color-brand-secondary-subtlest)',
            border: '1px solid var(--color-brand-secondary-subtle)',
            iconColor: 'var(--color-brand-secondary-strong)',
        },
        expressive: {
            fillGradient: 'var(--gradient-expressive-fill-secondary-subtle)',
            outlineGradient: 'var(--gradient-expressive-outline-secondary-subtle)',
            iconColor: 'var(--color-brand-secondary-strong)',
        },
    },
    error: {
        simple: {
            background: 'var(--color-state-error-subtlest)',
            border: '1px solid var(--color-state-error-subtle)',
            iconColor: 'var(--color-state-error-strong)',
        },
        expressive: {
            fillGradient: 'var(--gradient-expressive-fill-error-subtle)',
            outlineGradient: 'var(--gradient-expressive-outline-error-subtle)',
            iconColor: 'var(--color-state-error-strong)',
        },
    },
    success: {
        simple: {
            background: 'var(--color-state-success-subtlest)',
            border: '1px solid var(--color-state-success-subtle)',
            iconColor: 'var(--color-state-success-strong)',
        },
        expressive: {
            fillGradient: 'var(--gradient-expressive-fill-success-subtle)',
            outlineGradient: 'var(--gradient-expressive-outline-success-subtle)',
            iconColor: 'var(--color-state-success-strong)',
        },
    },
    warning: {
        simple: {
            background: 'var(--color-state-warning-subtlest)',
            border: '1px solid var(--color-state-warning-subtle)',
            iconColor: 'var(--color-state-warning-strong)',
        },
        expressive: {
            fillGradient: 'var(--gradient-expressive-fill-warning-subtle)',
            outlineGradient: 'var(--gradient-expressive-outline-warning-subtle)',
            iconColor: 'var(--color-state-warning-strong)',
        },
    },
};

// Component definition
export const Toast: React.FC<ToastProps> = ({
    size = 'default',
    style = 'simple',
    state = 'default',
    title,
    description,
    message,
    icon = true,
    defaultIcon,
    highlightIcon,
    errorIcon,
    successIcon,
    warningIcon,
    button = true,
    showButton,
    buttonText,
    onButtonClick,
    dismissible = true,
    showCloseIcon,
    onClose,
    className = '',
    duration = 5000,
    visible: controlledVisible,
}) => {
    const [internalVisible, setInternalVisible] = useState(true);
    const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;

    const sizeTokens = SIZE_TOKENS[size];
    const simpleTokens = STATE_STYLE_TOKENS[state].simple;
    const expressiveTokens = STATE_STYLE_TOKENS[state].expressive;

    const handleDismiss = useCallback(() => {
        setInternalVisible(false);
        if (onClose) onClose();
    }, [onClose]);

    // Handle auto-dismiss
    useEffect(() => {
        if (duration > 0 && isVisible) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, isVisible, handleDismiss]);

    if (!isVisible) return null;

    // Resolve props
    const effectiveShowButton = showButton !== undefined ? showButton : button;
    const effectiveDismissible = showCloseIcon !== undefined ? showCloseIcon : dismissible;
    const effectiveButtonText = buttonText || DEFAULT_TEXTS[state].buttonText;

    // Resolve title and description
    const defaultData = DEFAULT_TEXTS[state];
    const hasTitle = title !== undefined && title !== null;
    const hasDescription = description !== undefined && description !== null && description !== false;

    let effectiveTitle: React.ReactNode = null;
    let effectiveDescription: React.ReactNode = null;

    if (hasTitle) {
        effectiveTitle = title;
        if (typeof description === 'boolean') {
            effectiveDescription = description ? defaultData.description : null;
        } else {
            effectiveDescription = description;
        }
    } else if (message) {
        effectiveTitle = message;
        if (typeof description === 'boolean') {
            effectiveDescription = description ? defaultData.description : null;
        } else {
            effectiveDescription = description;
        }
    } else {
        effectiveTitle = defaultData.title;
        if (typeof description === 'boolean') {
            effectiveDescription = description ? defaultData.description : null;
        } else {
            effectiveDescription = description ?? defaultData.description;
        }
    }

    // Resolve custom icon override
    let customStateIcon: React.ReactNode = undefined;
    if (typeof icon !== 'boolean' && icon !== null && icon !== undefined) {
        customStateIcon = icon;
    } else {
        switch (state) {
            case 'default':
                customStateIcon = defaultIcon;
                break;
            case 'highlight':
                customStateIcon = highlightIcon;
                break;
            case 'error':
                customStateIcon = errorIcon;
                break;
            case 'success':
                customStateIcon = successIcon;
                break;
            case 'warning':
                customStateIcon = warningIcon;
                break;
        }
    }

    const isExpressive = style === 'expressive';
    const isSimpleNeutral = style === 'simple' && state === 'default';
    const shadowToken = isExpressive ? sizeTokens.expressiveShadowToken : sizeTokens.simpleShadowToken;
    const activeIconColor = isExpressive ? expressiveTokens.iconColor : simpleTokens.iconColor;
    const iconWeight: 'duotone' | 'regular' = isExpressive ? 'duotone' : 'regular';

    const containerStyle: React.CSSProperties = {
        borderRadius: sizeTokens.borderRadiusToken,
        boxShadow: shadowToken,
        ...(isExpressive
            ? {
                border: '1px solid transparent',
                background: `${expressiveTokens.fillGradient} padding-box, ${expressiveTokens.outlineGradient} border-box`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
            }
            : {
                border: simpleTokens.border,
                backgroundColor: simpleTokens.background,
            }),
    };

    const hasIcon = Boolean(icon);
    const effectivePaddingClass = hasIcon ? sizeTokens.paddingClass : sizeTokens.noIconPaddingClass;

    const toastContent = (
        <>
            {/* State Icon */}
            {hasIcon && (
                <div className="relative z-10 shrink-0 flex items-center justify-center">
                    {getStateIcon(state, sizeTokens.iconSize, activeIconColor, customStateIcon, iconWeight)}
                </div>
            )}

            {/* Text Content */}
            <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center py-[var(--spacing-1)]">
                {Boolean(effectiveTitle) && (
                    <div className={`${sizeTokens.titleClass} font-semibold text-[var(--color-neutral-text-strong)] leading-snug break-words`}>
                        {effectiveTitle}
                    </div>
                )}
                {Boolean(effectiveDescription) && (
                    <div className={`${sizeTokens.descriptionClass} font-normal text-[var(--color-neutral-text-medium)] leading-snug mt-[var(--spacing-1)] break-words`}>
                        {effectiveDescription}
                    </div>
                )}
            </div>

            {/* Action Button */}
            {effectiveShowButton && (
                <div className="relative z-10 shrink-0 flex items-center justify-center">
                    {size === 'small' ? (
                        <CompactButton
                            size="small"
                            variant="outline"
                            onClick={onButtonClick}
                        >
                            {effectiveButtonText}
                        </CompactButton>
                    ) : (
                        <Button
                            size="small"
                            variant="neutral"
                            buttonStyle="outline"
                            onClick={onButtonClick}
                        >
                            {effectiveButtonText}
                        </Button>
                    )}
                </div>
            )}

            {/* Close Button */}
            {effectiveDismissible && (
                <div className="relative z-10 shrink-0 flex items-center justify-center">
                    <CompactButton
                        size={sizeTokens.compactButtonSize}
                        variant="subtle"
                        icon={<XIcon weight="regular" />}
                        onClick={handleDismiss}
                        aria-label="Dismiss"
                    />
                </div>
            )}
        </>
    );

    if (isSimpleNeutral) {
        return (
            <Material
                role="status"
                aria-live="polite"
                size={sizeTokens.materialSize}
                elevation="floating"
                cornerRadiusType="control"
                cornerRadius={sizeTokens.borderRadiusToken}
                surfaceColor="var(--color-neutral-surface-subtlest)"
                className={`flex items-center shrink-0 ${sizeTokens.widthClass} ${effectivePaddingClass} ${sizeTokens.gapClass} ${className}`}
            >
                {toastContent}
            </Material>
        );
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className={`relative overflow-hidden flex items-center shrink-0 ${sizeTokens.widthClass} ${effectivePaddingClass} ${sizeTokens.gapClass} ${className}`}
            style={containerStyle}
        >
            {toastContent}
        </div>
    );
};

Toast.displayName = 'Toast';

export interface ToastContainerProps {
    children?: React.ReactNode;
    className?: string;
    position?: ToastPosition;
}

const POSITION_CLASSES: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4 items-start',
    'top': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
    children,
    className = '',
    position = 'bottom-right',
}) => {
    return (
        <div
            className={`fixed z-50 flex flex-col gap-3 pointer-events-none max-w-full p-4 ${POSITION_CLASSES[position]} ${className}`}
        >
            {React.Children.map(children, (child) =>
                child ? <div className="pointer-events-auto w-full">{child}</div> : null
            )}
        </div>
    );
};

ToastContainer.displayName = 'ToastContainer';

export default Toast;

