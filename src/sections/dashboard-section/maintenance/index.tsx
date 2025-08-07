"use client";
import React, { useRef, useState } from "react";
import styles from "./styles.module.css";
import PopOver from "@/components/ui/popover";
import { chevronDownPinkIcon } from "@/resources/images";
import Image from "next/image";
import classNames from "classnames";
import MetricCard from "@/components/ui/metric-card";
import ContributionChart from "@/components/ui/contribution-chart";
import { MaintenanceSectionProps } from "@/types/sections";
import {
  // filterOptions,
  yearlyMaintenanceSummaryOptions,
} from "@/app/constants";

export default function MaintenanceSection({
  selectedFilter,
  selectedYearlyMaintenanceSummary,
  metricCards,
  contributionData,
  totalValue,
  totalPercentageChange,
  onFiltersChange,
}: MaintenanceSectionProps) {
  // const [showFilter, setShowFilter] = useState(false);
  const [showYearlyMaintenanceSummary, setShowYearlyMaintenanceSummary] =
    useState(false);
  const yearlyMaintenanceSummaryRef = useRef<HTMLDivElement>(null);
  // const filterRef = useRef<HTMLDivElement>(null);

  // Event handlers for popups
  // const handleFilterClick = () => setShowFilter(true);
  const handleYearlyMaintenanceSummaryClick = () =>
    setShowYearlyMaintenanceSummary(true);
  // const handleFilterClose = () => setShowFilter(false);
  const handleYearlyMaintenanceSummaryClose = () =>
    setShowYearlyMaintenanceSummary(false);

  // const handleFilterSelect = (value: string) => {
  //   setShowFilter(false);
  //   onFiltersChange(value, selectedYearlyMaintenanceSummary);
  // };

  const handleYearlyMaintenanceSummarySelect = (value: string) => {
    setShowYearlyMaintenanceSummary(false);
    onFiltersChange(selectedFilter, value);
  };

  return (
    <div className={styles.dashboard_Maintenance_container}>
      {/* top container */}
      <div className={styles.dashboard_Maintenance_top_container}>
        <p className={styles.dashboard_Maintenance_title_text}>
          Yearly Maintenance Costs Summary
        </p>
        <div className={styles.dashboard_Maintenance_top_right_container}>
          {/* <div
            ref={filterRef}
            onClick={handleFilterClick}
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
          </div> */}
          <div
            ref={yearlyMaintenanceSummaryRef}
            onClick={handleYearlyMaintenanceSummaryClick}
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
          <p className={styles.dashboard_Maintenance_totalTitle}>
            {totalValue}
          </p>
          {/* <div className={styles.dashboard_Maintenance_variationWrapper}>
            <p className={styles.dashboard_Maintenance_variationText}>
              {totalPercentageChange}
            </p>
          </div> */}
        </div>
      </div>

      {/* contribution chart */}
      <ContributionChart items={contributionData} />

      {/* bottom container */}
      <div className={styles.dashboard_Maintenance_bottom_container}>
        {metricCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            // percentageChange={card.percentageChange}
            showDot={true}
            dotColor={card.color}
            className={styles.metric_card}
            showK={true}
          />
        ))}
      </div>

      {/* <PopOver
        reference={filterRef}
        show={showFilter}
        onClose={handleFilterClose}
      >
        <div className={styles.filter_container}>
          <div className={styles.filter_title_container}>
            <p className={styles.filter_title}>View For</p>
          </div>
          {filterOptions.map((option) => (
            <div
              key={option.value}
              className={styles.filter_content}
              onClick={() => handleFilterSelect(option.value)}
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
      </PopOver> */}
      <PopOver
        reference={yearlyMaintenanceSummaryRef}
        show={showYearlyMaintenanceSummary}
        onClose={handleYearlyMaintenanceSummaryClose}
      >
        <div className={styles.filter_container}>
          <div className={styles.filter_title_container}>
            <p className={styles.filter_title}>Filter</p>
          </div>
          {yearlyMaintenanceSummaryOptions.map((option) => (
            <div
              key={option.value}
              className={styles.filter_content}
              onClick={() => handleYearlyMaintenanceSummarySelect(option.value)}
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
