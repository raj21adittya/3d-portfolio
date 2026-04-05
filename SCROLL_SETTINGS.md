# Scroll Speed Settings

## Scroll Speed Cap (`src/components/Navbar.tsx`)

```typescript
const MAX_DELTA = 80;
document.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaY) > MAX_DELTA) {
      e.preventDefault();
      const clampedDelta = Math.sign(e.deltaY) * MAX_DELTA;
      window.scrollBy(0, clampedDelta);
    }
  },
  { passive: false, capture: true }
);
```

### Settings

| Setting | Current Value | What it controls |
|---|---|---|
| `MAX_DELTA` | `90` | **Max pixels per wheel tick.** This is the main knob. Lower = slower max speed (try `50` for very slow), higher = faster (try `120` for looser cap). Normal gentle scroll is ~30-50px, fast flick can be 300-500px. |
| `capture: true` | -- | Intercepts wheel events **before** ScrollSmoother sees them. Without this, ScrollSmoother processes the raw scroll first and the cap doesn't work. Don't change this. |
| `passive: false` | -- | Allows `preventDefault()` on wheel events. Required for the cap to work. Don't change this. |

## ScrollSmoother Settings (`src/components/Navbar.tsx`)

```typescript
smoother = ScrollSmoother.create({
  smooth: 1.7,
  speed: 1.7,
  ...
});
```

### Settings

| Setting | Current Value | What it controls |
|---|---|---|
| `smooth` | `1.7` | **Lerp duration in seconds.** How long the page takes to "catch up" to the scroll position. Higher = smoother/slower easing. Try `2.5` for buttery, `1` for snappy. |
| `speed` | `1.7` | **Scroll distance multiplier.** `1` = normal, `<1` = less distance per scroll, `>1` = more distance. This multiplies the scroll amount *before* the cap. |

## Quick Tuning Guide

- **Want slower max scroll?** Lower `MAX_DELTA` (e.g., `50`)
- **Want smoother easing after scroll stops?** Increase `smooth` (e.g., `2.5`)
- **Want each scroll tick to cover less ground overall?** Lower `speed` (e.g., `1.0`)
