import React from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import { checkWhite } from "@/resources/images";
import classNames from "classnames";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
}) => {
  return (
    <div className={styles.wrapper} onClick={onChange}>
      <div
        className={classNames(
          styles.checkbox,
          checked && styles.checkbox_checked
        )}
      >
        {checked && (
          <Image
            src={checkWhite}
            alt={checked ? "Checked" : "Unchecked"}
            className={styles.icon}
            width={16}
            height={16}
          />
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default CustomCheckbox;
