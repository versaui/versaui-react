'use client';

import React from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { CompactIconButton } from '../Button/CompactIconButton';
import { Dropdown } from '../Dropdown/Dropdown';

export const PAGINATION_SIZES = ['default', 'small'] as const;

export type PaginationSize = (typeof PAGINATION_SIZES)[number];

export interface PaginationProps {
    /** Current page (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Items per page */
    pageSize?: number;
    /** Available page size options */
    pageSizeOptions?: number[];
    /** Total item count */
    totalItems?: number;
    /** Page change callback */
    onPageChange: (page: number) => void;
    /** Page size change callback */
    onPageSizeChange?: (size: number) => void;
    /** Show page size selector */
    showPageSizeSelector?: boolean;
    /** Show item range info */
    showItemRange?: boolean;
    /** Maximum page buttons to show */
    maxPageButtons?: number;
    /** Additional className */
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    totalItems,
    onPageChange,
    onPageSizeChange,
    showPageSizeSelector = true,
    showItemRange = true,
    maxPageButtons = 5,
    className,
}) => {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: 'var(--color-neutral-surface-subtlest)',
        boxSizing: 'border-box',
    };

    const sectionStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    };

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    // Generate page numbers to display
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        if (totalPages <= maxPageButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | 'ellipsis')[] = [];
        const halfVisible = Math.floor((maxPageButtons - 2) / 2);

        let startPage = Math.max(2, currentPage - halfVisible);
        let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

        if (currentPage <= halfVisible + 1) {
            endPage = Math.min(totalPages - 1, maxPageButtons - 1);
        }
        if (currentPage >= totalPages - halfVisible) {
            startPage = Math.max(2, totalPages - maxPageButtons + 2);
        }

        pages.push(1);
        if (startPage > 2) pages.push('ellipsis');
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        if (endPage < totalPages - 1) pages.push('ellipsis');
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    const dropdownOptions = pageSizeOptions.map((option) => ({
        value: String(option),
        label: `${option}/Page`,
    }));

    return (
        <div className={cn('table-pagination', className)} style={containerStyle}>
            {/* Left section: Page info */}
            <div style={sectionStyle}>
                {showItemRange && totalItems !== undefined && (
                    <span
                        className="text-b5"
                        style={{ color: 'var(--color-neutral-text-subtle)' }}
                    >
                        Page {currentPage}/{totalPages}
                    </span>
                )}
            </div>

            {/* Center section: Page navigation */}
            <div style={{ ...sectionStyle, justifyContent: 'center', flex: 'none' }}>
                <CompactIconButton
                    size="small"
                    variant="subtle"
                    icon={<CaretLeftIcon size={16} weight="regular" />}
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={!canGoPrevious}
                    aria-label="Previous page"
                />

                {/* Page numbers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {pageNumbers.map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="text-b5"
                                    style={{
                                        padding: '4px 8px',
                                        color: 'var(--color-neutral-text-subtle)',
                                    }}
                                >
                                    ...
                                </span>
                            );
                        }

                        const isCurrentPage = page === currentPage;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className="text-b5"
                                style={{
                                    minWidth: 32,
                                    height: 32,
                                    padding: '4px 8px',
                                    border: 'none',
                                    borderRadius: 6,
                                    backgroundColor: isCurrentPage
                                        ? 'var(--color-brand-primary-subtlest)'
                                        : 'transparent',
                                    color: isCurrentPage
                                        ? 'var(--color-brand-primary-strong)'
                                        : 'var(--color-neutral-text-medium)',
                                    cursor: 'pointer',
                                    fontWeight: isCurrentPage ? 600 : 400,
                                    transition: 'all 0.15s ease',
                                }}
                                aria-label={`Page ${page}`}
                                aria-current={isCurrentPage ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <CompactIconButton
                    size="small"
                    variant="subtle"
                    icon={<CaretRightIcon size={16} weight="regular" />}
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={!canGoNext}
                    aria-label="Next page"
                />
            </div>

            {/* Right section: Page size dropdown */}
            <div style={{ ...sectionStyle, justifyContent: 'flex-end' }}>
                {showPageSizeSelector && onPageSizeChange && (
                    <Dropdown
                        size="small"
                        type="inline"
                        value={String(pageSize)}
                        options={dropdownOptions}
                        onChange={(value) => onPageSizeChange(Number(value))}
                        showSearch={false}
                        floatingLabel={false}
                    />
                )}
            </div>
        </div>
    );
};

Pagination.displayName = 'Pagination';

export default Pagination;
