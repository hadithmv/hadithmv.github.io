# Design Guide

## Color Palette

| Token                | Light Mode                                    | Dark Mode                  | Usage                 |
| -------------------- | --------------------------------------------- | -------------------------- | --------------------- |
| `--bg-primary`       | `#ffffff`                                     | `#0e1621`                  | Page background       |
| `--text-primary`     | `#222222`                                     | `rgb(255 255 255 / 84.7%)` | Body text             |
| `--accent-blue`      | `#1f6cb9` / `#136296`                         | Same                       | Tabs, quotes, buttons |
| `--accent-red`       | `#b71c1c`                                     | Same                       | Price buttons, CTA    |
| `--link`             | `#00598b`                                     | `#66bce6`                  | Hyperlinks            |
| `--link-hover`       | `#3366cc`                                     | `#7dc4e6`                  | Link hover state      |
| `--gradient-primary` | `linear-gradient(45deg, red, #002bff, red)`   | Same                       | Price button glow     |
| `--gradient-hr`      | `linear-gradient(to right, #f33939, #4f39f3)` | Same                       | Section dividers      |
| `--social-fb`        | `#1877f2`                                     | Same                       | Facebook button       |
| `--social-tw`        | `#1d9bf0`                                     | Same                       | Twitter/X button      |
| `--social-tg`        | `#229ed9`                                     | Same                       | Telegram button       |
| `--social-vb`        | `#7360f2`                                     | Same                       | Viber button          |
| `--social-yt`        | `#ff0000`                                     | Same                       | YouTube button        |
| `--social-ig`        | Gradient (orange→purple)                      | Same                       | Instagram button      |

## Typography

### Font Stack

```css
--font-primary: "mergedFont", "Quicksand", sans-serif, "faruma";
```

| Font                     | Weight | Usage                                        |
| ------------------------ | ------ | -------------------------------------------- |
| Quicksand (Google Fonts) | 500    | English text                                 |
| Faruma (system)          | Normal | Dhivehi text fallback                        |
| mergedFont (custom)      | 300    | Both English + Dhivehi (merged .woff/.woff2) |

### Font Sizes

- **Body (English)**: 19px, line-height 1.6
- **Body (Dhivehi)**: 22px, line-height 1.7
- **Heading h1**: 28px
- **Basmala**: 28px
- **Price button**: Inherit (bold)
- **Modal contact text**: 14px

## Spacing

- **Page padding**: 30px (desktop), 15px (mobile via `@media print`)
- **Section separator**: `<hr>` with gradient, 3px height, 15px border-radius
- **Image gap**: 8px margin on `.flexItem`
- **Button padding**: `.resp-sharing-button` uses `0.5em 0.75em`

## Components

### Price Button

```css
.price {
  background: #b71c1c;
  color: #fff;
  border-radius: 12px;
  width: 300px;
  max-width: 100%;
  cursor: pointer;
  transition: all 0.25s ease-out;
}
.price:hover {
  transform: scale(1.15);
}
.price:hover:before {
  /* Glowing animated border effect */
  opacity: 1;
  background: linear-gradient(45deg, red, #002bff, red);
  animation: glowing 20s linear infinite;
}
```

### Social Media Button

```css
.resp-sharing-button {
  border-radius: 5px;
  padding: 0.5em 0.75em;
  transition: transform 0.25s ease-out;
}
.resp-sharing-button:hover {
  filter: brightness(90%);
  transform: scale(1.25);
}
```

### Tab System

```css
.tab {
  border: 1px solid #ccc;
  background: #136296;
  border-radius: 5px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.tab button {
  color: #eee;
  font-size: 18px;
  flex-grow: 1;
  min-width: 20%;
  width: 150px;
}
```

### Image Grid

```css
.flexRow {
  flex-wrap: wrap;
  place-content: flex-start center;
  display: flex;
}
.flexItem {
  flex-grow: 1;
  margin: 8px;
  max-width: 45% (≥900px);
}
.flexItem img {
  border-radius: 15px;
  box-shadow: 0 2px 3px #00000030;
}
```

### Modal

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000040;
  z-index: 999;
}
.modal-content {
  background: #0e1621; /* #fff in light mode */
  border-radius: 20px;
  max-width: 500px;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  animation: animatetop 0.4s;
}
```

## Responsive Breakpoints

| Breakpoint | Name             | Usage                          |
| ---------- | ---------------- | ------------------------------ |
| < 600px    | Phone            | Single column, hidden elements |
| 600px+     | Tablet Portrait  | Multi-column starts            |
| 900px+     | Tablet Landscape | Full layout                    |
| 1200px+    | Desktop          | Wide layout                    |
| 1800px+    | Big Desktop      | Ultra-wide                     |

## Animations

| Animation         | Duration            | Element                        |
| ----------------- | ------------------- | ------------------------------ |
| Tab fade-in       | 0.7s                | `.tabcontent`                  |
| Hover scale       | 0.25s ease-out      | Images, prices, social buttons |
| Price glow        | 20s linear infinite | `.price:before`                |
| Testimonial cycle | 30s (5s per item)   | `.quotes li`                   |
| Modal slide-in    | 0.4s                | `.modal-content`               |
| Scroll-to-top     | 0.5s                | `.toTop`                       |
| Link underline    | 0.275s              | `<a>` hover                    |
