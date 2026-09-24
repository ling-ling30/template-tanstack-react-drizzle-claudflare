import * as React from "react";
import {
  Check,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryByCode,
  formatPhoneNumber,
  extractDigits,
  isValidPhoneNumber,
  type Country,
} from "@/lib/phone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface PhoneValueMeta {
  country: Country;
  dialCode: string;
  nationalNumber: string;
  formatted: string;
  e164: string;
  isValid: boolean;
}

export interface PhoneInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, meta: PhoneValueMeta) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean | string;
  showValidationState?: boolean;
  className?: string;
  autoComplete?: string;
}

export function PhoneInput({
  id,
  name,
  value: controlledValue,
  defaultValue = "",
  onChange,
  defaultCountry = "US",
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  showValidationState = false,
  className,
  autoComplete = "tel-national",
}: PhoneInputProps) {
  // Selected country state
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(() => {
    return (
      (defaultCountry ? getCountryByCode(defaultCountry) : undefined) ??
      DEFAULT_COUNTRY
    );
  });

  // Country popover state
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Input internal value state for uncontrolled usage
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
    () => {
      const initial = defaultValue || "";
      return formatPhoneNumber(initial, selectedCountry);
    }
  );

  const [isTouched, setIsTouched] = React.useState(false);

  // Derived current formatted value
  const displayValue = isControlled
    ? formatPhoneNumber(controlledValue ?? "", selectedCountry)
    : uncontrolledValue;

  // Digits & validation calculation
  const nationalDigits = extractDigits(displayValue);
  const isValid = isValidPhoneNumber(nationalDigits, selectedCountry);
  const isInvalid = Boolean(
    error ||
    (isTouched && showValidationState && nationalDigits.length > 0 && !isValid)
  );

  const filteredCountries = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const emitChange = React.useCallback(
    (formatted: string, country: Country) => {
      const digits = extractDigits(formatted);
      const valid = isValidPhoneNumber(digits, country);
      const e164 = digits ? `${country.dialCode}${digits}` : "";
      const meta: PhoneValueMeta = {
        country,
        dialCode: country.dialCode,
        nationalNumber: digits,
        formatted,
        e164,
        isValid: valid,
      };

      onChange?.(formatted, meta);
    },
    [onChange]
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");

    // Reformat existing digits with the new country mask
    if (nationalDigits) {
      const reformatted = formatPhoneNumber(nationalDigits, country);
      if (!isControlled) {
        setUncontrolledValue(reformatted);
      }
      emitChange(reformatted, country);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Check if user pasted an international number starting with "+"
    if (rawInput.startsWith("+")) {
      const sorted = [...COUNTRIES].sort(
        (a, b) => b.dialCode.length - a.dialCode.length
      );
      const matched = sorted.find((c) => rawInput.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
        const nationalPart = rawInput.slice(matched.dialCode.length);
        const formatted = formatPhoneNumber(nationalPart, matched);
        if (!isControlled) {
          setUncontrolledValue(formatted);
        }
        emitChange(formatted, matched);
        return;
      }
    }

    const formatted = formatPhoneNumber(rawInput, selectedCountry);
    if (!isControlled) {
      setUncontrolledValue(formatted);
    }
    emitChange(formatted, selectedCountry);
  };

  const handleClear = () => {
    if (!isControlled) {
      setUncontrolledValue("");
    }
    emitChange("", selectedCountry);
  };

  const activePlaceholder =
    placeholder || selectedCountry.format.replace(/#/g, "0");

  return (
    <div
      data-slot="phone-input-root"
      aria-invalid={isInvalid ? "true" : undefined}
      className={cn(
        "border-input bg-background relative flex h-9.5 w-full items-center rounded-md border shadow-xs transition-colors duration-120",
        "focus-within:border-primary focus-within:ring-ring/25 focus-within:ring-2",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2",
        disabled &&
          "bg-muted/20 pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Country Selector Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || readOnly}
            aria-label={`Select country, current: ${selectedCountry.name}`}
            className={cn(
              "hover:bg-muted/50 flex h-full shrink-0 items-center gap-1.5 rounded-l-md px-2.5 text-sm font-medium transition-colors focus-visible:outline-none",
              disabled && "pointer-events-none"
            )}
          >
            <span
              className="text-base leading-none select-none"
              role="img"
              aria-hidden="true"
            >
              {selectedCountry.flag}
            </span>
            <span className="text-muted-foreground font-mono text-xs">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown
              className={cn(
                "text-muted-foreground/80 size-3 transition-transform duration-150",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="border-border bg-popover w-72 rounded-lg border p-1.5 shadow-md"
        >
          {/* Search Box */}
          <div className="relative mb-1 flex items-center px-1">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 size-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="bg-muted/40 border-input/60 focus:border-primary focus:bg-background placeholder:text-muted-foreground h-8 w-full rounded-md border pr-7 pl-8 text-xs transition-colors outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/80 absolute right-3 rounded-sm p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Countries List */}
          <div className="max-h-60 space-y-0.5 overflow-y-auto py-1 text-xs">
            {filteredCountries.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-xs">
                No country found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="text-sm select-none"
                        role="img"
                        aria-hidden="true"
                      >
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground font-mono">
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <Check className="text-primary size-3.5" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Vertical Hairline Divider */}
      <div className="bg-border/80 h-4.5 w-px shrink-0" aria-hidden="true" />

      {/* National Number Input */}
      <input
        id={id}
        name={name}
        type="tel"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={() => setIsTouched(true)}
        placeholder={activePlaceholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        className={cn(
          "placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent px-3 font-mono text-sm tracking-tight outline-none"
        )}
      />

      {/* Clear Button */}
      {displayValue && !disabled && !readOnly && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear phone number"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/80 mr-2 shrink-0 rounded-full p-1 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}

      {/* Validation Indicator */}
      {showValidationState && nationalDigits.length > 0 && (
        <div className="pointer-events-none mr-2.5 flex shrink-0 items-center">
          {isValid ? (
            <CheckCircle2 className="text-chart-2 size-4" />
          ) : (
            <AlertCircle className="text-destructive size-4" />
          )}
        </div>
      )}
    </div>
  );
}
