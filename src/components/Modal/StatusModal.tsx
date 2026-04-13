'use client';

import React, { useId, useMemo } from 'react';
import { UsersThree as UsersThreeIcon, Trash as TrashIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon } from '@phosphor-icons/react';
import { Button, type ButtonStyle, type ButtonType, type ButtonSize } from '../Button/Button';
import { CheckboxLabel } from '../Checkbox/CheckboxLabel';
import { Material } from '../Material/Material';
import { cn } from '../../utils/cn';

// --- Variants ---

export const STATUS_MODAL_VARIANTS = ['default', 'destructive', 'success', 'warning'] as const;

export type StatusModalVariant = (typeof STATUS_MODAL_VARIANTS)[number];

// --- Props ---

/** Props that can be passed to override StatusModal button defaults */
export interface StatusModalButtonProps {
    variant?: ButtonType;
    size?: ButtonSize;
    buttonStyle?: ButtonStyle;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export interface StatusModalProps {
    /** The status variant of the modal */
    status?: StatusModalVariant;
    /** Custom icon to display (defaults based on status) */
    icon?: React.ReactNode;
    /** Modal title */
    title: string;
    /** Modal description */
    description: string;
    /** Whether to show the checkbox */
    showCheckbox?: boolean;
    /** Checkbox label text */
    checkboxLabel?: string;
    /** Checkbox checked state */
    checkboxChecked?: boolean;
    /** Cancel button text */
    cancelText?: string;
    /** Confirm button text */
    confirmText?: string;
    /** Called when cancel button is clicked */
    onCancel?: () => void;
    /** Called when confirm button is clicked */
    onConfirm?: () => void;
    /** Called when checkbox state changes */
    onCheckboxChange?: (checked: boolean) => void;
    /** Override props for the primary (confirm) button */
    primaryButtonProps?: StatusModalButtonProps;
    /** Override props for the secondary (cancel) button */
    secondaryButtonProps?: StatusModalButtonProps;
    /** Additional className */
    className?: string;
}

// --- Status Configuration ---

const STATUS_CONFIG: Record<StatusModalVariant, {
    iconBg: string;
    iconOutlineGradient: string;
    iconColor: string;
    iconInset: string;
    confirmVariant: 'primary' | 'error';
    defaultIcon: React.ElementType;
}> = {
    default: {
        iconBg: 'var(--color-brand-secondary-subtlest)',
        iconOutlineGradient: 'var(--gradient-thematic-outline-secondary-subtle)',
        iconColor: 'var(--color-brand-secondary-strong)',
        iconInset: 'var(--inset-subtle-large)',
        confirmVariant: 'primary',
        defaultIcon: UsersThreeIcon,
    },
    destructive: {
        iconBg: 'var(--color-state-error-subtlest)',
        iconOutlineGradient: 'var(--gradient-thematic-outline-error-subtle)',
        iconColor: 'var(--color-state-error-strong)',
        iconInset: 'var(--inset-subtle-large)',
        confirmVariant: 'error',
        defaultIcon: TrashIcon,
    },
    success: {
        iconBg: 'var(--color-state-success-subtlest)',
        iconOutlineGradient: 'var(--gradient-thematic-outline-success-subtle)',
        iconColor: 'var(--color-state-success-strong)',
        iconInset: 'var(--inset-subtle-large)',
        confirmVariant: 'primary',
        defaultIcon: CheckCircleIcon,
    },
    warning: {
        iconBg: 'var(--color-state-warning-subtlest)',
        iconOutlineGradient: 'var(--gradient-thematic-outline-warning-subtle)',
        iconColor: 'var(--color-state-warning-strong)',
        iconInset: 'var(--inset-subtle-large)',
        confirmVariant: 'primary',
        defaultIcon: WarningIcon,
    },
};

// --- Component ---

export const StatusModal: React.FC<StatusModalProps> = ({
    status = 'default',
    icon,
    title,
    description,
    showCheckbox = true,
    checkboxLabel = "Don't show again",
    checkboxChecked = false,
    cancelText = 'Cancel',
    confirmText = 'Continue',
    onCancel,
    onConfirm,
    onCheckboxChange,
    primaryButtonProps,
    secondaryButtonProps,
    className,
}) => {
    const config = STATUS_CONFIG[status];
    const IconComponent = config.defaultIcon;

    // Accessibility IDs
    const titleId = useId();
    const descriptionId = useId();

    // Icon container styles (complex gradient, can't be done with pure Tailwind)
    const iconContainerStyle: React.CSSProperties = useMemo(() => ({
        background: `linear-gradient(${config.iconBg}, ${config.iconBg}) padding-box, ${config.iconOutlineGradient} border-box`,
        border: '1px solid transparent',
        boxShadow: config.iconInset,
    }), [config.iconBg, config.iconOutlineGradient, config.iconInset]);

    return (
        <Material
            size="large"
            elevation="floating"
            role="alertdialog"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            aria-modal="true"
            className={cn(
                // Base layout
                "flex flex-col",
                // Sizing — width is controlled by parent Modal size
                "w-full",
                className
            )}
        >
            <div className="flex flex-col overflow-hidden p-[var(--spacing-7)] gap-[var(--spacing-9)]" style={{ borderRadius: 'inherit' }}>
            {/* Content Section - grows to push footer down */}
            <div className="flex flex-col gap-[var(--spacing-6)] flex-1">
                {/* Icon Container */}
                <div
                    className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full overflow-hidden"
                    style={iconContainerStyle}
                    aria-hidden="true"
                >
                    {icon || (
                        <IconComponent
                            size={24}
                            weight="duotone"
                            color={config.iconColor}
                        />
                    )}
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-[var(--spacing-4)]">
                    <h3
                        id={titleId}
                        className="text-h7 text-[var(--color-neutral-text-strong)] m-0"
                    >
                        {title}
                    </h3>
                    <p
                        id={descriptionId}
                        className="text-b4 text-[var(--color-neutral-text-medium)] m-0"
                    >
                        {description}
                    </p>
                </div>
            </div>

            {/* Footer Section - always at bottom, full width */}
            <div
                className={cn(
                    "flex flex-wrap items-center gap-[var(--spacing-8)]",
                    "w-full",
                    showCheckbox ? "justify-between" : "justify-stretch"
                )}
            >
                {/* Checkbox - left aligned */}
                {showCheckbox && (
                    <div className="flex items-center shrink-0">
                        <CheckboxLabel
                            size="medium"
                            label={checkboxLabel}
                            checked={checkboxChecked}
                            onChange={onCheckboxChange}
                        />
                    </div>
                )}

                {/* CTAs - right aligned, grow to fill when wrapped */}
                <div
                    className={cn(
                        "flex items-center gap-[var(--spacing-6)]",
                        "flex-1 min-w-fit justify-end",
                        // When wrapped to new line, take full width
                        "flex-wrap"
                    )}
                >
                    <Button
                        variant={secondaryButtonProps?.variant ?? 'neutral'}
                        size={secondaryButtonProps?.size ?? 'medium'}
                        buttonStyle={secondaryButtonProps?.buttonStyle ?? 'outline'}
                        onClick={onCancel}
                        className={cn('whitespace-nowrap min-w-[100px] flex-1', secondaryButtonProps?.className)}
                        disabled={secondaryButtonProps?.disabled}
                        loading={secondaryButtonProps?.loading}
                        leadingIcon={secondaryButtonProps?.leadingIcon}
                        trailingIcon={secondaryButtonProps?.trailingIcon}
                        fullWidth={secondaryButtonProps?.fullWidth}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={primaryButtonProps?.variant ?? config.confirmVariant}
                        size={primaryButtonProps?.size ?? 'medium'}
                        buttonStyle={primaryButtonProps?.buttonStyle ?? 'filled'}
                        onClick={onConfirm}
                        className={cn('whitespace-nowrap min-w-[100px] flex-1', primaryButtonProps?.className)}
                        disabled={primaryButtonProps?.disabled}
                        loading={primaryButtonProps?.loading}
                        leadingIcon={primaryButtonProps?.leadingIcon}
                        trailingIcon={primaryButtonProps?.trailingIcon}
                        fullWidth={primaryButtonProps?.fullWidth}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
            </div>
        </Material>
    );
};

export default StatusModal;
