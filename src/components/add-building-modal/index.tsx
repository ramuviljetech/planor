"use client";
import React, { useState } from "react";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import CustomTabs from "@/components/ui/tabs";
import FileUpload from "@/components/ui/upload-file";
import { backButtonIcon, closeRoseIcon } from "@/resources/images";
import styles from "./styles.module.css";

interface AddBuildingModalProps {
  show: boolean;
  onClose: () => void;
}

const AddBuildingModal: React.FC<AddBuildingModalProps> = ({
  show,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("add-revit");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [revitFiles, setRevitFiles] = useState<any[]>([]);

  const handleCloseModal = () => {
    onClose();
    setActiveTab("add-revit");
    setUploadedFiles([]);
    setRevitFiles([]);
  };

  const handleSubmitBuilding = () => {
    if (activeTab === "add-revit" && revitFiles.length > 0) {
      setActiveTab("add-file");
    }
    if (activeTab === "add-file" && uploadedFiles.length > 0) {
      console.log("Uploaded files:", uploadedFiles);
      // Add your API call here to save the building
      handleCloseModal();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleFilesAdded = (files: any[]) => {
    console.log("Files added:", files);
    // Ensure files maintain their progress state
    const filesWithProgress = files.map((file) => ({
      ...file,
      progress: file.progress || 0,
      status: file.status || "uploading",
    }));
    setUploadedFiles((prev) => [...prev, ...filesWithProgress]);
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleRevitFilesAdded = (files: any[]) => {
    console.log("Revit files added:", files);
    // Ensure files maintain their progress state
    const filesWithProgress = files.map((file) => ({
      ...file,
      progress: file.progress || 0,
      status: file.status || "uploading",
    }));
    setRevitFiles((prev) => [...prev, ...filesWithProgress]);
  };

  const handleRevitFileRemoved = (fileId: string) => {
    setRevitFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const tabs = [
    { label: "Add Revit", value: "add-revit" },
    { label: "Add File", value: "add-file" },
  ];

  return (
    <Modal
      show={show}
      onClose={handleCloseModal}
      closeOnOutSideClick={true}
      container_style={styles.add_building_modal_container}
      overlay_style={styles.add_building_modal_overlay}
    >
      <div className={styles.add_building_modal_content}>
        <div className={styles.add_building_modal_header}>
          <div className={styles.add_building_modal_header_left}>
            <Avatar image={backButtonIcon} size="md" />
            <h2 className={styles.add_building_modal_title}>
              Add New Building
            </h2>
          </div>
          <Avatar
            image={closeRoseIcon}
            size="md"
            onClick={handleCloseModal}
            className={styles.add_building_modal_close_button}
          />
        </div>

        <div className={styles.add_building_modal_tabs}>
          <CustomTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            customStyles={{
              tabColor: "var(--granite-gray)",
              selectedTabColor: "var(--rose-red)",
              indicatorColor: "var(--rose-red)",
              fontSize: "14px",
              fontFamily: "var(--font-lato-medium)",
            }}
          />
        </div>

        <div className={styles.add_building_modal_body}>
          <div className={styles.add_building_modal_file_upload_section}>
            <FileUpload
              allowedTypes={
                activeTab === "add-revit"
                  ? [".rvt", ".rfa", ".rte", ".dwg", ".dxf", "application/pdf"]
                  : [".ifc", ".rvt", "image/*", "application/pdf"]
              }
              maxSize={50}
              maxFiles={10}
              uploadedFiles={
                activeTab === "add-revit" ? revitFiles : uploadedFiles || []
              }
              onFilesAdded={
                activeTab === "add-revit"
                  ? handleRevitFilesAdded
                  : handleFilesAdded
              }
              onFileRemoved={
                activeTab === "add-revit"
                  ? handleRevitFileRemoved
                  : handleFileRemoved
              }
              onUploadComplete={(fileId) => {
                if (activeTab === "add-revit") {
                  setRevitFiles((prev) =>
                    prev.map((file) =>
                      file.id === fileId
                        ? { ...file, progress: 100, status: "completed" }
                        : file
                    )
                  );
                } else {
                  setUploadedFiles((prev) =>
                    prev.map((file) =>
                      file.id === fileId
                        ? { ...file, progress: 100, status: "completed" }
                        : file
                    )
                  );
                }
              }}
              supportedText={
                activeTab === "add-revit"
                  ? "Supported files are Revit files (.rvt, .rfa, .rte), CAD files (.dwg, .dxf), and PDFs up to Max 50 MB"
                  : "Supported files are IFC / Images / PDFs up to Max 50 MB"
              }
              className={styles.add_building_modal_file_upload_component}
            />
          </div>
        </div>

        <div className={styles.add_building_modal_footer}>
          <Button title="Cancel" onClick={handleCloseModal} variant="plain" />
          <Button
            title={activeTab === "add-revit" ? "Save & Continue" : "Submit"}
            onClick={handleSubmitBuilding}
            variant="primary"
            className={styles.add_building_modal_button}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddBuildingModal;
