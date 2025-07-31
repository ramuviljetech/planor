"use client";
import styles from "./styles.module.css";
import { switchIcon } from "@/resources/images";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MainMenu } from "@/app/constants";
import { useRouter, usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Initialize activeRoute based on current pathname
  const getInitialActiveRoute = () => {
    // First try exact match
    const exactMatch = MainMenu.find((item) => item.route === pathname);
    if (exactMatch) {
      return exactMatch.label;
    }

    // Handle specific sub-routes that don't follow the pattern
    if (pathname.startsWith("/client-info")) {
      return "Clients";
    }

    if (
      pathname.startsWith("/property-details") ||
      pathname.startsWith("/building-details")
    ) {
      return "Properties";
    }

    // If no exact match, check if pathname starts with any menu route
    const nestedMatch = MainMenu.find(
      (item) => pathname.startsWith(item.route) && item.route !== "/"
    );
    if (nestedMatch) {
      return nestedMatch.label;
    }

    return "Dashboard";
  };

  const [activeRoute, setActiveRoute] = useState<string>(
    getInitialActiveRoute()
  );

  // Set active route based on current pathname
  useEffect(() => {
    // First try exact match
    const exactMatch = MainMenu.find((item) => item.route === pathname);
    if (exactMatch) {
      setActiveRoute(exactMatch.label);
      return;
    }

    // Handle specific sub-routes that don't follow the pattern
    if (pathname.startsWith("/client-info")) {
      setActiveRoute("Clients");
      return;
    }

    if (
      pathname.startsWith("/property-details") ||
      pathname.startsWith("/building-details")
    ) {
      setActiveRoute("Properties");
      return;
    }

    // If no exact match, check if pathname starts with any menu route
    const nestedMatch = MainMenu.find(
      (item) => pathname.startsWith(item.route) && item.route !== "/"
    );
    if (nestedMatch) {
      setActiveRoute(nestedMatch.label);
      return;
    }

    // Default to Dashboard if no match found
    setActiveRoute("Dashboard");
  }, [pathname]);

  return (
    <div
      className={`${styles.sidebar_container} ${
        !isOpen ? styles.collapsed : ""
      }`}
    >
      {/* header */}
      <div className={styles.sidebar_header}>
        {isOpen && <p className={styles.sidebar_title}>Menu</p>}
        <Image
          onClick={() => setIsOpen(!isOpen)}
          src={switchIcon}
          alt="switch"
          width={20}
          height={20}
          className={styles.switch_icon}
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
            onClick={() => {
              setActiveRoute(item.label);
              router.push(item.route);
            }}
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
            {isOpen && (
              <p
                className={`${styles.sidebar_content_item_label} ${
                  activeRoute === item.label ? styles.active_label : ""
                }`}
              >
                {item.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
