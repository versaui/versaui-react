'use client';

import React, { createContext, useContext, useId, useCallback } from 'react';
import {
    Modal as AriaModal,
    ModalOverlay,
    Dialog
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { X as CloseIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { Material } from '../Material/Material';
import { CompactIconButton } from '../Button/CompactIconButton';

// --- Size Variants ---

export const MODAL_SIZES = ['sm', 'md', 'lg', 'xl', 'full'] as const;
export type ModalSize = (typeof MODAL_SIZES)[number];

export const modalSizeVariants = cva(
    "relative flex flex-col w-full max-h-[calc(100vh-var(--spacing-12))]",
    {
        variants: {
            size: {
                sm: "max-w-[400px]",
                md: "max-w-[560px]",
                lg: "max-w-[720px]",
                xl: "max-w-[960px]",
                full: "max-w-[calc(100vw-var(--spacing-12))]",
            }
        },
        defaultVariants: {
            size: "md"
        }
    }
);

// --- Context ---

interface ModalContextValue {
    size: ModalSize;
    onClose: () => void;
    titleId: string;
    descriptionId: string;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('Modal subcomponents must be used within a Modal component');
    }
    return context;
}

// --- Root Modal ---

export interface ModalProps {
    /** Whether the modal is open (controlled) */
    open?: boolean;
    /** Called when the open state changes */
    onOpenChange?: (isOpen: boolean) => void;
    /** The size variant of the modal */
    size?: ModalSize;
    /** Whether clicking backdrop closes the modal */
    closeOnBackdrop?: boolean;
    /** Whether pressing ESC closes the modal */
    closeOnEsc?: boolean;
    /** Modal content */
    children?: React.ReactNode;
    /** Additional CSS classes for the modal container */
    className?: string;
}

export const Modal = ({
    open,
    onOpenChange,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEsc = true,
    children,
    className
}: ModalProps) => {
    const titleId = useId();
    const descriptionId = useId();

    const handleClose = useCallback(() => {
        onOpenChange?.(false);
    }, [onOpenChange]);

    // Only render the modal overlay when open
    if (!open) {
        return null;
    }

    return (
        <ModalContext.Provider value={{ size, onClose: handleClose, titleId, descriptionId }}>
            <ModalOverlay
                isOpen={true}
                onOpenChange={onOpenChange}
                isDismissable={closeOnBackdrop}
                isKeyboardDismissDisabled={!closeOnEsc}
                className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center p-[var(--spacing-6)]",
                    "bg-[var(--color-overlay)] backdrop-blur-sm"
                )}
            >
                <AriaModal
                    className={cn(
                        "w-full outline-none",
                        modalSizeVariants({ size }),
                        className
                    )}
                >
                    <Dialog
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                        className="outline-none h-full w-full"
                    >
                        {children}
                    </Dialog>
                </AriaModal>
            </ModalOverlay>
        </ModalContext.Provider>
    );
};

// --- Modal.Content ---

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const ModalContent = ({ children, className, ...props }: ModalContentProps) => {
    return (
        <Material
            size="large"
            elevation="elevated"
            className={cn("flex flex-col", className)}
            {...props}
        >
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
                {children}
            </div>
        </Material>
    );
};

// --- Modal.Header ---

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Modal title (required for accessibility) */
    title: string;
    /** Optional description text below the title */
    description?: string;
    /** Optional leading icon (Phosphor icon element) */
    icon?: React.ReactNode;
    /** Whether the header should be sticky when body scrolls */
    sticky?: boolean;
    /** Whether to show the close button */
    showCloseButton?: boolean;
}

