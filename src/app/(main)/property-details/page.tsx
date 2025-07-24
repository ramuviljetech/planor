"use client";
import React, { useRef } from "react";
import SectionHeader from "@/components/ui/section-header";
import Button from "@/components/ui/button";
import Image from "next/image";
import { backButtonIcon, filterIcon } from "@/resources/images";
import Breadcrumb from "@/components/ui/breadcrumb";
import Info from "@/components/ui/info";
import MetricCard from "@/components/ui/metric-card";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";

const PropertyDetails: React.FC = () => {
  const router = useRouter();
  const buildingListRef = useRef<HTMLDivElement>(null);
  const breadcrumbItems = [
    { label: "Brunnfast AB", isActive: false },
    { label: "Kvarter Skatan", isActive: true },
  ];

  const propertyInfoItems = [
    { label: "Name", value: "Brunnfast AB" },
    { label: "Primary Contact Name", value: "John stwien" },
    { label: "Client ID", value: "98088" },
    { label: "Role", value: "CEO" },
    { label: "Organization Number", value: "Stora Nygatan" },
    { label: "Phone", value: "+ 56 287 342 343" },
    { label: "Industry Type", value: "Akrivia Infratech Solutions" },
    { label: "Email", value: "Akrstwien@gmail.com" },
    { label: "Website Url", value: "Brunnfast AB .In" },
    { label: "Description", value: "A Property Management Organizations" },
  ];

  const propertyStatistics = [
    { label: "Total Buildings", value: 24 },
    { label: "Total Area", value: 25000 },
    { label: "Total Maintenance Cost", value: 849340 },
    { label: "Maintenance Updates", value: 24 },
  ];

  const renderTopContainer = () => {
    return (
      <section className={styles.property_details_top_container}>
        <div className={styles.property_details_top_container_left}>
          <Image src={backButtonIcon} alt="property" width={24} height={24} />
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Button
          title="Add Building"
          onClick={() => router.push("/building-details")}
          variant="primary"
        />
      </section>
    );
  };

  const renderBodyContainer = () => {
    return (
      <div className={styles.property_details_body_container}>
        {/* Header */}
        <div className={styles.property_details_body_container_header}>
          <p className={styles.property_details_body_container_title}>
            Property Info
          </p>
        </div>
        {/* Property Info */}
        <div className={styles.property_details_property_info}>
          {propertyInfoItems.map((item, index) => (
            <Info
              key={index}
              title={item.label}
              value={item.value}
              className={styles.property_details_property_info_item}
            />
          ))}
        </div>
        {/* Building List */}
        <div className={styles.property_building_info}>
          <SectionHeader
            title="Building List"
            searchValue=""
            searchPlaceholder="Search by building name"
            onSearchChange={() => {}}
            filterComponent={
              <div ref={buildingListRef} onClick={() => {}}>
                <Image src={filterIcon} alt="filter" width={24} height={24} />
              </div>
            }
            titleStyle={styles.property_building_info_title}
          />
          <div className={styles.property_statistics}>
            {propertyStatistics.map((item, index) => (
              <MetricCard
                key={index}
                title={item.label}
                value={Number(item.value)}
                className={styles.property_statistics_item}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.property_details_container}>
      {renderTopContainer()}
      {renderBodyContainer()}
    </div>
  );
};

export default PropertyDetails;
