"use client";
import {
  pinIcon,
  questionmarkIcon,
  searchEnableIcon,
  searchIcon,
  avatarIcon,
  building1,
  building2,
  building3,
  building4,
} from "@/resources/images";
import SearchBar from "../ui/searchbar";
import { useState } from "react";
import Image from "next/image";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ImageViewer } from "@/components/ui/image-viewer";
import { CustomDatePicker } from "@/components/ui/date-picker";
import styles from "./styles.module.css";

const Header: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showViewer, setShowViewer] = useState(false);

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const images = [
    building3,
    building4,
    building2,
    building1,
    building2,
    building3,
    building4,
    building1,
    building2,
    building3,
    building4,
    building2,
    building3,
    building4,
  ];

  const openCarousel = () => {
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const handleDateChange = (date: Date) => {
    console.log("Selected date:", date);
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
        <div className={styles.pin_icon}>
          <Image
            src={pinIcon}
            alt="pin"
            width={20}
            height={20}
            onClick={openCarousel}
          />
        </div>

        {/* // TODO: IMAGE CAROUSEL IMPLEMENTATION */}
        <ImageCarousel
          images={images}
          isOpen={isCarouselOpen}
          onClose={closeCarousel}
        />
        {/* //TODO: IMAGE 3D CAROUSEL IMPLEMENTATION */}
        <div className={styles.questionmark_icon}>
          <Image
            src={questionmarkIcon}
            alt="questionmark"
            width={20}
            height={20}
            onClick={() => setShowViewer(true)}
          />

          {showViewer && (
            <ImageViewer
              src={building1.src}
              alt="building one"
              onClose={() => setShowViewer(false)}
            />
          )}
        </div>

        {/* //TODO: DATE PICKER IMPLEMENTATION */}

        {/* <CustomDatePicker
          label="Set new Maintenance date*"
          placeholder="Select Maintenance date"
          onChange={handleDateChange}
        /> */}

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
