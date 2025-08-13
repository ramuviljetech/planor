"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  accordianDownBlackIcon,
  accordianDownPinkIcon,
  threeDotsIcon,
  closeBlackIcon,
  zoomInBlackIcon,
  zoomOutBlackIcon,
  focusBlackIcon,
} from "@/resources/images";
import MetricCard from "@/components/ui/metric-card";
// import { clientsStaticCardTitle } from "@/app/constants";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Avatar from "@/components/ui/avatar";
import FallbackScreen from "@/components/ui/fallback-screen";
import { pricelistApiService } from "@/networking/pricelist-api-service";
import styles from "./styles.module.css";


type TabType = "all" | "new";

type TableRow = {
  object: string;
  // type: string;
  price: string;
  unit: string;
  intervals: string;
};

interface NewObjectRow {
  id: string;
  object: string;
  type: string;
  price: string;
  unit: string;
  intervals: string;
}

const PriceListPage: React.FC = () => {
  const [showAddNewObjectModal, setShowAddNewObjectModal] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [accordionStates, setAccordionStates] = useState<{
    [key: string]: boolean;
  }>({
    walls: true,
    doors: false,
    floors: false,
    roof: false,
    windows: false,
    area: false,
  });
  const [priceListData, setPriceListData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const[priceListStatisticsData, setPriceListStatisticsData] = useState<any>([]);

  // Fetch price list api call

  const fetchPriceList = async () => {
    try {
      setIsLoading(true);
      const response = await pricelistApiService.getPriceList();
      setPriceListData(response.data.pricelists);
      setPriceListStatisticsData(response.data.statistics);
    } catch (error) {
      console.error("❌ PriceListPage: Error fetching price list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceList();
  }, []);

  console.log("🔄 Price list data:", priceListData);

  // Define table columns
  const tableColumns = [
    { key: "object", label: "Type" },
    { key: "price", label: "Price" },
    { key: "unit", label: "Unit" },
    { key: "interval", label: "Interval" },
  ];

  const toggleAccordion = (accordionKey: string) => {
    setAccordionStates((prev) => {
      const newState = { ...prev };
      // Close all accordions first
      Object.keys(newState).forEach((key) => {
        newState[key] = false;
      });
      // Then open the clicked one if it was closed
      if (!prev[accordionKey]) {
        newState[accordionKey] = true;
      }
      return newState;
    });
  };

  const [newObjectsData, setNewObjectsData] = useState<NewObjectRow[]>([
    {
      id: "1",
      object: "Door",
      type: "Door W",
      price: "1200 SEK",
      unit: "ST",
      intervals: "1 Year",
    },
    {
      id: "2",
      object: "Door",
      type: "Door W1",
      price: "",
      unit: "ST",
      intervals: "",
    },
    {
      id: "3",
      object: "Door",
      type: "Door W2",
      price: "",
      unit: "ST",
      intervals: "",
    },
    {
      id: "4",
      object: "Door",
      type: "Door W3",
      price: "",
      unit: "ST",
      intervals: "",
    },
    {
      id: "5",
      object: "Door",
      type: "Door W4",
      price: "",
      unit: "ST",
      intervals: "",
    },
    {
      id: "6",
      object: "Door",
      type: "Door W5",
      price: "",
      unit: "ST",
      intervals: "",
    },
  ]);

  const handleInputChange = (
    id: string,
    field: "price" | "intervals",
    value: string
  ) => {
    setNewObjectsData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = () => {
    console.log("Submitting data:", newObjectsData);
    console.log("All table values:", {
      totalRows: newObjectsData.length,
      filledRows: newObjectsData.filter((row) => row.price && row.intervals)
        .length,
      data: newObjectsData.map((row) => ({
        object: row.object,
        type: row.type,
        price: row.price || "Not entered",
        unit: row.unit,
        intervals: row.intervals || "Not entered",
      })),
    });
  };

  const handleCancel = () => {
    // Reset to initial state or close modal
    setNewObjectsData([
      {
        id: "1",
        object: "Door",
        type: "Door W",
        price: "1200 SEK",
        unit: "ST",
        intervals: "1 Year",
      },
      {
        id: "2",
        object: "Door",
        type: "Door W1",
        price: "",
        unit: "ST",
        intervals: "",
      },
      {
        id: "3",
        object: "Door",
        type: "Door W2",
        price: "",
        unit: "ST",
        intervals: "",
      },
      {
        id: "4",
        object: "Door",
        type: "Door W3",
        price: "",
        unit: "ST",
        intervals: "",
      },
      {
        id: "5",
        object: "Door",
        type: "Door W4",
        price: "",
        unit: "ST",
        intervals: "",
      },
      {
        id: "6",
        object: "Door",
        type: "Door W5",
        price: "",
        unit: "ST",
        intervals: "",
      },
    ]);
  };

  const tableHeadings = [
    { heading: "Object", key: "object" },
    { heading: "Type", key: "type" },
    { heading: "Price", key: "price" },
    { heading: "Unit", key: "unit" },
    { heading: "Intervals", key: "intervals" },
  ];

  const renderTabs = () => {
    return (
      <div className={styles.price_list_content_header_item_section}>
        {(["all", "new"] as TabType[]).map((tab) => (
          <div
            key={tab}
            className={`${
              tab === "all"
                ? styles.price_list_content_header_item_section_all_objects
                : styles.price_list_content_header_item_section_new_objects
            } ${activeTab === tab ? styles.active_tab : styles.inactive_tab}`}
            onClick={() => setActiveTab(tab)}
          >
            <p
              className={
                styles.price_list_content_header_item_section_item_text
              }
            >
              {tab === "all" ? "All Objects" : "New Objects"}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderAccordion = (
    title: string,
    data: TableRow[],
    isOpen: boolean,
    onToggle: () => void
  ) => {
    return (
      <div
        className={`${styles.accordion_table_full} ${
          !isOpen ? styles.closed : ""
        }`}
      >
        <div className={styles.accordion_header} onClick={onToggle}>
          <div className={styles.accordion_header_left}>
            <p className={styles.accordion_header_left_text}>{title}</p>
            <p className={styles.accordion_header_left_text_count}>
              {data.length} Types
            </p>
          </div>
          <Image
            src={isOpen ? accordianDownPinkIcon : accordianDownBlackIcon}
            alt="Accordian Icon"
            className={`${styles.accordion_icon} ${
              isOpen ? styles.accordion_icon_open : ""
            }`}
          />
        </div>
        <div className={styles.accordion_table_full_content}>
          <div className={styles.table_container}>
            <table className={styles.accordion_table_header}>
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column.key}
                      className={styles.accordion_table_head_item}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
            <div className={styles.table_body_wrapper}>
              <table className={styles.accordion_table_body}>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx}>
                      {tableColumns.map((column) => (
                        <td
                          key={column.key}
                          className={styles.accordion_table_body_item}
                        >
                          {item[column.key as keyof TableRow]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const clientsStaticsData = [
    {
      title: "Total Clients",
      value: priceListStatisticsData?.totalClients || 0,
    },
    {
      title: "New Clients This Month",
      value: priceListStatisticsData?.newClientsThisMonth || 0,
    },
    {
      title: "Total Files Uploaded",
      value: priceListStatisticsData?.totalFileUploads || 0,
    },
    {
      title: "Total Buildings",
      value: priceListStatisticsData?.totalBuildings || 0,
    },
  ];

  const renderAllObjects = () => {
    return (
      <>
        <div className={styles.price_list_content_middle_section}>
          {clientsStaticsData.map((card, index) => (
            <MetricCard
              key={index}
              title={card.title}
              value={card.value}
              className={styles.price_list_content_middle_section_card}
              titleStyle={styles.price_list_content_middle_section_card_title}
              valueStyle={styles.price_list_content_middle_section_card_value}
            />
          ))}
        </div>
        <div className={styles.price_list_content_accordion}>
          {isLoading ? (
            <div className={styles.price_list_content_accordion_loading}>
              <FallbackScreen 
                title="Loading Price List"
                subtitle="Please wait while we fetch the latest pricing data..."
                className={styles.price_list_content_accordion_loading_fallback}
              />
            </div>
          ) : (
            (() => {
              // Use API data for each accordion
              const accordionData = [
                {
                  key: "walls",
                  title: "Walls",
                  data: priceListData.wall || [],
                },
                {
                  key: "doors",
                  title: "Doors",
                  data: priceListData.door || [],
                },
                {
                  key: "floors",
                  title: "Floors",
                  data: priceListData.floor || [],
                },
                {
                  key: "roof",
                  title: "Roof",
                  data: priceListData.roof || [],
                },
                {
                  key: "windows",
                  title: "Windows",
                  data: priceListData.window || [],
                },
                {
                  key: "area",
                  title: "Area",
                  data: priceListData.area || [],
                },
              ];

              // Filter accordions that have data (length >= 1)
              const accordionsWithData = accordionData.filter(
                (accordion) => accordion.data.length >= 1
              );

              // Check if all accordions have no data
              if (accordionsWithData.length === 0) {
                return (
                  <div className={styles.price_list_content_accordion_no_data}>
                    <p className={styles.price_list_content_accordion_no_data_text}>No Data Found</p>
                  </div>
                );
              }

              return accordionsWithData.map((accordion) => (
                <React.Fragment key={accordion.key}>
                  {renderAccordion(
                    accordion.title,
                    accordion.data,
                    accordionStates[accordion.key as keyof typeof accordionStates],
                    () => toggleAccordion(accordion.key)
                  )}
                </React.Fragment>
              ));
            })()
          )}
        </div>
      </>
    );
  };

  const renderNewObjectsTable = () => {
    return (
      <div className={styles.price_list_new_objects_section}>
        <table className={styles.new_objects_table}>
          <thead className={styles.table_header}>
            <tr>
              {tableHeadings.map((heading, index) => (
                <th
                  key={index}
                  className={`${styles.table_header_cell_object} `}
                >
                  {heading.heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.table_body}>
            {newObjectsData.map((row) => (
              <tr key={row.id} className={styles.table_row}>
                <td className={styles.table_cell_object}>{row.object}</td>
                <td className={styles.table_cell_type}>{row.type}</td>
                <td className={styles.table_cell_price}>
                  <Input
                    label=""
                    value={row.price}
                    onChange={(e) =>
                      handleInputChange(row.id, "price", e.target.value)
                    }
                    placeholder="Enter Price"
                    inputStyle={styles.inputContainerClass}
                    inputContainerClass={styles.inputContainerWrapper}
                  />
                </td>
                <td className={styles.table_cell_unit}>{row.unit}</td>
                <td className={styles.table_cell_intervals}>
                  <Input
                    label=""
                    value={row.intervals}
                    onChange={(e) =>
                      handleInputChange(row.id, "intervals", e.target.value)
                    }
                    placeholder="Enter Intervals"
                    inputStyle={styles.inputContainerClass}
                    inputContainerClass={styles.inputContainerWrapper}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className={styles.action_buttons}>
          <Button title="Cancel" variant="plain" onClick={handleCancel} />
          <Button title="Submit" variant="primary" onClick={handleSubmit} />
        </div>
      </div>
    );
  };



  return (
    <div className={styles.price_list_container}>
      <div className={styles.price_list_header}>
        <p className={styles.price_list_header_text}>
          1,20,300 SEK
          <span className={styles.price_list_header_text_span}>
            {" "}
            Maintenance Cost
          </span>
        </p>
      </div>

      <section className={styles.price_list_content}>
        <div className={styles.price_list_content_header}>
          {renderTabs()}

          <div className={styles.price_list_content_header_threedots}>
            <Image
              src={threeDotsIcon}
              alt="More Options"
              onClick={() => {
                setShowAddNewObjectModal(true);
              }}
            />
          </div>
        </div>
        {activeTab === "all" ? renderAllObjects() : renderNewObjectsTable()}
      </section>
      {/* <Modal
        show={showAddNewObjectModal}
        onClose={() => setShowAddNewObjectModal(false)}
      >
        <div className={styles.property_image_modal_container}>
          
          <div className={styles.property_image_modal_cancel_button}>
            <Avatar
              image={closeBlackIcon}
              alt="Close"
              size="sm"
              // className={styles.property_image_modal_cancel_button_avatar_wrapper}
              avatarStyle={styles.property_image_modal_cancel_button_avatar}
              onClick={() => setShowAddNewObjectModal(false)}
            />
          </div>
          <div className={styles.property_image_modal_view_adjustment_section}>
            <Avatar
              image={zoomInBlackIcon}
              alt="Zoom In"
              size="sm"
              avatarStyle={styles.property_image_modal_cancel_button_avatar}
            />
            <Avatar
              image={zoomOutBlackIcon}
              alt="Zoom In"
              size="sm"
              avatarStyle={styles.property_image_modal_cancel_button_avatar}
            />
            <Avatar
              image={focusBlackIcon}
              alt="Focus"
              size="sm"
              avatarStyle={styles.property_image_modal_cancel_button_avatar}
            />
          </div>
        </div>
      </Modal> */}
    </div>
  );
};

export default PriceListPage;
