# Architecture Overview

## Current Architecture

The BirruMv website is a **single-page application (SPA)** built with vanilla HTML, CSS, and JavaScript. There is no build step or framework — the site is served as static files.

### File Roles

| File                  | Purpose                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `index.html`          | Main entry point — contains all HTML, inline CSS, and inline JavaScript                            |
| `minimal-mod.css`     | Core stylesheet (~1344 lines) — layout, typography, dark mode, social buttons, tabs, scroll-to-top |
| `minimal-mod.min.css` | Minified version of `minimal-mod.css` for production                                               |
| `merged-300.woff2`    | Custom merged font (WOFF2 format) — combines Quicksand + Faruma for bilingual support              |
| `merged-300.woff`     | Custom merged font (WOFF format) — fallback for older browsers                                     |
| `img/*.webp`          | Optimized WebP images (500px width)                                                                |

### Key Design Decisions

1. **No Framework**: The site uses zero dependencies. No React, Vue, or jQuery. This keeps the page lightweight and fast.

2. **Inline Everything**: CSS and JS are embedded directly in `index.html` for the critical path. This reduces HTTP requests and improves load time.

3. **Bilingual via CSS Classes**: English content uses `.eng` class (LTR, Quicksand font). Dhivehi content uses `.dv` class (RTL, mergedFont/Faruma). Both languages coexist on the same page.

4. **Dark/Light Mode**: Uses `@media (prefers-color-scheme: dark/light)` media queries. No JavaScript toggle needed.

5. **Tab System**: Custom vanilla JS tab implementation with fade animation. Two tabs: Wells and Aqiqah/Udhiya.

6. **Modal**: Custom modal for contact options (Messenger, WhatsApp, Telegram, Viber, Email, Call).

7. **Testimonial Carousel**: Pure CSS animation cycling through 6 testimonials with 30-second loop.

8. **Aqiqah Date Calculator**: Client-side JavaScript that calculates the 7th/14th/21st day after birth, accounting for Maghrib time.

### Data Flow

```
User clicks "Order Now" or price button
  → openModal() function called
  → Modal overlay displayed with contact options
  → User clicks a contact method
  → Opens in new tab (Messenger, WhatsApp, Telegram, etc.)
```

```
User selects birth date in calculator
  → setSecondDate() called
  → Calculates 7/14/21 days after birth
  → Displays two dates (before Maghrib / after Maghrib)
```

### Performance Considerations

- Images are pre-optimized to 500px width in WebP format
- Custom font is loaded with `font-display: block` (was `swap`)
- CSS is minified for production
- Google Analytics is loaded asynchronously
- Telegram widgets are loaded with `defer`

### Limitations

- All content is in a single HTML file — can become unwieldy
- No CSS preprocessing (no variables, mixins, nesting)
- No JavaScript modularization
- Commented-out dead code accumulates over time
- No automated testing
