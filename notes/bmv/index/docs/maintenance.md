# Maintenance Guide

## Project Structure

```
bmv/index/
├── index.html              # Main page — edit for content changes
├── css/style.css           # Core stylesheet — edit for style changes
├── js/main.js              # JavaScript — edit for behavior changes
├── img/                    # Product/asset images (WebP, 500px)
├── font/                   # Custom font files (WOFF2, WOFF)
├── info/                   # Expandable section content (markdown)
│   ├── aqiqah.md
│   └── udhiya.md
└── docs/                   # Project documentation
```

## How to Update Prices

Prices are plain text inside `.card-price` buttons. To update:

1. Open `index.html`
2. Search for the price you want to change (e.g., `4,500/- MVR`)
3. Replace with the new price

**Example:**

```html
<!-- Before -->
<button
  class="card-price"
  onclick="openModal()"
  aria-label="Order Nepal Standard Well for 4500 MVR"
>
  4,500/- MVR
</button>

<!-- After -->
<button
  class="card-price"
  onclick="openModal()"
  aria-label="Order Nepal Standard Well for 5000 MVR"
>
  5,000/- MVR
</button>
```

## How to Add a New Product

### 1. Prepare the Image

- Resize to 500px width
- Convert to WebP format (use [squoosh.app](https://squoosh.app) or similar)
- Save to `img/` folder with a descriptive filename (e.g., `well-ethiopia-500px.webp`)

### 2. Add the Carousel HTML

Each product card has an image carousel. Copy an existing `.product-card` block and modify:

```html
<div class="product-card">
  <div class="carousel" data-carousel="uniqueId">
    <div class="carousel-track">
      <img
        src="img/your-new-image.webp"
        alt="Descriptive alt text"
        loading="lazy"
      />
      <!-- Add more <img> tags for multiple images -->
    </div>
    <!-- Carousel controls (only if more than 1 image) -->
    <button class="carousel-btn carousel-prev" aria-label="Previous image">
      ‹
    </button>
    <button class="carousel-btn carousel-next" aria-label="Next image">
      ›
    </button>
    <div class="carousel-dots">
      <span class="active"></span>
      <span></span>
    </div>
  </div>
  <div class="card-body">
    <div class="card-title">English Title</div>
    <div class="card-title-dv">Dhivehi Title</div>
    <button
      class="card-price"
      onclick="openModal()"
      aria-label="Order Product for PRICE MVR"
    >
      PRICE/- MVR
    </button>
  </div>
</div>
```

### 3. Add to the Correct Tab

- **Wells tab** (`id="tabTwo"`): Add after existing well products
- **Aqiqah/Udhiya tab** (`id="tabThree"`): Add after existing sacrifice products

## How to Update Expandable Info Sections

Expandable sections (Udhiya and Aqiqah info) load their content from markdown files in the `info/` folder.

### Update Content

1. Open the relevant file in `info/`:
   - `info/udhiya.md` — Udhiya information
   - `info/aqiqah.md` — Aqiqah information
2. Edit the markdown content
3. Content is split by double newlines (`\n\n`) into paragraphs

### Add a New Expandable Section

1. Create a new markdown file in `info/` (e.g., `info/faq.md`)
2. Add the button and content container in `index.html`:
   ```html
   <button
     class="expand-toggle"
     onclick="toggleExpand('faqInfo')"
     aria-expanded="false"
   >
     Click here to learn more about the FAQ
   </button>
   <div class="expand-content" id="faqInfo"></div>
   ```

## How to Update Social Media Links

Social media icons are in the header `.social-bar` section:

```html
<div class="social-bar">
  <a
    href="http://fb.me/birrumv"
    class="social-btn"
    style="background: #1877f2"
    target="_blank"
    rel="noopener"
    aria-label="Facebook"
  >
    <svg viewBox="0 0 24 24">...</svg>
  </a>
  <!-- ... more social links ... -->
</div>
```

To add a new social platform:

1. Copy an existing `.social-btn` block
2. Update the `href` with your new URL
3. Update the SVG icon path
4. Set the background color to match the platform's brand color
5. Update the `aria-label`

## How to Update Contact Methods

Contact methods are in the modal (`id="myModal"`):

```html
<a
  href="http://m.me/birrumv"
  class="contact-item"
  target="_blank"
  rel="noopener"
>
  <span class="icon-wrap" style="background: #1877f2">
    <svg viewBox="0 0 24 24">...</svg>
  </span>
  Messenger
</a>
```

To add a new contact method:

1. Copy an existing `.contact-item` block
2. Update the `href` with your contact URL
3. Add an appropriate SVG icon
4. Update the text

## How to Update Testimonials

Testimonials are in the `.testimonials-grid` section:

```html
<div class="testimonial-card">
  <span class="stars">⭐⭐⭐⭐⭐</span>
  <p class="quote">"Testimonial text here."</p>
  <span class="author">— Customer Name</span>
</div>
```

To add a new testimonial:

1. Copy an existing `.testimonial-card` block
2. Update the star rating, quote text, and author name
3. No CSS animation timing needed — the grid layout handles display

## How to Update Fonts

1. Generate new WOFF2/WOFF font files
2. Replace files in `font/`:
   - `font/merged-300.woff2`
   - `font/merged-300.woff`
3. Update the `@font-face` declaration in `css/style.css` if filenames change

## How to Edit Styles

All styles are in `css/style.css`. The file is organized with clear section comments:

- `:root` — CSS custom properties (colors, shadows, transitions)
- Typography — headings, paragraphs, links
- Components — hero, tabs, product cards, carousel, modal, footer
- `@media (prefers-color-scheme: dark)` — dark mode overrides
- `@media (max-width: 599px)` — responsive overrides

## How to Edit JavaScript

All JavaScript is in `js/main.js`. Key functions:

| Function                   | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `goTo(i)`                  | Navigate carousel to specific image index   |
| `next() / prev()`          | Next/previous carousel image                |
| `startAuto() / stopAuto()` | Auto-play carousel on timer                 |
| `openTab(tabId)`           | Switch between Wells and Aqiqah/Udhiya tabs |
| `openModal()`              | Show contact modal                          |
| `closeModal()`             | Hide contact modal                          |
| `toggleExpand(id)`         | Load and expand/collapse info section       |
| `setSecondDate()`          | Calculate Aqiqah dates                      |
| `jumpCalc()`               | Scroll to calculator                        |

## Deployment Checklist

- [ ] Prices updated and correct
- [ ] Images optimized (WebP, 500px width)
- [ ] Tested in dark/light mode
- [ ] Tested on mobile (Chrome DevTools device emulation)
- [ ] All links working (social, contact, Telegram embeds)
- [ ] Google Analytics tag present
- [ ] Canonical URL correct
- [ ] No broken images
- [ ] Aqiqah calculator working correctly
- [ ] Carousel auto-play working on all product cards
- [ ] Expandable sections load content correctly
