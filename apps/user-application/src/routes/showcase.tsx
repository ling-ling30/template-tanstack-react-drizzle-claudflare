/* eslint-disable i18next/no-literal-string --
   Living Design System & Component Engineering Showcase:
   demonstrates design tokens, inputs, padding rhythm, table, and form specifications. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Copy,
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Trash2,
  Eye,
  Filter,
  Layers,
  Ruler,
  Palette,
  FormInput,
  Table as TableIcon,
  Sliders,
  Send,
  Loader2,
  Type,
  RotateCcw,
} from "lucide-react";
import {
  ScrollReveal,
  ScrollRevealGroup,
  type ScrollRevealVariant,
} from "@/components/ui/scroll-reveal";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ValueBox,
  TelemetryBox,
  type ValueBoxType,
} from "@/components/ui/value-box";
import { NumberInput } from "@/components/ui/number-input";
import {
  DateInput,
  type DateRange,
  DateTimeInput,
  TimeInput,
} from "@/components/ui/date-input";
import {
  PhoneInput,
  CountryFlag,
  type PhoneValueMeta,
} from "@/components/ui/phone-input";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { parsePhoneNumber } from "@/lib/phone";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Format,
  FormattedCompactNumber,
  FormattedDate,
  FormattedDateRange,
  FormattedDateTime,
  FormattedDuration,
  FormattedNumber,
  FormattedPercent,
  FormattedRelativeTime,
  FormattedTime,
} from "@/components/ui/formatted";
import {
  Typography,
  Heading,
  Text,
  Code,
  Kbd,
  TypographyComponents,
  type TypographyProps,
} from "@/components/ui/typography";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DataTablePagination,
} from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export const Route = createFileRoute("/showcase")({
  component: ShowcasePage,
});

/* -------------------------------------------------------------------------
   Tokens Definition Data
   ------------------------------------------------------------------------- */
interface ColorToken {
  name: string;
  variable: string;
  description: string;
  previewClass: string;
  borderClass?: string;
  category: "surface" | "brand" | "border" | "charts" | "sidebar";
}

const COLOR_TOKENS: ColorToken[] = [
  // Surfaces
  {
    name: "Background",
    variable: "--background",
    description:
      "App backdrop layer. Pure white or deep Apple obsidian in dark mode.",
    previewClass: "bg-background",
    borderClass: "border-border",
    category: "surface",
  },
  {
    name: "Foreground",
    variable: "--foreground",
    description: "Primary high-contrast text and glyph elements.",
    previewClass: "bg-foreground",
    category: "surface",
  },
  {
    name: "Card",
    variable: "--card",
    description: "Surface for cards, modals, and grouped panel containers.",
    previewClass: "bg-card",
    borderClass: "border-border",
    category: "surface",
  },
  {
    name: "Popover",
    variable: "--popover",
    description: "Floating context layers: dropdowns, tooltips, select menus.",
    previewClass: "bg-popover",
    borderClass: "border-border",
    category: "surface",
  },
  {
    name: "Muted",
    variable: "--muted",
    description: "Subtle inset fills, disabled states, and skeleton bones.",
    previewClass: "bg-muted",
    category: "surface",
  },
  {
    name: "Muted Foreground",
    variable: "--muted-foreground",
    description: "Secondary labels, timestamps, placeholders, and meta notes.",
    previewClass: "bg-muted-foreground",
    category: "surface",
  },
  // Brand & Action
  {
    name: "Primary",
    variable: "--primary",
    description: "Key actions, primary buttons, and active highlight states.",
    previewClass: "bg-primary",
    category: "brand",
  },
  {
    name: "Secondary",
    variable: "--secondary",
    description: "Alternative action fills, soft secondary badges, pill tabs.",
    previewClass: "bg-secondary",
    category: "brand",
  },
  {
    name: "Accent",
    variable: "--accent",
    description: "Hover surface highlights on menu items and clickable rows.",
    previewClass: "bg-accent",
    category: "brand",
  },
  {
    name: "Destructive",
    variable: "--destructive",
    description: "Irreversible actions, error banners, and deletion alerts.",
    previewClass: "bg-destructive",
    category: "brand",
  },
  // Borders & Focus
  {
    name: "Border",
    variable: "--border",
    description: "1px structural dividers, card outlines, and table headers.",
    previewClass: "bg-border",
    category: "border",
  },
  {
    name: "Input Border",
    variable: "--input",
    description: "Standard outline for form inputs, textareas, and checkboxes.",
    previewClass: "bg-input",
    category: "border",
  },
  {
    name: "Focus Ring",
    variable: "--ring",
    description:
      "Keyboard navigation glowing halo and accessibility focus ring.",
    previewClass: "bg-ring",
    category: "border",
  },
  {
    name: "Signature Coral",
    variable: "--coral",
    description: "Iconic Asana brand accent for key actions and celebrations.",
    previewClass: "bg-coral",
    category: "brand",
  },
  // Charts
  {
    name: "Chart 1 (Coral / Lead)",
    variable: "--chart-1",
    description: "Primary analytics trendline or lead category metric.",
    previewClass: "bg-[var(--chart-1)]",
    category: "charts",
  },
  {
    name: "Chart 2 (Emerald / Growth)",
    variable: "--chart-2",
    description: "Positive growth, completed bookings, or retention dataset.",
    previewClass: "bg-[var(--chart-2)]",
    category: "charts",
  },
  {
    name: "Chart 3 (Azure / Volume)",
    variable: "--chart-3",
    description: "Secondary volume comparison or baseline trendline.",
    previewClass: "bg-[var(--chart-3)]",
    category: "charts",
  },
  {
    name: "Chart 4 (Amber / Pending)",
    variable: "--chart-4",
    description: "Warning thresholds, pending deliverables, or notice metric.",
    previewClass: "bg-[var(--chart-4)]",
    category: "charts",
  },
  {
    name: "Chart 5 (Amethyst / Supplemental)",
    variable: "--chart-5",
    description: "Tertiary metric or supplemental categorical indicator.",
    previewClass: "bg-[var(--chart-5)]",
    category: "charts",
  },
];

/* -------------------------------------------------------------------------
   Typography Hierarchy & Specimen Tokens
   ------------------------------------------------------------------------- */
interface TypographyToken {
  name: string;
  role: string;
  size: string;
  lineHeight: string;
  tracking: string;
  weight: string;
  sample: string;
  className: string;
}

const TYPOGRAPHY_TOKENS: TypographyToken[] = [
  {
    name: "Display Hero",
    role: "Hero headers, major metric calls, landing showcase headlines",
    size: "48px / 3.0rem",
    lineHeight: "1.1",
    tracking: "-0.035em",
    weight: "SemiBold (600)",
    sample: "Unforgettable Moments Captured",
    className: "text-3xl sm:text-5xl font-semibold tracking-[-0.035em]",
  },
  {
    name: "Page Title (H1)",
    role: "Primary view header, dashboard page title, dialog headlines",
    size: "30px / 1.875rem",
    lineHeight: "1.2",
    tracking: "-0.025em",
    weight: "SemiBold (600)",
    sample: "Design System & Component Spec",
    className: "text-2xl sm:text-3xl font-semibold tracking-tight",
  },
  {
    name: "Section Title (H2)",
    role: "Major content chapter divider, module headings",
    size: "24px / 1.5rem",
    lineHeight: "1.25",
    tracking: "-0.02em",
    weight: "SemiBold (600)",
    sample: "Typography & Hierarchy System",
    className: "text-xl sm:text-2xl font-semibold tracking-tight",
  },
  {
    name: "Card Title (H3)",
    role: "Card headers, popover titles, grouping section labels",
    size: "16px / 1.0rem",
    lineHeight: "1.35",
    tracking: "-0.01em",
    weight: "SemiBold (600)",
    sample: "Interactive Form Composition",
    className: "text-base font-semibold leading-snug",
  },
  {
    name: "Lead / Subheading",
    role: "Introductory summaries, hero subtitle copy",
    size: "16px / 1.0rem",
    lineHeight: "1.6",
    tracking: "normal",
    weight: "Regular (400)",
    sample:
      "Strict token definitions, mathematical padding rhythm, and responsive controls.",
    className: "text-base text-muted-foreground leading-relaxed",
  },
  {
    name: "Body Regular",
    role: "Standard UI paragraphs, card descriptions, data table entries",
    size: "14px / 0.875rem",
    lineHeight: "1.5",
    tracking: "normal",
    weight: "Regular (400)",
    sample:
      "Every input state tuned with instant feedback and tactile focus rings.",
    className: "text-sm text-foreground/90 leading-relaxed",
  },
  {
    name: "Caption / Label",
    role: "Field labels, column headers, metadata timestamps",
    size: "12px / 0.75rem",
    lineHeight: "1.4",
    tracking: "normal",
    weight: "Medium (500)",
    sample: "Event Date & Start Time · Required Field",
    className: "text-xs font-medium text-muted-foreground",
  },
  {
    name: "Monospace / Telemetry",
    role: "Code tokens, E.164 phone payloads, coordinates, IDs",
    size: "12px / 0.75rem",
    lineHeight: "1.4",
    tracking: "-0.01em",
    weight: "Regular (400)",
    sample: "EVT-8921 · +1 (202) 555-0123 · origin-aware",
    className: "font-mono text-xs text-foreground",
  },
  {
    name: "Micro Badge / Tag",
    role: "Status pill tags, compact counts, keyboard shortcuts",
    size: "10px / 0.625rem",
    lineHeight: "1.0",
    tracking: "0.05em",
    weight: "SemiBold (600)",
    sample: "VERIFIED · ⌘K · v2.0",
    className:
      "font-mono text-[10px] uppercase font-semibold tracking-wider text-muted-foreground",
  },
];

/* -------------------------------------------------------------------------
   Spacing & Padding Rules Data
   ------------------------------------------------------------------------- */
interface SpacingRule {
  token: string;
  pixels: number;
  rem: string;
  tailwind: string;
  usage: string;
  example: string;
}

