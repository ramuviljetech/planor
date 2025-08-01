"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
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
import styles from "./styles.module.css";
import { sampleActivities } from "@/app/constants";

const BuildingDetails: React.FC = () => {
  const [activeImageTab, setActiveImageTab] = useState("image");
  const [activeTab, setActiveTab] = useState("overview");
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
      src: building1,
      alt: "Main",
    },
    {
      src: building2,
      alt: "Main",
    },
    {
      src: building3,
      alt: "Main",
    },
    {
      src: building4,
      alt: "Main",
    },
  ];

  const [showViewer, setShowViewer] = useState(false);

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const images2 = [
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderHeaderSection = (): React.ReactNode => {
    return (
      <div className={styles.building_details_sub_container_header}>
        <p className={styles.building_details_sub_container_header_title}>
          Stora Nygatan
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

  const renderImagesSection = (): React.ReactNode => {
    return (
      <div className={styles.building_details_images_section}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <Image src={images[0].src} alt="Main" fill objectFit="cover" />
          </div>
          <div className={styles.sideImages}>
            <div className={styles.topImage}>
              <Image src={images[1].src} alt="Side 1" fill objectFit="cover" />
            </div>
            <div className={styles.bottomImages}>
              <div className={styles.bottomLeft}>
                <Image
                  src={images[2].src}
                  alt="Side 2"
                  fill
                  objectFit="cover"
                />
              </div>
              <div
                onClick={() => openCarousel()}
                className={styles.bottomRight}
              >
                <Image
                  src={images[3].src}
                  alt="Side 3"
                  fill
                  objectFit="cover"
                />
                <div className={styles.overlay}>
                  <span>10+</span>
                </div>
              </div>
            </div>
          </div>
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
        <Button title="Add Revit" variant="plain" size="sm" />
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
        {renderImagesSection()}
        {renderTabsSection()}
        {renderTabContent()}
      </div>
      <ImageCarousel
        images={images2}
        isOpen={isCarouselOpen}
        onClose={closeCarousel}
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
    </section>
  );
};

export default BuildingDetails;
