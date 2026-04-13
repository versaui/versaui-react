'use client';

import type { FC, CSSProperties } from 'react';
import { ProgressBar, type ProgressBarSize } from './ProgressBar';

export const PROGRESS_BAR_LABEL_TYPES = ['planUsage', 'status'] as const;
export const PROGRESS_BAR_LABEL_SIZES = ['default', 'small'] as const;

export type ProgressBarLabelType = (typeof PROGRESS_BAR_LABEL_TYPES)[number];
export type ProgressBarLabelSize = (typeof PROGRESS_BAR_LABEL_SIZES)[number];

interface ProgressBarLabelProps {
    type?: ProgressBarLabelType;
    size?: ProgressBarLabelSize;
    value?: number;
    title?: string;
    titleValue?: string;
    statusLeft?: string;
    statusRight?: string;
    statusText?: string;
    className?: string;
}

const SIZE_CONFIG: Record<ProgressBarLabelSize, {
    titleClass: string;
    statusClass: string;
    progressBarSize: ProgressBarSize;
}> = {
    default: {
        titleClass: 'text-h8',
        statusClass: 'text-b5',
        progressBarSize: 'default',
    },
    small: {
        titleClass: 'text-h9',
        statusClass: 'text-b6',
        progressBarSize: 'small',
    },
};

const rowStyle: CSSProperties = {
    display: 'inline-flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
};

export const ProgressBarLabel: FC<ProgressBarLabelProps> = ({
    type = 'status',
    size = 'default',
    value = 0,
    title = 'Seats',
    titleValue = '5/20',
    statusLeft = '25% used',
    statusRight = '15 remaining',
    statusText = 'Uploading...',
    className = '',
}) => {
    const { titleClass, statusClass, progressBarSize } = SIZE_CONFIG[size];

    const containerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
        width: '100%',
    };

    const titleTextStyle: CSSProperties = {
        color: 'var(--color-neutral-text-strong)',
    };

    const statusTextStyle: CSSProperties = {
        color: 'var(--color-neutral-text-medium)',
    };

    if (type === 'planUsage') {
        return (
            <div className={className} style={containerStyle}>
                <div style={rowStyle}>
                    <span className={titleClass} style={titleTextStyle}>{title}</span>
                    <span className={titleClass} style={titleTextStyle}>{titleValue}</span>
                </div>
                <ProgressBar size={progressBarSize} value={value} showLabel={false} />
                <div style={rowStyle}>
                    <span className={statusClass} style={statusTextStyle}>{statusLeft}</span>
                    <span className={statusClass} style={statusTextStyle}>{statusRight}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={className} style={containerStyle}>
            <ProgressBar size={progressBarSize} value={value} showLabel={true} />
            <span className={statusClass} style={{ ...statusTextStyle, alignSelf: 'stretch' }}>{statusText}</span>
        </div>
    );
};

export default ProgressBarLabel;
