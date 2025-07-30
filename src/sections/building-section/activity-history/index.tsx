"use client";

import React from "react";
import CommonTable from "@/components/ui/common-table";
import StatusCapsule from "@/components/ui/status-capsule";
import styles from "./styles.module.css";
import Image from "next/image";
import { downloadIcon, threeDotsIcon } from "@/resources/images";

interface FileData {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedDate: string;
  fileSize: string;
  folder: string;
}

interface ActivityEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  files?: FileData[];
  status?: string;
}

interface ActivityHistoryProps {
  activities: ActivityEntry[];
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ activities }) => {
  const tableColumns = [
    {
      key: "fileName",
      title: "File name",
      width: "30%",
    },
    {
      key: "uploadedBy",
      title: "Uploaded by",
      width: "20%",
    },
    {
      key: "uploadedDate",
      title: "Uploaded date",
      width: "15%",
    },
    {
      key: "fileSize",
      title: "File Size",
      width: "10%",
    },
    {
      key: "folder",
      title: "Folder",
      width: "15%",
    },
    {
      key: "actions",
      title: "",
      width: "10%",
      render: () => (
        <div className={styles.action_buttons}>
          <Image src={downloadIcon} alt="download" width={16} height={16} />
          <Image src={threeDotsIcon} alt="three dots" width={16} height={16} />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.activity_history}>
      <div className={styles.timeline}>
        {activities.map((activity, index) => (
          <div key={activity.id} className={styles.timeline_item}>
            <div
              className={`${styles.timeline_marker} ${
                index === 0 ? styles.timeline_marker_active : ""
              }`}
            >
              <div
                className={`${styles.marker} ${
                  index === 0 ? styles.marker_active : ""
                }`}
              ></div>
            </div>

            <div className={styles.timeline_content}>
              <div className={styles.activity_header}>
                <div className={styles.activity_info}>
                  <h3 className={styles.activity_title}>{activity.title}</h3>
                  <p className={styles.activity_description}>
                    {activity.description}
                  </p>
                </div>
                <span className={styles.activity_timestamp}>
                  {activity.timestamp}
                </span>
              </div>

              {activity.files && activity.files.length > 0 ? (
                <div className={styles.file_table_container}>
                  <CommonTable
                    columns={tableColumns}
                    rows={activity.files}
                    className={styles.file_table}
                  />
                </div>
              ) : activity.status ? (
                <div className={styles.status_container}>
                  <StatusCapsule status={activity.status} variant="approved" />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHistory;
