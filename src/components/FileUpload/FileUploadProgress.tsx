'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FilePdfIcon, FileDocIcon, FileImageIcon, FileIcon, XIcon, TrashIcon, ArrowClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Material } from '../Material/Material';

export type UploadStatus = 'uploading' | 'uploaded' | 'failed';

export interface FileUploadProgressProps {
    fileName: string;
    fileSize: number; // in bytes
    fileType?: string;
    /** Initial status - component manages transitions internally */
    initialStatus?: UploadStatus;
    /** Upload speed in bytes per second for progress simulation */
    uploadSpeed?: number;
    /** Whether to simulate progress automatically */
    simulateProgress?: boolean;
    /** Called when upload completes */
    onComplete?: () => void;
    /** Called when upload fails */
    onFail?: (error: string) => void;
    /** Called when cancel is clicked */
    onCancel?: () => void;
    /** Called when delete is clicked */
    onDelete?: () => void;
    /** Called when retry is clicked - should trigger new upload */
    onRetry?: () => void;
    /** Error message to display when failed */
    errorMessage?: string;
    width?: number | string;
    className?: string;
    style?: React.CSSProperties;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 1) return 'less than a second';
    if (seconds < 60) return `${Math.ceil(seconds)} secs left`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} mins left`;
    return `${Math.ceil(seconds / 3600)} hrs left`;
};

const getFileIcon = (fileType?: string) => {
    if (!fileType) return FileIcon;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return FilePdfIcon;
    if (type.includes('doc') || type.includes('word')) return FileDocIcon;
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif')) return FileImageIcon;
    return FileIcon;
};

// Component to display filename with truncation in the middle, keeping extension visible
const TruncatedFileName: React.FC<{ fileName: string }> = ({ fileName }) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;
    const baseName = hasExtension ? fileName.slice(0, lastDotIndex) : fileName;
    const extension = hasExtension ? fileName.slice(lastDotIndex) : '';

    return (
        <div
            className="text-h7"
            style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-neutral-text-strong)',
                minWidth: 0,
                width: '100%',
            }}
            title={fileName}
        >
            <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 1,
            }}>
                {baseName}
            </span>
            {extension && (
                <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {extension}
                </span>
            )}
        </div>
    );
};

const STATUS_STYLES = {
    uploading: {
        paddingTop: 16,
        paddingBottom: 12,
    },
    uploaded: {
        paddingTop: 12,
        paddingBottom: 12,
    },
    failed: {
        paddingTop: 12,
        paddingBottom: 12,
    },
} as const;

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
    fileName,
    fileSize,
    fileType,
    initialStatus = 'uploading',
    uploadSpeed = 50000, // 50KB/s default
    simulateProgress = true,
    onComplete,
    onCancel,
    onDelete,
    onRetry,
    errorMessage = 'Upload Failed',
    width = 600,
    className = '',
    style,
}) => {
    const [status, setStatus] = useState<UploadStatus>(initialStatus);
    const [progress, setProgress] = useState(initialStatus === 'uploaded' ? 100 : 0);
    const [uploadedBytes, setUploadedBytes] = useState(initialStatus === 'uploaded' ? fileSize : 0);

    const FileIcon = getFileIcon(fileType);
    const statusStyles = STATUS_STYLES[status];

    // Calculate time remaining
    const timeRemaining = uploadSpeed > 0 ? (fileSize - uploadedBytes) / uploadSpeed : 0;

    // Progress animation using setInterval with 2% steps (CSS transition handles smoothness)
    useEffect(() => {
        if (status !== 'uploading' || !simulateProgress) return;

        const totalDuration = (fileSize / uploadSpeed) * 1000; // Total duration in ms
        const stepPercent = 2;
        const stepInterval = (stepPercent / 100) * totalDuration;

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = Math.min(prev + stepPercent, 100);
                const newUploadedBytes = Math.floor((newProgress / 100) * fileSize);
                setUploadedBytes(newUploadedBytes);

                if (newProgress >= 100) {
                    clearInterval(interval);
                    setStatus('uploaded');
                    onComplete?.();
                }
                return newProgress;
            });
        }, stepInterval);

        return () => clearInterval(interval);
    }, [status, simulateProgress, fileSize, uploadSpeed, onComplete]);

    // Reset when initialStatus changes
    useEffect(() => {
        setStatus(initialStatus);
        setProgress(initialStatus === 'uploaded' ? 100 : 0);
        setUploadedBytes(initialStatus === 'uploaded' ? fileSize : 0);
    }, [initialStatus, fileSize]);

    const handleCancel = useCallback(() => {
        setStatus('failed');
        onCancel?.();
    }, [onCancel]);

    const handleRetry = useCallback(() => {
        setStatus('uploading');
        setProgress(0);
        setUploadedBytes(0);
        onRetry?.();
    }, [onRetry]);

    // Layout styles applied via style prop on Material
    const layoutStyle: React.CSSProperties = {
        width,
        paddingTop: statusStyles.paddingTop,
        paddingBottom: statusStyles.paddingBottom,
        paddingLeft: 16,
        paddingRight: 12,
        display: 'flex',
        flexDirection: status === 'uploading' ? 'column' : 'row',
        justifyContent: status === 'uploading' ? 'center' : 'flex-start',
        alignItems: status === 'uploading' ? 'flex-start' : 'center',
        gap: status === 'uploading' ? 12 : 16,
        position: 'relative', // For error overlay positioning
        ...style,
    };

    // Error outline overlay - positioned absolutely to cover Material's thematic outline
    const errorOverlayStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        outline: '1px solid var(--color-state-error-medium)',
        outlineOffset: -1,
        pointerEvents: 'none',
        zIndex: 2, // Above Material's ::before pseudo-element (z-index: 1)
    };

    const renderUploading = () => (
        <>
            <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, minWidth: 0 }}>
                <div style={{ padding: 12, background: 'var(--color-brand-secondary-subtlest)', borderRadius: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <FileIcon size={24} weight="duotone" color="var(--color-brand-secondary-strong)" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minWidth: 0 }}>
                    <TruncatedFileName fileName={fileName} />
                    <div className="text-b3" style={{ color: 'var(--color-neutral-text-medium)' }}>
                        {formatFileSize(uploadedBytes)} of {formatFileSize(fileSize)} • {formatTimeRemaining(timeRemaining)}
                    </div>
                </div>
                <Button
                    variant="neutral"
                    size="small"
                    buttonStyle="subtle"
                    leadingIcon={<XIcon />}
                    onClick={handleCancel}
                />
            </div>
            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <ProgressBar value={progress} showLabel size="default" />
                <div className="text-b5" style={{ color: 'var(--color-neutral-text-medium)' }}>Uploading...</div>
            </div>
        </>
    );

    const renderUploaded = () => (
        <>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 16, minWidth: 0 }}>
                <div style={{ padding: 12, background: 'var(--color-brand-secondary-subtlest)', borderRadius: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <FileIcon size={24} weight="duotone" color="var(--color-brand-secondary-strong)" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minWidth: 0 }}>
                    <TruncatedFileName fileName={fileName} />
                    <div className="text-b3" style={{ color: 'var(--color-neutral-text-medium)' }}>{formatFileSize(fileSize)}</div>
                </div>
            </div>
            <Button
                variant="error"
                size="medium"
                buttonStyle="subtle"
                leadingIcon={<TrashIcon />}
                onClick={onDelete}
            />
        </>
    );

    const renderFailed = () => (
        <>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 16, minWidth: 0 }}>
                <div style={{ padding: 12, background: 'var(--color-brand-secondary-subtlest)', borderRadius: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <FileIcon size={24} weight="duotone" color="var(--color-brand-secondary-strong)" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minWidth: 0 }}>
                    <TruncatedFileName fileName={fileName} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <WarningCircleIcon size={16} weight="regular" color="var(--color-state-error-strong)" />
                        <span className="text-b3" style={{ color: 'var(--color-state-error-strong)' }}>{errorMessage}</span>
                    </div>
                </div>
            </div>
            <Button
                variant="neutral"
                size="small"
                buttonStyle="outline"
                leadingIcon={<ArrowClockwiseIcon />}
                onClick={handleRetry}
            >
                Retry
            </Button>
            <Button
                variant="error"
                size="medium"
                buttonStyle="subtle"
                leadingIcon={<TrashIcon />}
                onClick={onDelete}
            />
        </>
    );

    return (
        <Material
            size="medium"
            elevation="default"
            className={className}
            style={layoutStyle}
            aria-live="polite"
            aria-label={`File upload: ${fileName}. Status: ${status === 'uploading' ? `Uploading ${progress}%` : status}`}
        >
            {/* Error outline overlay - covers thematic outline when in failed state */}
            {status === 'failed' && <div style={errorOverlayStyle} />}
            {status === 'uploading' && renderUploading()}
            {status === 'uploaded' && renderUploaded()}
            {status === 'failed' && renderFailed()}
        </Material>
    );
};

export default FileUploadProgress;
