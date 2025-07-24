"use client";

import styles from "./styles.module.css";
import Image from "next/image";
import { filterIcon, propertiesBlueIcon } from "@/resources/images";
import { clientDetailsCardsData } from "@/app/constants";
import SectionHeader from "@/components/ui/section-header";
import { useRef, useState } from "react";
const ClientDetails: React.FC = () => {
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  const renderCard = () => {
    return (
      <div className={styles.client_details_card_container}>
        {clientDetailsCardsData.map((card, index) => (
          <div className={styles.client_details_card} key={index}>
            <div className={styles.client_details_card_icon}>
              <Image
                src={propertiesBlueIcon}
                alt="client"
                width={24}
                height={24}
              />
            </div>
            <div className={styles.client_details_card_content}>
              <p className={styles.client_details_card_value}>{card.value}</p>
              <p className={styles.client_details_card_label}>{card.title}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.client_details_container}>
      {renderCard()}
      <SectionHeader
        title="Properties List"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search properties..."
        actionButtonTitle="Add  Property"
        onActionButtonClick={() => {}}
        filterComponent={
          <div ref={clientsFilterRef} onClick={() => {}}>
            <Image src={filterIcon} alt="filter" width={24} height={24} />
          </div>
        }
        searchBarClassName={styles.client_details_search_bar}
        actionButtonClassName={styles.client_details_add_property_button}
      />
    </div>
  );
};

export default ClientDetails;
