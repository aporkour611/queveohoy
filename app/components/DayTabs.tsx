"use client";

import { useRef } from "react";

type DayTab = {
  date: string;
  label: string;
  num: number;
  month: string;
};

type Props = {
  days: DayTab[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export function DayTabs({ days, activeIndex, onChange }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  function scrollTabIntoView(index: number) {
    const tab = listRef.current?.querySelector<HTMLElement>(
      `[data-day-index="${index}"]`
    );
    tab?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }

  function handleSelect(index: number) {
    onChange(index);
    requestAnimationFrame(() => scrollTabIntoView(index));
  }

  return (
    <div
      ref={listRef}
      className="qvh-day-tabs qvh-day-tabs-sticky"
      role="tablist"
      aria-label="Elegir día"
    >
      {days.map((day, i) => (
        <button
          key={day.date}
          type="button"
          role="tab"
          data-day-index={i}
          aria-selected={activeIndex === i}
          className={`qvh-day-tab ${activeIndex === i ? "active" : ""}`}
          onClick={() => handleSelect(i)}
        >
          <span className="qvh-day-tab-label">{day.label}</span>
          <span className="qvh-day-tab-date">
            {day.num} {day.month.toLowerCase()}
          </span>
        </button>
      ))}
    </div>
  );
}
