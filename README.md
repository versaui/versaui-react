<div align="center">

<svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.4667 7.20003L24.8 3.53337L18.2 10.1334V1.33337H13.8V6.59252C13.8 6.9815 13.9545 7.35456 14.2296 7.62961L20.0963 13.4963C20.5633 13.9634 21.2671 14.0495 21.8215 13.7548C21.9469 13.6882 22.0647 13.602 22.1704 13.4963L28.4667 7.20003Z" fill="currentColor"/>
<path d="M7.19999 3.53337L13.4962 9.82961C13.6019 9.9353 13.6881 10.0531 13.7548 10.1786C14.0495 10.733 13.9633 11.4367 13.4962 11.9038L7.62957 17.7705C7.35452 18.0455 6.98146 18.2 6.59248 18.2H1.33333V13.8H10.1333L3.53333 7.20003L7.19999 3.53337Z" fill="currentColor"/>
<path d="M3.53333 24.8L9.82957 18.5037C9.93526 18.398 10.0531 18.3118 10.1785 18.2452C10.7329 17.9505 11.4367 18.0366 11.9037 18.5037L17.7704 24.3704C18.0455 24.6454 18.2 25.0185 18.2 25.4075V30.6666H13.8V21.8666L7.19999 28.4666L3.53333 24.8Z" fill="currentColor"/>
<path d="M24.8 28.4666L18.5038 22.1704C18.3981 22.0647 18.3119 21.9469 18.2452 21.8214C17.9505 21.267 18.0367 20.5633 18.5038 20.0962L24.3704 14.2295C24.6455 13.9545 25.0185 13.8 25.4075 13.8H30.6667V18.2L21.8667 18.2L28.4667 24.8L24.8 28.4666Z" fill="currentColor"/>
</svg>


**A free, production-ready React component library** with a built-in design token system, accessible components, and theming support.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Documentation](https://www.versaui.com/docs) · [Components](https://www.versaui.com/docs/components) · [Website](https://www.versaui.com)

</div>

---

### Design Token Driven
Colours, typography, spacing, corner radii, shadows, and effects are all controlled through CSS custom properties. Swap a few tokens and the entire system adapts - from buttons to modals to surfaces.

### Accessible by Default
Components ship with full keyboard navigation, ARIA attributes, focus management, and screen reader support. Built on [React Aria](https://react-spectrum.adobe.com/react-aria/), accessibility is baked into every component from day one.

### Copy-Paste Architecture
Versa UI follows a copy-paste model - you own every line of code. No black-box dependencies. Drop components into your project, customise freely, and maintain full control over your codebase.

### Composable Components
35+ components built with composition in mind. Combine primitives like `Material`, `Segment`, and `AccordionItem` into complex patterns. Each component does one thing well and composes with everything else.

### Light and Dark Mode
Every component supports both light and dark modes out of the box. Toggle between them by changing the `data-mode` attribute on your root element - all design tokens automatically adapt.

### Minimal Dependencies
Built on React 19, Tailwind CSS 4, TypeScript 5, and Class Variance Authority. No heavy runtime dependencies - just the essentials for building fast, modern UIs.

---

| Category | Components |
|---|---|
| **Actions** | Button, Compact Icon Button, Link Button, Social Button, Button Group |
| **Data Entry** | Text Input, Text Area, OTP Input, Search Bar, Checkbox, Radio, Toggle, Slider, Dropdown, File Upload, Image Upload |
| **Data Display** | Avatar, Badge, Tag, Status Tag, Brand Icon, Country Flag, Logo, Tooltip, Divider, Progress Bar, Circular Progress Bar |
| **Feedback** | Alert, Toast, Notification, Modal, Status Modal |
| **Navigation** | Bar Tabs, Container Tabs, Breadcrumbs, Side Navigation, Top Navigation, Segmented Control, Pagination |
| **Layout** | Material, Accordion |

---

## Getting Started

### Prerequisites
- **React** 18.0+ (React 19 recommended)
- **Tailwind CSS** 4.0+
- A bundler like **Vite**, **Next.js**, or **Webpack**

### Install Dependencies

```bash
npm install react react-dom tailwindcss clsx tailwind-merge class-variance-authority @phosphor-icons/react
```

#### Interaction and Accessibility

```bash
npm install @react-aria/focus @react-aria/interactions @react-aria/button @react-aria/progress @react-aria/utils react-aria-components
```

#### Dropdown Positioning

```bash
npm install @floating-ui/react
```

### CSS Setup
Import the required styles in your main CSS file. **Order matters:**

```css
/* Fonts */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');

/* Tailwind */
@import "tailwindcss";

/* Versa UI Design Tokens */
@import "./path-to/styles/primitives.css";
@import "./path-to/styles/base.css";

/* Theme */
@import "./path-to/styles/themes/core.css";
```

### Theme Setup
Set the active theme using data attributes on your root element:

```html
<html data-theme="core" data-mode="light">
```

Toggle dark mode by changing `data-mode` to `"dark"`.

### Use a Component

```tsx
import { Button } from './components/Button/Button';
import { Tooltip } from './components/Tooltip/Tooltip';

function App() {
  return (
    <Tooltip content="Welcome to Versa UI!" placement="top">
      <Button variant="primary" size="default">
        Hover Me
      </Button>
    </Tooltip>
  );
}
```

---

## Tech Stack
| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | v19 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | v5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Utility-first styling |
| [Class Variance Authority](https://cva.style) | v0.7 | Component variants |
| [React Aria](https://react-spectrum.adobe.com/react-aria/) | Latest | Accessibility primitives |
| [Phosphor Icons](https://phosphoricons.com/) | v2 | Icon system |
| [Floating UI](https://floating-ui.com/) | Latest | Dropdown positioning |

---

## Project Structure
```
src/
├── assets/          # SVG icons, logos, flags, avatars
├── components/      # All UI components
├── generated/       # Auto-generated data (brand icons)
├── styles/
│   ├── primitives.css    # Primitive color tokens
│   ├── base.css          # Base tokens and Material styles
│   └── themes/
│       └── core.css      # Core theme (light + dark)
└── utils/
    └── cn.ts        # Class name merge utility
```

---

## Links
- **Website:** [versaui.com](https://www.versaui.com)
- **Documentation:** [versaui.com/docs](https://www.versaui.com/docs)

---

## License
This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">
  <sub>Built by the Versa UI team</sub>
</div>
