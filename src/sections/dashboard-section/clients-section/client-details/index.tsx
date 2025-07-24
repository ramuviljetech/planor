"use client";

import styles from "./styles.module.css";
import Image from "next/image";
import { propertiesBlueIcon } from "@/resources/images";
import { clientDetailsCardsData } from "@/app/constants";

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

const ClientDetails = () => {
  return <div className={styles.client_details_container}>{renderCard()}</div>;
};

export default ClientDetails;
