'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { FileArrowUpIcon, FolderOpenIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '../Button/Button';
import { LinkButton } from '../Button/LinkButton';

export interface FileUploadAreaProps {
    title?: string;
    description?: string;
    browseButtonText?: string;
    sampleLinkText?: string;
    showSampleLink?: boolean;
    /** Whether to show the browse/upload button. Defaults to true. */
    showBrowseButton?: boolean;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    width?: number | string;
    onFilesSelected?: (files: FileList) => void;
    onSampleDownload?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

type UploadState = 'default' | 'hovered' | 'dragover';

const STATE_COLORS = {
    default: {
        background: 'var(--color-neutral-surface-subtlest)',
        border: 'var(--color-neutral-outline-medium)',
        iconBg: 'var(--color-neutral-surface-subtle)',
        icon: 'var(--color-neutral-icon-medium)',
    },
    hovered: {
        background: 'var(--color-neutral-surface-subtle)',
        border: 'var(--color-neutral-outline-medium)',
        iconBg: 'var(--color-neutral-surface-subtle)',
        icon: 'var(--color-neutral-icon-medium)',
    },
    dragover: {
        background: 'var(--color-brand-secondary-subtlest)',
        border: 'var(--color-brand-secondary-medium)',
        iconBg: 'var(--color-brand-secondary-subtlest)',
        icon: 'var(--color-brand-secondary-medium)',
    },
} as const;

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    title = 'Drag and drop a file here',
    description = 'File type must be PDF, PNG or JPG under 5 MB',
    browseButtonText = 'Browse Files',
    sampleLinkText = 'Download Sample File',
    showSampleLink = true,
    showBrowseButton = true,
    accept,
    multiple = false,
    disabled = false,
    width = 600,
    onFilesSelected,
    onSampleDownload,
    className = '',
    style,
}) => {
    const [state, setState] = useState<UploadState>('default');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);

    const colors = STATE_COLORS[state];

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounterRef.current++;
        if (e.dataTransfer.items?.length) setState('dragover');
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        if (--dragCounterRef.current === 0) setState('default');
    }, [disabled]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounterRef.current = 0;
        setState('default');
        if (e.dataTransfer.files?.length) {
            onFilesSelected?.(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    }, [disabled, onFilesSelected]);

    const handleMouseEnter = useCallback(() => {
        if (!disabled && state !== 'dragover') setState('hovered');
    }, [disabled, state]);

    const handleMouseLeave = useCallback(() => {
        if (!disabled && state !== 'dragover') setState('default');
    }, [disabled, state]);

    const handleBrowseClick = useCallback(() => {
        if (!disabled) fileInputRef.current?.click();
    }, [disabled]);

    // When browse button is hidden, clicking the container opens the file picker
    const handleContainerClick = useCallback(() => {
        if (!disabled && !showBrowseButton) fileInputRef.current?.click();
    }, [disabled, showBrowseButton]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) onFilesSelected?.(e.target.files);
        e.target.value = '';
    }, [onFilesSelected]);

    const containerStyle: React.CSSProperties = useMemo(() => ({
        width,
        padding: 32,
        borderRadius: 'var(--corner-radius-default-large)',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
        background: colors.background,
        border: `1px dashed ${colors.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 150ms ease-out, border-color 150ms ease-out',
        outline: 'none',
        ...style,
    }), [width, colors, disabled, style]);

    // Handle keyboard activation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
        }
    }, [disabled]);

    return (
        <div
            className={className}
            style={containerStyle}
            role="button"
            aria-label="File upload area. Drag and drop files here or press Enter to browse."
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleContainerClick}
            onKeyDown={handleKeyDown}
        >
            <div style={{ padding: 12, borderRadius: 200, background: colors.iconBg, display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                <FileArrowUpIcon size={32} weight="duotone" color={colors.icon} />
            </div>

            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="text-h6" style={{ textAlign: 'center', color: 'var(--color-neutral-text-strong)' }}>
                    {title}
                </div>
                <div className="text-b3" style={{ textAlign: 'center', color: 'var(--color-neutral-text-medium)' }}>
                    {description}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                {showBrowseButton && (
                    <Button
                        variant="primary"
                        size="medium"
                        buttonStyle="outline"
                        leadingIcon={<FolderOpenIcon />}
                        onClick={handleBrowseClick}
                        disabled={disabled}
                    >
                        {browseButtonText}
                    </Button>
                )}

                {showSampleLink && (
                    <LinkButton
                        type="neutral"
                        size="small"
                        leadingIcon={<DownloadSimpleIcon />}
                        onClick={onSampleDownload}
                        disabled={disabled}
                    >
                        {sampleLinkText}
                    </LinkButton>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default FileUploadArea;
