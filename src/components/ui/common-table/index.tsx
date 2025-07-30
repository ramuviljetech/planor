import React from "react";
import classNames from "classnames";
import Pagination from "../pagination";
import styles from "./styles.module.css";

export interface TableColumn {
  key: string;
  title: string;
  width?: string | number;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

export interface CommonTableProps {
  title?: string;
  columns: TableColumn[];
  rows: TableRow[];
  onRowClick?: (row: TableRow, index: number) => void;
  selectedRowId?: string | number;
  selectedRowIds?: Set<string | number>;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onPrevious?: () => void;
    onNext?: () => void;
    showItemCount?: boolean;
  };
}

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  rows,
  onRowClick,
  selectedRowId,
  selectedRowIds,
  className,
  containerClassName,
  disabled = false,
  pagination,
}) => {
  const handleRowClick = (row: TableRow, index: number) => {
    if (disabled || !onRowClick) {
      return;
    }
    onRowClick(row, index);
  };

  const getColumnStyle = (column: TableColumn) => {
    if (column.width) {
      return {
        width:
          typeof column.width === "number" ? `${column.width}px` : column.width,
        minWidth:
          typeof column.width === "number" ? `${column.width}px` : column.width,
      };
    }
    return {};
  };

  return (
    <div className={classNames(styles.table_container, containerClassName)}>
      <div className={classNames(styles.table_wrapper, className)}>
        <table className={styles.table}>
          <thead className={styles.table_header}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={styles.table_header_cell}
                  style={getColumnStyle(column)}
                >
                  {column.headerRender ? (
                    column.headerRender()
                  ) : (
                    <div className={styles.table_header_cell_title}>
                      {column.title}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.table_body}>
            {rows.map((row, rowIndex) => {
              const isSelected =
                selectedRowId === row.id || selectedRowIds?.has(row.id);

              const rowClassName = classNames(styles.table_row, {
                [styles.selected_row]: isSelected,
                [styles.clickable_row]: !!onRowClick && !disabled,
                [styles.disabled_row]: disabled,
              });

              return (
                <tr
                  key={row.id}
                  className={rowClassName}
                  onClick={() =>
                    handleRowClick && handleRowClick(row, rowIndex)
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={styles.table_cell}
                      style={getColumnStyle(column)}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalItems > pagination.itemsPerPage && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
          showItemCount={pagination.showItemCount}
        />
      )}
    </div>
  );
};

export default CommonTable;
