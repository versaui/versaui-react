'use client';

import React, { useId } from 'react';
import {
    UsersThree as UsersThreeIcon,
    Trash as TrashIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
} from '@phosphor-icons/react';
import { Button, type ButtonStyle, type ButtonType, type ButtonSize } from '../Button/Button';
import { CheckboxLabel } from '../Checkbox/CheckboxLabel';
import { Material } from '../Material/Material';
import {
    ContainedIcon,
    type ContainedIconStyle,
    type ContainedIconSize,
    type ContainedIconRole,
    type ContainedIconCornerRadiusType,
} from '../../assets/ContainedIcon';
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
    /** Visual style treatment for the contained icon ('simple' | 'expressive'). Defaults to 'expressive' */
    iconStyle?: ContainedIconStyle;
    /** Size of the contained icon ('small' | 'medium' | 'large' | 'xlarge'). Defaults to 'large' */
    iconSize?: ContainedIconSize;
    /** Corner radius for the contained icon. Defaults to 'var(--corner-radius-default-fully-rounded)' */
    iconCornerRadius?: string;
    /** Corner radius type for the contained icon ('default' | 'control' | 'full'). Defaults to 'full' */
    iconCornerRadiusType?: ContainedIconCornerRadiusType;
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
    role: ContainedIconRole;
    confirmVariant: 'primary' | 'error';
    defaultIcon: React.ElementType;
}> = {
    default: {
        role: 'secondary',
        confirmVariant: 'primary',
        defaultIcon: UsersThreeIcon,
    },
    destructive: {
        role: 'error',
        confirmVariant: 'error',
        defaultIcon: TrashIcon,
    },
    success: {
        role: 'success',
        confirmVariant: 'primary',
        defaultIcon: CheckCircleIcon,
    },
    warning: {
        role: 'warning',
        confirmVariant: 'primary',
        defaultIcon: WarningIcon,
    },
};

// --- Component ---

export const StatusModal: React.FC<StatusModalProps> = ({
    status = 'default',
    iconStyle = 'expressive',
    iconSize = 'large',
    iconCornerRadius = 'var(--corner-radius-default-fully-rounded)',
    iconCornerRadiusType = 'full',
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
                    {/* Contained Icon */}
                    <ContainedIcon
                        style={iconStyle}
                        role={config.role}
                        size={iconSize}
                        cornerRadiusType={iconCornerRadiusType}
                        cornerRadius={iconCornerRadius}
                        icon={icon || <IconComponent />}
                    />

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
