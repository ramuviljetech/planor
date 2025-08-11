import React, { useState } from "react";
import Modal from "../ui/modal";
import {
  closeRoseIcon,
  pdfIcon,
  fileIcon,
  closeBlackIcon,
  docIcon,
  xlsIcon,
} from "@/resources/images";
import Image from "next/image";
import Button from "../ui/button";
import Input from "../ui/input";
import SelectDropDown from "../ui/select-dropdown";
import classNames from "classnames";
import styles from "./styles.module.css";

interface AddFolderModalProps {
  show: boolean;
  onClose: () => void;
}

const AddFolderModal = ({ show, onClose }: AddFolderModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const fileOptions = [
    { label: "Clients.pdf", value: "Clients.pdf" },
    { label: "Properties.pdf", value: "Properties.pdf" },
    { label: "Buildings.xlsx", value: "Buildings.xlsx" },
    { label: "Floors.xlsx", value: "Floors.xlsx" },
    { label: "Units.xlsx", value: "Units.xlsx" },
    { label: "Tenants.xlsx", value: "Tenants.xlsx" },
    { label: "Leases.docx", value: "Leases.docx" },
    { label: "Contracts.docx", value: "Contracts.docx" },
    { label: "Invoices.docx", value: "Invoices.docx" },
    { label: "Payments.docx", value: "Payments.docx" },
    { label: "Reports.pdf", value: "Reports.pdf" },
    { label: "Settings.pdf", value: "Settings.pdf" },
  ];

  const renderFolderInfo = () => {
    return (
      <div className={styles.add_folder_modal_content}>
        <Input
          label="Folder name*"
          value={""}
          onChange={() => {}}
          placeholder="Enter folder name"
          inputStyle={styles.add_folder_modal_folder_info_input}
          inputContainerClass={
            styles.add_folder_modal_folder_info_input_container
          }
        />
        <div className={styles.add_folder_modal_select_files_container}>
          <SelectDropDown
            label="Select Files*"
            placeholder="Select Status"
            options={fileOptions}
            selected={selectedFiles || []}
            onSelect={(value) =>
              setSelectedFiles(Array.isArray(value) ? value : [value])
            }
            multiSelect={true}
            leftImage={true}
            onCloseIconClick={(item: string) => {
              setSelectedFiles(selectedFiles.filter((f) => f !== item));
            }}
          />
        </div>
      </div>
    );
  };
  return (
    <Modal
      show={show}
      onClose={() => onClose()}
      closeOnOutSideClick={true}
      container_style={styles.add_folder_modal_container_style}
      overlay_style={styles.add_folder_modal_overlay_style}
    >
      <div className={styles.add_folder_modal_header}>
        <div className={styles.add_folder_modal_header_left}>
          <p className={styles.add_folder_modal_header_left_text}>
            Add New Folder
          </p>
        </div>
        <Image
          src={closeRoseIcon}
          alt="close"
          className={styles.add_folder_modal_header_close_icon}
          onClick={() => onClose()}
          style={{ cursor: "pointer" }}
        />
      </div>
      {renderFolderInfo()}
      <div className={styles.add_folder_modal_footer}>
        <Button title="Cancel" variant="plain" onClick={() => onClose()} />
        <Button
          title="Submit"
          className={styles.add_folder_modal_footer_button_submit}
          onClick={() => onClose()}
        />
      </div>
    </Modal>
  );
};

export default AddFolderModal;
