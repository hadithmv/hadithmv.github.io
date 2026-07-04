# Maintenance Guide

## How to Update Prices

Prices are plain text inside `<b>` tags within `.price` divs. To update:

1. Open `index.html`
2. Search for the price you want to change (e.g., `4500/- MVR`)
3. Replace with the new price

**Example:**

```html
<!-- Before -->
<h3 class="price" onclick="openModal()"><b>4500/- MVR</b></h3>

<!-- After -->
<h3 class="price" onclick="openModal()"><b>5000/- MVR</b></h3>
```

## How to Add a New Product

### 1. Prepare the Image

- Resize to 500px width
- Convert to WebP format (use [squoosh.app](https://squoosh.app) or similar)
- Save to `img/` folder with a descriptive filename (e.g., `well-ethiopia-500px.webp`)

### 2. Add the HTML

Copy an existing product block and modify:

```html
<!-- Image Row -->
<div class="flexRow">
  <img
    alt="descriptive alt text"
    class="flexItem"
    src="img/your-new-image.webp"
    loading="lazy"
    width="500"
  />
</div>
<br />

<!-- Title Row (Bilingual) -->
<div class="flexRow">
  <div class="flexItem">
    <h3 class="iTitle">English Title</h3>
  </div>
  <div class="flexItem dv">
    <h3 class="iTitle">Dhivehi Title</h3>
  </div>
</div>
<br />

<!-- Price -->
<div class="Pr">
  <h3 class="price" onclick="openModal()"><b>9999/- MVR</b></h3>
</div>
<br />
<hr />
<br />
```

### 3. Add to the Correct Tab

- **Wells tab** (`id="tabTwo"`): Add after existing well products
- **Aqiqah/Udhiya tab** (`id="tabThree"`): Add after existing sacrifice products

## How to Update Social Media Links

Social media icons are in the header section:

```html
<div style="direction:ltr">
  <a href="http://fb.me/birrumv" class="noLine resp-sharing-button__link" ...>
    <!-- Facebook -->
  </a>
  <a
    href="https://invite.viber.com/..."
    class="noLine resp-sharing-button__link"
    ...
  >
    <!-- Viber -->
  </a>
  <!-- ... more social links ... -->
</div>
```

To add a new social platform:

1. Copy an existing `<a>` block
2. Update the `href` with your new URL
3. Add the appropriate icon CSS class (or create a new one in `minimal-mod.css`)
4. Add the button color class (e.g., `.fbBtn`, `.tgBtn`)

## How to Update Contact Methods

Contact methods are in the modal (`id="myModal"`):

```html
<div class="modal" id="myModal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <div class="mid">
      <h2>How would you like to contact us?</h2>
      <hr />
      <br />
      <h3><a href="http://m.me/birrumv" ...>Messenger</a></h3>
      <br />
      <h3><a href="https://wa.me/..." ...>WhatsApp</a></h3>
      <br />
      <!-- ... more contact methods ... -->
    </div>
  </div>
</div>
```

To add a new contact method:

1. Copy an existing `<h3><a>...</a></h3>` block
2. Update the `href` with your contact URL
3. Update the icon class and text

## How to Update Testimonials

Testimonials are in the `<ul class="quotes">` section:

```html
<ul class="quotes" id="quotes">
  <li class="show">
    ⭐⭐⭐⭐⭐
    <span class="stars"></span>
    "Testimonial text here."
    <span>-Customer Name.</span>
  </li>
  <!-- ... more testimonials ... -->
</ul>
```

To add a new testimonial:

1. Copy an existing `<li>` block
2. Update the star rating, text, and customer name
3. Add the CSS animation timing (see `@keyframes quote` in the inline `<style>`)

**Animation timing formula:**

- Each testimonial gets 5 seconds of display time
- Total cycle: 30 seconds (6 testimonials × 5s)
- Add `animation: 30s Xs infinite quote` where X = (index - 1) × 5

## How to Update the Aqiqah Date Calculator

The calculator is in the `#jumpCalcHere` section. It uses:

- `<input type="date">` for birth date
- `<select>` for days to count (7, 14, 21)
- JavaScript `setSecondDate()` function

To modify:

- **Change default days**: Edit `<option>` values in `<select id="selectDays">`
- **Change calculation logic**: Edit the `setSecondDate()` function
- **Change output format**: Edit the `toDateString()` call or replace with `toLocaleDateString()`

## How to Update Fonts

1. Generate new WOFF2/WOFF font files
2. Replace `merged-300.woff2` and `merged-300.woff` in the root
3. Update the `@font-face` declaration in `minimal-mod.css` if filenames change

## How to Minify CSS

Run the PowerShell script:

```powershell
.\0 MINIFY-html-and-css.ps1
```

Or manually:

1. Copy `minimal-mod.css` content
2. Use an online minifier (e.g., [cssminifier.com](https://cssminifier.com))
3. Save output to `minimal-mod.min.css`

## Deployment Checklist

- [ ] Prices updated and correct
- [ ] Images optimized (WebP, 500px width)
- [ ] CSS minified
- [ ] Tested in dark/light mode
- [ ] Tested on mobile (Chrome DevTools device emulation)
- [ ] Testimonials animation timing correct
- [ ] All links working (social, contact, Telegram embeds)
- [ ] Google Analytics tag present
- [ ] Canonical URL correct
- [ ] No broken images
- [ ] Aqiqah calculator working correctly
