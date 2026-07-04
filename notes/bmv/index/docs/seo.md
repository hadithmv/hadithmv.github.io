# SEO & Meta Tags

## Current Meta Tags

```html
<title>BirruMv — Only the Best Wells & Aqiqah</title>
<meta name="description" content="BirruMv — Only the Best Wells & Aqiqah" />
<link rel="canonical" href="https://birrumv.com" />
<meta property="og:title" content="birrumv" />
<meta property="og:type" content="website" />
<meta property="og:url" content="birrumv.com" />
<meta
  property="og:image"
  content="https://birrumv.com/img/birrumv-logo-2.0-og-1080px-min.png"
/>
```

## Recommendations for Improvement

### Title Tag

Current: `BirruMv — Only the Best Wells & Aqiqah`

- ✅ Good length (~40 chars)
- ✅ Includes brand name
- ✅ Describes service
- Consider adding location: `BirruMv — Best Wells & Aqiqah Services in Maldives`

### Meta Description

Current: `BirruMv — Only the Best Wells & Aqiqah`

- ❌ Too short (only 37 chars)
- ❌ Duplicates title
- Recommended: `BirruMv offers affordable well construction in Nepal & Aqiqah/Udhiya sacrifices in Africa. Islamic charity services for Maldivians. Photos & videos as proof.`

### Open Graph

- `og:title` should match `<title>` (currently lowercase "birrumv")
- `og:description` is missing — add it matching meta description
- `og:image` is good (1200×630px recommended for social sharing)

### Additional Meta Tags to Add

```html
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="BirruMv — Only the Best Wells & Aqiqah" />
<meta name="twitter:description" content="..." />
<meta
  name="twitter:image"
  content="https://birrumv.com/img/birrumv-logo-2.0-og-1080px-min.png"
/>

<!-- Additional OG -->
<meta property="og:locale" content="en_US" />
<meta property="og:site_name" content="BirruMv" />

<!-- Mobile -->
<meta name="format-detection" content="telephone=yes" />

<!-- Verification (if needed) -->
<meta name="google-site-verification" content="..." />
```

## Structured Data (JSON-LD)

Consider adding this for rich search results:

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BirruMv",
    "url": "https://birrumv.com",
    "logo": "https://birrumv.com/img/birrumv-logo-2.0.svg",
    "description": "Well construction and Aqiqah/Udhiya sacrifice services",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+960-772-7960",
      "contactType": "customer service",
      "availableLanguage": ["English", "Dhivehi"]
    },
    "sameAs": [
      "https://fb.me/birrumv",
      "https://t.me/birrumv",
      "https://instagram.com/birrumv",
      "https://twitter.com/birrumv",
      "https://youtube.com/@birrumv"
    ]
  }
</script>
```

## Performance SEO

- ✅ Images are WebP format (modern, efficient)
- ✅ Images are 500px width (appropriate size)
- ✅ CSS is minified (`minimal-mod.min.css`)
- ✅ Google Analytics loaded async
- ✅ Custom font loaded with `font-display: block`
- ❌ No lazy loading on above-the-fold images (but `loading="lazy"` on below-fold)
- ✅ Canonical URL set
- ✅ Viewport meta tag set
- ✅ Theme color meta tag set (`#29434e`)

## Accessibility SEO

- ✅ `lang="dv"` on HTML tag (correct for primary language)
- ✅ `notranslate` meta tag (prevents automatic translation of Dhivehi)
- ❌ Missing `hreflang` tags for bilingual content
- ❌ Images have `alt` text but could be more descriptive
- ❌ No skip-to-content link
- ❌ Tab focus order could be improved
