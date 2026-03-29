---
trigger: always_on
---

# 🎨 Design System Guide: Volunteer Platform Kazakhstan

## 📌 1. Project Context & Philosophy
- **Domain:** Volunteer and Charity platform in Kazakhstan.
- **Vibe / Style:** "Warm Minimalism" (Теплый минимализм).
- **Core Emotion:** Trust, empathy, transparency, and urgency to help.
- **Target Audience:** Volunteers, NGOs, and people needing help in Kazakhstan (Mobile-first, all ages).
- **Design Rule #1:** The UI must NOT look like a hospital or an aggressive corporate site. It must feel like a modern, friendly app (similar to Kaspi or eGov style, but warmer).

---

## 🎨 2. Color Palette
The primary visual identity relies heavily on White (cleanliness, trust) and Dark Red (energy, heart, action).

### Brand Colors (Strict Usage)
- **Primary Canvas (Background):** `White` `#FFFFFF` (Use for 80% of the UI).
- **Primary Accent (Dark Red / Carmine):** `#9B111E` (Use STRICTLY for primary buttons, important icons, progress bars, and active states).
- **Primary Hover (Darker Red):** `#7A0D17` (Use for button hover states).

### Secondary & Surface Colors
- **Surface / Background 2:** `Light Gray` `#F7F8FA` (Use as a background behind white cards to create depth without borders).
- **Surface / Background 3:** `Gray 100` `#F3F4F6` (Use for inactive elements, skeleton loaders).

### Text Colors
- **Text Primary (Headings):** `Dark Charcoal` `#111827` (Never use pure black `#000000`).
- **Text Secondary (Body/Descriptions):** `Gray 500` `#6B7280`.
- **Text on Primary:** `White` `#FFFFFF` (Text inside Dark Red buttons).

---

## 📐 3. Typography
The platform requires excellent support for Cyrillic and specific Kazakh letters (қ, ғ, ң, ө, ұ, ү).

- **Primary Font Family:** `Inter` or `Golos Text` (Clean, modern sans-serif).
- **Headings (H1-H4):** Font weight `SemiBold` (600) or `Bold` (700). Letter-spacing slightly tight (`tracking-tight`).
- **Body Text:** Font weight `Regular` (400) or `Medium` (500). Line-height relaxed for readability (`leading-relaxed` or `1.6`).
- **Multilingual Support:** Always ensure UI elements (buttons, nav links) have enough padding to accommodate longer Kazakh words compared to Russian or English.

---

## 💠 4. UI Geometry & Elements (The "Warm" Feel)
To soften the contrast of Dark Red and White, use generous border radiuses and soft shadows.

### Shapes & Borders
- **Cards & Containers:** `Border Radius 16px` (Tailwind: `rounded-2xl`).
- **Buttons & Inputs:** `Border Radius 12px` (Tailwind: `rounded-xl`) or fully rounded (`rounded-full`).
- **Borders:** Avoid harsh borders. Prefer soft shadows or subtle border colors (`border-gray-100`).

### Shadows (Soft Elevation)
- **Cards:** Soft, diffuse shadow. Use `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);` (Tailwind custom shadow or `shadow-sm` / `shadow-md` with low opacity).

### Spacing (Whitespace)
- Use generous whitespace. Minimum gap between major sections: `64px` (`gap-16` or `py-16`).
- Padding inside cards: `24px` (`p-6`).

---

## 🇰🇿 5. Cultural Context (Kazakhstan)
- **Ornaments (Ою-өрнек):** If implementing traditional Kazakh patterns, they must be **ultra-subtle**. Use them as background watermarks or SVG patterns with maximum opacity of `3%` to `5%` over white backgrounds, or `10%` over the Dark Red background. They should not distract from the content.
- **Language Switcher:** Must be prominent in the Header (`KZ | RU | EN`).

---

## 💻 6. Tailwind CSS Implementation Rules (For AI)
When generating UI components, adhere to these Tailwind conventions:

**1. Buttons:**
- Primary: `bg-[#9B111E] hover:bg-[#7A0D17] text-white font-medium rounded-xl px-6 py-3 transition-colors duration-200`
- Secondary: `bg-white text-[#111827] border border-gray-200 hover:bg-gray-50 font-medium rounded-xl px-6 py-3 transition-colors duration-200`
- Ghost/Text: `text-[#9B111E] hover:bg-red-50 font-medium rounded-xl px-4 py-2 transition-colors duration-200`

**2. Cards (Projects / News):**
- Container: `bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]`
- Make sure cards sit on a `bg-[#F7F8FA]` main layout background for contrast.

**3. Layout (Mobile-First):**
- Default to column layouts (`flex-col`) for mobile screens.
- Use `md:grid-cols-2` or `lg:grid-cols-3` for desktop cards.
- Bottom Navigation bar is required for mobile views.

## 🚫 7. Anti-Patterns (What NOT to do)
- ❌ **DO NOT** use pure black (`#000000`) for text or backgrounds.
- ❌ **DO NOT** use sharp square corners (`rounded-none`).
- ❌ **DO NOT** use Dark Red as a large background color for main sections (it will look too aggressive/bloody). Use it strictly for accents, buttons, and small banner highlights.
- ❌ **DO NOT** clutter the UI. If in doubt, add more whitespace (`padding`/`margin`).