const ModalHeader = ({
    title,
    description,
    icon,
    sticky = false,
    showCloseButton = true,
    className,
    ...props
}: ModalHeaderProps) => {
    const { onClose, titleId, descriptionId } = useModalContext();

    return (
        <div
            className={cn(
                "flex items-center gap-[var(--spacing-4)] py-[var(--spacing-7)] px-[var(--spacing-6)]",
                "border-b border-[var(--color-neutral-outline-subtlest)]",
                sticky && "sticky top-0 z-10 bg-[var(--color-neutral-surface-subtlest)]",
                className
            )}
            {...props}
        >
            {/* Leading Icon */}
            {icon && (
                <div
                    className="flex items-center justify-center shrink-0 w-10 h-10 rounded-full"
                    style={{
                        background: `linear-gradient(var(--color-brand-secondary-subtlest), var(--color-brand-secondary-subtlest)) padding-box, var(--gradient-thematic-outline-secondary-subtle) border-box`,
                        border: '1px solid transparent',
                        boxShadow: 'var(--inset-subtle-large)',
                    }}
                >
                    <span className="text-[var(--color-brand-secondary-strong)]">
                        {React.isValidElement(icon)
                            ? React.cloneElement(icon as React.ReactElement<any>, { size: 20, weight: 'duotone' })
                            : icon}
                    </span>
                </div>
            )}

            {/* Title & Description */}
            <div className="flex-1 flex flex-col gap-[var(--spacing-1)] min-w-0">
                <h2
                    id={titleId}
                    className="text-h7 text-[var(--color-neutral-text-strong)] m-0 truncate"
                >
                    {title}
                </h2>
                {description && (
                    <p
                        id={descriptionId}
                        className="text-b5 text-[var(--color-neutral-text-medium)] m-0"
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* Close Button */}
            {showCloseButton && (
                <CompactIconButton
                    icon={<CloseIcon />}
                    variant="filled"
                    size="default"
                    onClick={onClose}
                    aria-label="Close modal"
                />
            )}
        </div>
    );
};

// --- Modal.Body ---

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const ModalBody = ({ children, className, ...props }: ModalBodyProps) => {
    return (
        <div
            className={cn("flex-1 overflow-y-auto py-[var(--spacing-6)] px-[var(--spacing-7)]", className)}
            {...props}
        >
            {children}
        </div>
    );
};

// --- Modal.Footer ---

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Action buttons (primary, secondary) */
    children?: React.ReactNode;
    /** Left-aligned content (checkbox, text, link button) */
    leftContent?: React.ReactNode;
    /** Whether the footer should be sticky when body scrolls */
    sticky?: boolean;
}

const ModalFooter = ({
    children,
    leftContent,
    sticky = false,
    className,
    ...props
}: ModalFooterProps) => {
    return (
        <div
            className={cn(
                "flex items-center gap-[var(--spacing-6)] py-[var(--spacing-7)] px-[var(--spacing-7)]",
                "border-t border-[var(--color-neutral-outline-subtlest)]",
                leftContent ? "justify-between" : "justify-end",
                sticky && "sticky bottom-0 z-10 bg-[var(--color-neutral-surface-subtlest)]",
                className
            )}
            {...props}
        >
            {/* Left Content (metadata, checkbox, etc.) */}
            {leftContent && (
                <div className="flex-shrink-0 text-b4 text-[var(--color-neutral-text-medium)]">
                    {leftContent}
                </div>
            )}

            {/* Action Buttons - always align right */}
            <div className="flex items-center gap-[var(--spacing-4)] ml-auto">
                {children}
            </div>
        </div>
    );
};

// --- Modal.Close ---

export interface ModalCloseProps {
    /** Render function or element - receives close handler */
    children: React.ReactNode | ((props: { onClose: () => void }) => React.ReactNode);
    /** Additional props passed to wrapper */
    className?: string;
}

const ModalClose = ({ children, className }: ModalCloseProps) => {
    const { onClose } = useModalContext();

    // If children is a function, call it with onClose
    if (typeof children === 'function') {
        return <>{children({ onClose })}</>;
    }

    // Otherwise wrap children with click handler
    return (
        <div onClick={onClose} className={className} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClose()}>
            {children}
        </div>
    );
};

// --- Compound Component ---

Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Close = ModalClose;

export default Modal;
