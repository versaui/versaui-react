'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast, type ToastState, type ToastSize, type ToastStyle, type ToastPosition } from './Toast';

export interface ToastConfig {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode | boolean;
    message?: string;
    state?: ToastState;
    style?: ToastStyle;
    size?: ToastSize;
    icon?: boolean | React.ReactNode;
    duration?: number;
    button?: boolean;
    showButton?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
    dismissible?: boolean;
    showCloseIcon?: boolean;
    position?: ToastPosition;
    className?: string;
}

interface ToastContextValue {
    toasts: ToastConfig[];
    exitingIds: Set<string>;
    addToast: (config: Omit<ToastConfig, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAll: () => void;
    maxToasts: number;
    position: ToastPosition;
    setPosition: (position: ToastPosition) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export interface ToastProviderProps {
    children: React.ReactNode;
    /** Maximum number of visible toasts in stacked view. Default: 3 */
    maxToasts?: number;
    /** Default toast position on screen. Default: 'bottom-right' */
    position?: ToastPosition;
}

export function ToastProvider({ children, maxToasts = 3, position: initialPosition = 'bottom-right' }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);
    const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
    const [position, setPosition] = useState<ToastPosition>(initialPosition);

    const removeToast = useCallback((id: string) => {
        setExitingIds((prev) => new Set(prev).add(id));
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
            setExitingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 300);
    }, []);

    const addToast = useCallback(
        (config: Omit<ToastConfig, 'id'>): string => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const newToast: ToastConfig = { ...config, id };

            if (config.position) {
                setPosition(config.position);
            }

            setToasts((prev) => [newToast, ...prev]);
            return id;
        },
        []
    );

    const clearAll = useCallback(() => {
        setToasts((prev) => {
            setExitingIds(new Set(prev.map((t) => t.id)));
            return prev;
        });
        setTimeout(() => {
            setToasts([]);
            setExitingIds(new Set());
        }, 300);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, exitingIds, addToast, removeToast, clearAll, maxToasts, position, setPosition }}>
            {children}
        </ToastContext.Provider>
    );
}

export interface ToastViewportProps {
    /** Position on screen: 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right'. Default: 'bottom-right' */
    position?: ToastPosition;
    /** Offset in pixels from top/bottom screen edge. Default: 24 */
    offset?: number;
    /** Backward compatible bottom offset in pixels. Default: 24 */
    bottomOffset?: number;
    /** Maximum visible toasts in stacked collapsed view. Default: 3 */
    maxVisibleToasts?: number;
    /** Whether hovering over the viewport expands the stacked toasts. Default: true */
    expandOnHover?: boolean;
    /** Additional CSS classes */
    className?: string;
}

interface ToastItemProps {
    toast: ToastConfig;
    index: number;
    totalToasts: number;
    isExpanded: boolean;
    isExiting: boolean;
    activeMaxToasts: number;
    position: ToastPosition;
    onClose: (id: string) => void;
    getExpandedOffsetY: (targetIndex: number) => number;
}

