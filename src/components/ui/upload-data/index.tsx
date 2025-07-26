import Image from "next/image";
import React from "react";
import styles from "./styles.module.css";
import { uploadBlackIcon } from "@/resources/images";

const UploadFile = () => {
  return (
    <div className={styles.upload_file_container}>
      <Image
        src={uploadBlackIcon}
        alt="upload-file"
        className={styles.upload_file_icon}
      />
      <div className={styles.upload_data_desc}>
        <p className={styles.choose_file_text}>
          Choose a file or drag & drop it here
        </p>
        <p className={styles.supported_formats_text}>
          Supported files are IFC / Images / PDFs up to Max 50 MB{" "}
        </p>
      </div>
    </div>
  );
};

export default UploadFile;