const SPACING_RULES: SpacingRule[] = [
  {
    token: "xxs (Micro)",
    pixels: 4,
    rem: "0.25rem",
    tailwind: "p-1 / gap-1",
    usage: "Micro gaps, badge interior padding, icon alignment gaps.",
    example: "Tag badge insets, hairline icon spacing",
  },
  {
    token: "xs (Compact)",
    pixels: 8,
    rem: "0.5rem",
    tailwind: "p-2 / gap-2",
    usage: "Dropdown item insets, icon button padding, compact list items.",
    example: "DropdownMenuItem, toolbars, pagination chips",
  },
  {
    token: "sm (Control)",
    pixels: 12,
    rem: "0.75rem",
    tailwind: "p-3 / gap-3",
    usage: "Input vertical alignment, compact card interior, toast cards.",
    example: "Form field stacks, compact banners, toast notifications",
  },
  {
    token: "md (Standard)",
    pixels: 16,
    rem: "1.0rem",
    tailwind: "p-4 / gap-4",
    usage: "Default container padding on mobile, modal content, list groups.",
    example: "Standard card body, table header spacing, alert boxes",
  },
  {
    token: "lg (Comfortable)",
    pixels: 24,
    rem: "1.5rem",
    tailwind: "p-6 / gap-6",
    usage: "Standard desktop card padding, modal shells, dashboard widgets.",
    example: "Card container padding, dialog frames, feature grids",
  },
  {
    token: "xl (Macro)",
    pixels: 32,
    rem: "2.0rem",
    tailwind: "p-8 / gap-8",
    usage: "Section interior vertical separation, empty states, hero cards.",
    example: "Page section gaps, large feature banners",
  },
  {
    token: "2xl (Section)",
    pixels: 48,
    rem: "3.0rem",
    tailwind: "py-12",
    usage: "Major landing page section divisions, layout rhythm boundaries.",
    example: "Hero-to-grid spacing, landing feature transitions",
  },
];

/* -------------------------------------------------------------------------
   Component Padding Standards Table
   ------------------------------------------------------------------------- */
const COMPONENT_PADDING_RULES = [
  {
    component: "Buttons",
    classes:
      "sm: px-3 py-1.5 (h-8) | default: px-4 py-2 (h-9.5) | lg: px-6 py-2.5 (h-11)",
    rule: "Horizontal padding is always 1.5x–2x vertical padding for comfortable touch targets.",
  },
  {
    component: "Text & Number Inputs",
    classes: "px-3.5 py-2 (h-10)",
    rule: "Consistent 14px horizontal inset for optical text alignment with labels.",
  },
  {
    component: "Cards & Panels",
    classes: "py-6 px-6 with gap-6",
    rule: "Uniform 24px inset on desktop; collapses to 16px (p-4) on small viewports.",
  },
  {
    component: "Tables",
    classes: "th: h-11 px-4 py-2 | td: px-4 py-3.5",
    rule: "16px horizontal cell padding preserves column alignment; 14px row height ensures scannability.",
  },
  {
    component: "Dialogs & Modals",
    classes: "p-6 gap-4 (max-w-lg)",
    rule: "24px interior padding prevents content from crowding the dismissal chrome.",
  },
  {
    component: "Dropdown & Popovers",
    classes: "p-1.5 with item px-2.5 py-1.5",
    rule: "6px container padding provides breathing room around active selection highlights.",
  },
];

/* -------------------------------------------------------------------------
   Concentric Corner Radius System Tokens
   ------------------------------------------------------------------------- */
interface RadiusToken {
  name: string;
  variable: string;
  pixels: number;
  rem: string;
  tailwind: string;
  usage: string;
}

const RADIUS_TOKENS: RadiusToken[] = [
  {
    name: "Micro (2xs)",
    variable: "--radius-2xs",
    pixels: 3,
    rem: "0.1875rem",
    tailwind: "rounded-[var(--radius-2xs)]",
    usage: "Sub-pixel indicators, checkbox checks, dot badges",
  },
  {
    name: "Extra Small (xs)",
    variable: "--radius-xs",
    pixels: 4,
    rem: "0.25rem",
    tailwind: "rounded-xs",
    usage: "Keyboard keys (kbd), compact tags, status pips",
  },
  {
    name: "Small (sm)",
    variable: "--radius-sm",
    pixels: 6,
    rem: "0.375rem",
    tailwind: "rounded-sm",
    usage: "Compact buttons, segmented controls, inner input elements",
  },
  {
    name: "Medium (md)",
    variable: "--radius-md",
    pixels: 8,
    rem: "0.5rem",
    tailwind: "rounded-md",
    usage: "Standard buttons, inputs, dropdown items, select triggers",
  },
  {
    name: "Large (lg)",
    variable: "--radius-lg",
    pixels: 10,
    rem: "0.625rem",
    tailwind: "rounded-lg",
    usage: "Base system radius, dialog popovers, nested sub-panels",
  },
  {
    name: "Extra Large (xl)",
    variable: "--radius-xl",
    pixels: 14,
    rem: "0.875rem",
    tailwind: "rounded-xl",
    usage: "Standard cards, feature bento panels, elevation sheets",
  },
  {
    name: "2X Large (2xl)",
    variable: "--radius-2xl",
    pixels: 18,
    rem: "1.125rem",
    tailwind: "rounded-2xl",
    usage: "Modal dialog windows, master viewports, hero shells",
  },
  {
    name: "3X Large (3xl)",
    variable: "--radius-3xl",
    pixels: 24,
    rem: "1.5rem",
    tailwind: "rounded-3xl",
    usage: "Floating hero containers, drawer sheets, presentation cards",
  },
  {
    name: "Full (Pill)",
    variable: "--radius-full",
    pixels: 9999,
    rem: "9999px",
    tailwind: "rounded-full",
    usage: "Pill navigation buttons, avatar circles, filter capsules",
  },
];

const SAMPLE_VENUES: ComboboxOption[] = [
  {
    value: "villa-sol",
    label: "Villa Solstice Clifftop",
    description: "Uluwatu, Bali · 300 Guests",
    group: "Bali Venues",
  },
  {
    value: "ayana-estate",
    label: "Ayana Ocean Glasshouse",
    description: "Jimbaran · 450 Guests",
    group: "Bali Venues",
  },
  {
    value: "como-shambhala",
    label: "COMO Shambhala Rainforest",
    description: "Ubud · 180 Guests",
    group: "Bali Venues",
  },
  {
    value: "como-point-yamu",
    label: "Point Yamu Overlook",
    description: "Phuket, Thailand · 200 Guests",
    group: "International",
  },
  {
    value: "chateau-bouffemont",
    label: "Château de Bouffémont",
    description: "Paris, France · 150 Guests",
    group: "International",
  },
  {
    value: "amalfi-belmond",
    label: "Hotel Caruso Belvedere",
    description: "Ravello, Italy · 120 Guests",
    group: "International",
  },
];

/* -------------------------------------------------------------------------
   Sample Table Data
   ------------------------------------------------------------------------- */
interface EventRow {
  id: string;
  name: string;
  couple: string;
  date: string;
  photos: number;
  storage: string;
  status: "active" | "completed" | "processing" | "pending";
}

const SAMPLE_EVENTS: EventRow[] = [
  {
    id: "EVT-8921",
    name: "Summer Botanical Wedding",
    couple: "Clara & Liam",
    date: "2026-10-14",
    photos: 1420,
    storage: "18.4 GB",
    status: "active",
  },
  {
    id: "EVT-8922",
    name: "Bali Cliffside Vows",
    couple: "Maya & Nathan",
    date: "2026-10-22",
    photos: 980,
    storage: "12.1 GB",
    status: "processing",
  },
  {
    id: "EVT-8923",
    name: "Historic Villa Reception",
    couple: "Sophie & Julian",
    date: "2026-09-18",
    photos: 2150,
    storage: "29.7 GB",
    status: "completed",
  },
  {
    id: "EVT-8924",
    name: "Kyoto Autumn Nuptials",
    couple: "Hana & Kenji",
    date: "2026-11-05",
    photos: 0,
    storage: "0 GB",
    status: "pending",
  },
];

type SectionTab =
  | "tokens"
  | "typography"
  | "spacing"
  | "primitives"
  | "inputs"
  | "table"
  | "form"
  | "components";

