/* eslint-disable i18next/no-literal-string --
   Living Design System & Component Engineering Showcase:
   demonstrates design tokens, inputs, padding rhythm, table, and form specifications. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  DateInput,
  type DateRange,
  DateTimeInput,
  TimeInput,
} from "@/components/ui/date-input";
import { PhoneInput, type PhoneValueMeta } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
  // Charts
  {
    name: "Chart 1 (Amber / Coral)",
    variable: "--chart-1",
    description: "Lead metric trendline or primary analytics series.",
    previewClass: "bg-[var(--chart-1)]",
    category: "charts",
  },
  {
    name: "Chart 2 (Cyan / Teal)",
    variable: "--chart-2",
    description: "Secondary comparison dataset.",
    previewClass: "bg-[var(--chart-2)]",
    category: "charts",
  },
  {
    name: "Chart 3 (Cobalt / Indigo)",
    variable: "--chart-3",
    description: "Tertiary metric or historical baseline.",
    previewClass: "bg-[var(--chart-3)]",
    category: "charts",
  },
  {
    name: "Chart 4 (Emerald / Lime)",
    variable: "--chart-4",
    description: "Positive growth / retention metric.",
    previewClass: "bg-[var(--chart-4)]",
    category: "charts",
  },
  {
    name: "Chart 5 (Berry / Fuchsia)",
    variable: "--chart-5",
    description: "Supplemental categorical indicator.",
    previewClass: "bg-[var(--chart-5)]",
    category: "charts",
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
  "tokens" | "spacing" | "inputs" | "table" | "form" | "components";

interface ShowcaseTabItem {
  id: SectionTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SHOWCASE_TABS: ShowcaseTabItem[] = [
  { id: "tokens", label: "Color Tokens", icon: Palette },
  { id: "spacing", label: "Padding & Spacing", icon: Ruler },
  { id: "inputs", label: "Inputs & Controls", icon: FormInput },
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
      "spacing",
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
  const [phoneValue, setPhoneValue] = useState("2025550123");
  const [phoneMeta, setPhoneMeta] = useState<PhoneValueMeta | null>(null);
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [selectValue, setSelectValue] = useState("pro");
  const [selectedRows, setSelectedRows] = useState<string[]>(["EVT-8921"]);
  const [tableSearch, setTableSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  onClick={(e) => scrollToSection(e, tab.id)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition-all active:scale-95 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </a>
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
            SECTION 2: SPACING & PADDING RULES
            ========================================================================= */}
        <section id="spacing" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                2. Padding & Spacing Rhythm
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
        </section>

        {/* =========================================================================
            SECTION 3: INPUTS & FORM CONTROLS
            ========================================================================= */}
        <section id="inputs" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                3. Inputs & Form Controls
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

          <div className="grid gap-6 sm:grid-cols-2">
            {/* String / Text Input */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label htmlFor="string-input" className="text-sm font-semibold">
                  String / Text Input
                </Label>
                <p className="text-muted-foreground text-xs">
                  With leading icon, clearable state, and active focus halo.
                </p>
              </div>

              <div className="relative">
                <Input
                  id="string-input"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Enter text..."
                  className="pr-10"
                />
                {textValue && (
                  <button
                    onClick={() => setTextValue("")}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Value: "{textValue}"
              </div>
            </Card>

            {/* Number Input (No Scroll & No Auto-Zero) */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label htmlFor="number-input" className="text-sm font-semibold">
                  Number Input (No Scroll & No Auto-Zero)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Can be completely cleared without forcing 0. Wheel scroll
                  disabled, no clunky browser spin arrows.
                </p>
              </div>

              <NumberInput
                id="number-input"
                value={numberValue}
                onChange={setNumberValue}
                min={0}
                max={10000}
                step={25}
                placeholder="Enter a number..."
              />

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Value:{" "}
                {numberValue === ""
                  ? "(empty / cleared)"
                  : `${numberValue} units`}
              </div>
            </Card>

            {/* Single Date Picker */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Date Input (Choose One Date)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Interactive Asana calendar popover with quick day presets and
                  clear button.
                </p>
              </div>

              <div>
                <DateInput
                  mode="single"
                  value={singleDate}
                  onChange={setSingleDate}
                  placeholder="Select event date..."
                />
              </div>

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Selected:{" "}
                {singleDate
                  ? singleDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "None"}
              </div>
            </Card>

            {/* Date Range Picker */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Date Range Input (Choose Date Range)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Select start and end date with continuous track highlight, day
                  counter, and presets.
                </p>
              </div>

              <div>
                <DateInput
                  mode="range"
                  value={rangeDate}
                  onChange={setRangeDate}
                  placeholder="Select upload window..."
                />
              </div>

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Range:{" "}
                {rangeDate?.from
                  ? `${rangeDate.from.toLocaleDateString()} – ${rangeDate.to ? rangeDate.to.toLocaleDateString() : "…"}`
                  : "None"}
              </div>
            </Card>

            {/* Time Input */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Time Input (Choose Time)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Scrollable hour and minute columns with AM/PM toggle and quick
                  time presets.
                </p>
              </div>

              <div>
                <TimeInput
                  value={timeValue}
                  onChange={setTimeValue}
                  placeholder="Select event time..."
                />
              </div>

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Selected Time: {timeValue || "None"}
              </div>
            </Card>

            {/* Date & Time Input */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Date & Time Input (Combined Date & Time)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Integrated Asana calendar with synchronized time picker panel
                  and chip shortcuts.
                </p>
              </div>

              <div>
                <DateTimeInput
                  value={dateTimeValue}
                  onChange={setDateTimeValue}
                  placeholder="Select ceremony start..."
                />
              </div>

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Selected:{" "}
                {dateTimeValue
                  ? dateTimeValue.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "None"}
              </div>
            </Card>

            {/* Phone Number Input (with Country Selector & Validation) */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="phone-input"
                    className="text-sm font-semibold"
                  >
                    Phone Input (Country Dropdown & Validation)
                  </Label>
                  {phoneMeta && (
                    <Badge
                      variant={phoneMeta.isValid ? "success" : "coral"}
                      className="font-mono text-xs"
                    >
                      {phoneMeta.isValid ? "Valid" : "Incomplete"}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Searchable country selector, Google libphonenumber formatting,
                  and live E.164 validation.
                </p>
              </div>

              <div>
                <PhoneInput
                  id="phone-input"
                  defaultCountry="US"
                  value={phoneValue}
                  onChange={(val, meta) => {
                    setPhoneValue(val);
                    setPhoneMeta(meta);
                  }}
                  showValidationState
                  placeholder="Enter phone number..."
                />
              </div>

              <div className="text-muted-foreground bg-muted/30 space-y-1 rounded-lg p-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Country:</span>
                  <span className="text-foreground">
                    {phoneMeta?.country
                      ? `${phoneMeta.country.flag} ${phoneMeta.country.name} (${phoneMeta.dialCode})`
                      : "🇺🇸 United States (+1)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Formatted:</span>
                  <span className="text-foreground">
                    {phoneValue || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>E.164 Output:</span>
                  <span className="text-foreground">
                    {phoneMeta?.e164 || "+12025550123"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Select (Radix Select) */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Select (Single Option)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Radix-powered custom select with origin-aware popover
                  animation.
                </p>
              </div>

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

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Selected Tier: {selectValue}
              </div>
            </Card>

            {/* Dropdown Select / Menu */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Dropdown Menu / Action Menu
                </Label>
                <p className="text-muted-foreground text-xs">
                  Multi-action menu with keyboard shortcuts, destructive items,
                  and separators.
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
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

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Origin-aware: scales from the trigger point, not center.
              </div>
            </Card>

            {/* Checkbox with Label */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Checkbox with Description
                </Label>
                <p className="text-muted-foreground text-xs">
                  Accessible Radix Checkbox with check icon animation and toggle
                  state.
                </p>
              </div>

              <div className="border-border/60 bg-muted/20 flex items-start gap-3 rounded-xl border p-4">
                <Checkbox
                  id="demo-checkbox"
                  checked={checkboxValue}
                  onCheckedChange={(checked) =>
                    setCheckboxValue(Boolean(checked))
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="demo-checkbox"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Enable High-Resolution RAW uploads
                  </Label>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Automatically converts HEIC/CR3 camera formats directly into
                    WebP and JPEG.
                  </p>
                </div>
              </div>

              <div className="text-muted-foreground bg-muted/30 rounded-lg p-2 font-mono text-xs">
                Status: {checkboxValue ? "Enabled" : "Disabled"}
              </div>
            </Card>

            {/* Textarea */}
            <Card className="space-y-4 p-6 sm:col-span-2">
              <div className="space-y-1">
                <Label
                  htmlFor="textarea-demo"
                  className="text-sm font-semibold"
                >
                  Textarea (Multi-line Input)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Comfortable text canvas with character counting and 14px
                  padding.
                </p>
              </div>

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
            </Card>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: DATA TABLE
            ========================================================================= */}
        <section id="table" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                4. Data Table Component
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
                            {evt.date}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-medium">
                            {evt.photos.toLocaleString()}
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
            <div className="border-border/60 text-muted-foreground bg-muted/10 flex flex-col items-center justify-between gap-3 border-t p-4 text-xs sm:flex-row">
              <div>
                Showing 1 to {filteredEvents.length} of {SAMPLE_EVENTS.length}{" "}
                events
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* =========================================================================
            SECTION 5: INTERACTIVE REAL-WORLD FORM
            ========================================================================= */}
        <section id="form" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                5. Production Form Composition
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
            SECTION 6: EMIL KOWALSKI DESIGN ENGINEERING AUDIT TABLE
            ========================================================================= */}
        <section id="components" className="scroll-mt-28 space-y-6">
          <div className="border-border/60 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="section-title text-2xl font-semibold">
                6. Design Engineering Review Format
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
                </TableBody>
              </Table>
            </div>
          </Card>
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
