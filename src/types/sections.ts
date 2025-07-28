export interface MaintenanceSectionProps {
  // Filter states
  selectedFilter: string;
  selectedYearlyMaintenanceSummary: string;

  // Callback for when filters change
  onFiltersChange: (filter: string, year: string) => void;

  // Data
  metricCards: Array<{
    title: string;
    value: number;
    percentageChange: number;
    color: string;
    percentage: number;
  }>;
  contributionData: Array<{
    title: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  totalValue: string;
  totalPercentageChange: string;
}
