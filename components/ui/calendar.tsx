"use client";

import type * as React from "react";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { DayPicker, SelectSingleEventHandler } from "react-day-picker";
import fr from "date-fns/locale/fr";
import { format, getYear, setYear } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  yearRange?: { from: number; to: number };
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = fr,
  yearRange = { from: 1950, to: 2050 },
  ...props
}: CalendarProps) {
  // État pour stocker le mois affiché actuel
  const [month, setMonth] = useState<Date>(props.defaultMonth || new Date());

  // Générer un tableau d'années pour le sélecteur
  const yearsRange = Array.from(
    { length: yearRange.to - yearRange.from + 1 },
    (_, i) => yearRange.from + i
  );

  // Gérer le changement d'année
  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setMonth(setYear(month, newYear));

    // Si un mois est sélectionné, mettre à jour props.selected également
    if (props.selected && props.onSelect) {
      const newDate = setYear(props.selected as Date, newYear);
      props.onSelect(newDate as any);
    }
  };

  // Gérer le changement de mois rapide (année précédente/suivante)
  const handlePrevYear = () => {
    const newMonth = new Date(month);
    newMonth.setFullYear(newMonth.getFullYear() - 1);
    setMonth(newMonth);
  };

  const handleNextYear = () => {
    const newMonth = new Date(month);
    newMonth.setFullYear(newMonth.getFullYear() + 1);
    setMonth(newMonth);
  };

  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={month}
      onMonthChange={setMonth}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-10",
        caption_label: "text-sm font-medium grow text-center",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth }) => {
          const year = getYear(displayMonth);
          const formattedMonth = format(displayMonth, "MMMM", { locale });

          return (
            <div className="flex items-center justify-center gap-1 relative w-full pb-2">
              <div className="flex items-center absolute left-0 space-x-1">
                <button
                  onClick={handlePrevYear}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "h-7 w-7 bg-transparent p-0"
                  )}
                  title="Année précédente"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-1 items-center text-center">
                <span className="text-sm font-medium capitalize">
                  {formattedMonth}
                </span>
                <Select
                  value={year.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-7 w-[70px] text-xs focus:ring-0">
                    <SelectValue placeholder={year.toString()} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {yearsRange.map((year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="text-sm"
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center absolute right-0 space-x-1">
                <button
                  onClick={handleNextYear}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "h-7 w-7 bg-transparent p-0"
                  )}
                  title="Année suivante"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
