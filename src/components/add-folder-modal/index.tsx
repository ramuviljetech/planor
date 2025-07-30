import React, { useState } from 'react'
import Modal from '../ui/modal'
import { Formik } from 'formik'
import styles from './styles.module.css'
import { closeRoseIcon } from '@/resources/images';
import Image from 'next/image';
import Button from '../ui/button';
import Input from '../ui/input';
import SelectDropDown from '../ui/select-dropdown';

interface AddFolderModalProps {
  show: boolean;
  onClose: () => void;
}
const AddFolderModal = ({ show, onClose }: AddFolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const fileOptions = [
    { label: "Client Name.pdf", value: "Client Name.pdf" },
    { label: "Client Name.pdf", value: "Client Name.pdf" },
    { label: "client id.pdf", value: "client id.pdf" },
    { label: "client id.pdf", value: "client id.pdf" }, 
    { label: "Client Name.pdf", value: "Client Name.pdf" },
    { label: "Client Name.pdf", value: "Client Name.pdf" },
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
            inputContainerClass={styles.add_folder_modal_folder_info_input_container}
          />
          <div className={styles.add_folder_modal_select_files_container}>
            <SelectDropDown
              label="Select Files*"
              placeholder="Select Status"
              options={fileOptions}
              selected={selectedFiles}
              onSelect={(value) => setSelectedFiles(Array.isArray(value) ? value : [value])}
              multiSelect={true}
              containerClass={styles.add_folder_modal_select_dropdown}
              selectedTextClass={styles.add_folder_modal_select_dropdown_selected_text}
            />
          </div>
      </div>
    )
  }
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
              <Button
                title="Cancel"
                className={styles.add_folder_modal_footer_button_cancel}
                onClick={() => onClose()}
              />
              <Button
                title="Submit"
                className={styles.add_folder_modal_footer_button_submit}
                onClick={() => onClose()}
              />
            </div>
    </Modal>
  )
}

export default AddFolderModal