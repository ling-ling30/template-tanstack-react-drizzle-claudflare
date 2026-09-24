import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NumberInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange"
> {
  value?: number | "";
  onChange?: (val: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  withStepper?: boolean;
  prefixText?: string;
  suffixText?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      onChange,
      min,
      max,
      step = 1,
      withStepper = true,
      prefixText,
      suffixText,
      disabled,
      placeholder = "Enter number",
      ...props
    },
    ref
  ) => {
    // Internal display string allows empty state while backspacing without forcing 0
    const [rawText, setRawText] = React.useState<string>(() =>
      value === undefined || value === "" ? "" : String(value)
    );

    React.useEffect(() => {
      if (value === undefined || value === "") {
        setRawText("");
      } else {
        setRawText(String(value));
      }
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;

      // Allow complete clear / blank without forcing 0
      if (text === "" || text === "-") {
        setRawText(text);
        onChange?.("");
        return;
      }

      // Only allow valid numeric patterns
      if (/^-?\d*\.?\d*$/.test(text)) {
        setRawText(text);
        const parsed = parseFloat(text);
        if (!isNaN(parsed)) {
          onChange?.(parsed);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      props.onBlur?.(e);
      if (rawText === "" || rawText === "-") {
        onChange?.("");
        return;
      }
      const parsed = parseFloat(rawText);
      if (!isNaN(parsed)) {
        let clamped = parsed;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        setRawText(String(clamped));
        onChange?.(clamped);
      } else {
        setRawText("");
        onChange?.("");
      }
    };

    const stepUp = () => {
      if (disabled) return;
      const current =
        rawText === ""
          ? min !== undefined
            ? min
            : 0
          : parseFloat(rawText) || 0;
      const next = current + step;
      const clamped = max !== undefined ? Math.min(max, next) : next;
      setRawText(String(clamped));
      onChange?.(clamped);
    };

    const stepDown = () => {
      if (disabled) return;
      const current =
        rawText === ""
          ? min !== undefined
            ? min
            : 0
          : parseFloat(rawText) || 0;
      const next = current - step;
      const clamped = min !== undefined ? Math.max(min, next) : next;
      setRawText(String(clamped));
      onChange?.(clamped);
    };

    return (
      <div className="flex items-center gap-1.5">
        {withStepper && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={
              disabled ||
              (min !== undefined &&
                rawText !== "" &&
                parseFloat(rawText) <= min)
            }
            className="size-10 shrink-0 rounded-xl transition-transform active:scale-95"
            onClick={stepDown}
            aria-label="Decrease value"
          >
            <Minus className="size-4" />
          </Button>
        )}

        <div className="relative flex-1">
          {prefixText && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm">
              {prefixText}
            </span>
          )}

          <input
            {...props}
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={rawText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/20 border-input/70 bg-background/60 h-10 w-full min-w-0 rounded-xl border px-3.5 py-1.5 text-base shadow-xs backdrop-blur-xs transition-all duration-150 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              withStepper && "text-center font-mono font-medium",
              prefixText && "pl-8",
              suffixText && "pr-8",
              "focus-visible:border-foreground/40 focus-visible:ring-ring/25 focus-visible:ring-4",
              className
            )}
          />

          {suffixText && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-sm">
              {suffixText}
            </span>
          )}
        </div>

        {withStepper && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={
              disabled ||
              (max !== undefined &&
                rawText !== "" &&
                parseFloat(rawText) >= max)
            }
            className="size-10 shrink-0 rounded-xl transition-transform active:scale-95"
            onClick={stepUp}
            aria-label="Increase value"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
