"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";
import {
  avatarIcon,
  backButtonIcon,
  i3DGrayIcon,
  imageRoseIcon,
  locationBlackIcon,
  building1,
  building2,
  building3,
  building4,
} from "@/resources/images";
import Image from "next/image";
import Breadcrumb from "@/components/ui/breadcrumb";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import classNames from "classnames";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

const BuildingDetails: React.FC = () => {
  const [activeImageTab, setActiveImageTab] = useState("image");
  const breadcrumbItems = [
    { label: "Brunnfast AB", isActive: false },
    { label: "Kvarter Skatan", isActive: false },
    { label: "Building 1", isActive: true },
  ];

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
              onClick={() => setActiveImageTab("3d")}
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

  const renderImagesSection = (): React.ReactNode => {
    return (
      <div className={styles.building_details_images_section}>
        <Grid
          container
          spacing={2}
          sx={{ borderRadius: 2, overflow: "hidden", width: "100%" }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Image
              src={images[0].src}
              alt="Main"
              width={600}
              height={400}
              style={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2} sx={{ height: "100%" }}>
              {images.slice(1).map((img, i) => (
                <Grid size={{ xs: 6 }} key={i}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={300}
                    height={190}
                    style={{
                      width: "100%",
                      height: 190,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  };

  return (
    <section className={styles.building_details_container}>
      <div className={styles.building_details_breadcrumb_container}>
        <Image src={backButtonIcon} alt="property" width={24} height={24} />
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {/* Building Info */}
      <div className={styles.building_details_sub_container}>
        {/* Header section */}
        {renderHeaderSection()}
        {renderImagesSection()}
      </div>
    </section>
  );
};

export default BuildingDetails;
