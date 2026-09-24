import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type DateRange = {
  from?: Date | null;
  to?: Date | null;
};

export interface CalendarProps {
  className?: string;
  mode?: "single" | "range";
  selected?: Date | DateRange | null;
  onSelect?: (date: Date | DateRange | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
  locale?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isSameDay(d1?: Date | null, d2?: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isDateInRange(
  date: Date,
  from?: Date | null,
  to?: Date | null
): boolean {
  if (!from || !to) return false;
  const time = date.setHours(0, 0, 0, 0);
  const startTime = new Date(from).setHours(0, 0, 0, 0);
  const endTime = new Date(to).setHours(0, 0, 0, 0);
  return time > startTime && time < endTime;
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDates,
}: CalendarProps) {
  // Initial display month based on selected date or today
  const initialDate = React.useMemo(() => {
    if (mode === "single" && selected instanceof Date) {
      return new Date(selected);
    }
    if (
      mode === "range" &&
      selected &&
      typeof selected === "object" &&
      "from" in selected &&
      selected.from
    ) {
      return new Date(selected.from);
    }
    return new Date();
  }, [mode, selected]);

  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Days calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = React.useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete 6 rows (42 days) or 5 rows
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, firstDayOfWeek, daysInMonth, daysInPrevMonth]);

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      const range = (selected as DateRange) || {};
      if (!range.from || (range.from && range.to)) {
        // Start new range
        onSelect?.({ from: date, to: null });
      } else if (range.from && !range.to) {
        if (date < range.from) {
          // If clicked date is before start date, make it the new start
          onSelect?.({ from: date, to: range.from });
        } else {
          onSelect?.({ from: range.from, to: date });
        }
      }
    }
  };

  const isDayDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999)))
      return true;
    if (disabledDates && disabledDates(date)) return true;
    return false;
  };

  const today = new Date();

  return (
    <div className={cn("w-fit p-3 select-none", className)}>
      {/* Calendar Header */}
      <div className="border-border flex items-center justify-between gap-2 border-b pb-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="text-foreground text-sm font-semibold tracking-tight">
          {MONTH_NAMES[month]} {year}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-muted-foreground flex size-8 items-center justify-center text-xs font-semibold uppercase"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const disabled = isDayDisabled(date);
          const isToday = isSameDay(date, today);

          let isSelected = false;
          let isRangeStart = false;
          let isRangeEnd = false;
          let isInRange = false;

          if (mode === "single") {
            isSelected = isSameDay(date, selected as Date);
          } else if (mode === "range") {
            const range = (selected as DateRange) || {};
            isRangeStart = isSameDay(date, range.from);
            isRangeEnd = isSameDay(date, range.to);
            isSelected = isRangeStart || isRangeEnd;

            // Check if inside defined range
            if (range.from && range.to) {
              isInRange = isDateInRange(date, range.from, range.to);
            } else if (range.from && !range.to && hoveredDate) {
              // Hover preview
              const hoverStart =
                range.from < hoveredDate ? range.from : hoveredDate;
              const hoverEnd =
                range.from < hoveredDate ? hoveredDate : range.from;
              isInRange = isDateInRange(date, hoverStart, hoverEnd);
              if (isSameDay(date, hoveredDate)) {
                isRangeEnd = true;
                isSelected = true;
              }
            }
          }

          return (
            <div
              key={idx}
              className={cn(
                "relative flex h-8 items-center justify-center",
                isInRange && "bg-primary/10",
                isRangeStart && "bg-primary/10 rounded-l-md",
                isRangeEnd && "bg-primary/10 rounded-r-md"
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                className={cn(
                  "asana-press relative flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors outline-none",
                  !isCurrentMonth && "text-muted-foreground/35",
                  isCurrentMonth &&
                    !isSelected &&
                    !isInRange &&
                    "text-foreground hover:bg-secondary",
                  isToday &&
                    !isSelected &&
                    "border-border border font-semibold",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs",
                  isInRange && !isSelected && "text-foreground font-medium",
                  disabled &&
                    "pointer-events-none cursor-not-allowed opacity-30"
                )}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
