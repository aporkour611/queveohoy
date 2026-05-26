"use client";

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
  return (
    <div className="qvh-day-tabs" role="tablist" aria-label="Elegir día">
      {days.map((day, i) => (
        <button
          key={day.date}
          type="button"
          role="tab"
          aria-selected={activeIndex === i}
          className={`qvh-day-tab ${activeIndex === i ? "active" : ""}`}
          onClick={() => onChange(i)}
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
