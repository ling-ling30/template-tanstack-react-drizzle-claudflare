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
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function normalizeTime(d: Date | string): number {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

function isDateInRange(
  date: Date,
  from?: Date | null,
  to?: Date | null
): boolean {
  if (!from || !to) return false;
  const target = normalizeTime(date);
  const start = Math.min(normalizeTime(from), normalizeTime(to));
  const end = Math.max(normalizeTime(from), normalizeTime(to));
  return target > start && target < end;
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
  // Sync initial month
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

  // Sync current month when selected changes externally (e.g. from preset buttons)
  const [prevSelected, setPrevSelected] = React.useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    const targetDate =
      mode === "single" && selected instanceof Date
        ? selected
        : mode === "range" &&
            selected &&
            typeof selected === "object" &&
            "from" in selected &&
            selected.from
          ? new Date(selected.from)
          : null;

    if (targetDate) {
      if (
        currentMonth.getFullYear() !== targetDate.getFullYear() ||
        currentMonth.getMonth() !== targetDate.getMonth()
      ) {
        setCurrentMonth(
          new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
        );
      }
    }
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Day calculations
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

    // Next month padding days to complete a consistent 6-row (42 cells) or 5-row grid
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, firstDayOfWeek, daysInMonth, daysInPrevMonth]);

  const handleDateClick = (date: Date, isCurrent: boolean) => {
    if (!isCurrent) {
      // Navigate to clicked month if outside current
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      const range = (selected as DateRange) || {};
      if (!range.from || (range.from && range.to)) {
        // Start fresh range
        onSelect?.({ from: date, to: null });
      } else if (range.from && !range.to) {
        if (normalizeTime(date) < normalizeTime(range.from)) {
          // If clicked date is before start date, make it the new start
          onSelect?.({ from: date, to: range.from });
        } else {
          onSelect?.({ from: range.from, to: date });
        }
      }
    }
  };

  const isDayDisabled = (date: Date) => {
    if (minDate && normalizeTime(date) < normalizeTime(minDate)) return true;
    if (maxDate && normalizeTime(date) > normalizeTime(maxDate)) return true;
    if (disabledDates && disabledDates(date)) return true;
    return false;
  };

  const today = new Date();

  // Active range resolution
  const activeRange = React.useMemo(() => {
    if (mode !== "range") return null;
    const range = (selected as DateRange) || {};
    const from = range.from || null;
    const to = range.to || (range.from && hoveredDate ? hoveredDate : null);
    if (!from) return null;
    const start = normalizeTime(from) <= normalizeTime(to || from) ? from : to;
    const end = normalizeTime(from) <= normalizeTime(to || from) ? to : from;
    return {
      start,
      end,
      isResolved: Boolean(range.from && range.to),
    };
  }, [mode, selected, hoveredDate]);

  return (
    <div className={cn("w-64 select-none sm:w-72", className)}>
      {/* Calendar Header */}
      <div className="border-border flex items-center justify-between border-b pb-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="size-8 rounded-md"
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
          className="size-8 rounded-md"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Weekdays Row — perfectly aligned 7 columns */}
      <div className="grid grid-cols-7 pt-2 pb-1 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-muted-foreground flex h-8 items-center justify-center text-[11px] font-semibold tracking-wider uppercase"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid — 7 columns with zero horizontal offset */}
      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const colIndex = idx % 7;
          const disabled = isDayDisabled(date);
          const isToday = isSameDay(date, today);

          let isSelected = false;
          let isRangeStart = false;
          let isRangeEnd = false;
          let isInRange = false;

          if (isCurrentMonth) {
            if (mode === "single") {
              isSelected = isSameDay(date, selected as Date);
            } else if (activeRange) {
              isRangeStart = isSameDay(date, activeRange.start);
              isRangeEnd = isSameDay(date, activeRange.end);
              isSelected = isRangeStart || isRangeEnd;
              isInRange = isDateInRange(
                date,
                activeRange.start,
                activeRange.end
              );
            }
          }

          const hasRangeConnection =
            activeRange &&
            activeRange.start &&
            activeRange.end &&
            !isSameDay(activeRange.start, activeRange.end);

          return (
            <div
              key={idx}
              className="relative flex h-8 w-full items-center justify-center"
            >
              {/* Continuous Track Ribbon for Range */}
              {isCurrentMonth && hasRangeConnection && (
                <>
                  {/* Left half track leading into End Date */}
                  {isRangeEnd && colIndex !== 0 && (
                    <div className="bg-primary/10 absolute top-0 bottom-0 left-0 w-1/2" />
                  )}

                  {/* Right half track leading out of Start Date */}
                  {isRangeStart && colIndex !== 6 && (
                    <div className="bg-primary/10 absolute top-0 right-0 bottom-0 w-1/2" />
                  )}

                  {/* Full track for middle days */}
                  {isInRange && (
                    <div
                      className={cn(
                        "bg-primary/10 absolute inset-0",
                        colIndex === 0 && "rounded-l-md",
                        colIndex === 6 && "rounded-r-md"
                      )}
                    />
                  )}
                </>
              )}

              {/* Day Button */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleDateClick(date, isCurrentMonth)}
                onMouseEnter={() =>
                  mode === "range" && isCurrentMonth && setHoveredDate(date)
                }
                onMouseLeave={() => mode === "range" && setHoveredDate(null)}
                className={cn(
                  "asana-press relative z-10 flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors outline-none",
                  !isCurrentMonth &&
                    "text-muted-foreground/30 hover:text-muted-foreground/60",
                  isCurrentMonth &&
                    !isSelected &&
                    !isInRange &&
                    "text-foreground hover:bg-secondary",
                  isCurrentMonth &&
                    isInRange &&
                    !isSelected &&
                    "text-foreground hover:bg-primary/20 font-semibold",
                  isToday &&
                    !isSelected &&
                    "border-border border font-semibold",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary font-semibold shadow-xs",
                  disabled &&
                    "pointer-events-none cursor-not-allowed opacity-25"
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
