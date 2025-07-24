"use client";
import React, { useState, useMemo, useRef } from "react";
import styles from "./styles.module.css";
import MaintenanceSection from "@/sections/dashboard-section/maintenance";
import SearchBar from "@/components/ui/searchbar";
import { filterIcon, multipleFilterIcon } from "@/resources/images";
import Image from "next/image";
import Button from "@/components/ui/button";
import MetricCard from "@/components/ui/metric-card";
import { clientsStaticCardTitle, filterOptions } from "@/app/constants";
import PopOver from "@/components/ui/popover";
import classNames from "classnames";
import Checkbox from "@mui/material/Checkbox";
import CustomCheckbox from "@/components/ui/checkbox";

// Fixed colors for metric cards based on title
const titleColorMap: Record<string, string> = {
  Doors: "var(--lavender-sky)",
  Floors: "var(--aqua-mist)",
  Roof: "var(--pink-blush)",
  Walls: "var(--sunbeam)",
  Windows: "var(--royal-indigo)",
  Area: "var(--neon-mint)",
};

const tableOptions = [
  "Client Name",
  "Client Id",
  "Properties",
  "Created On",
  "Maintenance Cost",
  "Status",
];

export default function DashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("clients");
  const [
    selectedYearlyMaintenanceSummary,
    setSelectedYearlyMaintenanceSummary,
  ] = useState<string>("thisYear");
  const [showMultipleFilter, setShowMultipleFilter] = useState<boolean>(false);
  const multipleFilterRef = useRef<HTMLDivElement>(null);
  const [selectedTableOptions, setSelectedTableOptions] = useState<string[]>([
    "Client Name",
    "Client Id",
    "Properties",
    "Created On",
  ]);

  // TODO: Replace this with actual API call data
  // This will be fetched from the database based on selectedFilter and selectedYearlyMaintenanceSummary
  const mockApiData = useMemo(() => {
    // Simulate different data based on filter selection
    const baseCards = [
      {
        title: "Doors",
        value:
          selectedFilter === "clients"
            ? 900
            : selectedFilter === "properties"
            ? 750
            : 600,
        percentageChange: 3.4,
      },
      {
        title: "Floors",
        value:
          selectedFilter === "clients"
            ? 680
            : selectedFilter === "properties"
            ? 550
            : 480,
        percentageChange: 11.4,
      },
      {
        title: "Roof",
        value:
          selectedFilter === "clients"
            ? 680
            : selectedFilter === "properties"
            ? 620
            : 520,
        percentageChange: 3.4,
      },
      {
        title: "Walls",
        value:
          selectedFilter === "clients"
            ? 500
            : selectedFilter === "properties"
            ? 420
            : 380,
        percentageChange: -1.4,
      },
      {
        title: "Windows",
        value:
          selectedFilter === "clients"
            ? 300
            : selectedFilter === "properties"
            ? 280
            : 250,
        percentageChange: 7.2,
      },
      {
        title: "Area",
        value:
          selectedFilter === "clients"
            ? 1280
            : selectedFilter === "properties"
            ? 1100
            : 980,
        percentageChange: 4.4,
      },
    ];

    // Calculate total value
    const totalValue = baseCards.reduce((sum, card) => sum + card.value, 0);

    const metricCards = baseCards.map((card) => ({
      ...card,
      color: titleColorMap[card.title] || "var(--lavender-sky)", // fallback color
      percentage: Math.round((card.value / totalValue) * 100),
    }));

    const contributionData = metricCards.map((card) => ({
      title: card.title,
      value: card.value,
      color: card.color,
      percentage: card.percentage,
    }));

    return {
      metricCards,
      contributionData,
      totalValue: `${(totalValue / 1000).toFixed(1)}K`,
      totalPercentageChange: "+3.4%",
    };
  }, [selectedFilter, selectedYearlyMaintenanceSummary]);

  // Callback for when filters change in the maintenance component
  const handleFiltersChange = (filter: string, year: string) => {
    setSelectedFilter(filter);
    setSelectedYearlyMaintenanceSummary(year);
    // TODO: Trigger API call here to fetch new data based on the selected filters
    // fetchMaintenanceData(filter, year);
  };

  const renderClients = () => {
    return (
      <div className={styles.dashboard_clients_container}>
        {/* top container */}
        <div className={styles.dashboard_clients_top_container}>
          <p className={styles.dashboard_clients_top_title}>Clients</p>
          <div className={styles.dashboard_clients_top_right_container}>
            <SearchBar
              value={""}
              onChange={() => {}}
              placeholder="Search properties..."
              className={styles.dashboard_clients_search_bar}
            />
            <div
              ref={multipleFilterRef}
              onClick={() => setShowMultipleFilter(true)}
            >
              <Image
                src={multipleFilterIcon}
                alt="multiple filter"
                width={24}
                height={24}
              />
            </div>
            <Image src={filterIcon} alt="filter" width={24} height={24} />
            <Button
              title="Add  Client"
              variant="primary"
              className={styles.dashboard_clients_add_client_button}
            />
          </div>
        </div>
        {/* middle container */}
        <div className={styles.dashboard_clients_middle_container}>
          {clientsStaticCardTitle.map((card) => (
            <MetricCard
              title={card.title}
              value={card.value}
              className={styles.dashboard_clients_static_card}
              titleStyle={styles.dashboard_clients_static_card_title}
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
      <MaintenanceSection
        selectedFilter={selectedFilter}
        selectedYearlyMaintenanceSummary={selectedYearlyMaintenanceSummary}
        onFiltersChange={handleFiltersChange}
        metricCards={mockApiData.metricCards}
        contributionData={mockApiData.contributionData}
        totalValue={mockApiData.totalValue}
        totalPercentageChange={mockApiData.totalPercentageChange}
      />
      {renderClients()}
      <PopOver
        reference={multipleFilterRef}
        show={showMultipleFilter}
        onClose={() => setShowMultipleFilter(false)}
      >
        <div className={styles.filter_container}>
          <div className={styles.filter_title_container}>
            <p className={styles.filter_title}>Table List</p>
          </div>
          {tableOptions.map((option) => (
            <div
              key={option}
              className={styles.filter_content}
              onClick={() => {
                if (selectedTableOptions.includes(option)) {
                  setSelectedTableOptions(
                    selectedTableOptions.filter((o) => o !== option)
                  );
                } else {
                  setSelectedTableOptions([...selectedTableOptions, option]);
                }
              }}
            >
              <div className={styles.filter_subcontent}>
                <CustomCheckbox
                  checked={selectedTableOptions.includes(option)}
                  onChange={() => {
                    if (selectedTableOptions.includes(option)) {
                      setSelectedTableOptions(
                        selectedTableOptions.filter((o) => o !== option)
                      );
                    } else {
                      setSelectedTableOptions([
                        ...selectedTableOptions,
                        option,
                      ]);
                    }
                  }}
                  label={option}
                />
              </div>
            </div>
          ))}
        </div>
      </PopOver>
    </div>
  );
}
