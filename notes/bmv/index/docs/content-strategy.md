# Content Strategy

## Bilingual Approach

The BirruMv website serves a **Maldivian audience** (Dhivehi-speaking) while also being accessible to **English-speaking international visitors**. The content strategy reflects this dual audience.

### Language Rules

| Context                                 | Language            | CSS Class                | Direction | Font                   |
| --------------------------------------- | ------------------- | ------------------------ | --------- | ---------------------- |
| Brand name, logo                        | English             | `.eng`                   | LTR       | Quicksand              |
| Service descriptions                    | Both                | `.eng` / `.dv`           | LTR / RTL | Quicksand / mergedFont |
| Islamic terms (Basmala, Aqiqah, Udhiya) | Arabic/English      | `.eng`                   | LTR       | mergedFont             |
| Step-by-step instructions               | Both (parallel)     | `.eng` / `.dv`           | LTR / RTL | Respective fonts       |
| Product titles                          | Both (side-by-side) | `.flexRow` > `.flexItem` | LTR / RTL | Respective fonts       |
| Legal/religious text                    | English             | `.eng`                   | LTR       | Quicksand              |

### Content Layout Pattern

For bilingual content, the pattern is:

```html
<div class="flexRow">
  <div class="flexItem">
    <h3 class="iTitle">English Title</h3>
  </div>
  <div class="flexItem dv">
    <h3 class="iTitle">Dhivehi Title</h3>
  </div>
</div>
```

## Content Hierarchy

### Page Sections (Top to Bottom)

1. **Header**: Basmala → Logo → Tagline → Social Media Icons
2. **Navigation**: Tab bar (Wells | Aqiqah/Udhiya)
3. **Wells Tab**:
   - Well Construction intro (bullet points)
   - Nepal Family Wells (products with images)
   - Additional Info
   - Telegram embed
4. **Aqiqah/Udhiya Tab**:
   - Steps to order (English + Dhivehi)
   - Products (Goat, Sheep, Cow with images)
   - Udhiya info (expandable)
   - Aqiqah info (expandable)
   - Aqiqah Date Calculator
   - Additional Info
   - Telegram embed
5. **Testimonials**: CSS-animated carousel
6. **Footer**: Social links, copyright

## Writing Guidelines

### Tone

- **Warm and Islamic**: Begin with Basmala, use Islamic greetings
- **Trustworthy**: Emphasize quality, Islamic compliance, proof (photos/videos)
- **Clear**: Bullet points for features, simple pricing display
- **Action-oriented**: Clear CTAs ("Click on the price", "Order Now")

### Key Messaging

- "Only the Best" — quality assurance
- "Photos & videos as proof" — transparency
- "Islamic guidelines" — religious compliance
- "Sadaqa Jariya" — ongoing charity (wells)
- "Affordable prices" — value proposition

## SEO Keywords (English)

- BirruMv
- Wells in Nepal
- Aqiqah service
- Udhiya sacrifice
- Sadaqa Jariya
- Charity from Maldives
- Islamic sacrifice abroad

## SEO Keywords (Dhivehi)

- ފެންވަޅު ހަދައިދޭ
- އަގީގާ
- އުޟްހިޔާ
- ޞަދަޤާތް ޖާރިޔާ
- ބިއްރުއެމްވީ
