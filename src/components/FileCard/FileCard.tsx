'use client';

import React, { useMemo, type CSSProperties, type FC, type ReactNode } from 'react';
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
import {
    ContainedIcon,
    type ContainedIconCornerRadiusType,
    type ContainedIconRole,
    type ContainedIconSize,
} from '../../assets/ContainedIcon';
import { Material, type MaterialSize } from '../Material/Material';
import { Button, type ButtonSize } from '../Button/Button';
import { cn } from '../../utils/cn';

// Types & Constants

export const FILE_CARD_SIZES = ['small', 'medium', 'large'] as const;
export const FILE_CARD_ICON_STYLES = ['simple', 'expressive'] as const;
export const FILE_CARD_FORMATS = ['general', 'pdf', 'zip', 'figma', 'document', 'spreadsheet'] as const;

export type FileCardSize = (typeof FILE_CARD_SIZES)[number] | 'default';
export type FileCardIconStyle = (typeof FILE_CARD_ICON_STYLES)[number];
export type FileCardFormat = (typeof FILE_CARD_FORMATS)[number];

const MATERIAL_SIZE_MAP: Record<'small' | 'medium' | 'large', MaterialSize> = {
    small: 'small',
    medium: 'medium',
    large: 'medium',
};

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
    /** Contained icon size variant */
    iconSize: ContainedIconSize;
    /** File name typography class */
    nameClass: string;
    /** File size typography class */
    sizeClass: string;
    /** Details gap (only small has explicit gap) */
    detailsGap: string;
    /** Button size variant */
    buttonSize: ButtonSize;
    /** Button icon size */
    buttonIconSize: number;
    /** Buttons container padding-right */
    buttonsPaddingRight: string;
    /** Buttons container gap */
    buttonsGap: string;
}

const SIZE_CONFIG: Record<'small' | 'medium' | 'large', SizeConfig> = {
    small: {
        height: '48px',
        paddingLeft: 'var(--spacing-4)',
        paddingY: 'var(--spacing-4)',
        gap: 'var(--spacing-4)',
        borderRadius: 'var(--corner-radius-default-small)',
        iconSize: 'small',
        nameClass: 'text-h9',
        sizeClass: 'text-b6',
        detailsGap: 'var(--spacing-2)',
        buttonSize: 'small',
        buttonIconSize: 16,
        buttonsPaddingRight: 'var(--spacing-4)',
        buttonsGap: 'var(--spacing-4)',
    },
    medium: {
        height: '60px',
        paddingLeft: 'var(--spacing-5)',
        paddingY: 'var(--spacing-4)',
        gap: 'var(--spacing-5)',
        borderRadius: 'var(--corner-radius-default-medium)',
        iconSize: 'medium',
        nameClass: 'text-h8',
        sizeClass: 'text-b5',
        detailsGap: '0px',
        buttonSize: 'small',
        buttonIconSize: 16,
        buttonsPaddingRight: 'var(--spacing-5)',
        buttonsGap: 'var(--spacing-4)',
    },
    large: {
        height: '72px',
        paddingLeft: 'var(--spacing-5)',
        paddingY: 'var(--spacing-5)',
        gap: 'var(--spacing-6)',
        borderRadius: 'var(--corner-radius-default-medium)',
        iconSize: 'large',
        nameClass: 'text-h7',
        sizeClass: 'text-b4',
        detailsGap: '0px',
        buttonSize: 'medium',
        buttonIconSize: 20,
        buttonsPaddingRight: 'var(--spacing-5)',
        buttonsGap: 'var(--spacing-5)',
    },
};

// Format Configuration

interface FormatConfig {
    /** Semantic role matching the file format */
    role: ContainedIconRole;
    /** The Phosphor icon component */
    Icon: React.ElementType;
}

const FORMAT_CONFIG: Record<FileCardFormat, FormatConfig> = {
    general: {
        role: 'neutral',
        Icon: File,
    },
    pdf: {
        role: 'error',
        Icon: FilePdf,
    },
    zip: {
        role: 'secondary',
        Icon: FileArchive,
    },
    figma: {
        role: 'secondary',
        Icon: FigmaLogo,
    },
    document: {
        role: 'secondary',
        Icon: FileDoc,
    },
    spreadsheet: {
        role: 'success',
        Icon: Table,
    },
};

// Props

export interface FileCardProps {
    /** Visual style treatment for the contained icon: 'simple' | 'expressive' */
    iconStyle?: FileCardIconStyle;
    /** Size variant: 'small' | 'medium' | 'large' */
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
    /** Corner radius type for the contained icon: 'default' | 'control' | 'full' */
    iconCornerRadiusType?: ContainedIconCornerRadiusType;
    /** Explicit corner-radius override for the contained icon */
    iconCornerRadius?: string;
    /** Called when the download button is clicked */
    onDownload?: () => void;
    /** Called when the remove button is clicked */
    onRemove?: () => void;
    /** Additional className */
    className?: string;
}

// Component

export const FileCard: FC<FileCardProps> = ({
    iconStyle = 'simple',
    size = 'medium',
    format = 'general',
    fileName = 'Sample file',
    fileSize = '3.2 MB',
    downloadable = true,
    removable = true,
    icon,
    iconCornerRadiusType = 'full',
    iconCornerRadius = 'var(--corner-radius-default-fully-rounded)',
    onDownload,
    onRemove,
    className = '',
}) => {
    const effectiveSize: 'small' | 'medium' | 'large' = size === 'default' ? 'medium' : size;
    const config = SIZE_CONFIG[effectiveSize];
    const formatCfg = FORMAT_CONFIG[format];
    const IconComponent = formatCfg.Icon;

    const containerStyle = useMemo<CSSProperties>(() => ({
        display: 'flex',
        alignItems: 'center',
        height: config.height,
        paddingLeft: config.paddingLeft,
        gap: config.gap,
        width: '100%',
    }), [config]);

    return (
        <Material
            size={MATERIAL_SIZE_MAP[effectiveSize]}
            elevation="default"
            cornerRadius={config.borderRadius}
            className={className}
            style={containerStyle}
            role="listitem"
            aria-label={`${fileName}, ${fileSize}`}
        >
            {/* Contained File Icon */}
            <ContainedIcon
                style={iconStyle}
                role={formatCfg.role}
                size={config.iconSize}
                cornerRadiusType={iconCornerRadiusType}
                cornerRadius={iconCornerRadius}
                icon={icon || IconComponent}
            />

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
                        <Button
                            variant="neutral"
                            buttonStyle="filled"
                            size={config.buttonSize}
                            leadingIcon={
                                <DownloadSimple
                                    size={config.buttonIconSize}
                                    weight="regular"
                                />
                            }
                            onClick={onDownload}
                            aria-label={`Download ${fileName}`}
                        />
                    )}
                    {removable && (
                        <Button
                            variant="neutral"
                            buttonStyle="subtle"
                            size={config.buttonSize}
                            leadingIcon={
                                <X
                                    size={config.buttonIconSize}
                                    weight="regular"
                                />
                            }
                            onClick={onRemove}
                            aria-label={`Remove ${fileName}`}
                        />
                    )}
                </div>
            )}
        </Material>
    );
};

FileCard.displayName = 'FileCard';
export default FileCard;