const ToastItem: React.FC<ToastItemProps> = ({
    toast,
    index,
    totalToasts,
    isExpanded,
    isExiting,
    activeMaxToasts,
    position,
    onClose,
    getExpandedOffsetY,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsMounted(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    const isTop = position.startsWith('top');
    const PEEK_OFFSET = 14; // Shift per card when collapsed
    const SCALE_STEP = 0.05; // Scale reduction step

    const isVisibleInStack = index < activeMaxToasts;
    const isFront = index === 0;

    let translateY = 0;
    let scale = 1;
    let opacity = 1;

    if (!isMounted) {
        // Initial reveal animation state (slides in from direction)
        translateY = isTop ? -48 : 48;
        scale = 0.85;
        opacity = 0;
    } else if (isExiting) {
        // Exit animation state (slides back out)
        translateY = isTop ? -24 : 24;
        scale = 0.9;
        opacity = 0;
    } else if (!isVisibleInStack) {
        // Hidden beyond activeMaxToasts
        const maxOffset = isExpanded
            ? getExpandedOffsetY(Math.max(0, activeMaxToasts - 1))
            : activeMaxToasts * PEEK_OFFSET;
        translateY = isTop ? maxOffset : -maxOffset;
        scale = 0.85;
        opacity = 0;
    } else if (isExpanded) {
        // Hover expanded state
        const expandedOffset = getExpandedOffsetY(index);
        translateY = isTop ? expandedOffset : -expandedOffset;
        scale = 1;
        opacity = 1;
    } else {
        // Collapsed 3D stack state with full opacity
        const collapsedOffset = index * PEEK_OFFSET;
        translateY = isTop ? collapsedOffset : -collapsedOffset;
        scale = Math.max(0.85, 1 - index * SCALE_STEP);
        opacity = 1;
    }

    const zIndex = totalToasts - index;
    const pointerEvents = (isExpanded || isFront) && isVisibleInStack && !isExiting && isMounted ? 'auto' : 'none';

    const anchorClass = isTop ? 'top-0' : 'bottom-0';
    const originClass = isTop ? 'origin-top' : 'origin-bottom';

    return (
        <div
            className={`absolute ${anchorClass} w-full flex justify-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${originClass}`}
            style={{
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                opacity,
                zIndex,
                pointerEvents,
            }}
        >
            <Toast
                state={toast.state}
                style={toast.style}
                size={toast.size}
                title={toast.title}
                description={toast.description}
                message={toast.message}
                icon={toast.icon}
                button={toast.button ?? toast.showButton}
                buttonText={toast.buttonText}
                onButtonClick={toast.onButtonClick}
                dismissible={toast.dismissible ?? toast.showCloseIcon}
                duration={toast.duration ?? 5000}
                onClose={() => onClose(toast.id)}
                visible={true}
                className={toast.className || ''}
            />
        </div>
    );
};

const getToastHeight = (t: ToastConfig | undefined): number => {
    if (!t) return 64;
    const isSmall = t.size === 'small';
    const hasDesc = t.description !== false && (t.description !== undefined || (!t.title && !t.message));
    if (isSmall) {
        return hasDesc ? 48 : 36;
    }
    return hasDesc ? 64 : 48;
};

export function ToastViewport({
    position,
    offset,
    bottomOffset = 24,
    maxVisibleToasts = 3,
    expandOnHover = true,
    className = '',
}: ToastViewportProps) {
    const context = useContext(ToastContext);
    const [isHovered, setIsHovered] = useState(false);

    if (!context) {
        console.warn('ToastViewport must be used within a ToastProvider');
        return null;
    }

    const { toasts, exitingIds, removeToast, maxToasts: contextMaxToasts, position: contextPosition } = context;

    const activePosition = position || contextPosition || 'bottom-right';
    const isTop = activePosition.startsWith('top');
    const activeOffset = offset ?? bottomOffset ?? 24;
    const activeMaxToasts = maxVisibleToasts ?? contextMaxToasts ?? 3;

    if (toasts.length === 0) return null;

    const GAP = 12; // Vertical spacing between toasts when expanded
    const PEEK_OFFSET = 14; // Shift per card when collapsed

    const isExpanded = expandOnHover && isHovered;

    // Cumulative height calculation for expanded state with equal gap
    const getExpandedOffsetY = (targetIndex: number) => {
        let cumulative = 0;
        const limit = Math.min(targetIndex, activeMaxToasts - 1);
        for (let i = 0; i < limit; i++) {
            cumulative += getToastHeight(toasts[i]) + GAP;
        }
        return cumulative;
    };

    // Calculate total height of container limited to max 3 visible toasts
    const visibleToasts = toasts.slice(0, activeMaxToasts);
    const frontHeight = getToastHeight(toasts[0]);
    const totalExpandedHeight = visibleToasts.reduce(
        (acc, t, i) => acc + getToastHeight(t) + (i > 0 ? GAP : 0),
        0
    );
    const totalCollapsedHeight = frontHeight + Math.min(toasts.length - 1, activeMaxToasts - 1) * PEEK_OFFSET;
    const containerHeight = isExpanded ? totalExpandedHeight : totalCollapsedHeight;

    const getPositionClasses = (pos: ToastPosition): string => {
        if (pos.endsWith('-left')) {
            return 'left-4 sm:left-6';
        }
        if (pos.endsWith('-right')) {
            return 'right-4 sm:right-6';
        }
        return 'left-1/2 -translate-x-1/2';
    };

    const getViewportStyle = (): React.CSSProperties => {
        const style: React.CSSProperties = {
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'auto',
            width: 'calc(100vw - 32px)',
            maxWidth: 520,
            height: containerHeight,
        };

        if (isTop) {
            style.top = activeOffset;
        } else {
            style.bottom = activeOffset;
        }

        return style;
    };

    const containerFlexClass = isTop ? 'flex-col justify-start' : 'flex-col justify-end';

    return (
        <div
            role="region"
            aria-label="Notifications"
            className={`transition-[height] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${getPositionClasses(activePosition)} ${className}`}
            style={getViewportStyle()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative w-full h-full flex items-center ${containerFlexClass}`}>
                {toasts.map((toast, index) => {
                    const isExiting = exitingIds.has(toast.id);

                    return (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            index={index}
                            totalToasts={toasts.length}
                            isExpanded={isExpanded}
                            isExiting={isExiting}
                            activeMaxToasts={activeMaxToasts}
                            position={activePosition}
                            onClose={removeToast}
                            getExpandedOffsetY={getExpandedOffsetY}
                        />
                    );
                })}
            </div>
        </div>
    );
}

ToastViewport.displayName = 'ToastViewport';

// Convenience hook for toast helper methods
export function useToastActions() {
    const { addToast, removeToast, clearAll, setPosition, position } = useToast();

    return {
        toast: (messageOrConfig: string | Omit<ToastConfig, 'id'>, options?: Partial<Omit<ToastConfig, 'id'>>) => {
            if (typeof messageOrConfig === 'string') {
                return addToast({ message: messageOrConfig, ...options });
            }
            return addToast(messageOrConfig);
        },
        success: (messageOrConfig: string | Omit<ToastConfig, 'id' | 'state'>, options?: Partial<Omit<ToastConfig, 'id' | 'state'>>) => {
            if (typeof messageOrConfig === 'string') {
                return addToast({ message: messageOrConfig, state: 'success', ...options });
            }
            return addToast({ ...messageOrConfig, state: 'success' });
        },
        error: (messageOrConfig: string | Omit<ToastConfig, 'id' | 'state'>, options?: Partial<Omit<ToastConfig, 'id' | 'state'>>) => {
            if (typeof messageOrConfig === 'string') {
                return addToast({ message: messageOrConfig, state: 'error', ...options });
            }
            return addToast({ ...messageOrConfig, state: 'error' });
        },
        warning: (messageOrConfig: string | Omit<ToastConfig, 'id' | 'state'>, options?: Partial<Omit<ToastConfig, 'id' | 'state'>>) => {
            if (typeof messageOrConfig === 'string') {
                return addToast({ message: messageOrConfig, state: 'warning', ...options });
            }
            return addToast({ ...messageOrConfig, state: 'warning' });
        },
        highlight: (messageOrConfig: string | Omit<ToastConfig, 'id' | 'state'>, options?: Partial<Omit<ToastConfig, 'id' | 'state'>>) => {
            if (typeof messageOrConfig === 'string') {
                return addToast({ message: messageOrConfig, state: 'highlight', ...options });
            }
            return addToast({ ...messageOrConfig, state: 'highlight' });
        },
        dismiss: removeToast,
        clearAll,
        setPosition,
        position,
    };
}

export default ToastViewport;
