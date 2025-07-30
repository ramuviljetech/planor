import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import { CustomDatePicker } from "@/components/ui/date-picker";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";
import Avatar from "../avatar";
import { closeRoseIcon } from "@/resources/images";

interface UpdateLastDateProps {
  show: boolean;
  onClose: () => void;
  selectedObjectsCount: number;
  onDateSubmit: (date: Date) => void;
  buildingName?: string;
}

const UpdateLastDate: React.FC<UpdateLastDateProps> = ({
  show,
  onClose,
  selectedObjectsCount,
  onDateSubmit,
  buildingName = "Block-C",
}) => {
  const [selectedMaintenanceDate, setSelectedMaintenanceDate] =
    useState<Date | null>(null);

  const handleDateChange = (date: Date) => {
    setSelectedMaintenanceDate(date);
  };

  const handleSubmitUpdate = () => {
    if (selectedMaintenanceDate) {
      onDateSubmit(selectedMaintenanceDate);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedMaintenanceDate(null);
    onClose();
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      container_style={styles.update_last_maintenance_modal}
      overlay_style={styles.update_last_maintenance_modal_overlay}
    >
      <div className={styles.update_last_maintenance_modal_content}>
        <div className={styles.update_last_maintenance_modal_header}>
          <h3 className={styles.update_last_maintenance_modal_title}>
            Update Last Maintenance
          </h3>
          <Avatar
            image={closeRoseIcon}
            onClick={handleClose}
            className={styles.update_last_maintenance_modal_close_button}
            size="md"
          />
        </div>

        <div className={styles.update_last_maintenance_modal_body}>
          <p className={styles.update_last_maintenance_modal_description}>
            You have selected {selectedObjectsCount} objects from the{" "}
            {buildingName} building for updating the last maintenance date.
          </p>

          <div
            className={
              styles.update_last_maintenance_modal_date_picker_container
            }
          >
            <CustomDatePicker
              label="Set new Maintenance date*"
              placeholder="Select Maintenance date"
              value={selectedMaintenanceDate || undefined}
              onChange={handleDateChange}
              className={
                styles.update_last_maintenance_modal_maintenance_date_picker
              }
              containerStyle={
                styles.update_last_maintenance_modal_date_picker_high_z_index
              }
              zIndex={100001}
            />
          </div>
        </div>

        <div className={styles.update_last_maintenance_modal_footer}>
          <Button
            title="Set Date"
            onClick={handleSubmitUpdate}
            variant="primary"
            size="sm"
            className={styles.update_last_maintenance_modal_update_button}
            disabled={!selectedMaintenanceDate}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UpdateLastDate;
