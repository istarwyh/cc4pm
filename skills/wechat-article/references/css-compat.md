# WeChat Article CSS Compatibility Reference

## Supported Properties

| Category | Properties |
|----------|-----------|
| **Typography** | `font-size`, `font-weight`, `font-family`, `font-style`, `color`, `line-height`, `letter-spacing`, `word-spacing`, `text-align`, `text-indent`, `text-decoration`, `word-break`, `overflow-wrap`, `word-wrap`, `white-space` |
| **Box Model** | `margin` (all sides), `padding` (all sides), `width` (px), `max-width`, `height` |
| **Background** | `background`, `background-color`, `background-image` (WeChat CDN only), `background-size`, `background-repeat`, `background-position`, `linear-gradient()` |
| **Border** | `border`, `border-style`, `border-width`, `border-color`, `border-radius`, `border-left/right/top/bottom` |
| **Display** | `display: block`, `display: inline`, `display: inline-block`, `display: none`, `display: table` |
| **Shadow** | `box-shadow`, `text-shadow` |
| **Other** | `vertical-align`, `overflow`, `opacity`, `list-style-type` |

## Unsupported / Stripped Properties

| Property | Status | Alternative |
|----------|--------|------------|
| `display: flex` | Stripped | `display: inline-block` or vertical stacking |
| `display: grid` | Stripped | Vertical stacking or `<table>` |
| `position: absolute/fixed/relative` | Stripped | Document flow only |
| `float` | Unreliable | Avoid |
| `transform` | Stripped | None |
| `animation` / `@keyframes` | Stripped | None |
| `transition` | Stripped | None |
| `width: 50%` (percentage) | Unreliable | Use px values (max 590px) |
| `@font-face` / external fonts | Stripped | Use system font stack |
| `@media` queries | Stripped | None (inline only) |
| CSS variables (`var()`) | Not supported | Hardcode values |
| `calc()` | Not supported | Pre-calculate values |
| `z-index` | Not supported | No positioning |
| `::before` / `::after` | Not in inline | None |
| `overflow-x: auto` (scroll) | Unreliable | Keep content narrow |

## Safe Font Stack

```
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif
```

## Image Rules

- All `<img>` sources must use WeChat CDN (`mmbiz.qpic.cn`)
- Upload images via WeChat editor's image manager
- Use `style="display:block; max-width:100%; margin:20px auto; border-radius:8px;"` for images
- External image URLs are blocked

## Key Gotchas

- WeChat's iOS and Android renderers differ slightly — always test on real device
- WeChat may add wrapper styles that override inline styles
- Code blocks need explicit inline styling (no class-based syntax highlighting)
- Tables cannot overflow-scroll — keep them narrow or convert to stacked cards
- `<section>` is more reliable than `<div>` in WeChat
- The content area is approximately **590px** wide
