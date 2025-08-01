"use client";

import React, { useState } from "react";
import BreakdownModal from "./index";

const BreakdownModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const breakdownData = [
    { label: "Object", value: "12,000" },
    { label: "Object", value: "12,000" },
    { label: "Object", value: "12,000" },
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={handleOpenModal}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ec4899",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Show Breakdown Modal
      </button>

      {isModalOpen && (
        <BreakdownModal
          data={breakdownData}
          onClose={handleCloseModal}
          title="Break Down"
        />
      )}
    </div>
  );
};

export default BreakdownModalExample;
