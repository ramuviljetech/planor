import React, { useRef, useState } from "react";
import CommonTable, { TableColumn, TableRow } from "../common-table";
import PopOver from "../popover";
import Image from "next/image";
import { threeDotsIcon } from "@/resources/images";
import styles from "./styles.module.css";

export interface PopoverAction {
  label: string;
  onClick: (rowId: string | number) => void;
}

export interface CommonTableWithPopoverProps {
  columns: TableColumn[];
  rows: TableRow[];
  selectedRowId?: string | number;
  onRowClick?: (row: TableRow, index: number) => void;
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
  actions: PopoverAction[];
  actionIconClassName?: string;
  popoverMenuClassName?: string;
  popoverMenuItemClassName?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  actionIcon?: string;
}

const CommonTableWithPopover: React.FC<CommonTableWithPopoverProps> = ({
  columns,
  rows,
  selectedRowId,
  onRowClick,
  pagination,
  actions,
  actionIconClassName,
  popoverMenuClassName,
  popoverMenuItemClassName,
  disabled = false,
  className,
  containerClassName,
  actionIcon,
}) => {
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
    rowData: any | null;
  }>({ show: false, rowId: null, rowData: null });

  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Add actions column to the columns if it doesn't exist
  const columnsWithActions = React.useMemo(() => {
    const hasActionsColumn = columns.some((col) => col.key === "actions");

    if (!hasActionsColumn) {
      return [
        ...columns,
        {
          key: "actions",
          title: "",
          width: "calc(100% / 8)",
          render: (value: any, row: any, index: number) => (
            <div
              className={actionIconClassName || styles.actionIcon}
              ref={(el) => {
                actionIconRefs.current[row.id] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPopoverState({ show: true, rowId: row.id, rowData: row });
              }}
            >
              <Image
                src={actionIcon || threeDotsIcon}
                alt="menu-dot"
                width={16}
                height={16}
              />
            </div>
          ),
        },
      ];
    }

    return columns;
  }, [columns, actionIconClassName]);

  const handlePopoverClose = () => {
    setPopoverState({ show: false, rowId: null, rowData: null });
  };

  const handleActionClick = (action: PopoverAction) => {
    if (popoverState.rowId) {
      action.onClick(popoverState.rowData);
    }
    handlePopoverClose();
  };

  return (
    <>
      <CommonTable
        columns={columnsWithActions}
        rows={rows}
        selectedRowId={selectedRowId}
        onRowClick={onRowClick}
        pagination={pagination}
        disabled={disabled || popoverState.show}
        className={className}
        containerClassName={containerClassName}
      />

      {/* Popover for action menu */}
      {popoverState.show && popoverState.rowId && (
        <PopOver
          reference={{ current: actionIconRefs.current[popoverState.rowId] }}
          show={popoverState.show}
          onClose={handlePopoverClose}
          placement="bottom-end"
          offset={[0, 8]}
        >
          <div className={popoverMenuClassName || styles.action_popoverMenu}>
            {actions.map((action, index) => (
              <div
                key={index}
                className={
                  popoverMenuItemClassName || styles.action_popoverMenuItem
                }
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </div>
            ))}
          </div>
        </PopOver>
      )}
    </>
  );
};

export default CommonTableWithPopover;
