"use client";
import {
  pinIcon,
  questionmarkIcon,
  searchEnableIcon,
  searchIcon,
  avatarIcon,
} from "@/resources/images";
import SearchBar from "../ui/searchbar";
import { useState, useRef, RefObject } from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import Avatar from "../ui/avatar";
import { useAuth } from "@/providers";
import Modal from "../ui/modal";
import PopOver from "../ui/popover";
import { UserProfile } from "../user-profile/user-profile";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // const[popoverRef,setPopoverRef] = useState<RefObject<HTMLDivElement>>();
  const popoverRef = useRef<HTMLDivElement>(null);

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div className={styles.header_container}>
      <p className={styles.header_title}>Planor</p>
      {/* search bar */}
      <div className={styles.header_middle_container}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search properties, files, or plans..."
          leftIcon={searchIcon}
          rightIcon={search !== "" ? "" : searchEnableIcon}
          onRightIconClick={() => setSearch("")}
          rightIconStyle={styles.search_bar_rightIcon}
        />
      </div>
      {/* pfofile and notification */}
      <div className={styles.header_right_container}>
        <Avatar image={pinIcon} alt="building3d" className={styles.pin_icon} />
        <Avatar
          image={questionmarkIcon}
          alt="questionmark"
          className={styles.questionmark_icon}
        />

        <div
          ref={popoverRef}
          className={styles.avatar_container}
          onClick={() => setIsPopoverOpen(true)}
        >
          <Image
            src={avatarIcon}
            alt="avatar"
            width={40}
            height={40}
            className={styles.avatar_image}
          />
          <div className={styles.avatar_name_container}>
            <p className={styles.avatar_name}>{user?.name || "John Doe"}</p>
            <p className={styles.avatar_email}>{user?.role || "Admin"}</p>
          </div>
        </div>
      </div>
      <PopOver
        reference={popoverRef}
        show={isPopoverOpen}
        showOverlay={false}
        placement="bottom-end"
        offset={[0, 12]}
        onClose={handlePopoverClose}
        overlay_style={styles.profile_modal_overlay}
        zIndex={9999} 
      >
        <UserProfile />
      </PopOver>
    </div>
  );
};

export default Header;
