"use client";
import {
  pinIcon,
  questionmarkIcon,
  searchEnableIcon,
  searchIcon,
  avatarIcon,
} from "@/resources/images";
import SearchBar from "../ui/searchbar";
import { useState } from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import Avatar from "../ui/avatar";
import { useAuth } from "@/providers";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

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

        <div className={styles.avatar_container}>
          <Image
            src={avatarIcon}
            alt="avatar"
            width={40}
            height={40}
            className={styles.avatar_image}
          />
          <div className={styles.avatar_name_container}>
            <p className={styles.avatar_name}>{user?.name}</p>
            <p className={styles.avatar_email}>{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
