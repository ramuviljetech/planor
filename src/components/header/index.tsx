"use client";
import {
  pinIcon,
  questionmarkIcon,
  searchEnableIcon,
  searchIcon,
  avatarIcon,
} from "@/resources/images";
import SearchBar from "../ui/searchbar";
import styles from "./styles.module.css";
import { useState } from "react";
import Image from "next/image";

const Header: React.FC = () => {
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
        <div className={styles.pin_icon}>
          <Image src={pinIcon} alt="pin" width={20} height={20} />
        </div>
        <div className={styles.questionmark_icon}>
          <Image
            src={questionmarkIcon}
            alt="questionmark"
            width={20}
            height={20}
          />
        </div>
        <div className={styles.avatar_container}>
          <Image
            src={avatarIcon}
            alt="avatar"
            width={40}
            height={40}
            className={styles.avatar_image}
          />
          <div className={styles.avatar_name_container}>
            <p className={styles.avatar_name}>John Smith</p>
            <p className={styles.avatar_email}>Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
