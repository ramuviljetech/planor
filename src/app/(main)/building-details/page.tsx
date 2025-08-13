"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  b1Icon,
  b2Icon,
  b3Icon,
  i3DGrayIcon,
  imageRoseIcon,
  locationBlackIcon,
  questionmarkIcon,
} from "@/resources/images";
import {
  building1,
  building2,
  building3,
  building4,
  building3d,
} from "@/resources/images";
import Image from "next/image";
import Breadcrumb from "@/components/ui/breadcrumb";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import classNames from "classnames";
import CustomTabs, { TabItem } from "@/components/ui/tabs";
import Overview from "@/sections/building-section/overview";
import Maintenance from "@/sections/building-section/maintenance";
import ActivityHistory from "@/sections/building-section/activity-history";
import FileCategories from "@/sections/building-section/file-categories";
import { ImageViewer } from "@/components/ui/image-viewer";
import { ImageCarousel } from "@/components/ui/image-carousel";
import AddBuildingModal from "@/components/add-building-modal";
import ImageGallery from "@/sections/building-section/image-gallery";
import styles from "./styles.module.css";
import { sampleActivities } from "@/app/constants";

const BuildingDetails: React.FC = () => {
  const [activeImageTab, setActiveImageTab] = useState("image");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const router = useRouter();
  const breadcrumbItems = [
    { label: "Brunnfast AB", isActive: false },
    { label: "Kvarter Skatan", isActive: false },
    { label: "Building 1", isActive: true },
  ];

  const tabs: TabItem[] = [
    { label: "Overview", value: "overview" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Files", value: "files" },
    { label: "Activity History", value: "activity" },
  ];

  let images = [
    {
      src: b1Icon,
      alt: "Building 1",
    },
    {
      src: b2Icon,
      alt: "Building 2",
    },
    {
      src: b3Icon,
      alt: "Building 3",
    },
  ]; // Only show images based on imageCount

  const [showViewer, setShowViewer] = useState(false);
  const [clickedImageIndex, setClickedImageIndex] = useState(0);

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  const openCarousel = (imageIndex: number = 0) => {
    setClickedImageIndex(imageIndex);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleImageClick = (imageIndex: number) => {
    openCarousel(imageIndex);
  };

  const renderHeaderSection = (): React.ReactNode => {
    return (
      <div className={styles.building_details_sub_container_header}>
        <p className={styles.building_details_sub_container_header_title}>
          Stora Nygatan{" "}
          {/* <span
            style={{ fontSize: "14px", color: "#666", fontWeight: "normal" }}
          >
            ({images.length} images)
          </span> */}
        </p>
        <div className={styles.building_details_sub_container_header_right}>
          <div
            className={
              styles.building_details_sub_container_header_imageBtn_container
            }
          >
            <Avatar
              image={imageRoseIcon}
              alt="check"
              size="sm"
              onClick={() => setActiveImageTab("image")}
              className={classNames(styles.avatar_img_container, {
                [styles.active_image_tab]: activeImageTab === "image",
              })}
              avatarStyle={styles.avatar_img}
            />
            <Avatar
              image={i3DGrayIcon}
              alt="check"
              onClick={() => {
                setActiveImageTab("3d");
                setShowViewer(true);
              }}
              className={classNames(styles.avatar_img_container, {
                [styles.active_image_tab]: activeImageTab === "3d",
              })}
              avatarStyle={styles.avatar_img}
            />
          </div>
          <Avatar image={locationBlackIcon} alt="check" size="md" />
        </div>
      </div>
    );
  };

  const renderTabsSection = (): React.ReactNode => {
    return (
      <div className={styles.building_details_tabs_section}>
        <CustomTabs
          tabs={tabs}
          defaultTab="overview"
          onTabChange={handleTabChange}
        />
        <Button
          title="Add Revit"
          variant="plain"
          size="sm"
          onClick={() => setShowAddBuildingModal(true)}
        />
      </div>
    );
  };

  const renderTabContent = (): React.ReactNode => {
    return (
      <div className={styles.building_details_tab_content}>
        {activeTab === "overview" && <Overview />}
        {activeTab === "maintenance" && <Maintenance />}
        {activeTab === "files" && <FileCategories />}
        {activeTab === "activity" && (
          <ActivityHistory activities={sampleActivities} />
        )}
      </div>
    );
  };

  return (
    <section className={styles.building_details_container}>
      <div className={styles.building_details_breadcrumb_container}>
        <Breadcrumb
          items={breadcrumbItems}
          showBackArrow={true}
          onBackClick={() => router.back()}
        />
      </div>
      {/* Building Info */}
      <div className={styles.building_details_sub_container}>
        {/* Header section */}
        {renderHeaderSection()}
        <ImageGallery images={images} onImageClick={handleImageClick} />
        {renderTabsSection()}
        {renderTabContent()}
      </div>
      <ImageCarousel
        images={images.map((img) => img.src)}
        isOpen={isCarouselOpen}
        onClose={closeCarousel}
        initialIndex={clickedImageIndex}
      />
      {showViewer && (
        <ImageViewer
          src={building3d.src}
          alt="building one"
          onClose={() => {
            setShowViewer(false);
            setActiveImageTab("image");
          }}
        />
      )}
      {showAddBuildingModal && (
        <AddBuildingModal
          show={showAddBuildingModal}
          onClose={() => setShowAddBuildingModal(false)}
          showOnlyRevitTab={true}
        />
      )}
    </section>
  );
};

export default BuildingDetails;
