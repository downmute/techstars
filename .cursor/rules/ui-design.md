# UI Design Rules

## Step 0 — Always mock in Paper MCP first

Before writing any UI code, open Paper MCP and create a mockup of the screen or component. Get the layout, spacing, and visual feel right in Paper before touching code. Only start implementing after the mockup is approved or you are satisfied with the direction.

## Design Language

### Feeling
Warm, calm, trustworthy. This is a postpartum recovery product used by women in a vulnerable time. The UI should feel like a premium wellness journal — not a tech app, not clinical, not "vibe coded."

### What to avoid
- No dark backgrounds (no `#0A0A12`, no near-black base — that's the old Vela palette)
- No purple/indigo/neon accents (`#C5C1F5` is gone)
- No heavy glassmorphism or multi-color glow blobs
- No gradients that go purple → teal → orange
- No excessive shadows stacked on top of each other
- No "AI startup" aesthetic

### Color palette — warm rose / cream / blush

Use exclusively this palette. Do not introduce colors outside it without strong reason.

| Role | Value | Usage |
|---|---|---|
| Background | `#FAF7F4` | Screen backgrounds |
| Surface | `#F0E9E2` | Cards, input fields |
| Surface raised | `#E8DDD4` | Elevated cards, selected states |
| Primary accent | `#B5604F` | Primary buttons, active states, key numbers |
| Accent soft | `#D4856A` | Secondary accent, icons, trends |
| Blush | `#E8C4B8` | Highlight chips, tags |
| Text primary | `#2C1F1A` | Headings, primary labels |
| Text secondary | `#8A6F65` | Body text, secondary labels |
| Text muted | `#B39B93` | Placeholders, timestamps |
| Border | `rgba(44, 31, 26, 0.08)` | Subtle dividers and card borders |
| Success | `#5A8A6A` | Positive trends, on-track indicators |
| Warning | `#C4925A` | Watch flags, declining trends |
| Danger | `#B5404A` | PPD risk flags, emergency alerts |

### Dark mode
Use `dark:` Tailwind variants where applicable. Dark mode palette:
- Background: `#1C1410`
- Surface: `#261C17`
- Text primary: `#F5EDE8`
- Text secondary: `#C4A99E`
- Primary accent: `#D4856A`

### Typography
- **Font**: Keep the existing system font — `ui-rounded` on iOS, `system-ui` elsewhere. Do not introduce Google Fonts or third-party fonts in the mobile app.
- **Hierarchy**: Large display weight for recovery scores and key numbers. Regular weight for body. Never use font sizes below 13px/13sp.
- **Letter spacing**: Slightly tight on large headings (`-0.3`), open on uppercase labels (`1.2`–`1.6`).

### Spacing
Use the existing `Spacing` constants from `@/constants/theme`:
- `Spacing.one` = 4, `Spacing.two` = 8, `Spacing.three` = 16, `Spacing.four` = 24, `Spacing.five` = 32, `Spacing.six` = 64

### Components
- **Cards**: `borderRadius: 20`, warm surface background, `1px` border at `rgba(44,31,26,0.08)`, no shadow
- **Buttons (primary)**: `borderRadius: 999` (pill), `backgroundColor: #B5604F`, white text `#FAF7F4`
- **Chips / tags**: `borderRadius: 999`, blush background `#E8C4B8`, `color: #2C1F1A`
- **Inputs**: Warm surface background, no border by default, `1px` border on focus

### Dashboard (Next.js clinic web app)
Same palette. Use Tailwind CSS. Light mode default — doctors use this on their laptops in a clinic setting. Clean, information-dense but not noisy. Tables and lists over cards where data density is needed.
