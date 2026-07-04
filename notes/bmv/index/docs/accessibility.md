# Accessibility Notes

## Current State

### ✅ Good Practices

- `lang="dv"` on `<html>` — correct primary language declaration
- `notranslate` meta tag — prevents automatic translation of Dhivehi content
- Semantic HTML elements used (`<h1>`, `<h2>`, `<h3>`, `<ul>`, `<li>`)
- Images have `alt` attributes
- Links open in `target="_blank"` with clear purpose
- Color contrast is generally good (dark text on light background, light text on dark background)
- `prefers-color-scheme` media query for dark/light mode
- `prefers-reduced-motion` could be added for animations

### ❌ Areas for Improvement

#### 1. Skip Navigation Link

Add a skip-to-content link for keyboard users:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

#### 2. ARIA Labels

- Modal needs `role="dialog"` and `aria-modal="true"`
- Tab buttons need `role="tab"`, `aria-selected`, and `aria-controls`
- Tab panels need `role="tabpanel"` and `aria-labelledby`
- Social media links need descriptive `aria-label` (e.g., "Follow us on Facebook" instead of empty)
- Expandable sections (Udhiya/Aqiqah info) need `aria-expanded` state

#### 3. Focus Management

- Modal should trap focus when open
- Tab focus should move to first focusable element in modal
- Close button should receive focus when modal opens
- Tab panel content should be focusable

#### 4. Keyboard Navigation

- Tab buttons work with click but should also work with Enter/Space
- Expandable sections (Udhiya/Aqiqah) use `onclick` on `<h3>` — should be `<button>` elements
- Price buttons use `onclick` on `<h3>` — should be `<button>` elements

#### 5. Image Alt Text

Current alt texts are generic:

- `alt="sadaqa"` → should be `alt="Goat for Aqiqah in Africa"`
- `alt="aqeeqa"` → should be `alt="Well construction in Nepal"`
- `alt="water well"` → should be `alt="Community well in Africa with hand pump"`

#### 6. Language Declaration

- `lang="dv"` on `<html>` is correct for Dhivehi
- English content should be wrapped with `lang="en"` or `span lang="en"`
- Consider adding `hreflang` tags for bilingual SEO

#### 7. Heading Hierarchy

- Page has `h1` (Basmala), then `h2` (tagline), then `h3` (section titles) — good structure
- But some `h3` elements are used for clickable actions (prices, expandable sections) — should be buttons

#### 8. Touch Targets

- Social media buttons are adequately sized (≥44px recommended)
- Price buttons are 300px wide — good
- Tab buttons are 150px wide — adequate

## Recommended Fixes

### Modal

```html
<div
  id="myModal"
  class="modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div class="modal-content">
    <h2 id="modal-title">How would you like to contact us?</h2>
    ...
  </div>
</div>
```

### Tab System

```html
<div class="tab" role="tablist">
  <button
    class="tablinks"
    role="tab"
    aria-selected="false"
    aria-controls="tabTwo"
    onclick="openTab(event, 'tabTwo')"
  >
    Wells - ފެންވަޅު
  </button>
  ...
</div>
<div id="tabTwo" class="tabcontent" role="tabpanel" aria-labelledby="tabTwo">
  ...
</div>
```

### Price Buttons

```html
<button
  class="price"
  onclick="openModal()"
  aria-label="Order Nepal Standard Well for 4500 MVR"
>
  <b>4500/- MVR</b>
</button>
```

### Expandable Sections

```html
<button
  class="expand-btn"
  onclick="showhide()"
  aria-expanded="false"
  aria-controls="hiddenPost"
>
  Click here to learn more about the Aqiqah
</button>
```
