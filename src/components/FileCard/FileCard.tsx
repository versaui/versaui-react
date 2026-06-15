'use client';

import React, { useMemo, type CSSProperties, type FC, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import {
    File,
    FilePdf,
    FileArchive,
    FigmaLogo,
    FileDoc,
    Table,
    DownloadSimple,
    X,
} from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

// Types & Constants

export const FILE_CARD_SIZES = ['small', 'default', 'large'] as const;
export const FILE_CARD_FORMATS = ['general', 'pdf', 'zip', 'figma', 'document', 'spreadsheet'] as const;

export type FileCardSize = (typeof FILE_CARD_SIZES)[number];
export type FileCardFormat = (typeof FILE_CARD_FORMATS)[number];

// Size Configuration

interface SizeConfig {
    /** Container height */
    height: string;
    /** Container padding-left */
    paddingLeft: string;
    /** Container padding-y */
    paddingY: string;
    /** Gap between icon, details, buttons */
    gap: string;
    /** Corner radius class */
    borderRadius: string;
    /** Elevation size token */
    elevationSize: 'small' | 'medium' | 'large';
    /** Icon container padding */
    iconPadding: string;
    /** Icon size in pixels */
    iconSize: number;
    /** File name typography class */
    nameClass: string;
    /** File size typography class */
    sizeClass: string;
    /** Details gap (only small has explicit gap) */
    detailsGap: string;
    /** Button padding */
    buttonPadding: string;
    /** Button icon size */
    buttonIconSize: number;
    /** Button corner radius */
    buttonRadius: string;
    /** Buttons container padding-right */
    buttonsPaddingRight: string;
    /** Buttons container gap */
    buttonsGap: string;
}

const SIZE_CONFIG: Record<FileCardSize, SizeConfig> = {
    small: {
        height: '48px',
        paddingLeft: 'var(--spacing-4)',
        paddingY: 'var(--spacing-4)',
        gap: 'var(--spacing-4)',
        borderRadius: 'var(--corner-radius-default-small)',
        elevationSize: 'small',
        iconPadding: 'var(--spacing-4)',
        iconSize: 16,
        nameClass: 'text-h9',
        sizeClass: 'text-b6',
        detailsGap: 'var(--spacing-2)',
        buttonPadding: 'var(--spacing-4)',
        buttonIconSize: 16,
        buttonRadius: 'var(--corner-radius-thematic-small)',
        buttonsPaddingRight: 'var(--spacing-4)',
        buttonsGap: 'var(--spacing-4)',
    },
    default: {
        height: '60px',
        paddingLeft: 'var(--spacing-5)',
        paddingY: 'var(--spacing-4)',
        gap: 'var(--spacing-5)',
        borderRadius: 'var(--corner-radius-default-medium)',
        elevationSize: 'medium',
        iconPadding: '10px',
        iconSize: 20,
        nameClass: 'text-h8',
        sizeClass: 'text-b5',
        detailsGap: '0px',
        buttonPadding: 'var(--spacing-4)',
        buttonIconSize: 16,
        buttonRadius: 'var(--corner-radius-thematic-small)',
        buttonsPaddingRight: 'var(--spacing-5)',
        buttonsGap: 'var(--spacing-4)',
    },
    large: {
        height: '72px',
        paddingLeft: 'var(--spacing-5)',
        paddingY: 'var(--spacing-5)',
        gap: 'var(--spacing-6)',
        borderRadius: 'var(--corner-radius-default-medium)',
        elevationSize: 'large',
        iconPadding: 'var(--spacing-5)',
        iconSize: 24,
        nameClass: 'text-h7',
        sizeClass: 'text-b4',
        detailsGap: '0px',
        buttonPadding: '10px',
        buttonIconSize: 20,
        buttonRadius: 'var(--corner-radius-thematic-medium)',
        buttonsPaddingRight: 'var(--spacing-5)',
        buttonsGap: 'var(--spacing-5)',
    },
};

// Format Configuration

interface FormatConfig {
    /** Background color for the icon container */
    iconBg: string;
    /** Border color for the icon container */
    iconBorder: string;
    /** Icon color */
    iconColor: string;
    /** The Phosphor icon component */
    Icon: React.ElementType;
}

const FORMAT_CONFIG: Record<FileCardFormat, FormatConfig> = {
    general: {
        iconBg: 'var(--color-neutral-surface-subtle)',
        iconBorder: 'var(--color-neutral-outline-subtlest)',
        iconColor: 'var(--color-neutral-icon-medium)',
        Icon: File,
    },
    pdf: {
        iconBg: 'var(--color-state-error-subtlest)',
        iconBorder: 'var(--color-state-error-subtler)',
        iconColor: 'var(--color-state-error-strong)',
        Icon: FilePdf,
    },
    zip: {
        iconBg: 'var(--color-brand-secondary-subtlest)',
        iconBorder: 'var(--color-brand-secondary-subtler)',
        iconColor: 'var(--color-brand-secondary-strong)',
        Icon: FileArchive,
    },
    figma: {
        iconBg: 'var(--color-brand-secondary-subtlest)',
        iconBorder: 'var(--color-brand-secondary-subtler)',
        iconColor: 'var(--color-brand-secondary-strong)',
        Icon: FigmaLogo,
    },
    document: {
        iconBg: 'var(--color-brand-secondary-subtlest)',
        iconBorder: 'var(--color-brand-secondary-subtler)',
        iconColor: 'var(--color-brand-secondary-strong)',
        Icon: FileDoc,
    },
    spreadsheet: {
        iconBg: 'var(--color-state-success-subtlest)',
        iconBorder: 'var(--color-state-success-subtler)',
        iconColor: 'var(--color-state-success-strong)',
        Icon: Table,
    },
};

// Props

export interface FileCardProps {
    /** Size variant */
    size?: FileCardSize;
    /** File format, determines icon and color scheme */
    format?: FileCardFormat;
    /** File name to display */
    fileName?: string;
    /** File size text to display */
    fileSize?: string;
    /** Whether to show the download button */
    downloadable?: boolean;
    /** Whether to show the remove (×) button */
    removable?: boolean;
    /** Custom icon to override the format icon */
    icon?: ReactNode;
    /** Called when the download button is clicked */
    onDownload?: () => void;
    /** Called when the remove button is clicked */
    onRemove?: () => void;
    /** Additional className */
    className?: string;
}

// Component

export const FileCard: FC<FileCardProps> = ({
    size = 'default',
    format = 'general',
    fileName = 'Sample file',
    fileSize = '3.2 MB',
    downloadable = true,
    removable = true,
    icon,
    onDownload,
    onRemove,
    className = '',
}) => {
    const config = SIZE_CONFIG[size];
    const formatCfg = FORMAT_CONFIG[format];
    const IconComponent = formatCfg.Icon;

    const containerStyle = useMemo<CSSProperties>(() => ({
        display: 'flex',
        alignItems: 'center',
        height: config.height,
        paddingLeft: config.paddingLeft,
        gap: config.gap,
        backgroundColor: 'var(--color-neutral-surface-subtlest)',
        border: '1px solid var(--color-neutral-outline-subtle)',
        borderRadius: config.borderRadius,
        backdropFilter: `blur(var(--elevation-${config.elevationSize}-blur))`,
        WebkitBackdropFilter: `blur(var(--elevation-${config.elevationSize}-blur))`,
        width: '100%',
    }), [config]);

    const iconContainerStyle = useMemo<CSSProperties>(() => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: config.iconPadding,
        border: `1px solid ${formatCfg.iconBorder}`,
        borderRadius: 'var(--corner-radius-default-fully-rounded)',
        backgroundColor: formatCfg.iconBg,
        flexShrink: 0,
        position: 'relative',
    }), [config.iconPadding, formatCfg]);

    const glowStyle = useMemo<CSSProperties>(() => ({
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        boxShadow: 'var(--glow-small)',
    }), []);

    return (
        <div
            className={cn('relative', className)}
            style={containerStyle}
            role="listitem"
            aria-label={`${fileName}, ${fileSize}`}
        >
            {/* File Icon */}
            <div style={iconContainerStyle}>
                {icon || (
                    <IconComponent
                        size={config.iconSize}
                        weight="regular"
                        style={{ color: formatCfg.iconColor, flexShrink: 0 }}
                    />
                )}
                <div style={glowStyle} aria-hidden />
            </div>

            {/* File Details */}
            <div
                className="flex flex-col items-start justify-center flex-1 min-w-0 relative"
                style={{ gap: config.detailsGap }}
            >
                <p
                    className={cn(config.nameClass, 'w-full truncate')}
                    style={{ color: 'var(--color-neutral-text-strong)', margin: 0 }}
                    title={fileName}
                >
                    {fileName}
                </p>
                <p
                    className={config.sizeClass}
                    style={{ color: 'var(--color-neutral-text-medium)', margin: 0 }}
                >
                    {fileSize}
                </p>
            </div>

            {/* Action Buttons */}
            {(downloadable || removable) && (
                <div
                    className="flex items-center justify-end shrink-0"
                    style={{
                        gap: config.buttonsGap,
                        paddingRight: config.buttonsPaddingRight,
                    }}
                >
                    {downloadable && (
                        <button
                            type="button"
                            className="flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                            style={{
                                padding: config.buttonPadding,
                                borderRadius: config.buttonRadius,
                                backgroundColor: 'var(--color-neutral-surface-medium)',
                            }}
                            onClick={onDownload}
                            aria-label={`Download ${fileName}`}
                        >
                            <DownloadSimple
                                size={config.buttonIconSize}
                                weight="regular"
                                style={{ color: 'var(--color-neutral-icon-strong)' }}
                            />
                        </button>
                    )}
                    {removable && (
                        <button
                            type="button"
                            className="flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                            style={{
                                padding: config.buttonPadding,
                                borderRadius: config.buttonRadius,
                            }}
                            onClick={onRemove}
                            aria-label={`Remove ${fileName}`}
                        >
                            <X
                                size={config.buttonIconSize}
                                weight="regular"
                                style={{ color: 'var(--color-neutral-icon-medium)' }}
                            />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

FileCard.displayName = 'FileCard';
export default FileCard;
