# Architecture Overview

## Current Architecture

The BirruMv website is a **single-page application (SPA)** built with vanilla HTML, CSS, and JavaScript. There is no build step or framework — the site is served as static files.

### File Roles

| File                    | Purpose                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `index.html`            | Main entry point — contains all semantic HTML structure                                   |
| `style.css`             | Core stylesheet — layout, typography, dark mode, carousel, tabs, modal, footer            |
| `main.js`               | JavaScript — carousels, tab system, modal, expandable sections, calculator, scroll-to-top |
| `font/merged-300.woff2` | Custom merged font (WOFF2 format) — combines Quicksand + Faruma for bilingual support     |
| `font/merged-300.woff`  | Custom merged font (WOFF format) — fallback for older browsers                            |
| `img/*.webp`            | Optimized WebP images (500px width)                                                       |
| `info/aqiqah.md`        | Aqiqah information content (loaded dynamically)                                           |
| `info/udhiya.md`        | Udhiya information content (loaded dynamically)                                           |

### Key Design Decisions

1. **No Framework**: The site uses zero dependencies. No React, Vue, or jQuery. This keeps the page lightweight and fast.

2. **Modular Structure**: HTML, CSS, and JavaScript are split into separate files (`index.html`, `style.css`, `main.js`) for maintainability.

3. **Bilingual via CSS Classes**: English content uses `.eng` class (LTR, Quicksand font). Dhivehi content uses `.dv` class (RTL, mergedFont/Faruma). Both languages coexist on the same page.

4. **Dark/Light Mode**: Uses `@media (prefers-color-scheme: dark/light)` media queries. No JavaScript toggle needed.

5. **Tab System**: Custom vanilla JS tab implementation with fade animation. Two tabs: Wells and Aqiqah/Udhiya.

6. **Image Carousel**: Each product card has its own carousel with prev/next buttons, dot indicators, and auto-play.

7. **Modal**: Custom modal for contact options (Messenger, WhatsApp, Telegram, Viber, Email, Call).

8. **Expandable Sections**: Udhiya and Aqiqah info content is loaded dynamically from `info/` markdown files via `fetch()`.

9. **Aqiqah Date Calculator**: Client-side JavaScript that calculates the 7th/14th/21st day after birth, accounting for Maghrib time.

### Data Flow

```
User clicks "Order Now" or price button
  → openModal() function called
  → Modal overlay displayed with contact options
  → User clicks a contact method
  → Opens in new tab (Messenger, WhatsApp, Telegram, etc.)
```

```
User clicks "Click here to learn more" (expandable section)
  → toggleExpand(id) called
  → If content not loaded yet, fetches info/{id}.md via fetch()
  → Processes markdown into HTML paragraphs
  → Displays content with slide-in animation
```

```
User selects birth date in calculator
  → setSecondDate() called
  → Calculates 7/14/21 days after birth
  → Displays two dates (before Maghrib / after Maghrib)
```

### Performance Considerations

- Images are pre-optimized to 500px width in WebP format
- Custom font is loaded with `font-display: swap`
- Google Analytics is loaded asynchronously
- Telegram widgets are loaded with `defer`
- Dynamic content is fetched only when user expands the section

### CSS Organization

The stylesheet (`style.css`) follows a modular structure with clear section comments:

```
Variables          → :root custom properties
Reset              → Box-sizing, margin/padding
Typography         → Headings, paragraphs, links
Hero               → Header, logo, social bar
Tabs               → Navigation, content panels
Product Cards      → Image grid, carousel, pricing
Expandable Sections → Info buttons and content
Steps              → Order instructions
Calculator         → Aqiqah date calculator
Testimonials       → Review cards
Modal              → Contact overlay
Footer             → Full-width footer
Scroll-to-Top      → Fixed position button
Dark Mode          → prefers-color-scheme overrides
Responsive         → Media queries
```

### Limitations

- No CSS preprocessing (no variables, mixins, nesting) — using native CSS custom properties instead
- No JavaScript modularization (single file with section comments)
- No automated testing
