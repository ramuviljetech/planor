// components/BreakdownModal.tsx
"use client";

import React from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { closeRoseIcon } from "@/resources/images";

interface BreakdownModalProps {
  data: any;
  onClose: () => void;
  title?: string;
}

const BreakdownModal: React.FC<BreakdownModalProps> = ({
  data,
  onClose,
  title = "Break Down",
}) => {
  console.log(data, "data");
  return (
    <div className={styles.breakdown_modal_overlay}>
      <div className={styles.breakdown_modal_content}>
        <div className={styles.breakdown_modal_header}>
          <h4 className={styles.breakdown_modal_title}>{title}</h4>
          <Image
            src={closeRoseIcon}
            alt="close"
            width={24}
            height={24}
            onClick={onClose}
          />
        </div>

        <div className={styles.breakdown_modal_body}>
          {/* {data &&
            data.map((item, index) => ( */}
          <div className={styles.breakdown_item}>
            <span className={styles.breakdown_label}>
              {data?.value || "Label"}
            </span>
            <span className={styles.breakdown_value}>
              {data?.value || "Value"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakdownModal;
