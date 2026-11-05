# Persora Design System

The single source of truth for Persora's visual design. Based on the ReUI
component library (shadcn/ui-aligned) and the typography specification in
`uploads/typography.txt`.

## 1. Typography (source of truth: uploads/typography.txt)

**Primary typeface:** Inter
**Fallback:** `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Font weights:** Regular 400, Medium 500, Semibold 600, Bold 700

### 52 typography tokens

Naming convention: `text-{family}-{weight}`

| Family | Size | Line height | Use |
|--------|------|-------------|-----|
| large-title | 64px | 80px | Hero numerals, marketing-scale headings |
| display-1 | 56px | 72px | Full-page hero headings |
| display-2 | 48px | 64px | Large section hero headings |
| display-3 | 40px | 54px | Prominent statistics, page hero headings |
| display-4 | 32px | 44px | Page titles (application shell) |
| title-1 | 24px | 34px | Card headline figures |
| title-2 | 20px | 26px | Section headings |
| title-3 | 18px | 25px | Sub-section / calendar month headings |
| headline | 16px | 22px | Emphasized body copy |
| body | 14px | 20px | Default interface text, labels, table cells, nav |
| body-2 | 13px | 18px | Dense contexts, compact tables |
| caption-1 | 12px | 16px | Axis labels, timestamps (tracking 0.15px) |
| caption-2 | 11px | 15px | Badges, fine print (tracking 0.2px) |

Each family supports `regular`, `medium`, `semibold`, `bold`.

### Implementation rules

1. Each token sets font family, size, line height, letter spacing (where defined), and weight together.
2. Use one typography token per element — don't manually combine unrelated font utilities.
3. Text color is separate from typography tokens (semantic color tokens applied alongside).
4. Typography tokens are registered in `cn()` as `text-size` utilities so they compose with color tokens.
5. Prefer the smallest suitable style in the hierarchy.
6. Body text uses Regular 400; avoid making every label bold.

## 2. Global theme colors

| Surface | Dark Mode | Light Mode |
|---------|-----------|------------|
| Sidebar | RGB(23,23,23) | RGB(247,247,247) |
| Workspace | RGB(18,18,18) | RGB(255,255,255) |

Semantic colors (HSL): primary (221 83% 53%), secondary, muted, accent,
destructive, border, input, ring. Light/dark variants defined in
`src/app/globals.css`.

## 3. ReUI component standards

Use ReUI primitives consistently across admin, user, and public interfaces:

- **Button** — default, destructive, outline, secondary, ghost, link variants; sm/default/lg/icon sizes.
- **Input** — form text input with focus ring and disabled states.
- **Label** — form labels.
- **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
- **Badge** — default, secondary, destructive, outline variants.
- **Dialog** — Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogHeader, DialogFooter, DialogTitle, DialogDescription.
- **Popover** — Popover, PopoverTrigger, PopoverContent.
- **Tabs** — Tabs, TabsList, TabsTrigger, TabsContent.
- **ScrollArea** — ScrollArea, ScrollBar, ScrollbarThumb.
- **Separator** — visual dividers.
- **Avatar** — Avatar, AvatarImage, AvatarFallback.
- **Switch** — toggle switch.
- **Skeleton** — component-specific loading layouts (default, circular, text).
- **IconStack** — stacked icon layers with offset.
- **IconTile** — square tile container for icons.
- **Link** — styled navigation links.

Do not introduce unrelated component libraries or independently styled UI components.

## 4. Animations

Smooth ReUI-style animations only where useful:

- `fade-in` — 0.25s ease-out
- `slide-up-fade` — 0.3s ease-out
- `slide-down-fade` — 0.2s ease-out
- `scale-in` — 0.2s ease-out
- `skeleton-pulse` — 1.4s infinite

Apply sparingly to modals, drawers, toasts, and page transitions.

## 5. Skeleton package

Use `reui-skeleton` with component-specific loading layouts:

- Default: `h-4 w-full`
- Circular: `h-10 w-10 rounded-full`
- Text: `h-3 w-full`

Always show skeletons while data is fetching; never show empty layouts during load.

## 6. Spacing, sizing, borders, interactions

- Border radius: `0.625rem` (10px) default.
- Cards: `rounded-xl border border-border shadow-sm`.
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- Disabled states: `disabled:pointer-events-none disabled:opacity-50`.
- Hover states: subtle background shifts (`hover:bg-accent`, `hover:bg-primary/90`).
- Consistent 4px/8px spacing scale (Tailwind default).

## 7. Icon Stack & Icon Tile

Use `IconStack` where multiple icon layers are needed (e.g. status badges with
overlays). Use `IconTile` for square icon containers (36px default) in grids
and feature cards.

## 8. Light & dark themes

Supported throughout via `next-themes` (`data-theme="class"`). Sidebar and
workspace colors switch automatically based on the active theme.

## 9. Guidelines for future development

- Always use a typography token; never arbitrary font-size/weight/leading.
- Apply semantic text-color tokens alongside typography tokens.
- Register any new typography token in `cn()` classGroups at the same time.
- Compose complex interfaces from ReUI primitives — no custom-styled components.
- Keep admin, user, and public interfaces separated.
- Update this document and the relevant `docs/features/` file whenever the design
  system changes.