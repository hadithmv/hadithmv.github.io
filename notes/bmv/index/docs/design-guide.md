# Design Guide

## Color Palette

| Token             | Light Mode                    | Dark Mode                    | Usage              |
| ----------------- | ----------------------------- | ---------------------------- | ------------------ |
| `--primary`       | `#0d6e6e`                     | `#0d6e6e`                    | Main brand color   |
| `--primary-dark`  | `#0a5555`                     | `#4a9e9e`                    | Dark hover states  |
| `--primary-light` | `#e8f5f5`                     | `#1a3a3a`                    | Light backgrounds  |
| `--accent`        | `#c44536`                     | `#c44536`                    | Price buttons, CTA |
| `--accent-hover`  | `#a83a2e`                     | `#a83a2e`                    | Button hover       |
| `--gold`          | `#d4a843`                     | `#d4a843`                    | Accent underlines  |
| `--text`          | `#2d3436`                     | `#e0e0e0`                    | Body text          |
| `--text-light`    | `#636e72`                     | `#8899aa`                    | Secondary text     |
| `--bg`            | `#fafafa`                     | `#0e1621`                    | Page background    |
| `--bg-card`       | `#ffffff`                     | `#1a2533`                    | Card backgrounds   |
| `--shadow`        | `0 4px 20px rgba(0,0,0,0.08)` | `0 4px 20px rgba(0,0,0,0.3)` | Card shadows       |
| `--shadow-hover`  | `0 8px 30px rgba(0,0,0,0.15)` | `0 8px 30px rgba(0,0,0,0.4)` | Card hover shadows |

### Social Button Colors

| Platform  | Color   |
| --------- | ------- |
| Facebook  | #1877f2 |
| Viber     | #7360f2 |
| Twitter/X | #1d9bf0 |

## Typography

### Font Stack

```css
--font-family: "mergedFont", "Quicksand", sans-serif, "faruma";
```

| Font                     | Weight | Usage                                        |
| ------------------------ | ------ | -------------------------------------------- |
| Quicksand (Google Fonts) | 300    | English text                                 |
| Faruma (system)          | Normal | Dhivehi text fallback                        |
| mergedFont (custom)      | 300    | Both English + Dhivehi (merged .woff/.woff2) |

### Font Sizes

- **Body**: 1rem (16px at default), line-height 1.7
- **Heading h1**: 2rem
- **Heading h2**: 1.6rem
- **Heading h3**: 1.2rem
- **Basmala**: 1.4rem
- **Price button**: 1.1rem
- **Small text**: 0.85rem

## Spacing

- **Page padding**: 0 1.5rem (wrapper), 0 1rem (mobile)
- **Section separator**: `<hr>` with gradient, 2px height
- **Card padding**: 1.2rem
- **Carousel button size**: 36px × 36px

## Components

### Product Card

```css
.product-card {
  background: var(--bg-card);
  border-radius: var(--radius); /* 16px */
  overflow: hidden;
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
```

### Carousel Controls

```css
.product-card .carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  padding-bottom: 2px;
  /* ... */
}
.product-card .carousel-prev {
  left: 8px;
}
.product-card .carousel-next {
  right: 8px;
}
```

### Price Button

```css
.product-card .card-price {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 0.7rem 2rem;
  font-family: "Quicksand", sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}
.product-card .card-price:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(196, 69, 54, 0.35);
}
```

### Social Media Button

```css
.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}
.social-btn:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

### Tab System

```css
.tab-nav {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius); /* 16px */
  overflow: hidden;
  border: 2px solid var(--primary);
  margin-bottom: 2rem;
}
.tab-btn {
  flex: 1;
  padding: 1rem 0.75rem;
  border: none;
  background: transparent;
  font-family: "mergedFont", "Quicksand", sans-serif, "faruma";
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-light);
  cursor: pointer;
  transition: all var(--transition);
}
.tab-btn.active {
  color: #fff;
  background: var(--primary);
}
```

### Expandable Section Button

```css
.expand-toggle {
  display: block;
  width: 100%;
  text-align: center;
  padding: 1rem;
  background: var(--primary-light);
  border: none;
  border-radius: var(--radius-sm); /* 10px */
  cursor: pointer;
  font-family: "mergedFont", "Quicksand", sans-serif, "faruma";
  font-size: 1rem;
  color: var(--primary-dark);
  transition: all var(--transition);
  margin: 1rem 0;
}
.expand-toggle:hover {
  background: var(--primary);
  color: #fff;
}
```

### Modal

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-overlay.open {
  display: flex;
}
.modal-box {
  background: var(--bg-card);
  border-radius: var(--radius); /* 16px */
  padding: 1.25rem 1.5rem;
  max-width: 420px;
  width: 100%;
  animation: modalIn 0.3s ease-out;
}
```

### Testimonial Card

```css
.testimonial-card {
  background: var(--bg-card);
  border-radius: var(--radius); /* 16px */
  padding: 1.5rem;
  box-shadow: var(--shadow);
  position: relative;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
  overflow: hidden;
}
.testimonial-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, var(--gold), var(--primary));
  border-radius: var(--radius) var(--radius) 0 0;
}
```

## Responsive Breakpoints

| Breakpoint | Name             | Usage                          |
| ---------- | ---------------- | ------------------------------ |
| < 600px    | Phone            | Single column, hidden elements |
| 600px+     | Tablet Portrait  | Multi-column starts            |
| 768px+     | Tablet Landscape | 2-column product grid          |
| 900px+     | Desktop          | 3-column testimonials grid     |

## Animations

| Animation      | Duration          | Element                    |
| -------------- | ----------------- | -------------------------- |
| Tab fade-in    | 0.4s ease-out     | `.tab-content`             |
| Hover lift     | 0.3s cubic-bezier | Product cards, testimonial |
| Button scale   | 0.3s              | Price buttons on hover     |
| Social hover   | 0.3s              | Social icons on hover      |
| Modal slide-in | 0.3s ease-out     | `.modal-box`               |
| FadeIn         | 0.4s ease-out     | Tab content appearance     |
| Bob animation  | 1.2s ease-in-out  | Tab hint indicator         |

## CSS Custom Properties

```css
:root {
  --primary: #0d6e6e;
  --primary-dark: #0a5555;
  --primary-light: #e8f5f5;
  --accent: #c44536;
  --accent-hover: #a83a2e;
  --gold: #d4a843;
  --text: #2d3436;
  --text-light: #636e72;
  --bg: #fafafa;
  --bg-card: #ffffff;
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.15);
  --radius: 16px;
  --radius-sm: 10px;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --max-width: 1100px;
}
```
