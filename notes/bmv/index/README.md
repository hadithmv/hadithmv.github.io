# BirruMv — Only the Best Wells & Aqiqah

![BirruMv Logo](index/img/birrumv-logo-2.0.svg)

> **BirruMv** is a Maldivian charitable initiative providing well construction (Nepal, Africa) and Aqiqah/Udhiya sacrifice services across multiple African countries.

---

## 📁 Directory Structure

```
bmv/
├── index/                    # Website root (deployed)
│   ├── index.html           # Main landing page
│   ├── minimal-mod.css      # Core stylesheet
│   ├── minimal-mod.min.css  # Minified stylesheet
│   ├── merged-300.woff      # Custom font (WOFF)
│   ├── merged-300.woff2     # Custom font (WOFF2)
│   ├── img/                 # Image assets
│   ├── src/                 # Source files (modular, redesigned)
│   ├── docs/                # Project documentation
│   └── old/                 # Archived previous versions
```

---

## ✨ Key Features

- **Bilingual**: English & Dhivehi (ދިވެހި)
- **Dark/Light Mode**: Auto-detects system preference
- **Responsive**: Mobile-first design
- **Fast**: Minified CSS, optimized images (WebP), custom fonts
- **Accessible**: Semantic HTML, screen-reader friendly

---

## 🚀 Services Offered

| Service                  | Region | Price Range |
| ------------------------ | ------ | ----------- |
| Standard Hand Pump Well  | Nepal  | 4,500 MVR   |
| Electric Motor Pump Well | Nepal  | 6,500 MVR   |
| Goat (Aqiqah/Udhiya)     | Africa | 749 MVR     |
| Sheep (Aqiqah/Udhiya)    | Africa | 995 MVR     |
| Cow (Aqiqah/Udhiya)      | Africa | 5,650 MVR   |

---

## 🛠 Maintenance

### Updating Prices

Edit the `.price` text in `index.html` — prices are plain text within `<b>` tags.

### Adding Products

1. Add a new image to `img/` (500px width, WebP format recommended)
2. Copy an existing product block (`.flexRow` + `.Pr`)
3. Update image `src`, title text, and price text

### Fonts

- Custom merged font files: `merged-300.woff2` and `merged-300.woff`
- Font is defined in `minimal-mod.css` under `@font-face`
- To update: replace font files and update the `url()` paths

### Social Media Links

Edit the social button blocks in `<div style="direction:ltr">` near the top of the page.

### Contact Methods

Edit the modal content inside `<div id="myModal">` — add/remove contact method links.

---

## 🌐 Deployment

The site is deployed via **GitHub Pages** at [birrumv.com](https://birrumv.com).

To deploy:

```bash
git add .
git commit -m "Update description"
git push origin main
```

---

## 📄 License

Copyright © BirruMv — All Rights Reserved

---

## 📞 Contact

- **Facebook**: [fb.me/birrumv](http://fb.me/birrumv)
- **Telegram**: [t.me/birrumv](http://t.me/birrumv)
- **Viber**: [Invite Link](https://invite.viber.com/?g2=AQA%2BbvnySNQHZEy9axm1ck2TX/ZVrvGtq/bJboZzADy3OssLND4H1TFWklNmNQZC)
- **WhatsApp**: [Chat](https://wa.me/message/IVXJAT4EBQ35C1)
- **Instagram**: [@birrumv](https://instagram.com/birrumv)
- **Twitter/X**: [@birrumv](https://twitter.com/birrumv)
- **YouTube**: [@birrumv](https://www.youtube.com/@birrumv)
- **Email**: birrumv@gmail.com
