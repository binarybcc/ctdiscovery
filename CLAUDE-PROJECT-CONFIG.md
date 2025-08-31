# Claude Project Configuration
**Auto-loaded context for consistent development practices**

## **Architecture Standards**

### **CSS Requirements**
```css
/* ALWAYS use these patterns */

/* 1. Design tokens (not hard-coded values) */
:root {
  --component-padding: 1rem;
  --component-gap: 0.75rem;
  --component-radius: 0.5rem;
}

/* 2. Layout-agnostic components */
.component {
  /* Self-contained, works anywhere */
  display: grid;
  gap: var(--component-gap);
  padding: var(--component-padding);
}

/* 3. NO absolute positioning unless absolutely necessary */
/* Use CSS Grid/Flexbox instead */

/* 4. Container queries over media queries when possible */
@container (max-width: 400px) {
  .component { grid-template-columns: 1fr; }
}
```

### **JavaScript Requirements**
```javascript
// 1. Always use namespaces (no global pollution)
window.ProjectName = window.ProjectName || {};

// 2. Class-based modules for reusability
class ComponentManager {
  constructor(options = {}) {
    this.options = { ...this.defaults, ...options };
  }
}

// 3. Event delegation over individual listeners
document.addEventListener('click', this.handleClick.bind(this));

// 4. Defensive programming
const element = document.getElementById('target');
if (!element) {
  console.warn('Element not found');
  return;
}
```

### **HTML Requirements**
```html
<!-- 1. Semantic, accessible structure -->
<section class="component" role="region" aria-label="Description">
  <h2 class="component__title">Title</h2>
  <div class="component__content">Content</div>
</section>

<!-- 2. BEM or component-based naming -->
<!-- 3. ARIA attributes for accessibility -->
<!-- 4. No inline styles (use classes) -->
```

## **Decision Framework**

### **Before Adding New Features:**
1. **Can existing components handle this?** (Reuse first)
2. **Will this work on mobile?** (Mobile-first thinking)
3. **Is it accessible?** (Screen reader friendly)
4. **Can it be tested?** (Isolated components)

### **CSS Cascade Sensitivity Rules:**
- ❌ **Avoid:** `.parent .child .grandchild` (fragile cascade)
- ✅ **Use:** `.component__element` (predictable naming)
- ❌ **Avoid:** `position: absolute` for layout
- ✅ **Use:** CSS Grid, Flexbox for positioning

### **Responsive Strategy:**
```css
/* Mobile-first, progressive enhancement */
.component {
  /* Mobile styles (base) */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .component {
    /* Desktop enhancement */
    grid-template-columns: 2fr 1fr;
  }
}
```

## **Testing Requirements**
- [ ] Works on mobile viewport (390px width minimum)
- [ ] Keyboard navigation functional
- [ ] Screen reader accessible
- [ ] No horizontal scrolling on mobile
- [ ] Performance: animations at 60fps

## **File Organization Standards**
```
/assets/
  /css/
    - style.css (main design system)
    - components.css (reusable components)
    - pages.css (page-specific overrides)
  /js/
    - main.js (core functionality)
    - utils.js (shared utilities)
    - components/ (individual component modules)
```

## **Context Reminders for Claude**

### **When Building Components:**
- "Use CSS Grid instead of absolute positioning"
- "Make this component work in any container"
- "Include mobile-responsive behavior from start"
- "Add ARIA attributes for accessibility"

### **When Debugging Layout:**
- "Check for cascade sensitivity issues"
- "Verify component works independently"
- "Test mobile viewport behavior"

### **Available macOS Automation:**
- Use `osascript` for screenshot automation
- Use `open` command for browser testing
- AppleScript available for UI testing

## **Key Reminders**

### **Architecture Over Tools**
- Focus on resilient component design, not which tool to use
- Remember cascade sensitivity lessons from geofencing extraction
- Always consider mobile-first responsive behavior

### **macOS Integration Available**
- Use `osascript` and `open` commands for automation and testing
- Take screenshots with system tools when needed

---
**Usage:** Reference this file at start of each session to maintain consistency.