import React, { useState, useRef } from "react";
import { calenderBlackIcon, leftArrowBlackIcon } from "@/resources/images";
import PopOver from "@/components/ui/popover";
import styles from "./styles.module.css";

interface CustomDatePickerProps {
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label = "Set new Maintenance date *",
  placeholder = "Select Maintenance date",
  value,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode("days");
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setViewMode("months");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevMonthDays = getDaysInMonth(prevMonth, prevYear);
      const day = prevMonthDays - firstDay + i + 1;

      days.push(
        <button
          key={`prev-${day}`}
          className={styles.datePicker_dayDisabled}
          disabled
        >
          {day.toString().padStart(2, "0")}
        </button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          className={`${styles.datePicker_day} ${
            isSelected ? styles.datePicker_daySelected : ""
          }`}
          onClick={() => handleDateSelect(day)}
        >
          {day.toString().padStart(2, "0")}
        </button>
      );
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingCells = totalCells - days.length;

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className={styles.datePicker_dayDisabled}
          disabled
        >
          {day.toString().padStart(2, "0")}
        </button>
      );
    }

    return days;
  };

  const renderMonths = () => {
    return months.map((month, index) => (
      <button
        key={month}
        className={`${styles.datePicker_monthYear} ${
          currentMonth === index ? styles.datePicker_monthYearSelected : ""
        }`}
        onClick={() => handleMonthSelect(index)}
      >
        {month}
      </button>
    ));
  };

  const renderYears = () => {
    const startYear = currentYear - 10;
    const years = [];

    for (let year = startYear; year <= startYear + 19; year++) {
      years.push(
        <button
          key={year}
          className={`${styles.datePicker_monthYear} ${
            currentYear === year ? styles.datePicker_monthYearSelected : ""
          }`}
          onClick={() => handleYearSelect(year)}
        >
          {year}
        </button>
      );
    }

    return years;
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.datePicker_mainContainer} ${className}`}
    >
      {label && <label className={styles.datePicker_label}>{label}</label>}

      <div className={styles.datePicker_inputContainer}>
        <input
          type="text"
          readOnly
          placeholder={placeholder}
          value={selectedDate ? formatDate(selectedDate) : ""}
          className={styles.datePicker_input}
          onClick={() => setIsOpen(!isOpen)}
        />

        <img
          src={calenderBlackIcon.src}
          className={styles.datePicker_icon}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      <PopOver
        reference={containerRef}
        show={isOpen}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        container_style={styles.datePicker_dropdown}
        relativeWidth={true}
        offset={[0, 16]}
      >
        <div className={styles.datePicker_header}>
          <div
            className={styles.datePicker_navButton}
            onClick={() => {
              if (viewMode === "days") navigateMonth("prev");
              else if (viewMode === "months") setCurrentYear(currentYear - 1);
              else if (viewMode === "years") setCurrentYear(currentYear - 20);
            }}
          >
            <img src={leftArrowBlackIcon.src} />
          </div>

          <div className={styles.datePicker_headerTitle}>
            {viewMode === "days" && (
              <>
                <button
                  className={styles.datePicker_titleButton}
                  onClick={() => setViewMode("months")}
                >
                  {months[currentMonth]}
                </button>
                <button
                  className={styles.datePicker_titleButton}
                  onClick={() => setViewMode("years")}
                >
                  {currentYear}
                </button>
              </>
            )}
            {viewMode === "months" && (
              <div
                className={styles.datePicker_titleButton}
                onClick={() => setViewMode("years")}
              >
                {currentYear}
              </div>
            )}
            {viewMode === "years" && (
              <span className={styles.datePicker_titleButton}>
                {currentYear - 10} - {currentYear + 9}
              </span>
            )}
          </div>

          <div
            className={styles.datePicker_navButton}
            onClick={() => {
              if (viewMode === "days") navigateMonth("next");
              else if (viewMode === "months") setCurrentYear(currentYear + 1);
              else if (viewMode === "years") setCurrentYear(currentYear + 20);
            }}
          >
            <img
              src={leftArrowBlackIcon.src}
              className={styles.datePicker_navRight}
            />
          </div>
        </div>

        <div className={styles.datePicker_content}>
          {viewMode === "days" && (
            <>
              <div className={styles.datePicker_weekHeader}>
                {daysOfWeek.map((day) => (
                  <div key={day} className={styles.datePicker_weekDay}>
                    {day}
                  </div>
                ))}
              </div>
              <div className={styles.datePicker_daysGrid}>{renderDays()}</div>
            </>
          )}

          {viewMode === "months" && (
            <div className={styles.datePicker_monthsGrid}>{renderMonths()}</div>
          )}

          {viewMode === "years" && (
            <div className={styles.datePicker_yearsGrid}>{renderYears()}</div>
          )}
        </div>
      </PopOver>
    </div>
  );
};

export { CustomDatePicker };
