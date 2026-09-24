import * as React from "react";
import { Check, ChevronDown, Search, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  group?: string;
}

export interface ComboboxProps {
  id?: string;
  name?: string;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option?: ComboboxOption) => void;
  onValueChange?: (value: string, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  error?: boolean | string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  onCreateOption?: (query: string) => void;
  createLabel?: (query: string) => string;
}

export function Combobox({
  id,
  options = [],
  value: controlledValue,
  defaultValue = "",
  onChange,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search or type...",
  emptyText = "No matching options found",
  disabled = false,
  readOnly = false,
  clearable = true,
  error,
  className,
  triggerClassName,
  popoverClassName,
  onCreateOption,
  createLabel = (q) => `Create "${q}"`,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const selectedValue = isControlled ? controlledValue : uncontrolledValue;

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === selectedValue);
  }, [options, selectedValue]);

  // Filtered options based on query
  const filteredOptions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  // Group filtered options if any options have group
  const groupedOptions = React.useMemo(() => {
    const hasGroups = filteredOptions.some((opt) => Boolean(opt.group));
    if (!hasGroups) return null;

    const groups: Record<string, ComboboxOption[]> = {};
    for (const opt of filteredOptions) {
      const g = opt.group || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    }
    return groups;
  }, [filteredOptions]);

  // Flat list for keyboard navigation
  const navigableOptions = React.useMemo(() => {
    return filteredOptions.filter((opt) => !opt.disabled);
  }, [filteredOptions]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setHighlightedIndex(0);
  };

  const handleSelect = React.useCallback(
    (option: ComboboxOption) => {
      if (option.disabled || disabled || readOnly) return;
      if (!isControlled) {
        setUncontrolledValue(option.value);
      }
      onChange?.(option.value, option);
      onValueChange?.(option.value, option);
      setIsOpen(false);
      setSearchQuery("");
    },
    [disabled, readOnly, isControlled, onChange, onValueChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || readOnly) return;
    if (!isControlled) {
      setUncontrolledValue("");
    }
    onChange?.("", undefined);
    onValueChange?.("", undefined);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || readOnly) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < navigableOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : navigableOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (navigableOptions[highlightedIndex]) {
        handleSelect(navigableOptions[highlightedIndex]);
      } else if (onCreateOption && searchQuery.trim()) {
        onCreateOption(searchQuery.trim());
        setIsOpen(false);
        setSearchQuery("");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const isInvalid = Boolean(error);
  const SelectedIcon = selectedOption?.icon;

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            className={cn(
              "border-input bg-background flex h-9.5 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs transition-colors duration-120 outline-none",
              "hover:bg-muted/30 focus-visible:border-primary focus-visible:ring-ring/25 focus-visible:ring-2",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2",
              disabled && "bg-muted/20 cursor-not-allowed opacity-50",
              triggerClassName
            )}
            aria-invalid={isInvalid ? "true" : undefined}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              {SelectedIcon && (
                <SelectedIcon className="text-muted-foreground size-4 shrink-0" />
              )}
              {selectedOption ? (
                <span className="text-foreground truncate font-medium">
                  {selectedOption.label}
                </span>
              ) : (
                <span className="text-muted-foreground truncate">
                  {placeholder}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 pl-1">
              {clearable && selectedOption && !disabled && !readOnly && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClear(e as unknown as React.MouseEvent);
                    }
                  }}
                  aria-label="Clear selection"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-5 items-center justify-center rounded-full transition-colors"
                >
                  <X className="size-3.5" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "text-muted-foreground size-3.5 transition-transform duration-150",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className={cn(
            "border-border bg-popover w-[var(--radix-popover-trigger-width)] min-w-64 rounded-lg border p-0 shadow-md outline-none",
            popoverClassName
          )}
        >
          {/* Header Search Box with 4px Grid Cadence */}
          <div className="border-border/60 bg-muted/20 border-b p-2">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground pointer-events-none absolute left-2.5 size-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="border-input/80 bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-ring/25 h-8 w-full rounded-md border pr-7 pl-8 text-xs transition-colors outline-none focus:ring-1"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-2 rounded-sm p-0.5"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-1 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-xs">
                <p>{emptyText}</p>
                {onCreateOption && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateOption(searchQuery.trim());
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="bg-primary/10 text-primary hover:bg-primary/20 mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>{createLabel(searchQuery.trim())}</span>
                  </button>
                )}
              </div>
            ) : groupedOptions ? (
              Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                <div key={groupName} className="mb-2 last:mb-0">
                  <div className="text-muted-foreground px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase">
                    {groupName}
                  </div>
                  <div className="space-y-0.5">
                    {groupOpts.map((option) => {
                      const isSelected = option.value === selectedValue;
                      const OptionIcon = option.icon;
                      const isHighlighted =
                        navigableOptions[highlightedIndex]?.value ===
                        option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => handleSelect(option)}
                          className={cn(
                            "flex h-8.5 w-full items-center justify-between rounded-md px-2.5 text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : isHighlighted
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-accent hover:text-accent-foreground",
                            option.disabled && "pointer-events-none opacity-40"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {OptionIcon && (
                              <OptionIcon className="text-muted-foreground size-3.5 shrink-0" />
                            )}
                            <div className="flex flex-col truncate">
                              <span className="truncate">{option.label}</span>
                              {option.description && (
                                <span className="text-muted-foreground truncate text-[10px]">
                                  {option.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="text-primary ml-1.5 size-3.5 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-0.5">
                {filteredOptions.map((option) => {
                  const isSelected = option.value === selectedValue;
                  const OptionIcon = option.icon;
                  const isHighlighted =
                    navigableOptions[highlightedIndex]?.value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "flex h-8.5 w-full items-center justify-between rounded-md px-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : isHighlighted
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                        option.disabled && "pointer-events-none opacity-40"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {OptionIcon && (
                          <OptionIcon className="text-muted-foreground size-3.5 shrink-0" />
                        )}
                        <div className="flex flex-col truncate">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className="text-muted-foreground truncate text-[10px]">
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="text-primary ml-1.5 size-3.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
