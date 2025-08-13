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
import { getPriceList } from "@/networking/pricelist-api-service";
import {
  newObjectsTableHeadings,
  allObjectsAccordionTableColumns,
} from "@/app/constants";

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
  const [priceListStatisticsData, setPriceListStatisticsData] = useState<any>(
    []
  );
  const [itemsWithoutPrice, setItemsWithoutPrice] = useState<any[]>([]);
  const [filteredAccordionData, setFilteredAccordionData] = useState<any[]>([]);
  const [newObjectsData, setNewObjectsData] = useState<NewObjectRow[]>([]);

  // Fetch price list api call

  const fetchPriceList = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await getPriceList();
      setPriceListData(response.data.pricelists);
      setPriceListStatisticsData(response.data.statistics);
    } catch (error) {
      console.error("❌ PriceListPage: Error fetching price list:", error);
    } finally {
      // setIsLoading(true);//
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceList();
  }, []);

  // Filter items with and without prices when priceListData changes
  useEffect(() => {
    if (priceListData) {
      const allItemsWithoutPrice: any[] = [];

      const accordionData = [
        {
          key: "walls",
          title: "Walls",
          data: (priceListData.wall || []).filter((item: any) => {
            if (!item.price || item.price === null || item.price === "") {
              allItemsWithoutPrice.push({ ...item, category: "Walls" });
              return false;
            }
            return true;
          }),
        },
        {
          key: "doors",
          title: "Doors",
          data: (priceListData.door || []).filter((item: any) => {
            if (!item.price || item.price === null || item.price === "") {
              allItemsWithoutPrice.push({ ...item, category: "Doors" });
              return false;
            }
            return true;
          }),
        },
        {
          key: "floors",
          title: "Floors",
          data: (priceListData.floor || []).filter((item: any) => {
            if (!item.price || item.price === null || item.price === "") {
              allItemsWithoutPrice.push({ ...item, category: "Floors" });
              return false;
            }
            return true;
          }),
        },
        {
          key: "roof",
          title: "Roof",
          data: (priceListData.roof || []).filter((item: any) => {
            if (!item.price || item.price === null || item.price === "") {
              allItemsWithoutPrice.push({ ...item, category: "Roof" });
              return false;
            }
            return true;
          }),
        },
        {
          key: "windows",
          title: "Windows",
          data: (priceListData.window || []).filter((item: any) => {
            if (!item.price || item.price === null || item.price === "") {
              allItemsWithoutPrice.push({ ...item, category: "Windows" });
              return false;
            }
            return true;
          }),
        },
        {
          key: "area",
          title: "Area",
          data: (priceListData.area || []).filter((item: any) => {
            if (!item.price || item.price === null || item.price === "") {
              allItemsWithoutPrice.push({ ...item, category: "Area" });
              return false;
            }
            return true;
          }),
        },
      ];

      // Filter accordions that have data (length >= 1)
      const accordionsWithData = accordionData.filter(
        (accordion) => accordion.data.length >= 1
      );

      // If there's only one accordion with data, automatically open it
      if (accordionsWithData.length === 1) {
        const singleAccordionKey = accordionsWithData[0].key;
        setAccordionStates({
          walls: singleAccordionKey === "walls",
          doors: singleAccordionKey === "doors",
          floors: singleAccordionKey === "floors",
          roof: singleAccordionKey === "roof",
          windows: singleAccordionKey === "windows",
          area: singleAccordionKey === "area",
        });
      }

      // Update state with items without prices
      setItemsWithoutPrice(allItemsWithoutPrice);
      setFilteredAccordionData(accordionData);

      // Convert items without prices to NewObjectRow format and set to newObjectsData
      const newObjectsFromItemsWithoutPrice = allItemsWithoutPrice.map(
        (item) => ({
          id: item.id || "", // Use original ID or fallback
          object: item.object || "",
          type: item.category || "",
          price: "",
          unit: item.unit || "",
          intervals: "",
        })
      );
      setNewObjectsData(newObjectsFromItemsWithoutPrice);

      console.log("Setting newObjectsData:", newObjectsFromItemsWithoutPrice);

      // Console log items without prices
      if (allItemsWithoutPrice.length > 0) {
        console.log("Items without prices:", allItemsWithoutPrice);
      }
    }
  }, [priceListData]);

  console.log("🔄 Price list data:", priceListData);

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
    // Filter items that have both price and intervals filled
    const completedItems = newObjectsData.filter(
      (row) => row.price && row.intervals
    );

    if (completedItems.length === 0) {
      console.log("No items with complete price and intervals data");
      return;
    }

    // Console log each completed item with price and intervals
    completedItems.forEach((item) => {
      console.log("Completed Item:", {
        object: item.object,
        type: item.type,
        price: item.price,
        unit: item.unit,
        intervals: item.intervals,
        category: item.type,
      });
    });

    console.log("Total completed items:", completedItems.length);
    console.log("All completed items data:", completedItems);
  };

  const handleCancel = () => {
    // Reset all input fields to empty
    setNewObjectsData((prev) =>
      prev.map((item) => ({
        ...item,
        price: "",
        intervals: "",
      }))
    );
  };

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
            } ${activeTab === tab ? styles.active_tab : styles.inactive_tab} ${
              isLoading ? styles.disabled_tab : ""
            }`}
            onClick={() => !isLoading && setActiveTab(tab)}
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
                  {allObjectsAccordionTableColumns.map((column: any) => (
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
                      {allObjectsAccordionTableColumns.map((column: any) => (
                        <td
                          key={column.key}
                          className={styles.accordion_table_body_item}
                        >
                          {item[column.key as keyof TableRow] || "-"}
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

  // Clients Statistics Data
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
              // Filter accordions that have data (length >= 1)
              const accordionsWithData = filteredAccordionData.filter(
                (accordion) => accordion.data.length >= 1
              );

              // Check if all accordions have no data
              if (accordionsWithData.length === 0) {
                return (
                  <div className={styles.price_list_content_accordion_no_data}>
                    <p
                      className={
                        styles.price_list_content_accordion_no_data_text
                      }
                    >
                      No Data Found
                    </p>
                  </div>
                );
              }
              //  if(itemsWithoutPrice.length === 0){
              //   return (
              //     <div className={styles.price_list_content_accordion_no_data}>
              //       <p className={styles.price_list_content_accordion_no_data_text}>No Data Found</p>
              //     </div>
              //   );
              //  }
              return accordionsWithData.map((accordion) => (
                <React.Fragment key={accordion.key}>
                  {renderAccordion(
                    accordion.title,
                    accordion.data,
                    accordionStates[
                      accordion.key as keyof typeof accordionStates
                    ],
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
    console.log("Rendering newObjectsData:", newObjectsData);

    // If no items without prices, show only message
    if (newObjectsData.length === 0) {
      return (
        <div className={styles.price_list_content_new_objects_no_data}>
          <p className={styles.price_list_content_new_objects_no_data_text}>
            No Data Found
          </p>
        </div>
      );
    }

    return (
      <div className={styles.price_list_new_objects_section}>
        <table className={styles.new_objects_table}>
          <thead className={styles.table_header}>
            <tr>
              {newObjectsTableHeadings.map((heading: any, index: any) => (
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
                    type="number"
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
