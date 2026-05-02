'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useFocusRing } from '@react-aria/focus';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';

export type ImageType = 'logo' | 'avatar';
export type ImageUploadState = 'default' | 'hovered' | 'uploaded';

export interface ImageUploadProps {
    imageType?: ImageType;
    title?: string;
    description?: string;
    accept?: string;
    imageUrl?: string;
    onImageSelect?: (file: File) => void;
    onRemove?: () => void;
    onChange?: () => void;
    width?: number | string;
    className?: string;
    style?: React.CSSProperties;
}

const STATE_COLORS = {
    logo: {
        default: {
            iconBg: 'var(--color-brand-primary-subtlest)',
            iconOutline: 'var(--color-brand-primary-subtler)',
        },
        hovered: {
            iconBg: 'var(--color-brand-primary-subtler)',
            iconOutline: 'var(--color-brand-primary-subtler)',
        },
    },
} as const;

export const ImageUpload: React.FC<ImageUploadProps> = ({
    imageType = 'logo',
    title,
    description = 'File type PNG or JPG • Min 512 x 512 px',
    accept = 'image/png, image/jpeg, image/jpg',
    imageUrl,
    onImageSelect,
    onRemove,
    onChange,
    width = 600,
    className = '',
    style,
}) => {
    const [state, setState] = useState<ImageUploadState>(imageUrl ? 'uploaded' : 'default');
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isFocusVisible, focusProps } = useFocusRing();

    const defaultTitle = imageType === 'logo' ? 'Upload Logo' : 'Upload Avatar';
    const displayTitle = title || defaultTitle;

    const handleMouseEnter = useCallback(() => {
        if (state !== 'uploaded') setState('hovered');
    }, [state]);

    const handleMouseLeave = useCallback(() => {
        if (state !== 'uploaded') setState('default');
    }, [state]);

    const handleClick = useCallback(() => {
        if (state !== 'uploaded') fileInputRef.current?.click();
    }, [state]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setState('uploaded');
            onImageSelect?.(file);
        }
        e.target.value = '';
    }, [onImageSelect]);

    const handleRemove = useCallback(() => {
        setPreviewUrl(undefined);
        setState('default');
        onRemove?.();
    }, [onRemove]);

    const handleChange = useCallback(() => {
        fileInputRef.current?.click();
        onChange?.();
    }, [onChange]);

    const containerStyle: React.CSSProperties = useMemo(() => ({
        width,
        paddingTop: 8,
        paddingBottom: 8,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: state === 'uploaded' ? 'center' : 'flex-start',
        gap: 16,
        cursor: state !== 'uploaded' ? 'pointer' : 'default',
        outline: 'none',
        ...style,
    }), [width, state, style]);

    // Handle keyboard activation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (state === 'uploaded') return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [state, handleClick]);

    const renderLogoIcon = () => {
        const colors = state === 'hovered' ? STATE_COLORS.logo.hovered : STATE_COLORS.logo.default;
        const focusRingStyle = (isFocusVisible && state !== 'uploaded')
            ? { boxShadow: 'var(--focus-ring-primary)' }
            : {};
        return (
            <div style={{
                padding: 12,
                background: colors.iconBg,
                borderRadius: 200,
                outline: `1px solid ${colors.iconOutline}`,
                outlineOffset: -1,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 8,
                ...focusRingStyle,
            }}>
                <UploadSimpleIcon size={24} weight="regular" color="var(--color-brand-primary-strong)" />
            </div>
        );
    };

    const renderAvatarPlaceholder = () => {
        const focusRingStyle = (isFocusVisible && state !== 'uploaded')
            ? { boxShadow: 'var(--focus-ring-primary)', borderRadius: '9999px' }
            : {};
        return (
            <div style={{ display: 'inline-flex', borderRadius: '9999px', ...focusRingStyle }}>
                <Avatar size="l" type="placeholder" color="neutral" />
            </div>
        );
    };

    const renderUploadedLogo = () => (
        <div style={{
            width: 48,
            height: 48,
            borderRadius: 200,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <img
                src={previewUrl}
                alt="Uploaded logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
        </div>
    );

    const renderUploadedAvatar = () => (
        <div style={{
            width: 48,
            height: 48,
            borderRadius: 9999,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <img
                src={previewUrl}
                alt="Uploaded avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
        </div>
    );

    const renderIcon = () => {
        if (state === 'uploaded') {
            return imageType === 'logo' ? renderUploadedLogo() : renderUploadedAvatar();
        }
        return imageType === 'logo' ? renderLogoIcon() : renderAvatarPlaceholder();
    };

    return (
        <div
            className={className}
            style={containerStyle}
            role={state !== 'uploaded' ? 'button' : undefined}
            aria-label={state !== 'uploaded' ? `Upload ${imageType}. Click or press Enter to browse.` : undefined}
            tabIndex={state !== 'uploaded' ? 0 : -1}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={state !== 'uploaded' ? handleClick : undefined}
            onKeyDown={handleKeyDown}
            {...(state !== 'uploaded' ? focusProps : {})}
        >
            {renderIcon()}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4 }}>
                <div className="text-h7" style={{ alignSelf: 'stretch', color: 'var(--color-neutral-text-strong)' }}>
                    {displayTitle}
                </div>
                <div className="text-b4" style={{ alignSelf: 'stretch', color: 'var(--color-neutral-text-medium)' }}>
                    {description}
                </div>
            </div>

            {state === 'uploaded' && (
                <>
                    <Button
                        variant="error"
                        size="small"
                        buttonStyle="outline"
                        onClick={handleRemove}
                    >
                        Remove
                    </Button>
                    <Button
                        variant="neutral"
                        size="small"
                        buttonStyle="outline"
                        onClick={handleChange}
                    >
                        Change
                    </Button>
                </>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ImageUpload;
