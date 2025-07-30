'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { accordianDownBlackIcon, accordianDownPinkIcon, threeDotsIcon } from '@/resources/images';
import MetricCard from '@/components/ui/metric-card';
import { clientsStaticCardTitle } from '@/app/constants';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import AddFolderModal from '@/components/add-folder-modal';
import styles from './styles.module.css';


type TabType = 'all' | 'new';

type TableRow = {
  type: string;
  price: string;
  unit: string;
  interval: string;
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
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [accordionStates, setAccordionStates] = useState<{ [key: string]: boolean }>({
    walls: true,
    doors: false,
    floors: false,
    roof: false,
    windows: false,
    area: false
  });
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  // Define table columns
  const tableColumns = [
    { key: 'type', label: 'Type' },
    { key: 'price', label: 'Price' },
    { key: 'unit', label: 'Unit' },
    { key: 'interval', label: 'Interval' }
  ];

  const toggleAccordion = (accordionKey: string) => {
    setAccordionStates(prev => {
      const newState = { ...prev };
      // Close all accordions first
      Object.keys(newState).forEach(key => {
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
    { id: '1', object: 'Door', type: 'Door W', price: '1200 SEK', unit: 'ST', intervals: '1 Year' },
    { id: '2', object: 'Door', type: 'Door W1', price: '', unit: 'ST', intervals: '' },
    { id: '3', object: 'Door', type: 'Door W2', price: '', unit: 'ST', intervals: '' },
    { id: '4', object: 'Door', type: 'Door W3', price: '', unit: 'ST', intervals: '' },
    { id: '5', object: 'Door', type: 'Door W4', price: '', unit: 'ST', intervals: '' },
    { id: '6', object: 'Door', type: 'Door W5', price: '', unit: 'ST', intervals: '' },
  ]);

  const handleInputChange = (id: string, field: 'price' | 'intervals', value: string) => {
    setNewObjectsData(prev => 
      prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = () => {
    console.log('Submitting data:', newObjectsData);
    console.log('All table values:', {
      totalRows: newObjectsData.length,
      filledRows: newObjectsData.filter(row => row.price && row.intervals).length,
      data: newObjectsData.map(row => ({
        object: row.object,
        type: row.type,
        price: row.price || 'Not entered',
        unit: row.unit,
        intervals: row.intervals || 'Not entered'
      }))
    });
  };

  const handleCancel = () => {
    // Reset to initial state or close modal
    setNewObjectsData([
      { id: '1', object: 'Door', type: 'Door W', price: '1200 SEK', unit: 'ST', intervals: '1 Year' },
      { id: '2', object: 'Door', type: 'Door W1', price: '', unit: 'ST', intervals: '' },
      { id: '3', object: 'Door', type: 'Door W2', price: '', unit: 'ST', intervals: '' },
      { id: '4', object: 'Door', type: 'Door W3', price: '', unit: 'ST', intervals: '' },
      { id: '5', object: 'Door', type: 'Door W4', price: '', unit: 'ST', intervals: '' },
      { id: '6', object: 'Door', type: 'Door W5', price: '', unit: 'ST', intervals: '' },
    ]);
  };

  const tableHeadings = [
    { heading: 'Object', key: 'object' },
    { heading: 'Type', key: 'type' },
    { heading: 'Price', key: 'price' },
    { heading: 'Unit', key: 'unit' },
    { heading: 'Intervals', key: 'intervals' }
  ];

  const renderTabs = () => {
    return (
      <div className={styles.price_list_content_header_item_section}>
        {(['all', 'new'] as TabType[]).map((tab) => (
          <div
            key={tab}
            className={`${tab === 'all' ? styles.price_list_content_header_item_section_all_objects : styles.price_list_content_header_item_section_new_objects} ${activeTab === tab ? styles.active_tab : styles.inactive_tab
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


  const renderAccordion = (title: string, data: TableRow[], isOpen: boolean, onToggle: () => void) => {
    return (
      <div className={`${styles.accordion_table_full} ${!isOpen ? styles.closed : ''}`}>
        <div className={styles.accordion_header} onClick={onToggle}>
          <div className={styles.accordion_header_left}>
            <p className={styles.accordion_header_left_text}>{title}</p>
            <p className={styles.accordion_header_left_text_count}>{data.length} Types</p>
          </div>
            <Image
              src={isOpen ? accordianDownPinkIcon : accordianDownBlackIcon}
              alt="Accordian Icon"
              className={`${styles.accordion_icon} ${isOpen ? styles.accordion_icon_open : ''}`}
            />
        </div>
        <div className={styles.accordion_table_full_content}>
          <table className={styles.accordion_table}>
            <thead className={styles.accordion_table_head}>
              <tr className={styles.accordion_table_head_row}>
                {tableColumns.map((column) => (
                  <th key={column.key} className={styles.accordion_table_head_item}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.accordion_table_body}>
              {data.map((item, idx) => (
                <tr key={idx}>
                  {tableColumns.map((column) => (
                    <td key={column.key} className={styles.accordion_table_body_item}>{item[column.key as keyof TableRow]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderAllObjects = () => {
    // Sample data for each accordion
    const accordionData = [
      {
        key: 'walls',
        title: 'Walls',
        data: [
          { type: "Wall-A", price: "150 SEK", unit: "M2", interval: "1 Year" },
          { type: "Wall-B", price: "180 SEK", unit: "M2", interval: "2 years" },
          { type: "Wall-C", price: "220 SEK", unit: "M2", interval: "3 years" },
        ]
      },
      {
        key: 'doors',
        title: 'Doors',
        data: [
          { type: "Door-A", price: "200 SEK", unit: "ST", interval: "1 Year" },
          { type: "Door-B", price: "200 SEK", unit: "ST", interval: "2 years" },
          { type: "Door-C", price: "200 SEK", unit: "ST", interval: "3 years" },
          { type: "Door-D", price: "200 SEK", unit: "ST", interval: "2 years" },
          { type: "Door-E", price: "200 SEK", unit: "ST", interval: "2 years" },
        ]
      },
      {
        key: 'floors',
        title: 'Floors',
        data: [
          { type: "Floor-A", price: "300 SEK", unit: "M2", interval: "1 Year" },
          { type: "Floor-B", price: "350 SEK", unit: "M2", interval: "2 years" },
          { type: "Floor-C", price: "400 SEK", unit: "M2", interval: "3 years" },
        ]
      },
      {
        key: 'roof',
        title: 'Roof',
        data: [
          { type: "Roof-A", price: "500 SEK", unit: "M2", interval: "1 Year" },
          { type: "Roof-B", price: "600 SEK", unit: "M2", interval: "2 years" },
          { type: "Roof-C", price: "700 SEK", unit: "M2", interval: "3 years" },
        ]
      },
      {
        key: 'windows',
        title: 'Windows',
        data: [
          { type: "Window-A", price: "250 SEK", unit: "ST", interval: "1 Year" },
          { type: "Window-B", price: "280 SEK", unit: "ST", interval: "2 years" },
          { type: "Window-C", price: "320 SEK", unit: "ST", interval: "3 years" },
        ]
      },
      {
        key: 'area',
        title: 'Area',
        data: [
          { type: "Area-A", price: "100 SEK", unit: "M2", interval: "1 Year" },
          { type: "Area-B", price: "120 SEK", unit: "M2", interval: "2 years" },
          { type: "Area-C", price: "150 SEK", unit: "M2", interval: "3 years" },
        ]
      }
    ];

    return (
      <>
        <div className={styles.price_list_content_middle_section}>
          {clientsStaticCardTitle.map((card,index) => (
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
          {accordionData.map((accordion) => (
            <div key={accordion.key}>
              {renderAccordion(
                accordion.title, 
                accordion.data, 
                accordionStates[accordion.key as keyof typeof accordionStates], 
                () => toggleAccordion(accordion.key)
              )}
            </div>
          ))}
        </div>
      </>
    )
  }

  const renderNewObjectsTable = () => {
    return(
      <div className={styles.price_list_new_objects_section}>
        <table className={styles.new_objects_table}>
          <thead className={styles.table_header}>
            <tr>
              {tableHeadings.map((heading, index) => (
                <th key={index} className={`${styles.table_header_cell_object} `}>{heading.heading}</th>
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
                    onChange={(e) => handleInputChange(row.id, 'price', e.target.value)}
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
                    onChange={(e) => handleInputChange(row.id, 'intervals', e.target.value)}
                    placeholder='Enter Intervals'
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
          <Button
            title="Cancel"
            variant="outline"
            onClick={handleCancel}  
            className={styles.cancel_button}
          />
          <Button
            title="Submit"
            variant="primary"
            onClick={handleSubmit}
            className={styles.submit_button}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.price_list_container}>
      <div className={styles.price_list_header}>
        <p className={styles.price_list_header_text}>
          1,20,300 SEK
          <span className={styles.price_list_header_text_span}> Maintenance Cost</span>
        </p>
      </div>

      <section className={styles.price_list_content}>
        <div className={styles.price_list_content_header}>
          {renderTabs()}

          <div className={styles.price_list_content_header_threedots}>
            <Image src={threeDotsIcon} alt="More Options" onClick={() => setShowAddFolderModal(true)}/>
          </div>
        </div>
        {activeTab === 'all' ? (
          renderAllObjects()
        ) : (
          renderNewObjectsTable()
        )}
      </section>
      <AddFolderModal show={showAddFolderModal} onClose={() => setShowAddFolderModal(false)} />
    </div>
  );
};

export default PriceListPage;