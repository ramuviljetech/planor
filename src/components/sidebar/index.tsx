"use client";
import styles from "./styles.module.css";
import { switchIcon } from "@/resources/images";
import Image from "next/image";
import { useState } from "react";
import { MainMenu } from "@/app/constants";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string>("Dashboard");
  return (
    <div className={styles.sidebar_container}>
      {/* header */}
      <div className={styles.sidebar_header}>
        <p className={styles.sidebar_title}>Menu</p>
        <Image
          onClick={() => setIsOpen(!isOpen)}
          src={switchIcon}
          alt="switch"
          width={20}
          height={20}
        />
      </div>
      {/* content */}
      <div className={styles.sidebar_content}>
        {MainMenu.map((item) => (
          <div
            key={item.label}
            className={`${styles.sidebar_content_item} ${
              activeRoute === item.label ? styles.active : ""
            }`}
            onClick={() => setActiveRoute(item.label)}
          >
            <div
              className={`${styles.sidebar_content_item_icon_container} ${
                activeRoute === item.label ? styles.active_icon : ""
              }`}
            >
              <Image
                src={activeRoute === item.label ? item.active_icon : item.icon}
                alt={item.label}
                width={20}
                height={20}
              />
            </div>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
