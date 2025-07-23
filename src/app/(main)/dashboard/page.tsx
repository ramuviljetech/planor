"use client";
import React, { useState, useMemo } from "react";
import styles from "./styles.module.css";
import MaintenanceSection from "@/sections/dashboard-section/maintenance";

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
  const [selectedFilter, setSelectedFilter] = useState<string>("clients");
  const [
    selectedYearlyMaintenanceSummary,
    setSelectedYearlyMaintenanceSummary,
  ] = useState<string>("thisYear");

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
    </div>
  );
}
