"use client";
import { useRouter } from "next/navigation";
import React, { RefObject, useRef, useState } from "react";
import styles from "./styles.module.css";
import PopOver from "@/components/ui/popover";
import { chevronDownPinkIcon } from "@/resources/images";
import Image from "next/image";
import classNames from "classnames";
import MetricCard from "@/components/ui/metric-card";

const yearlyMaintenanceSummaryOptions = [
  {
    label: "This Year",
    value: "thisYear",
  },
  {
    label: "Next Year",
    value: "nextYear",
  },
  {
    label: "Select Year",
    value: "selectYear",
  },
];

const filterOptions = [
  {
    label: "Clients",
    value: "clients",
  },
  {
    label: "Properties",
    value: "properties",
  },
  {
    label: "Buildings",
    value: "buildings",
  },
];

const metricCards = [
  {
    title: "Doors",
    value: "900K",
    percentageChange: 3.4,
    color: "var(--lavender-sky)",
  },
  {
    title: "Floors",
    value: "680K",
    percentageChange: 11.4,
    color: "var(--aqua-mist)",
  },
  {
    title: "Roof",
    value: "680K",
    percentageChange: 3.4,
    color: "var(--pink-blush)",
  },
  {
    title: "Walls",
    value: "500K",
    percentageChange: -1.4,
    color: "var(--sunbeam)",
  },
  {
    title: "Windows",
    value: "300K",
    percentageChange: 7.2,
    color: "var(--ocean-blue)",
  },
  {
    title: "Area",
    value: "12,80K",
    percentageChange: 4.4,
    color: "var(--neon-mint)",
  },
];

export default function DashboardPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [showYearlyMaintenanceSummary, setShowYearlyMaintenanceSummary] =
    useState(false);

  const [selectedFilter, setSelectedFilter] = useState<string>("clients");
  const [
    selectedYearlyMaintenanceSummary,
    setSelectedYearlyMaintenanceSummary,
  ] = useState<string>("thisYear");
  const yearlyMaintenanceSummaryRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const renderMaintenanceSummary = () => {
    return (
      <div className={styles.dashboard_Maintenance_container}>
        {/* top container */}
        <div className={styles.dashboard_Maintenance_top_container}>
          <p className={styles.dashboard_Maintenance_title_text}>
            Yearly Maintenance Costs Summary
          </p>
          <div className={styles.dashboard_Maintenance_top_right_container}>
            <div
              ref={filterRef}
              onClick={() => setShowFilter(true)}
              className={styles.dashboard_Maintenance_filterWrapper}
            >
              <p className={styles.dashboard_Maintenance_filterText}>
                {selectedFilter === "clients"
                  ? "Clients"
                  : selectedFilter === "properties"
                  ? "Properties"
                  : "Buildings"}
              </p>
              <Image
                src={chevronDownPinkIcon}
                alt="filter"
                width={24}
                height={24}
              />
            </div>
            <div
              ref={yearlyMaintenanceSummaryRef}
              onClick={() => setShowYearlyMaintenanceSummary(true)}
              className={styles.dashboard_Maintenance_filterWrapper}
            >
              <p className={styles.dashboard_Maintenance_filterText}>
                {selectedYearlyMaintenanceSummary === "thisYear"
                  ? "This Year"
                  : selectedYearlyMaintenanceSummary === "nextYear"
                  ? "Next Year"
                  : "Select Year"}
              </p>
              <Image
                src={chevronDownPinkIcon}
                alt="filter"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>
        {/* middle container */}
        <div className={styles.dashboard_Maintenance_middle_container}>
          <div className={styles.dashboard_Maintenance_totalWrapper}>
            <p className={styles.dashboard_Maintenance_totalTitle}>24,80K</p>
            <div className={styles.dashboard_Maintenance_variationWrapper}>
              <p className={styles.dashboard_Maintenance_variationText}>
                +3.4%
              </p>
            </div>
          </div>
        </div>

        {/* bottom container */}
        <div className={styles.dashboard_Maintenance_bottom_container}>
          {metricCards.map((card) => (
            <MetricCard
              title={card.title}
              value={card.value}
              percentageChange={card.percentageChange}
              showDot={true}
              dotColor={card.color}
              className={styles.metric_card}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboard_container}>
      <p className={styles.dashboard_title}>Hey Vivek</p>
      {/* Yearly Maintenance Costs Summary */}
      {renderMaintenanceSummary()}
      <PopOver
        reference={filterRef}
        show={showFilter}
        onClose={() => setShowFilter(false)}
      >
        <div className={styles.filter_container}>
          <div className={styles.filter_title_container}>
            <p className={styles.filter_title}>View For</p>
          </div>
          {filterOptions.map((option) => (
            <div
              key={option.value}
              className={styles.filter_content}
              onClick={() => {
                setSelectedFilter(option.value);
                setShowFilter(false);
              }}
            >
              <p
                className={classNames(
                  styles.filter_content_text,
                  selectedFilter === option.value &&
                    styles.filter_content_text_active
                )}
              >
                {option.label}
              </p>
            </div>
          ))}
        </div>
      </PopOver>
      <PopOver
        reference={yearlyMaintenanceSummaryRef}
        show={showYearlyMaintenanceSummary}
        onClose={() => setShowYearlyMaintenanceSummary(false)}
      >
        <div className={styles.filter_container}>
          <div className={styles.filter_title_container}>
            <p className={styles.filter_title}>Filter</p>
          </div>
          {yearlyMaintenanceSummaryOptions.map((option) => (
            <div
              key={option.value}
              className={styles.filter_content}
              onClick={() => {
                setSelectedYearlyMaintenanceSummary(option.value);
                setShowYearlyMaintenanceSummary(false);
              }}
            >
              <p
                className={classNames(
                  styles.filter_content_text,
                  selectedYearlyMaintenanceSummary === option.value &&
                    styles.filter_content_text_active
                )}
              >
                {option.label}
              </p>
            </div>
          ))}
        </div>
      </PopOver>
    </div>
  );
}
