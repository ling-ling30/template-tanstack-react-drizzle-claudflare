import * as React from "react";
import {
  Check,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
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

export function CountryFlag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const Flag = (
    Flags as Record<string, React.ComponentType<{ className?: string }>>
  )[code?.toUpperCase()];

  if (!Flag) {
    return (
      <span
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-3.5 w-5 shrink-0 items-center justify-center rounded-[2px] font-mono text-[9px] font-bold shadow-[0_0_0_1px_rgba(0,0,0,0.1)]",
          className
        )}
      >
        {code?.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <Flag className="h-full w-full object-cover" />
    </span>
  );
}

export interface PhoneInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, meta: PhoneValueMeta) => void;
  country?: string;
  defaultCountry?: string;
  onCountryChange?: (country: Country) => void;
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
  country: controlledCountryCode,
  defaultCountry = "US",
  onCountryChange,
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
  const [internalCountry, setInternalCountry] = React.useState<Country>(() => {
    const code = controlledCountryCode || defaultCountry;
    return (code ? getCountryByCode(code) : undefined) ?? DEFAULT_COUNTRY;
  });

  const selectedCountry = React.useMemo(() => {
    if (controlledCountryCode) {
      return getCountryByCode(controlledCountryCode) ?? internalCountry;
    }
    return internalCountry;
  }, [controlledCountryCode, internalCountry]);

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
    if (!controlledCountryCode) {
      setInternalCountry(country);
    }
    onCountryChange?.(country);
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
        if (!controlledCountryCode) {
          setInternalCountry(matched);
        }
        onCountryChange?.(matched);
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
        "group border-input bg-background relative flex h-9.5 w-full items-center rounded-md border shadow-xs transition-all duration-120",
        "focus-within:border-primary focus-within:ring-ring/25 focus-within:ring-2",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2",
        disabled &&
          "bg-muted/20 pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Integrated Country Selector Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled || readOnly}
            aria-label={`Select country, current: ${selectedCountry.name}`}
            className={cn(
              "border-border/70 flex h-full shrink-0 items-center gap-1.5 rounded-l-[calc(var(--radius)-1px)] border-r px-2.5 transition-colors outline-none",
              "hover:bg-muted/50 active:bg-muted/80 focus-visible:bg-muted/60",
              disabled && "pointer-events-none"
            )}
          >
            {/* Real SVG Country Flag */}
            <CountryFlag code={selectedCountry.code} />

            {/* Dial Code - strictly inline with vertical centering */}
            <span className="text-foreground font-mono text-xs leading-none font-medium tabular-nums">
              {selectedCountry.dialCode}
            </span>

            {/* Dropdown Chevron */}
            <ChevronDown
              className={cn(
                "text-muted-foreground size-3 transition-transform duration-150",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="border-border bg-popover w-80 rounded-lg border p-0 shadow-md outline-none"
        >
          {/* Header Search Box with Asana 4px Grid Spacing */}
          <div className="border-border/60 bg-muted/20 border-b p-2">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground pointer-events-none absolute left-2.5 size-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or dial code..."
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

          {/* Precision Country List with Fixed-Width Tabular Columns */}
          <div className="max-h-64 overflow-y-auto p-1 text-xs">
            {filteredCountries.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-xs">
                No matching country found
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
                      "flex h-8.5 w-full items-center rounded-md px-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {/* Fixed Flag Column */}
                    <div className="flex w-6 shrink-0 items-center">
                      <CountryFlag code={c.code} />
                    </div>

                    {/* Country Name */}
                    <span className="flex-1 truncate pr-2 text-xs">
                      {c.name}
                    </span>

                    {/* Fixed Tabular Dial Code */}
                    <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-[11px] tabular-nums">
                      {c.dialCode}
                    </span>

                    {/* Active Checkmark */}
                    <span className="ml-1.5 flex w-4 shrink-0 justify-end">
                      {isSelected && (
                        <Check className="text-primary size-3.5" />
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

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
          "text-foreground placeholder:text-muted-foreground/70 h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-normal tabular-nums outline-none"
        )}
      />

      {/* Trailing Controls (Clear Button & Validation Indicator) */}
      <div className="flex shrink-0 items-center gap-1.5 pr-2.5">
        {displayValue && !disabled && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear phone number"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-5 items-center justify-center rounded-full transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}

        {/* Validation Status Indicator */}
        {showValidationState && nationalDigits.length > 0 && (
          <div
            className="pointer-events-none flex size-4 items-center justify-center"
            title={
              isValid ? "Phone number valid" : "Incomplete or invalid number"
            }
          >
            {isValid ? (
              <CheckCircle2 className="text-chart-2 size-4" />
            ) : (
              <AlertCircle className="text-destructive size-4" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
