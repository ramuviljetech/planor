import React from "react";
import classNames from "classnames";
import styles from "./styles.module.css";
import Image from "next/image";
import {
  rightArrowPinkIcon,
  leftArrowGrayIcon,
  leftArrowBlackIcon,
  rightArrowBlackIcon,
  rightArrowGrayIcon,
} from "@/resources/images";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
  showItemCount?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPrevious,
  onNext,
  className,
  showItemCount = true,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPrevious ? onPrevious() : onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onNext ? onNext() : onPageChange(currentPage + 1);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and neighbors
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={classNames(styles.pagination_container, className)}>
      <div className={styles.pagination_content}>
        <div className={styles.left_section}>
          <div
            className={classNames(styles.nav_button, {
              [styles.disabled]: currentPage === 1,
            })}
            onClick={currentPage > 1 ? handlePrevious : undefined}
          >
            <Image
              src={currentPage === 1 ? leftArrowGrayIcon : leftArrowBlackIcon}
              alt="arrow-left"
              width={16}
              height={16}
            />
            <span className={styles.nav_text}>Previous</span>
          </div>

          {showItemCount && (
            <div className={styles.item_count}>
              <span className={styles.count_text}>Showing</span>
              <span className={styles.count_number}>
                {String(startItem).padStart(2, "0")}
              </span>
              <span className={styles.count_text}>out of</span>
              <span className={styles.count_number}>
                {String(totalItems).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        <div className={styles.middle_section}>
          <div className={styles.page_numbers}>
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className={styles.ellipsis}>...</span>
                ) : (
                  <div
                    className={classNames(styles.page_button, {
                      [styles.activePage]: page === currentPage,
                    })}
                    onClick={() => onPageChange(page as number)}
                  >
                    {String(page).padStart(2, "0")}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className={styles.right_section}>
          <div
            className={classNames(styles.nav_button, {
              [styles.disabled]: currentPage === totalPages,
            })}
            onClick={currentPage < totalPages ? handleNext : undefined}
          >
            <span className={styles.nav_text}>Next</span>
            <Image
              src={
                currentPage === totalPages
                  ? rightArrowGrayIcon
                  : rightArrowBlackIcon
              }
              alt="arrow-right"
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
