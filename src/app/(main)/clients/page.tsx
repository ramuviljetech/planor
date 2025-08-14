"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import ClientDetails from "@/sections/clients-section/client-properties-list";
import ClientsList from "@/sections/clients-section/clients-list";
import AddClientUserModal from "@/components/add-client-user-modal";
import styles from "./styles.module.css";
import AddPropertyModal from "@/components/add-property-modal";
import { getClients } from "@/networking/client-api-service";
import { useRouter } from "next/navigation";

// Client data interface matching the API response
interface ClientData {
  id: string;
  clientName: string;
  clientId: string;
  properties: number;
  createdOn: string;
  totalMaintenanceCost: Record<string, number>;
  status: string;
}

interface ClientsData {
  data: ClientData[];
  statistics: {
    totalClients: number;
    newClientsThisMonth: number;
    totalBuildings: number;
    totalFileUploads: number;
  } | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const Clients: React.FC = () => {
  // Local state for clients data
  const [clientsData, setClientsData] = useState<ClientsData>({
    data: [],
    statistics: null,
    pagination: null,
    isLoading: false,
    error: null,
  });

  const [clientsSearchValue, setClientsSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const router = useRouter();
  const [showAddClientUserModal, setShowAddClientUserModal] =
    useState<boolean>(false);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);

  // Fetch clients data
  const fetchClientsData = async (
    page: number = 1,
    search?: string,
    filters?: any
  ) => {
    try {
      setClientsData((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Update API call to include search and filters when backend supports it
      const response = await getClients(page, itemsPerPage);

      if (response.success && response.data) {
        // Transform the API response to match our expected format
        const transformedClients =
          response.data.clients || response.data.data || [];
        const statistics = response.data.statistics || {
          totalClients: response.data.totalClients || transformedClients.length,
          newClientsThisMonth: response.data.newClientsThisMonth || 0,
          totalBuildings: response.data.totalBuildings || 0,
          totalFileUploads: response.data.totalFileUploads || 0,
        };
        const pagination = response.data.pagination || {
          currentPage: page,
          totalPages: Math.ceil(
            (response.data.totalClients || transformedClients.length) /
              itemsPerPage
          ),
          totalItems: response.data.totalClients || transformedClients.length,
        };

        setClientsData({
          data: transformedClients,
          statistics,
          pagination,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || "Failed to fetch clients data");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClientsData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch clients data",
      }));
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchClientsData(1);
  }, []);

  const handleRetry = () => {
    fetchClientsData(1);
  };

  const handleSearchChange = (value: string) => {
    setClientsSearchValue(value);
    // TODO: Implement search functionality when backend supports it
    // For now, just update the local state
    console.log("Search value changed:", value);

    // When backend supports search, uncomment and implement:
    // if (value.trim()) {
    //   fetchClientsData(1, value);
    // } else {
    //   fetchClientsData(1);
    // }
  };

  const handleFilterApply = (filters: any) => {
    // TODO: Implement filter functionality when backend supports it
    console.log("Filters applied:", filters);

    // When backend supports filters, uncomment and implement:
    // fetchClientsData(1, clientsSearchValue, filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log("📄 Clients Page: Changing to page:", page);
    fetchClientsData(page);
  };

  const handleViewDetails = (rowData: any) => {
    router.push(`/client-info?id=${encodeURIComponent(rowData?.id)}`);
  };

  const handleAddProperty = (rowId: string | number) => {
    console.log("Add Property clicked for row:", rowId);
    setShowAddPropertyModal(true);
  };

  const handleRowClick = (rowData: any) => {
    router.push(`/client-info?id=${encodeURIComponent(rowData?.id)}`);
  };

  const renderHeaderSection = () => {
    return (
      <div className={styles.clients_header_section}>
        <div className={styles.clients_header_section_title_container}>
          <p className={styles.clients_count}>
            {clientsData.isLoading && clientsData.data.length === 0
              ? ""
              : clientsData.statistics?.totalClients || 0}
          </p>
          <p className={styles.clients_header_section_title}>Clients</p>
        </div>
        <Button
          title="New Clients"
          variant="primary"
          size="sm"
          onClick={() => setShowAddClientUserModal(true)}
        />
      </div>
    );
  };

  return (
    <div className={styles.clients_container}>
      {renderHeaderSection()}
      <ClientsList
        clientsData={clientsData}
        onSearchChange={handleSearchChange}
        onFilterApply={handleFilterApply}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        onViewDetails={handleViewDetails}
        onAddProperty={handleAddProperty}
        onRetry={handleRetry}
        searchValue={clientsSearchValue}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />
      <AddClientUserModal
        show={showAddClientUserModal}
        onClose={() => setShowAddClientUserModal(false)}
      />
      <AddPropertyModal
        show={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
    </div>
  );
};

export default Clients;
