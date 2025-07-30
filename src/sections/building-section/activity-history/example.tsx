import React from "react";
import ActivityHistory from "./index";

const ActivityHistoryExample = () => {
  const sampleActivities = [
    {
      id: "1",
      title: "Approved Excel data for Block S Skatan",
      description:
        "is a platform for showcasing and discovering creative work, connecting artists and designers worldwide.",
      timestamp: "2 days ago",
      files: [
        {
          id: "file1",
          fileName: "blockc-1.Pdf",
          uploadedBy: "Kvarter Skatan",
          uploadedDate: "12 jun, 2025",
          fileSize: "3 MB",
          folder: "Block C",
        },
        {
          id: "file2",
          fileName: "blockc-2.Pdf",
          uploadedBy: "Kvarter Skatan",
          uploadedDate: "12 jun, 2025",
          fileSize: "3 MB",
          folder: "Block C",
        },
        {
          id: "file3",
          fileName: "BlockA_objectsP...",
          uploadedBy: "Kvarter Skatan",
          uploadedDate: "12 jun, 2025",
          fileSize: "3 MB",
          folder: "Modified details",
        },
      ],
    },
    {
      id: "2",
      title: "Approved Excel data for Block S Skatan",
      description:
        "is a platform for showcasing and discovering creative work, connecting artists and designers worldwide.",
      timestamp: "12 Hrs ago",
      status: "Approved",
    },
    {
      id: "3",
      title: "Approved Excel data for Block S Skatan",
      description:
        "is a platform for showcasing and discovering creative work, connecting artists and designers worldwide.",
      timestamp: "1 day ago",
      status: "Approved",
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <ActivityHistory activities={sampleActivities} />
    </div>
  );
};

export default ActivityHistoryExample;