interface ShowcaseTabItem {
  id: SectionTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SHOWCASE_TABS: ShowcaseTabItem[] = [
  { id: "tokens", label: "Color Tokens", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "spacing", label: "Spacing & Radius", icon: Ruler },
  { id: "primitives", label: "UI Primitives", icon: Sparkles },
  { id: "inputs", label: "Field Controls", icon: FormInput },
  { id: "table", label: "Data Table", icon: TableIcon },
  { id: "form", label: "Interactive Form", icon: Sliders },
  { id: "components", label: "Motion & Overlays", icon: Layers },
];

function ShowcasePage() {
  const { t } = useTranslation();

  // Active navigation anchor
  const [activeTab, setActiveTab] = useState<SectionTab>("tokens");
  const isManualScrolling = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: SectionTab
  ) => {
    e.preventDefault();
    setActiveTab(sectionId);

    // Lock scroll-spy so smooth scroll animation doesn't fight the active tab state
    isManualScrolling.current = true;
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      if (typeof window !== "undefined" && window.history) {
        window.history.replaceState(null, "", `#${sectionId}`);
      }
    }
  };

  useEffect(() => {
    const sectionIds: SectionTab[] = [
      "tokens",
      "typography",
      "spacing",
      "primitives",
      "inputs",
      "table",
      "form",
      "components",
    ];

    let ticking = false;

    const updateActiveSection = () => {
      if (isManualScrolling.current) {
        ticking = false;
        return;
      }

      // 1. Near the very top of the page
      if (window.scrollY < 200) {
        setActiveTab("tokens");
        ticking = false;
        return;
      }

      // 2. Near the very bottom of the page
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;
      if (isBottom) {
        setActiveTab("components");
        ticking = false;
        return;
      }

      // 3. Focal line: 220px from top of viewport (directly below sticky navbar)
      const focalLine = 220;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= focalLine && rect.bottom > focalLine) {
          setActiveTab(id);
          ticking = false;
          return;
        }
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    // Initial check on mount
    updateActiveSection();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // Input states
  const [textValue, setTextValue] = useState("Serenade Villa Collection");
  const [numberValue, setNumberValue] = useState<number | "">(250);
  const [textareaValue, setTextareaValue] = useState(
    "Please upload high-resolution candid shots from the cocktail reception. Photos will be compiled into the couple's commemorative album."
  );
  const [singleDate, setSingleDate] = useState<Date | null>(
    () => new Date(2026, 9, 24)
  );
  const [rangeDate, setRangeDate] = useState<DateRange | null>(() => ({
    from: new Date(2026, 9, 20),
    to: new Date(2026, 9, 27),
  }));
  const [timeValue, setTimeValue] = useState<string | null>("14:30");
  const [dateTimeValue, setDateTimeValue] = useState<Date | null>(
    () => new Date(2026, 9, 24, 15, 30)
  );
  const [phoneCountry, setPhoneCountry] = useState("US");
  const [phoneValue, setPhoneValue] = useState("2025550123");
  const [phoneMeta, setPhoneMeta] = useState<PhoneValueMeta | null>(() => {
    const parsed = parsePhoneNumber("2025550123", "US");
    return {
      country: parsed.country,
      dialCode: parsed.dialCode,
      nationalNumber: parsed.nationalNumber,
      formatted: parsed.formatted,
      e164: parsed.e164,
      isValid: parsed.isValid,
    };
  });
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [selectValue, setSelectValue] = useState("pro");
  const [comboboxValue, setComboboxValue] = useState("villa-sol");
  const [selectedRows, setSelectedRows] = useState<string[]>(["EVT-8921"]);
  const [tableSearch, setTableSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Primitives showcase interactive states
  const [buttonLoading, setButtonLoading] = useState(false);
  const [lastClickedButton, setLastClickedButton] = useState<string>("None");
  const [primitiveInputText, setPrimitiveInputText] =
    useState("Asana Design Token");
  const [valueBoxTypeDemo, setValueBoxTypeDemo] =
    useState<ValueBoxType>("info");

  // Interactive ScrollReveal Demo States
  const [demoScrollVariant, setDemoScrollVariant] =
    useState<ScrollRevealVariant>("blur-up");
  const [demoScrollKey, setDemoScrollKey] = useState(0);

  // Interactive Typography Component Playground
  const [typographyVariant, setTypographyVariant] =
    useState<NonNullable<TypographyProps["variant"]>>("display");
  const [typographyColor, setTypographyColor] =
    useState<TypographyProps["color"]>("default");
  const [typographyTabular, setTypographyTabular] = useState(false);
  const [typographyBalance, setTypographyBalance] = useState(true);
  const [typographySampleText, setTypographySampleText] = useState(
    "Cinematic Wedding Photography & Client Gallery"
  );

  // Form states
  const [formEventName, setFormEventName] = useState("");
  const [formGuestLimit, setFormGuestLimit] = useState<number | "">(150);
  const [formPhone, setFormPhone] = useState("");
  const [formDate, setFormDate] = useState<Date | null>(
    () => new Date(2026, 10, 15)
  );
  const [formPackage, setFormPackage] = useState("unlimited");
  const [formNotes, setFormNotes] = useState("");
  const [formAllowGuestUpload, setFormAllowGuestUpload] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Event settings saved successfully with live feedback.");
    }, 600);
  };

  const filteredEvents = SAMPLE_EVENTS.filter(
    (ev) =>
      ev.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      ev.couple.toLowerCase().includes(tableSearch.toLowerCase()) ||
      ev.id.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="bg-background text-foreground selection:bg-primary/10 min-h-screen antialiased">
      {/* Translucent Asana Glass Header */}
      <header className="asana-glass border-border sticky top-0 z-50 w-full border-b transition-colors">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-foreground flex items-center gap-2 font-medium tracking-tight transition-opacity hover:opacity-80 active:scale-98"
            >
              <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg shadow-xs">
                <Sparkles className="size-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                {t("app.name")}
              </span>
            </Link>
            <div className="bg-border/60 mx-1 hidden h-4 w-px sm:block" />
            <Badge
              variant="outline"
              className="hidden font-mono text-[11px] sm:inline-flex"
            >
              Design System v2.0
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full px-4"
            >
              <Link to="/">{t("actions.cancel")}</Link>
            </Button>
          </div>
        </div>

        {/* Quick Nav Anchors */}
        <div className="border-border/30 bg-background/50 overflow-x-auto border-t px-6 sm:px-8">
          <nav className="mx-auto flex max-w-6xl items-center gap-1 py-1.5 text-xs font-medium">
            {SHOWCASE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  asChild
                  variant="pill"
                  size="pill"
                  data-active={isActive}
                  className={isActive ? "font-semibold shadow-xs" : ""}
                >
                  <a
                    href={`#${tab.id}`}
                    onClick={(e) => scrollToSection(e, tab.id)}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                  </a>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-10 sm:px-8 sm:py-16">
        {/* Title Header */}
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="border-border/80 bg-background/80 gap-1.5 px-3 py-1 text-xs font-medium tracking-wide"
          >
            <Sparkles className="text-primary size-3" />
            <span>DesignMD + Emil Kowalski Engineering</span>
          </Badge>
          <h1 className="display-title text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Design System & Component Spec
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Strict token definitions, mathematical padding rhythm, responsive
            form controls, and Emil Kowalski motion physics verified end-to-end.
          </p>
        </div>

        {/* =========================================================================
            SECTION 1: COLOR TOKENS
            ========================================================================= */}
        <section id="tokens" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                1. Design Color Tokens
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Dynamic OKLCH color variables configured in CSS, reacting
                seamlessly to Dark / Light themes.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs">
              OKLCH Color Space
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_TOKENS.map((token) => (
              <Card
                key={token.name}
                className="border-border/70 hover:border-foreground/20 overflow-hidden border transition-all duration-150"
              >
                <div
                  className={`h-20 w-full ${token.previewClass} ${
                    token.borderClass ? "border-b " + token.borderClass : ""
                  } flex items-end justify-end p-3`}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`var(${token.variable})`)}
                    className="bg-background/80 hover:bg-background h-7 rounded-lg px-2 font-mono text-xs shadow-xs backdrop-blur-md"
                  >
                    <Copy className="mr-1 size-3" />
                    Copy
                  </Button>
                </div>
                <CardHeader className="space-y-1 p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {token.name}
                    </CardTitle>
                    <code className="text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 font-mono text-[11px]">
                      {token.variable}
                    </code>
                  </div>
                  <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                    {token.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: TYPOGRAPHY SYSTEM
            ========================================================================= */}
        <section id="typography" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                2. Typography & Hierarchy System
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Swiss editorial type stack, mathematical scale hierarchy, and
                open apertures for data density.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs">
              TWK Lausanne · Swiss Precision
            </Badge>
          </div>

          <div className="grid gap-6">
            {/* Interactive Typography Component Playground */}
            <Card size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>
                    Unified Typography Component (
                    <code className="text-primary font-mono text-xs">
                      &lt;Typography /&gt;
                    </code>
                    )
                  </CardTitle>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    Polymorphic · 14 Variants · Optical Tracking
                  </Badge>
                </div>
                <CardDescription>
                  Production-grade typographic primitive supporting polymorphic
                  HTML tags, Emil Kowalski optical tracking calibrations,
                  tabular numerals, and text balancing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Live Preview Box */}
                <div className="border-border/60 bg-muted/20 dark:bg-background relative flex min-h-[130px] flex-col justify-center rounded-xl border p-6 transition-all">
                  <Typography
                    variant={typographyVariant}
                    color={typographyColor}
                    tabular={typographyTabular}
                    balance={typographyBalance}
                  >
                    {typographySampleText || "Type custom text..."}
                  </Typography>
                </div>

                {/* Controls Bar */}
                <div className="space-y-3">
                  {/* Variant Selector */}
                  <div className="space-y-1.5">
                    <span className="text-muted-foreground text-xs font-medium">
                      Select Variant:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          "display",
                          "h1",
                          "h2",
                          "h3",
                          "h4",
                          "lead",
                          "large",
                          "body",
                          "small",
                          "caption",
                          "code",
                          "kbd",
                          "micro",
                          "blockquote",
                        ] as const
                      ).map((v) => (
                        <Button
                          key={v}
                          type="button"
                          size="xs"
                          variant={
                            typographyVariant === v ? "default" : "outline"
                          }
                          onClick={() => setTypographyVariant(v)}
                          className="font-mono text-[11px]"
                        >
                          {v}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Color & Modifiers Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-muted-foreground text-xs font-medium">
                        Color:
                      </span>
                      {(
                        [
                          "default",
                          "muted",
                          "primary",
                          "coral",
                          "destructive",
                          "chart-2",
                        ] as const
                      ).map((c) => (
                        <Button
                          key={c}
                          type="button"
                          size="xs"
                          variant={
                            typographyColor === c ? "default" : "outline"
                          }
                          onClick={() => setTypographyColor(c)}
                          className="font-mono text-[11px]"
                        >
                          {c}
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="xs"
                        variant={typographyTabular ? "default" : "outline"}
                        onClick={() => setTypographyTabular(!typographyTabular)}
                        className="font-mono text-[11px]"
                      >
                        Tabular Nums
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant={typographyBalance ? "default" : "outline"}
                        onClick={() => setTypographyBalance(!typographyBalance)}
                        className="font-mono text-[11px]"
                      >
                        Text Balance
                      </Button>
                    </div>
                  </div>

                  {/* Sample text input */}
                  <div className="pt-1">
                    <Input
                      size="sm"
                      value={typographySampleText}
                      onChange={(e) => setTypographySampleText(e.target.value)}
                      placeholder="Type custom preview text..."
                    />
                  </div>
                </div>

                {/* Generated Code Readout */}
                <ValueBox type="info" className="overflow-hidden">
                  <div className="flex items-center justify-between pb-1.5 font-mono text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Code className="size-3.5" />
                      GENERATED COMPONENT CODE
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `<Typography variant="${typographyVariant}" color="${typographyColor}"${typographyTabular ? " tabular" : ""}${typographyBalance ? " balance" : ""}>${typographySampleText}</Typography>`
                        )
                      }
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Copy className="size-3" />
                      Copy JSX
                    </button>
                  </div>
                  <div className="border-chart-3/30 bg-background/80 dark:bg-chart-3/20 text-chart-3 thin-scrollbar max-w-full overflow-x-auto rounded border p-2 font-mono text-xs font-semibold">
                    <code>{`<Typography variant="${typographyVariant}" color="${typographyColor}"${typographyTabular ? " tabular" : ""}${typographyBalance ? " balance" : ""}>${typographySampleText}</Typography>`}</code>
                  </div>
                </ValueBox>
              </CardContent>
            </Card>

            {/* Font Family Overview Card */}
            <Card size="sm">
              <CardHeader>
                <CardTitle>Typeface Stack & Alphabet Specimen</CardTitle>
                <CardDescription>
                  Clean Swiss geometry with open counters and balanced
                  micro-contrast for effortless reading.
                </CardDescription>
                <CardAction>
                  <code className="text-muted-foreground bg-muted/60 rounded px-2 py-0.5 font-mono text-[11px]">
                    --font-sans
                  </code>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-border/60 bg-muted/30 dark:bg-background space-y-3 rounded-xl border p-4">
                  <div className="border-border/40 flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <span className="text-foreground text-xs font-semibold">
                      TWK Lausanne Primary Character Set
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      Weights: 400 · 500 · 600
                    </span>
                  </div>
                  <div className="text-foreground text-2xl leading-normal font-medium tracking-tight break-all sm:text-3xl">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </div>
                  <div className="text-muted-foreground text-xl leading-normal font-normal tracking-tight break-all sm:text-2xl">
                    abcdefghijklmnopqrstuvwxyz 0123456789
                  </div>
                  <div className="text-muted-foreground/80 font-mono text-xs break-all">
                    !@#$%^&*()_+-=[]&#123;&#125;|;:&apos;&quot;,&lt;.&gt;?/~`
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="border-border/50 bg-background/50 rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs font-medium">
                      Regular (400)
                    </div>
                    <div className="text-foreground mt-1 text-sm font-normal">
                      Product body copy & table cells
                    </div>
                  </div>
                  <div className="border-border/50 bg-background/50 rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs font-medium">
                      Medium (500)
                    </div>
                    <div className="text-foreground mt-1 text-sm font-medium">
                      Form labels, tabs & controls
                    </div>
                  </div>
                  <div className="border-border/50 bg-background/50 rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs font-medium">
                      SemiBold (600)
                    </div>
                    <div className="text-foreground mt-1 text-sm font-semibold">
                      Titles, headings & CTAs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scale Hierarchy Sheet */}
            <Card className="overflow-hidden">
              <CardHeader className="border-border/50 border-b">
                <CardTitle>Typography Scale & Usage Roster</CardTitle>
                <CardDescription>
                  Every headline and body tier is bound to standard rem tokens
                  and tracking values.
                </CardDescription>
              </CardHeader>
              <div className="divide-border/50 divide-y">
                {TYPOGRAPHY_TOKENS.map((token) => (
                  <div
                    key={token.name}
                    className="hover:bg-muted/20 flex flex-col justify-between gap-4 p-4 transition-colors sm:p-5 lg:flex-row lg:items-center"
                  >
                    <div className="w-64 shrink-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-semibold">
                          {token.name}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs leading-relaxed">
                        {token.role}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <code className="bg-muted/80 text-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
                          {token.size}
                        </code>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {token.weight}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={token.className}>{token.sample}</p>
                    </div>

                    <div className="shrink-0 lg:text-right">
                      <code className="text-primary bg-muted/60 block max-w-xs truncate rounded px-2 py-1 font-mono text-[11px]">
                        {token.className}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Semantic Compound Primitives Card */}
            <Card size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>
                    Semantic Typography Helpers & Compound Primitives
                  </CardTitle>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    &lt;Heading&gt; · &lt;Text&gt; · &lt;Code&gt; · &lt;Kbd&gt;
                  </Badge>
                </div>
                <CardDescription>
                  Ergonomic convenience components built on top of Typography
                  with automatic HTML tag assignment and Asana styling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border-border/60 bg-muted/20 dark:bg-background/80 space-y-1 rounded-xl border p-3.5">
                    <TypographyComponents.Micro>
                      HEADING PRIMITIVE
                    </TypographyComponents.Micro>
                    <Heading level={3} className="text-base">
                      Custom H3 Header
                    </Heading>
                    <Text className="text-muted-foreground text-xs">
                      Auto-maps to &lt;h3&gt; tag
                    </Text>
                  </div>
                  <div className="border-border/60 bg-muted/20 dark:bg-background/80 space-y-1 rounded-xl border p-3.5">
                    <TypographyComponents.Micro>
                      BODY TEXT PRIMITIVE
                    </TypographyComponents.Micro>
                    <Text className="text-sm font-medium">
                      Standard Paragraph
                    </Text>
                    <Text className="text-muted-foreground text-xs">
                      Auto-maps to &lt;p&gt; tag
                    </Text>
                  </div>
                  <div className="border-border/60 bg-muted/20 dark:bg-background/80 space-y-1 rounded-xl border p-3.5">
                    <TypographyComponents.Micro>
                      CODE INLINE
                    </TypographyComponents.Micro>
                    <div>
                      <Code>const theme = oklch();</Code>
                    </div>
                    <Text className="text-muted-foreground text-xs">
                      Auto-maps to &lt;code&gt; tag
                    </Text>
                  </div>
                  <div className="border-border/60 bg-muted/20 dark:bg-background/80 space-y-1 rounded-xl border p-3.5">
                    <TypographyComponents.Micro>
                      KEYBOARD KBD
                    </TypographyComponents.Micro>
                    <div className="flex items-center gap-1.5">
                      <Kbd>⌘</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>P</Kbd>
                    </div>
                    <Text className="text-muted-foreground text-xs">
                      Auto-maps to &lt;kbd&gt; tag
                    </Text>
                  </div>
                </div>

                <TypographyComponents.Blockquote>
                  &ldquo;Good design is as little design as possible. Less, but
                  better &mdash; because it concentrates on the essential
                  aspects.&rdquo;
                </TypographyComponents.Blockquote>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: SPACING & PADDING RULES
            ========================================================================= */}
        <section id="spacing" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                3. Padding & Spacing Rhythm
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                The 4px / 8px spatial grid eliminates arbitrary numbers and
                creates harmonious vertical rhythm.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs">
              Base Unit: 4px / 8px
            </Badge>
          </div>

          {/* Visual Ruler Scale */}
          <Card className="space-y-5 p-6">
            <CardTitle className="text-base">
              Spatial Scale Visualization
            </CardTitle>
            <div className="space-y-3">
              {SPACING_RULES.map((rule) => (
                <div
                  key={rule.token}
                  className="border-border/50 bg-background/50 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="w-48 shrink-0">
                    <div className="text-xs font-semibold">{rule.token}</div>
                    <div className="text-muted-foreground font-mono text-[11px]">
                      {rule.pixels}px · {rule.rem} ·{" "}
                      <span className="text-primary font-medium">
                        {rule.tailwind}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Ruler */}
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      style={{ width: `${Math.min(rule.pixels * 4, 300)}px` }}
                      className="bg-primary/20 border-primary/40 text-primary flex h-4 shrink-0 items-center justify-end rounded border pr-1 font-mono text-[9px] font-bold"
                    >
                      {rule.pixels}px
                    </div>
                    <span className="text-muted-foreground truncate text-xs">
                      {rule.usage}
                    </span>
                  </div>

                  <code className="text-muted-foreground hidden text-right font-mono text-[11px] lg:block">
                    {rule.example}
                  </code>
                </div>
              ))}
            </div>
          </Card>

          {/* Component Standards Table */}
          <Card className="overflow-hidden">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-base">
                Component Inset Standards
              </CardTitle>
              <CardDescription className="text-xs">
                Exact padding rules enforced across all primitives in this
                design system.
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Component Element</TableHead>
                    <TableHead className="w-72">
                      Padding Specification
                    </TableHead>
                    <TableHead>Design Engineering Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPONENT_PADDING_RULES.map((c) => (
                    <TableRow key={c.component}>
                      <TableCell className="text-xs font-medium sm:text-sm">
                        {c.component}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted/60 text-primary rounded px-2 py-0.5 font-mono text-xs">
                          {c.classes}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs leading-relaxed">
                        {c.rule}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Concentric Corner Radius System ("maybe rounded?") */}
          <Card className="overflow-hidden">
            <CardHeader className="border-border/50 border-b p-6 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Concentric Corner Radius System & Squircle Geometry
                </CardTitle>
                <Badge
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                >
                  Base --radius: 10px (0.625rem)
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Tactile border radii hierarchy designed per Emil Kowalski
                concentric nesting:
                <code className="text-primary ml-1 font-mono">
                  R_inner = R_outer - padding
                </code>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Radii Swatch Tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {RADIUS_TOKENS.map((token) => (
                  <div
                    key={token.variable}
                    className="border-border/60 bg-muted/20 dark:bg-background/80 hover:border-primary/40 flex flex-col items-center justify-between rounded-xl border p-3.5 text-center transition-all"
                  >
                    <div
                      style={{
                        borderRadius:
                          token.pixels === 9999
                            ? "9999px"
                            : `${token.pixels}px`,
                      }}
                      className="border-primary/50 bg-primary/10 text-primary flex size-12 items-center justify-center border font-mono text-[10px] font-bold shadow-2xs"
                    >
                      {token.pixels === 9999 ? "full" : `${token.pixels}px`}
                    </div>
                    <div className="mt-2.5 space-y-0.5">
                      <div className="text-foreground text-xs font-semibold">
                        {token.name}
                      </div>
                      <div className="text-muted-foreground font-mono text-[10px]">
                        {token.rem}
                      </div>
                      <code className="text-primary/90 bg-muted/60 block truncate rounded px-1 font-mono text-[9px]">
                        {token.tailwind}
                      </code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Concentric Nesting Visualizer */}
              <div className="border-border/50 bg-muted/15 dark:bg-card/50 space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-semibold">
                    Concentric Arc Nesting in Action
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    R_inner = 14px - 8px = 6px
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Correct Concentric Nesting */}
                  <div className="border-chart-2/40 bg-chart-2/5 space-y-2 rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-chart-2 text-xs font-semibold">
                        Correct (Concentric Arc)
                      </span>
                      <Badge variant="success" size="compact">
                        Harmonious
                      </Badge>
                    </div>
                    <div className="border-chart-2/30 bg-background/90 text-foreground rounded-sm border p-3 text-xs shadow-2xs">
                      Outer:{" "}
                      <code className="text-chart-2 font-mono">
                        rounded-xl (14px)
                      </code>{" "}
                      · Inset: 16px · Inner:{" "}
                      <code className="text-chart-2 font-mono">
                        rounded-sm (6px)
                      </code>
                    </div>
                  </div>

                  {/* Incorrect Non-concentric Nesting */}
                  <div className="border-destructive/30 bg-destructive/5 space-y-2 rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-destructive text-xs font-semibold">
                        Mismatched (Corner Clashing)
                      </span>
                      <Badge variant="coral" size="compact">
                        Unequal Arc Gap
                      </Badge>
                    </div>
                    <div className="border-destructive/30 bg-background/90 text-foreground rounded-3xl border p-3 text-xs shadow-2xs">
                      Outer:{" "}
                      <code className="text-destructive font-mono">
                        rounded-xl (14px)
                      </code>{" "}
                      · Inset: 16px · Inner:{" "}
                      <code className="text-destructive font-mono">
                        rounded-3xl (24px)
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* =========================================================================
            SECTION 4: BASIC UI PRIMITIVES
            ========================================================================= */}
        <section id="primitives" className="min-w-0 scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                4. Basic UI Primitives
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Standardized buttons, inputs, badges, and telemetry containers
                built with strict 4px/8px rhythm and tactile physics.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs">
              Button · Input · Badge · ValueBox
            </Badge>
          </div>

          <div className="grid gap-6">
            {/* Card 1: Button Variants & Semantic Tiers */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Button Variants & Semantic Tiers</CardTitle>
                <CardDescription>
                  Every action tier has a distinct visual hierarchy. Emil
                  Kowalski active scale ensures tactile feedback on press.
                </CardDescription>
                <CardAction>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    7 Variants
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="default"
                    onClick={() => setLastClickedButton("Default / Primary")}
                  >
                    Primary Action
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setLastClickedButton("Secondary")}
                  >
                    Secondary
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLastClickedButton("Outline")}
                  >
                    Outline
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setLastClickedButton("Ghost")}
                  >
                    Ghost
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setLastClickedButton("Destructive")}
                  >
                    <Trash2 className="size-4" />
                    Destructive
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setLastClickedButton("Link")}
                  >
                    Link Action
                  </Button>
                  <Button
                    variant="pill"
                    onClick={() => setLastClickedButton("Pill")}
                  >
                    Pill Action
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <ValueBox
                    label="Last Clicked Action"
                    value={lastClickedButton}
                  />
                  <ValueBox>
                    Tactile physics: active:scale-[0.97] provides instant haptic
                    feedback.
                  </ValueBox>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Button Sizes & Icon Controls */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Standardized Button Sizes & Icon Controls</CardTitle>
                <CardDescription>
                  Strict height alignment across xs (24px), sm (32px), default
                  (38px), lg (44px), pill (28px), and icon controls.
                </CardDescription>
                <CardAction>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    8 Sizes / Types
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs" variant="outline">
                    Extra Small (24px)
                  </Button>
                  <Button size="sm" variant="outline">
                    Small (32px)
                  </Button>
                  <Button size="default" variant="default">
                    Default (38px)
                  </Button>
                  <Button size="lg" variant="default">
                    Large (44px)
                  </Button>
                  <Button size="pill" variant="secondary">
                    Pill (28px)
                  </Button>
                </div>

                <div className="border-border/50 flex flex-wrap items-center gap-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      Icon Buttons:
                    </span>
                    <Button size="icon" variant="outline" aria-label="Add item">
                      <Plus className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      aria-label="Filter items"
                    >
                      <Filter className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="outline"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="size-3" />
                    </Button>
                  </div>

                  <div className="bg-border/60 mx-2 hidden h-6 w-px sm:block" />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      State Toggles:
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setButtonLoading(!buttonLoading)}
                    >
                      {buttonLoading ? (
                        <>
                          <Loader2 className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5" />
                          <span>Toggle Loading</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>

                <ValueBox
                  label="Button Interactive State"
                  value={
                    buttonLoading
                      ? "Loading State Active (pointer events locked)"
                      : "Idle / Ready (all controls interactive)"
                  }
                />
              </CardContent>
            </Card>

            {/* Card 3: Standardized Input Sizes (CVA) & Height Parity */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>
                  Standardized Input Sizes (CVA) & Button Parity
                </CardTitle>
                <CardDescription>
                  Input sizes (sm: 32px, default: 38px, lg: 44px) engineered for
                  exact optical height parity with buttons.
                </CardDescription>
                <CardAction>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    sm · default · lg
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Small Size: 32px */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="input-sm" className="text-xs font-medium">
                        Small Size:{" "}
                        <code className="text-primary font-mono text-[11px]">
                          size="sm"
                        </code>{" "}
                        (h-8 / 32px)
                      </Label>
                      <span className="text-muted-foreground text-2xs font-mono">
                        Matches Button size="sm"
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="input-sm"
                        size="sm"
                        value={primitiveInputText}
                        onChange={(e) => setPrimitiveInputText(e.target.value)}
                        placeholder="Small input (32px)..."
                      />
                      <Button size="sm" variant="default" className="shrink-0">
                        Submit
                      </Button>
                    </div>
                  </div>

                  {/* Default Size: 38px */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="input-default"
                        className="text-xs font-medium"
                      >
                        Default Size:{" "}
                        <code className="text-primary font-mono text-[11px]">
                          size="default"
                        </code>{" "}
                        (h-9.5 / 38px)
                      </Label>
                      <span className="text-muted-foreground text-2xs font-mono">
                        Matches Button size="default"
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="input-default"
                        size="default"
                        value={primitiveInputText}
                        onChange={(e) => setPrimitiveInputText(e.target.value)}
                        placeholder="Default input (38px)..."
                      />
                      <Button
                        size="default"
                        variant="default"
                        className="shrink-0"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>

                  {/* Large Size: 44px */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="input-lg" className="text-xs font-medium">
                        Large Size:{" "}
                        <code className="text-primary font-mono text-[11px]">
                          size="lg"
                        </code>{" "}
                        (h-11 / 44px)
                      </Label>
                      <span className="text-muted-foreground text-2xs font-mono">
                        Matches Button size="lg"
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="input-lg"
                        size="lg"
                        value={primitiveInputText}
                        onChange={(e) => setPrimitiveInputText(e.target.value)}
                        placeholder="Large input (44px)..."
                      />
                      <Button size="lg" variant="default" className="shrink-0">
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Input States Comparison */}
                <div className="border-border/50 grid gap-3 border-t pt-3 sm:grid-cols-2">
                  <div className="min-w-0 space-y-1.5">
                    <Label className="text-muted-foreground text-xs">
                      Disabled Input State
                    </Label>
                    <Input disabled value="Read-only system token" />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <Label className="text-destructive text-xs">
                      Invalid Validation State (aria-invalid)
                    </Label>
                    <Input
                      aria-invalid="true"
                      defaultValue="invalid_token_format"
                    />
                  </div>
                </div>

                <ValueBox
                  label="Live Input Mirror"
                  value={primitiveInputText || "(empty)"}
                />
              </CardContent>
            </Card>

            {/* Card 4: Badges & Semantic Status Tags */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Badge Sizes & Semantic Status Tags</CardTitle>
                <CardDescription>
                  Versatile metadata indicators with standardized compact, sm,
                  default, and pill sizing.
                </CardDescription>
                <CardAction>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    Sizes & Semantic Colors
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs font-medium">
                    Standardized Badge Sizes:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="compact" variant="outline">
                      compact (18px)
                    </Badge>
                    <Badge size="sm" variant="outline">
                      sm (22px)
                    </Badge>
                    <Badge size="default" variant="outline">
                      default (24px)
                    </Badge>
                    <Badge size="pill" variant="secondary">
                      pill (24px)
                    </Badge>
                  </div>
                </div>

                <div className="border-border/50 space-y-2 border-t pt-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Semantic Status Variants:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success / Verified</Badge>
                    <Badge variant="warning">Warning / Pending</Badge>
                    <Badge variant="coral">Coral / High-Priority</Badge>
                    <Badge variant="destructive">Destructive / Failed</Badge>
                  </div>
                </div>

                <ValueBox>
                  Badges use squircle curvature and high-contrast OKLCH semantic
                  tints for optimal readability across themes.
                </ValueBox>
              </CardContent>
            </Card>

            {/* Card 5: ValueBox Types & Semantic Diagnostics */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>ValueBox Types & Semantic States</CardTitle>
                <CardDescription>
                  100% tokenized telemetry readouts with warning, error, info,
                  and success color tokens.
                </CardDescription>
                <CardAction>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                  >
                    5 Semantic Types
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Switcher */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground mr-1 text-xs font-medium">
                    Select Type:
                  </span>
                  {(
                    [
                      "default",
                      "info",
                      "warning",
                      "error",
                      "success",
                    ] as ValueBoxType[]
                  ).map((type) => (
                    <Button
                      key={type}
                      size="xs"
                      variant={
                        valueBoxTypeDemo === type ? "default" : "outline"
                      }
                      onClick={() => setValueBoxTypeDemo(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>

                {/* Live Preview */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <ValueBox
                    type={valueBoxTypeDemo}
                    label={`Telemetry [${valueBoxTypeDemo}]`}
                    value={
                      valueBoxTypeDemo === "error"
                        ? "E.164 Invalid Length"
                        : valueBoxTypeDemo === "warning"
                          ? "94% Storage Quota"
                          : valueBoxTypeDemo === "success"
                            ? "Sync Complete (200 OK)"
                            : valueBoxTypeDemo === "info"
                              ? "WebSocket Connected"
                              : "EVT-8921 Active"
                    }
                  />

                  <ValueBox type={valueBoxTypeDemo}>
                    {valueBoxTypeDemo === "error" &&
                      "Validation error: Digits must match selected country code."}
                    {valueBoxTypeDemo === "warning" &&
                      "Warning: Gallery size exceeds 90% of allocated photographer plan."}
                    {valueBoxTypeDemo === "success" &&
                      "Success: All high-resolution assets were compiled into WebP."}
                    {valueBoxTypeDemo === "info" &&
                      "Info: Origin-aware positioning scales from the trigger point."}
                    {valueBoxTypeDemo === "default" &&
                      "Default: Neutral diagnostic output with 100% tokenized colors."}
                  </ValueBox>
                </div>

                {/* Comparison Row */}
                <div className="border-border/50 space-y-2 border-t pt-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    All Semantic Types Side-by-Side:
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <ValueBox
                      type="default"
                      label="Neutral"
                      value="Status: Idle"
                    />
                    <ValueBox
                      type="info"
                      label="Notice"
                      value="Update Available"
                    />
                    <ValueBox
                      type="warning"
                      label="Warning"
                      value="High Latency"
                    />
                    <ValueBox
                      type="error"
                      label="Error"
                      value="Upload Failed"
                    />
                    <ValueBox
                      type="success"
                      label="Success"
                      value="Synced (67/67)"
                    />
                    <ValueBox
                      type="outline"
                      label="Outline"
                      value="Draft Mode"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DATE & FIELD CONTROLS
            ========================================================================= */}
        <section id="inputs" className="min-w-0 scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                5. Date & Field Controls
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Every input state tuned with instant feedback, tactile focus
                rings, and squircle curvature.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs">
              h-10 px-3.5 py-2
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* String / Text Input */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>String / Text Input</CardTitle>
                <CardDescription>
                  With leading icon, clearable state, and active focus halo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    id="string-input"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Enter text..."
                    className="pr-10"
                  />
                  {textValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setTextValue("")}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 size-5 -translate-y-1/2 rounded-sm p-0 text-xs"
                      title="Clear"
                    >
                      ✕
                    </Button>
                  )}
                </div>

                <ValueBox label="Value" value={`"${textValue}"`} />
              </CardContent>
            </Card>

            {/* Number Input (No Scroll & No Auto-Zero) */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Number Input (No Scroll & No Auto-Zero)</CardTitle>
                <CardDescription>
                  Can be completely cleared without forcing 0. Wheel scroll
                  disabled, no clunky browser spin arrows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NumberInput
                  id="number-input"
                  value={numberValue}
                  onChange={setNumberValue}
                  min={0}
                  max={10000}
                  step={25}
                  placeholder="Enter a number..."
                />

                <ValueBox
                  label="Value"
                  value={
                    numberValue === ""
                      ? "(empty / cleared)"
                      : `${numberValue} units`
                  }
                />
              </CardContent>
            </Card>

            {/* Single Date Picker */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Date Input (Choose One Date)</CardTitle>
                <CardDescription>
                  Interactive Asana calendar popover with quick day presets and
                  clear button.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <DateInput
                    mode="single"
                    value={singleDate}
                    onChange={setSingleDate}
                    placeholder="Select event date..."
                  />
                </div>

                <ValueBox
                  label="Selected"
                  value={
                    singleDate ? (
                      <FormattedDate
                        value={singleDate}
                        preset="weekday"
                        locale="en-US"
                      />
                    ) : (
                      "None"
                    )
                  }
                />
              </CardContent>
            </Card>

            {/* Date Range Picker */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Date Range Input (Choose Date Range)</CardTitle>
                <CardDescription>
                  Select start and end date with continuous track highlight, day
                  counter, and presets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <DateInput
                    mode="range"
                    value={rangeDate}
                    onChange={setRangeDate}
                    placeholder="Select upload window..."
                  />
                </div>

                <ValueBox
                  label="Range"
                  value={
                    rangeDate?.from ? (
                      <FormattedDateRange
                        from={rangeDate.from}
                        to={rangeDate.to}
                        locale="en-US"
                      />
                    ) : (
                      "None"
                    )
                  }
                />
              </CardContent>
            </Card>

            {/* Time Input */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Time Input (Choose Time)</CardTitle>
                <CardDescription>
                  Scrollable hour and minute columns with AM/PM toggle and quick
                  time presets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <TimeInput
                    value={timeValue}
                    onChange={setTimeValue}
                    placeholder="Select event time..."
                  />
                </div>

                <ValueBox label="Selected Time" value={timeValue || "None"} />
              </CardContent>
            </Card>

            {/* Date & Time Input */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Date & Time Input (Combined Date & Time)</CardTitle>
                <CardDescription>
                  Integrated Asana calendar with synchronized time picker panel
                  and chip shortcuts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <DateTimeInput
                    value={dateTimeValue}
                    onChange={setDateTimeValue}
                    placeholder="Select ceremony start..."
                  />
                </div>

                <ValueBox
                  label="Selected"
                  value={
                    dateTimeValue ? (
                      <FormattedDateTime value={dateTimeValue} locale="en-US" />
                    ) : (
                      "None"
                    )
                  }
                />
              </CardContent>
            </Card>

            {/* Phone Number Input (with Country Selector & Validation) */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="truncate">
                    Phone Input (Country Dropdown & Validation)
                  </CardTitle>
                  <Badge
                    variant={phoneMeta?.isValid ? "success" : "coral"}
                    size="sm"
                    className="shrink-0 font-mono text-xs"
                  >
                    {phoneMeta?.isValid ? "Valid" : "Incomplete"}
                  </Badge>
                </div>
                <CardDescription>
                  Searchable country selector, Google libphonenumber formatting,
                  and live E.164 validation.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <PhoneInput
                    id="phone-input"
                    country={phoneCountry}
                    onCountryChange={(c) => setPhoneCountry(c.code)}
                    value={phoneValue}
                    onChange={(val, meta) => {
                      setPhoneValue(val);
                      setPhoneMeta(meta);
                    }}
                    showValidationState
                    placeholder="Enter phone number..."
                  />

                  {/* Quick Switcher Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-muted-foreground shrink-0 text-[11px] font-medium">
                      Quick test:
                    </span>
                    {[
                      { code: "US", dial: "+1" },
                      { code: "ID", dial: "+62" },
                      { code: "GB", dial: "+44" },
                      { code: "JP", dial: "+81" },
                      { code: "AU", dial: "+61" },
                    ].map((preset) => (
                      <Button
                        key={preset.code}
                        type="button"
                        variant={
                          phoneCountry === preset.code ? "default" : "outline"
                        }
                        size="xs"
                        onClick={() => setPhoneCountry(preset.code)}
                        className="font-mono text-[11px]"
                      >
                        <CountryFlag code={preset.code} className="h-3 w-4" />
                        <span>{preset.dial}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Real-time Telemetry Panel */}
                <TelemetryBox className="space-y-1.5 p-3">
                  <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      Country:
                    </span>
                    <span className="text-foreground flex min-w-0 items-center gap-1.5 font-medium">
                      <CountryFlag
                        code={phoneMeta?.country?.code || phoneCountry}
                      />
                      <span className="truncate">
                        {phoneMeta?.country
                          ? `${phoneMeta.country.name} (${phoneMeta.dialCode})`
                          : "United States (+1)"}
                      </span>
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      Formatted:
                    </span>
                    <span className="text-foreground truncate tabular-nums">
                      {phoneValue || "—"}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      E.164 Payload:
                    </span>
                    <span className="text-foreground truncate tabular-nums">
                      {phoneMeta?.e164 || "—"}
                    </span>
                  </div>
                  <div className="border-border/40 flex min-w-0 flex-wrap items-center justify-between gap-1 border-t pt-1 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      Validation:
                    </span>
                    <span
                      className={cn(
                        "truncate font-semibold",
                        phoneMeta?.isValid ? "text-chart-2" : "text-destructive"
                      )}
                    >
                      {phoneMeta?.isValid
                        ? "✓ Valid E.164 Number"
                        : "⚠ Incomplete digits"}
                    </span>
                  </div>
                </TelemetryBox>
              </CardContent>
            </Card>

            {/* Select (Radix Select) */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Select (Single Option)</CardTitle>
                <CardDescription>
                  Radix-powered custom select with origin-aware popover
                  animation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a tier..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="starter">
                        Starter Plan (500 Photos)
                      </SelectItem>
                      <SelectItem value="pro">
                        Pro Photographer (Unlimited)
                      </SelectItem>
                      <SelectItem value="enterprise">
                        Agency White-Label
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <ValueBox
                  label="Selected Tier"
                  value={
                    selectValue === "pro"
                      ? "Pro Photographer (pro)"
                      : selectValue === "starter"
                        ? "Starter Plan (starter)"
                        : "Agency White-Label (enterprise)"
                  }
                />
              </CardContent>
            </Card>

            {/* Combobox (Searchable Autocomplete Input) */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="truncate">
                    Combobox (Searchable Autocomplete)
                  </CardTitle>
                  {comboboxValue && (
                    <Badge
                      variant="outline"
                      size="sm"
                      className="shrink-0 font-mono text-xs"
                    >
                      {comboboxValue}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Keyboard-navigable searchable input with grouped options and
                  one-click selection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Combobox
                    id="combobox-demo"
                    options={SAMPLE_VENUES}
                    value={comboboxValue}
                    onChange={(val) => setComboboxValue(val)}
                    placeholder="Select or search wedding venue..."
                    searchPlaceholder="Filter venues or locations..."
                  />
                </div>

                <ValueBox className="space-y-1">
                  <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      Selected Value:
                    </span>
                    <span className="text-foreground truncate font-medium">
                      {comboboxValue || "None"}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      Venue:
                    </span>
                    <span className="text-foreground truncate">
                      {SAMPLE_VENUES.find((v) => v.value === comboboxValue)
                        ?.label || "—"}
                    </span>
                  </div>
                </ValueBox>
              </CardContent>
            </Card>

            {/* Dropdown Select / Menu */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Dropdown Menu / Action Menu</CardTitle>
                <CardDescription>
                  Multi-action menu with keyboard shortcuts, destructive items,
                  and separators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>Manage Album Actions</span>
                      <ChevronDown className="size-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Album Options</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => toast.info("Opening photo manager")}
                    >
                      <Eye className="mr-2 size-4" />
                      <span>View Gallery</span>
                      <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.info("Link copied to clipboard")}
                    >
                      <Copy className="mr-2 size-4" />
                      <span>Copy Share URL</span>
                      <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => toast.error("Album marked for deletion")}
                    >
                      <Trash2 className="mr-2 size-4" />
                      <span>Archive Event</span>
                      <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ValueBox>
                  Origin-aware: scales from the trigger point, not center.
                </ValueBox>
              </CardContent>
            </Card>

            {/* Checkbox with Label */}
            <Card size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>Checkbox with Description</CardTitle>
                <CardDescription>
                  Accessible Radix Checkbox with check icon animation and toggle
                  state.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-border/60 bg-muted/20 flex items-start gap-3 rounded-xl border p-4">
                  <Checkbox
                    id="demo-checkbox"
                    checked={checkboxValue}
                    onCheckedChange={(checked) =>
                      setCheckboxValue(Boolean(checked))
                    }
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <Label
                      htmlFor="demo-checkbox"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Enable High-Resolution RAW uploads
                    </Label>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Automatically converts HEIC/CR3 camera formats directly
                      into WebP and JPEG.
                    </p>
                  </div>
                </div>

                <ValueBox
                  label="Status"
                  value={checkboxValue ? "Enabled" : "Disabled"}
                />
              </CardContent>
            </Card>

            {/* Textarea */}
            <Card size="sm" className="min-w-0 md:col-span-2">
              <CardHeader>
                <CardTitle>Textarea (Multi-line Input)</CardTitle>
                <CardDescription>
                  Comfortable text canvas with character counting and 14px
                  padding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  id="textarea-demo"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  placeholder="Write your note here..."
                  rows={3}
                />

                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>Auto-expanding, min-h-20 with squircle border.</span>
                  <span className="font-mono">
                    {textareaValue.length} characters
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Standardized Formatted Primitives Card */}
            <Card size="sm" className="min-w-0 md:col-span-2">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>Standardized Formatting Primitives</CardTitle>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    tabular-nums · semantic &lt;time&gt; · SSR-safe
                  </Badge>
                </div>
                <CardDescription>
                  Universal, hydration-safe formatters for dates, times,
                  relative offsets, currencies, compact metrics, and file sizes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Date Formats */}
                  <div className="border-border/60 bg-muted/20 space-y-2 rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Dates & Times
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Default (Medium):
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedDate
                            value="2026-09-24T14:30:00Z"
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Weekday Preset:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedDate
                            value="2026-09-24T14:30:00Z"
                            preset="weekday"
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Time (12h):
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedTime
                            value="2026-09-24T14:30:00Z"
                            preset="12h"
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Date Range:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedDateRange
                            from="2026-09-24"
                            to="2026-09-28"
                            locale="en-US"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Relative & Duration */}
                  <div className="border-border/60 bg-muted/20 space-y-2 rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Relative & Durations
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Recent Activity:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedRelativeTime
                            value="2026-09-24T11:42:00Z"
                            now={new Date("2026-09-24T12:00:00Z")}
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Yesterday:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedRelativeTime
                            value="2026-09-23T10:00:00Z"
                            now={new Date("2026-09-24T12:00:00Z")}
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Shoot Session:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedDuration value={7500} unit="s" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Full Ceremony:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedDuration
                            value={180}
                            unit="m"
                            durationStyle="long"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Storage */}
                  <div className="border-border/60 bg-muted/20 space-y-2 rounded-lg border p-3 sm:col-span-2 lg:col-span-1">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Financials & Storage
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Booking Fee:
                        </span>
                        <span className="text-primary font-mono font-semibold">
                          <Format.Currency
                            value={2450}
                            currency="USD"
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Quota Used:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedPercent
                            value={0.784}
                            decimals={1}
                            locale="en-US"
                          />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Client Gallery Size:
                        </span>
                        <span className="font-mono font-medium">
                          <Format.Bytes value={1073741824 * 18.4} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Photos Delivered:
                        </span>
                        <span className="font-mono font-medium">
                          <FormattedCompactNumber
                            value={1420}
                            decimals={1}
                            locale="en-US"
                          />{" "}
                          photos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <ValueBox type="info">
                  All metrics apply{" "}
                  <code className="bg-background/80 text-chart-3 rounded px-1">
                    tabular-nums
                  </code>{" "}
                  by default to guarantee vertical alignment in grids and data
                  tables. Dates emit semantic{" "}
                  <code className="bg-background/80 text-chart-3 rounded px-1">
                    &lt;time dateTime=&quot;...&quot;&gt;
                  </code>{" "}
                  tags.
                </ValueBox>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: DATA TABLE
            ========================================================================= */}
        <section id="table" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                6. Data Table Component
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Engineered with 16px cell padding rhythm, row selection, search,
                status badges, and action menus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {filteredEvents.length} Events Listed
              </Badge>
            </div>
          </div>

          <Card className="overflow-hidden">
            {/* Table Toolbar */}
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-between gap-3 border-b p-4 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Search events, couples, IDs..."
                  className="h-9 pl-9"
                />
              </div>

              <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                >
                  <Filter className="size-3.5" />
                  <span>Filter Status</span>
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl text-xs"
                  onClick={() => toast.info("Create event dialog opened")}
                >
                  <Plus className="size-3.5" />
                  <span>New Event</span>
                </Button>
              </div>
            </div>

            {/* Table Core */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedRows.length === filteredEvents.length &&
                          filteredEvents.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRows(filteredEvents.map((e) => e.id));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Event & Couple</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-muted-foreground py-10 text-center"
                      >
                        No events matching "{tableSearch}".
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((evt) => {
                      const isSelected = selectedRows.includes(evt.id);
                      return (
                        <TableRow
                          key={evt.id}
                          data-state={isSelected ? "selected" : undefined}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRows([...selectedRows, evt.id]);
                                } else {
                                  setSelectedRows(
                                    selectedRows.filter((id) => id !== evt.id)
                                  );
                                }
                              }}
                              aria-label={`Select ${evt.name}`}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {evt.id}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold">
                              {evt.name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {evt.couple}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            <FormattedDate value={evt.date} locale="en-US" />
                          </TableCell>
                          <TableCell className="font-mono text-xs font-medium">
                            <FormattedNumber
                              value={evt.photos}
                              locale="en-US"
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {evt.storage}
                          </TableCell>
                          <TableCell>
                            {evt.status === "active" && (
                              <Badge variant="success">Active</Badge>
                            )}
                            {evt.status === "processing" && (
                              <Badge variant="warning">Processing</Badge>
                            )}
                            {evt.status === "completed" && (
                              <Badge
                                variant="outline"
                                className="border-border text-muted-foreground"
                              >
                                Completed
                              </Badge>
                            )}
                            {evt.status === "pending" && (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    toast.info(`Viewing ${evt.name}`)
                                  }
                                >
                                  <Eye className="mr-2 size-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => copyToClipboard(evt.id)}
                                >
                                  <Copy className="mr-2 size-4" />
                                  <span>Copy Event ID</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() =>
                                    toast.error(`Deleted ${evt.id}`)
                                  }
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  <span>Delete Event</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Table Pagination Footer */}
            <DataTablePagination
              rowCount={SAMPLE_EVENTS.length}
              pageIndex={0}
              pageSize={filteredEvents.length}
            />
          </Card>
        </section>

        {/* =========================================================================
            SECTION 7: INTERACTIVE REAL-WORLD FORM
            ========================================================================= */}
        <section id="form" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                7. Production Form Composition
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Demonstrates how all inputs integrate into an Asana-grade,
                responsive data entry experience.
              </p>
            </div>
            <Badge variant="outline" className="w-fit font-mono text-xs">
              Asana Precision
            </Badge>
          </div>

          <Card className="border-border/80 mx-auto max-w-2xl border shadow-md">
            <CardHeader className="border-border/60 bg-muted/20 border-b p-6 sm:p-8">
              <div className="text-primary flex items-center gap-2 font-mono text-xs">
                <Sparkles className="size-3.5" />
                <span>Wedding Photo App Setup</span>
              </div>
              <CardTitle className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Configure New Wedding Gallery
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Set guest permissions, storage quotas, and album access
                parameters.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleFormSubmit}>
              <CardContent className="space-y-6 p-6 sm:p-8">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="form-title"
                    className="flex items-center justify-between text-sm font-semibold"
                  >
                    <span>Event Name / Couple Names</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      Required
                    </span>
                  </Label>
                  <Input
                    id="form-title"
                    required
                    value={formEventName}
                    onChange={(e) => setFormEventName(e.target.value)}
                    placeholder="e.g. Maya & Nathan's Wedding"
                  />
                  <p className="text-muted-foreground text-[11px]">
                    This appears as the hero banner on the guest upload portal.
                  </p>
                </div>

                {/* Two Column Row: Guest Limit & Event Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="form-guests"
                      className="text-sm font-semibold"
                    >
                      Estimated Guests
                    </Label>
                    <NumberInput
                      id="form-guests"
                      value={formGuestLimit}
                      onChange={setFormGuestLimit}
                      min={10}
                      max={5000}
                      step={25}
                      placeholder="e.g. 150"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="form-date"
                      className="text-sm font-semibold"
                    >
                      Wedding Date
                    </Label>
                    <DateInput
                      id="form-date"
                      mode="single"
                      value={formDate}
                      onChange={setFormDate}
                      placeholder="Select wedding date..."
                    />
                  </div>
                </div>

                {/* Contact Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="form-phone" className="text-sm font-semibold">
                    Contact Phone Number
                  </Label>
                  <PhoneInput
                    id="form-phone"
                    defaultCountry="US"
                    value={formPhone}
                    onChange={(val) => setFormPhone(val)}
                    showValidationState
                    placeholder="Organizer phone number..."
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Receive real-time SMS status updates when guests upload new
                    photo galleries.
                  </p>
                </div>

                {/* Package Tier Select */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Album Package Tier
                  </Label>
                  <Select value={formPackage} onValueChange={setFormPackage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">
                        Standard Tier — 10 GB Storage · 30 Days Retention
                      </SelectItem>
                      <SelectItem value="unlimited">
                        Professional Tier — 50 GB Storage · 1 Year Retention
                      </SelectItem>
                      <SelectItem value="archive">
                        Forever Archive — 200 GB Storage · Permanent Cloudflare
                        R2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Guest Description Notes */}
                <div className="space-y-2">
                  <Label
                    htmlFor="form-notes"
                    className="flex items-center justify-between text-sm font-semibold"
                  >
                    <span>Welcome Note for Guests</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      Optional
                    </span>
                  </Label>
                  <Textarea
                    id="form-notes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Welcome our friends and family! Please snap photos throughout the day and scan the table QR code to drop them directly here."
                    rows={3}
                  />
                </div>

                {/* Checkbox Permission */}
                <div className="border-border/70 bg-muted/20 flex items-start gap-3 rounded-xl border p-4">
                  <Checkbox
                    id="form-upload-perm"
                    checked={formAllowGuestUpload}
                    onCheckedChange={(checked) =>
                      setFormAllowGuestUpload(Boolean(checked))
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="form-upload-perm"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Enable Direct QR Uploads (No App or Account Required)
                    </Label>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Guests can scan table QR codes and upload directly from
                      their mobile browser into Cloudflare R2.
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-border/60 bg-muted/10 flex items-center justify-between gap-4 border-t p-6 sm:p-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormEventName("");
                    setFormNotes("");
                    toast.info("Form reset to defaults.");
                  }}
                  className="text-muted-foreground text-xs"
                >
                  Reset
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formEventName.trim()}
                    className="shadow-primary/10 rounded-full px-6 font-medium shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving Event...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-4" />
                        Create Wedding Gallery
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </section>

        {/* =========================================================================
            SECTION 8: EMIL KOWALSKI DESIGN ENGINEERING AUDIT TABLE
            ========================================================================= */}
        <section id="components" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                8. Design Engineering Review Format
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Before & After audit standards mandated by Emil Kowalski's
                philosophy.
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              animations.dev Standard
            </Badge>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">
                      Before (Default Web / Anti-pattern)
                    </TableHead>
                    <TableHead className="w-1/3">
                      After (Design Engineered)
                    </TableHead>
                    <TableHead className="w-1/3">
                      Why (The Compounding Effect)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      transition: all 300ms
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      transition: transform 160ms cubic-bezier(0.2, 0, 0, 1)
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Specify exact properties; never animate all. Custom curves
                      feel intentional and immediate.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      transform: scale(0) on enter
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      transform: scale(0.96); opacity: 0
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Nothing in the real physical world appears from a single
                      pixel point.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      No active press feedback on buttons
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      active:scale-[0.97] on touch-down
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Respond on pointer-down, not release. Proves to the user
                      the interface heard them.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      transform-origin: center on popovers
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      transform-origin: var(--radix-popover-origin)
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Popovers must scale from their trigger, anchoring user
                      spatial memory.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      Arbitrary random padding: 15px, 22px, 9px
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      4px / 8px spatial grid scale (4, 8, 12, 16, 24, 32px)
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Mathematical rhythm creates subconscious visual trust and
                      effortless scanning.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      ease-linear on drawers / sidebar
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      --ease-out & --ease-drawer (cubic-bezier)
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Linear motion feels robotic; deceleration curves mimic
                      natural physical friction.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      transition-none on checkbox check
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      160ms celebratory spring zoom-in-75
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Immediate tactile gratification for completed
                      micro-actions.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      width: progress% layout reflow
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      scaleX(progress/100) origin-left (GPU)
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Composite-only transform preserves 60/120fps with zero
                      layout recalculation.
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-destructive font-mono text-xs">
                      Wildcard duration: 0.01ms on reduced-motion
                    </TableCell>
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      Suppress transforms, preserve 150ms opacity/color
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      Accessibility means eliminating vestibular movement, not
                      blinding the user to state changes.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Scroll-Triggered Reveal System Playground */}
          <ScrollReveal variant="blur-up">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Sparkles className="text-coral size-4.5" />
                      <span>
                        Scroll-Triggered Reveal Primitive (&lt;ScrollReveal
                        /&gt;)
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Sequenced viewport entrance animations powered by
                      IntersectionObserver, CSS hardware acceleration, and
                      --ease-out physics.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDemoScrollKey((k) => k + 1)}
                    className="gap-2 self-start sm:self-auto"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Replay Sequence</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Controls */}
                <div className="border-border/60 bg-muted/20 flex flex-wrap items-center gap-2 rounded-lg border p-3">
                  <span className="text-muted-foreground font-mono text-xs font-semibold">
                    VARIANT:
                  </span>
                  {(
                    [
                      "blur-up",
                      "fade-up",
                      "scale-up",
                      "fade-in",
                      "slide-left",
                      "slide-right",
                    ] as ScrollRevealVariant[]
                  ).map((variant) => (
                    <Button
                      key={variant}
                      variant={
                        demoScrollVariant === variant ? "default" : "outline"
                      }
                      size="xs"
                      onClick={() => {
                        setDemoScrollVariant(variant);
                        setDemoScrollKey((k) => k + 1);
                      }}
                      className="font-mono text-xs"
                    >
                      {variant}
                    </Button>
                  ))}
                </div>

                {/* Staggered Live Visual Preview */}
                <ScrollRevealGroup
                  key={demoScrollKey}
                  staggerMs={80}
                  variant={demoScrollVariant}
                  triggerImmediate
                  className="grid gap-4 sm:grid-cols-3"
                >
                  <div className="border-border/60 bg-card asana-card-shadow rounded-xl border p-5">
                    <div className="bg-secondary text-primary flex size-8 items-center justify-center rounded-md font-mono text-xs font-semibold">
                      01
                    </div>
                    <h4 className="mt-3 text-sm font-semibold">
                      Deceleration Curve
                    </h4>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      Uses <code className="text-xs">--ease-out</code>{" "}
                      cubic-bezier(0.23, 1, 0.32, 1) for rapid response and
                      organic friction.
                    </p>
                  </div>

                  <div className="border-border/60 bg-card asana-card-shadow rounded-xl border p-5">
                    <div className="bg-secondary text-primary flex size-8 items-center justify-center rounded-md font-mono text-xs font-semibold">
                      02
                    </div>
                    <h4 className="mt-3 text-sm font-semibold">
                      Stagger Sequence
                    </h4>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      Cascading 80ms delay between cards creates spatial rhythm
                      without delaying user interaction.
                    </p>
                  </div>

                  <div className="border-border/60 bg-card asana-card-shadow rounded-xl border p-5">
                    <div className="bg-secondary text-primary flex size-8 items-center justify-center rounded-md font-mono text-xs font-semibold">
                      03
                    </div>
                    <h4 className="mt-3 text-sm font-semibold">
                      Motion Accessibility
                    </h4>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      Includes <code className="text-xs">motion-reduce:*</code>{" "}
                      fallbacks to suppress displacement for vestibular safety.
                    </p>
                  </div>
                </ScrollRevealGroup>

                {/* Telemetry Code Output */}
                <ValueBox variant="info">
                  <div className="flex items-center justify-between pb-1 font-mono text-[11px] font-semibold">
                    <span>COMPONENT USAGE SYNTAX</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      React 19 Primitive
                    </Badge>
                  </div>
                  <div className="text-muted-foreground font-mono text-xs leading-relaxed">
                    {`<ScrollRevealGroup staggerMs={80} variant="${demoScrollVariant}">\n  <Card>Card 1</Card>\n  <Card>Card 2</Card>\n  <Card>Card 3</Card>\n</ScrollRevealGroup>`}
                  </div>
                </ValueBox>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* =========================================================================
              CUSTOM SCROLLBAR & RADIX SCROLLAREA SHOWCASE
              ========================================================================= */}
          <ScrollReveal variant="fade-up">
            <Card className="border-border/80 mt-8 overflow-hidden border shadow-md">
              <CardHeader className="border-border/60 bg-muted/20 border-b p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-primary flex items-center gap-2 font-mono text-xs font-semibold">
                      <Sparkles className="size-3.5" />
                      <span>Radix ScrollArea & Sleek Custom Scrollbar</span>
                    </div>
                    <CardTitle className="mt-1 text-xl font-semibold tracking-tight">
                      Tactile Scrollable Containers
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                      Replaces bulky OS scrollbars with modern 8px floating pill
                      thumbs, inset border clips, and responsive hover
                      transitions.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      Cross-Browser Standard
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Vertical ScrollArea Demo */}
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-mono text-xs font-semibold">
                        VERTICAL SCROLLAREA (LOGS / EVENTS)
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px]"
                      >
                        &lt;ScrollArea className="h-64" /&gt;
                      </Badge>
                    </div>
                    <div className="border-border/70 bg-card rounded-xl border p-1 shadow-xs">
                      <ScrollArea className="h-64 rounded-lg p-3">
                        <div className="space-y-2 pr-3">
                          {[
                            {
                              time: "10:42:15",
                              title: "RAW photo batch uploaded",
                              meta: "128 items · 4.2 GB",
                              badge: "Sync Complete",
                            },
                            {
                              time: "10:41:03",
                              title: "Face clustering completed",
                              meta: "Bride & Groom tagged",
                              badge: "AI Vision",
                            },
                            {
                              time: "10:39:50",
                              title: "High-res thumbnails generated",
                              meta: "WebP format · 100% quality",
                              badge: "CDN Cached",
                            },
                            {
                              time: "10:37:12",
                              title: "VIP guest gallery link accessed",
                              meta: "Token: #gl-9920",
                              badge: "Auth OK",
                            },
                            {
                              time: "10:34:00",
                              title: "Color grade LUT preset applied",
                              meta: "Preset: Fuji Natural Warm",
                              badge: "Rendered",
                            },
                            {
                              time: "10:30:22",
                              title: "Cloudflare D1 metadata updated",
                              meta: "Latency 18ms",
                              badge: "D1 Edge",
                            },
                            {
                              time: "10:28:45",
                              title: "Storage quota snapshot saved",
                              meta: "45.8 GB / 100 GB used",
                              badge: "Telemetry",
                            },
                            {
                              time: "10:25:10",
                              title: "Wedding event session initialized",
                              meta: "Session ID #wed-2026-09",
                              badge: "Session",
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="border-border/50 bg-background/50 hover:bg-muted/40 flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground font-mono text-[11px]">
                                    {item.time}
                                  </span>
                                  <span className="text-foreground font-medium">
                                    {item.title}
                                  </span>
                                </div>
                                <p className="text-muted-foreground text-[11px]">
                                  {item.meta}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px]"
                              >
                                {item.badge}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Horizontal ScrollArea Demo & Scrollbar Variants */}
                  <div className="min-w-0 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-mono text-xs font-semibold">
                          HORIZONTAL SCROLLSTRIP (PHOTO TAGS)
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px]"
                        >
                          &lt;ScrollBar orientation="horizontal" /&gt;
                        </Badge>
                      </div>
                      <div className="border-border/70 bg-card overflow-hidden rounded-xl border p-1 shadow-xs">
                        <ScrollArea className="w-full overflow-hidden rounded-lg p-3 whitespace-nowrap">
                          <div className="flex gap-2.5 pb-2">
                            {[
                              "All Photos (1,248)",
                              "Ceremony & Vows (245)",
                              "Golden Hour Portraits (189)",
                              "Reception Dinner (312)",
                              "First Dance (74)",
                              "Drone Aerials (52)",
                              "Family Groups (180)",
                              "Candid Moments (196)",
                            ].map((tag, idx) => (
                              <div
                                key={idx}
                                className="border-border/60 bg-muted/40 hover:bg-accent hover:text-accent-foreground text-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
                              >
                                <span className="bg-coral size-1.5 rounded-full" />
                                {tag}
                              </div>
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>

                    {/* Native Utility Comparison */}
                    <ValueBox variant="info">
                      <div className="flex items-center justify-between pb-1 font-mono text-[11px] font-semibold">
                        <span>GLOBAL SCROLLBAR SPECS & UTILITIES</span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          CSS Layer Base
                        </Badge>
                      </div>
                      <div className="text-muted-foreground space-y-1.5 font-mono text-[11px]">
                        <p>
                          • <strong>Global default</strong>: 8px WebKit track
                          with 4px floating pill thumb (
                          <code className="text-foreground">border-box</code>{" "}
                          clip).
                        </p>
                        <p>
                          •{" "}
                          <code className="text-foreground">
                            .thin-scrollbar
                          </code>
                          : 5px ultra-compact track for tight sidebars and code
                          blocks.
                        </p>
                        <p>
                          •{" "}
                          <code className="text-foreground">.no-scrollbar</code>
                          : Hides scrollbars while preserving touch/trackpad
                          swipe momentum.
                        </p>
                        <p>
                          • <strong>Firefox standard</strong>: Native{" "}
                          <code className="text-foreground">
                            scrollbar-width: thin; scrollbar-color: ...
                          </code>{" "}
                          support.
                        </p>
                      </div>
                    </ValueBox>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border/40 bg-card/30 border-t backdrop-blur-md">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="bg-primary/80 inline-block size-2 rounded-full" />
            <span>{t("app.name")} · Living Component Spec</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link
              to="/login"
              className="hover:text-foreground transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              {t("nav.dashboard")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
