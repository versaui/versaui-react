'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, type ToastState, type ToastSize } from './Toast';

// TYPES

export interface ToastConfig {
    id: string;
    message: string;
    state?: ToastState;
    size?: ToastSize;
    duration?: number;
    showButton?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
}

interface ToastContextValue {
    toasts: ToastConfig[];
    addToast: (config: Omit<ToastConfig, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

// CONTEXT

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// PROVIDER

interface ToastProviderProps {
    children: React.ReactNode;
    /** Maximum number of visible toasts. Default: 5 */
    maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 3 }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const addToast = useCallback((config: Omit<ToastConfig, 'id'>): string => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: ToastConfig = { ...config, id };

        setToasts((prev) => {
            const updated = [newToast, ...prev];
            // Keep only the most recent toasts
            return updated.slice(0, maxToasts);
        });

        return id;
    }, [maxToasts]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
            {children}
        </ToastContext.Provider>
    );
}

// VIEWPORT COMPONENT

interface ToastViewportProps {
    /** Bottom offset in pixels. Default: 24 */
    bottomOffset?: number;
}

// Animation styles injected once
const STACK_ANIMATION_STYLES = `
@keyframes toast-stack-enter {
    from {
        transform: translateY(100%) scale(0.95);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

@keyframes toast-stack-exit {
    from {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
    to {
        transform: translateY(100%) scale(0.95);
        opacity: 0;
    }
}

.toast-stack-item {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.3s ease;
}
`;

let stackStylesInjected = false;
const injectStackStyles = () => {
    if (stackStylesInjected || typeof document === 'undefined') return;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = STACK_ANIMATION_STYLES;
    document.head.appendChild(styleSheet);
    stackStylesInjected = true;
};

export function ToastViewport({ bottomOffset = 24 }: ToastViewportProps) {
    const context = useContext(ToastContext);

    // Inject styles on mount
    React.useEffect(() => {
        injectStackStyles();
    }, []);

    if (!context) {
        console.warn('ToastViewport must be used within a ToastProvider');
        return null;
    }

    const { toasts, removeToast } = context;

    if (toasts.length === 0) return null;

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: bottomOffset,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: -36, // Negative gap for overlap effect
        pointerEvents: 'none',
    };

    return (
        <div style={containerStyle}>
            {toasts.map((toast, index) => {
                // Calculate stack position (most recent = index 0, shown on top)
                const stackPosition = index;
                const scale = 1 - stackPosition * 0.02; // Slightly smaller as stacked behind
                const zIndex = toasts.length - index; // Most recent on top

                const itemStyle: React.CSSProperties = {
                    position: 'relative',
                    marginBottom: stackPosition > 0 ? -16 : 0, // Negative margin creates overlap
                    transform: `scale(${Math.max(scale, 0.95)})`,
                    zIndex,
                    pointerEvents: stackPosition === 0 ? 'auto' : 'none', // Only top toast interactive
                    transformOrigin: 'center bottom',
                };

                return (
                    <div
                        key={toast.id}
                        className="toast-stack-item"
                        style={itemStyle}
                    >
                        <Toast
                            state={toast.state}
                            size={toast.size}
                            message={toast.message}
                            showButton={toast.showButton ?? false}
                            buttonText={toast.buttonText}
                            onButtonClick={toast.onButtonClick}
                            duration={toast.duration ?? 5000}
                            onClose={() => removeToast(toast.id)}
                            visible={true}
                        />
                    </div>
                );
            })}
        </div>
    );
}

ToastViewport.displayName = 'ToastViewport';

// CONVENIENCE HOOK FOR SIMPLE TOAST API

export function useToastActions() {
    const { addToast, removeToast, clearAll } = useToast();

    return {
        toast: (message: string, options?: Partial<Omit<ToastConfig, 'id' | 'message'>>) =>
            addToast({ message, ...options }),
        success: (message: string, options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'state'>>) =>
            addToast({ message, state: 'success', ...options }),
        error: (message: string, options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'state'>>) =>
            addToast({ message, state: 'error', ...options }),
        warning: (message: string, options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'state'>>) =>
            addToast({ message, state: 'warning', ...options }),
        highlight: (message: string, options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'state'>>) =>
            addToast({ message, state: 'highlight', ...options }),
        dismiss: removeToast,
        clearAll,
    };
}

export default ToastViewport;
