"use client";
import React, { RefObject, useRef, useState, useMemo } from "react";
import styles from "./styles.module.css";
import PopOver from "@/components/ui/popover";
import { chevronDownPinkIcon } from "@/resources/images";
import Image from "next/image";
import classNames from "classnames";
import MetricCard from "@/components/ui/metric-card";
import ContributionChart from "@/components/ui/contribution-chart";

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

// Fixed colors for metric cards based on title
const titleColorMap: Record<string, string> = {
  Doors: "var(--lavender-sky)",
  Floors: "var(--aqua-mist)",
  Roof: "var(--pink-blush)",
  Walls: "var(--sunbeam)",
  Windows: "var(--royal-indigo)",
  Area: "var(--neon-mint)",
};

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

  // Generate metric cards with fixed colors based on title
  const metricCards = useMemo(() => {
    const baseCards = [
      {
        title: "Doors",
        value: 900,
        percentageChange: 3.4,
      },
      {
        title: "Floors",
        value: 680,
        percentageChange: 11.4,
      },
      {
        title: "Roof",
        value: 680,
        percentageChange: 3.4,
      },
      {
        title: "Walls",
        value: 500,
        percentageChange: -1.4,
      },
      {
        title: "Windows",
        value: 300,
        percentageChange: 7.2,
      },
      {
        title: "Area",
        value: 1280,
        percentageChange: 4.4,
      },
    ];

    // Calculate total value
    const totalValue = baseCards.reduce((sum, card) => sum + card.value, 0);

    return baseCards.map((card) => ({
      ...card,
      color: titleColorMap[card.title] || "var(--lavender-sky)", // fallback color
      percentage: Math.round((card.value / totalValue) * 100),
      totalValue: totalValue,
    }));
  }, []);

  // Generate contribution data for the chart
  const contributionData = useMemo(() => {
    return metricCards.map((card) => ({
      title: card.title,
      value: card.value,
      color: card.color,
      percentage: card.percentage,
    }));
  }, [metricCards]);

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

        {/* contribution chart */}

        <ContributionChart items={contributionData} />

        {/* bottom container */}
        <div className={styles.dashboard_Maintenance_bottom_container}>
          {metricCards.map((card) => (
            <MetricCard
              key={card.title}
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
