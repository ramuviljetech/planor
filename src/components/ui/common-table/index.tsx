import React from "react";
import classNames from "classnames";
import Pagination from "../pagination";
import styles from "./styles.module.css";

export interface TableColumn {
  key: string;
  title: string;
  width?: string | number;
  render?: (value: any, row: any, index: number) => React.ReactNode;
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
  className?: string;
  containerClassName?: string;
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
  className,
  containerClassName,
  pagination,
}) => {
  const handleRowClick = (row: TableRow, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
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
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.table_body}>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={classNames(styles.table_row, {
                  [styles.selected_row]: selectedRowId === row.id,
                  [styles.clickable_row]: !!onRowClick,
                })}
                onClick={() => handleRowClick(row, rowIndex)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
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
