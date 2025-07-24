'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import { threeDotsIcon } from '@/resources/images';

type TabType = 'all' | 'new';

const PriceListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const renderTabs = () => {
    return (
      <div className={styles.price_list_content_header_item_section}>
            {(['all', 'new'] as TabType[]).map((tab) => (
              <div
                key={tab}
                className={`${tab === 'all' ? styles.price_list_content_header_item_section_all_objects : styles.price_list_content_header_item_section_new_objects} ${
                  activeTab === tab ? styles.active_tab : styles.inactive_tab
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <p className={styles.price_list_content_header_item_section_item_text}>
                  {tab === 'all' ? 'All Objects' : 'New Objects'}
                </p>
              </div>
            ))}
          </div>
    );
  };

  return (
    <div className={styles.price_list_container}>
      <header className={styles.price_list_header}>
        <h1 className={styles.price_list_header_text}>
          1,20,300 SEK
          <span className={styles.price_list_header_text_span}> Maintenance Cost</span>
        </h1>
      </header>

      <section className={styles.price_list_content}>
        <div className={styles.price_list_content_header}>
          {renderTabs()}
        
          <div className={styles.price_list_content_header_threedots}>
            <Image src={threeDotsIcon} alt="More Options" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PriceListPage;
