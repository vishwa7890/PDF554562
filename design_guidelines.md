# Design Guidelines for PDF Manipulation Tool

## Design Approach

**Selected Approach**: Design System + Reference-Based Hybrid

Drawing inspiration from **iLovePDF**, **Dropbox**, and **Linear** - combining the clean utility focus of productivity tools with the approachable visual design of file management applications. This tool prioritizes efficiency and clarity while maintaining a modern, professional aesthetic.

**Key Design Principles**:
- Clarity over decoration - every element serves a functional purpose
- Progressive disclosure - show relevant UI based on user's current step
- Immediate visual feedback for all interactions
- Consistent, reassuring experience across all PDF operations

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 220 90% 56% (vibrant blue - for CTAs and active states)
- Background: 0 0% 100% (pure white)
- Surface: 220 13% 97% (very light gray for cards/upload areas)
- Border: 220 13% 91% (subtle borders)
- Text Primary: 222 47% 11% (nearly black)
- Text Secondary: 215 16% 47% (muted gray)
- Success: 142 71% 45% (green for completed operations)
- Error: 0 84% 60% (red for errors)

**Dark Mode**:
- Primary: 220 90% 56% (same vibrant blue)
- Background: 222 47% 11% (dark navy)
- Surface: 217 33% 17% (dark card background)
- Border: 217 33% 25% (subtle dark borders)
- Text Primary: 0 0% 98% (nearly white)
- Text Secondary: 215 20% 65% (muted light gray)
- Success/Error: Same as light mode

### B. Typography

**Font Families**: 
- Primary: Inter (Google Fonts) - for all body text, buttons, labels
- Headings: Inter (same family, maintains consistency)

**Type Scale**:
- Page Title: text-3xl font-bold (30px)
- Section Heading: text-xl font-semibold (20px)
- Body: text-base font-normal (16px)
- Small/Helper: text-sm font-normal (14px)
- Button Text: text-base font-medium (16px)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-6 or p-8
- Section spacing: space-y-8 or space-y-12
- Card gaps: gap-4 or gap-6

**Grid System**:
- Container: max-w-5xl mx-auto (centered, 1024px max width)
- Padding: px-4 md:px-8 (responsive horizontal padding)
- Upload area: Full width within container
- Multi-file grid: grid-cols-1 md:grid-cols-2 gap-4 (for file previews)

### D. Component Library

**Navigation**:
- Top navigation bar: bg-surface border-b with logo and operation links
- Operation tabs/pills: Inline navigation showing all 4 operations
- Active state: bg-primary text-white rounded-lg px-4 py-2

**File Upload Area**:
- Large drop zone: min-h-64 border-2 border-dashed rounded-xl
- Idle state: border-border bg-surface/50
- Hover/Drag state: border-primary bg-primary/5
- Icon: Large upload cloud icon (96px) centered above text
- Text hierarchy: "Drop PDF files here" (text-xl) + "or click to browse" (text-sm text-secondary)

**File Preview Cards**:
- Compact card design: bg-surface rounded-lg p-4 border border-border
- Layout: flex items-center gap-3
- PDF icon (left) + filename + file size + remove button (right)
- Hover: subtle shadow-md transition

**Progress Indicator**:
- Indeterminate spinner: Using Tailwind's animate-spin on a circular icon
- Status text: "Processing your PDF..." below spinner
- Container: bg-surface rounded-xl p-12 text-center

**Buttons**:
- Primary CTA: bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium
- Secondary: bg-surface hover:bg-surface/80 border border-border
- Download button: bg-success hover:bg-success/90 with download icon
- Consistent height: h-12

**Input Fields** (for Split PDF page ranges):
- Input: bg-background dark:bg-surface border border-border rounded-lg px-4 py-2
- Label: text-sm font-medium text-secondary mb-2
- Focus: border-primary ring-2 ring-primary/20

**Cards/Sections**:
- Main operation card: bg-white dark:bg-surface rounded-2xl shadow-sm border border-border p-8
- Step indicators: Numbered circles (w-8 h-8) with connecting lines for multi-step flows

### E. Visual Enhancements

**Animations**: Minimal and purposeful
- Fade-in for uploaded file items: animate-in fade-in duration-200
- Button hover: smooth color transitions transition-colors duration-200
- NO complex scroll animations or distracting effects

**Icons**: 
- Use **Heroicons** (outline style) throughout
- Sizes: w-6 h-6 for inline icons, w-24 h-24 for upload area

**Shadows**:
- Cards: shadow-sm (subtle)
- Hover states: shadow-md
- Active/Processing: shadow-lg

---

## Page-Specific Layouts

### Common Structure (All Pages)
1. **Header Navigation** (h-16): Logo + 4 operation links horizontally
2. **Main Content Area**: max-w-5xl centered container with py-12
3. **Operation Card**: White/dark card containing all controls

### Merge PDFs
- Large upload drop zone
- Below: Grid of uploaded file preview cards (reorderable)
- Bottom: "Merge PDFs" primary button (disabled until 2+ files)

### Split PDF
- Single file upload area
- Input field: "Page ranges (e.g., 1-3, 5, 7-9)"
- Helper text explaining range format
- "Split PDF" button

### Compress PDF
- Single file upload area
- Original file size display
- "Compress PDF" button
- After processing: Show size comparison (before/after)

### Convert PDF to Images
- Single file upload area
- Format selector: Dropdown or radio buttons (PNG/JPG)
- "Convert to Images" button

### Download State (All Pages)
- Replace upload area with success card showing:
  - Checkmark icon (text-success)
  - "Your file is ready!" heading
  - Large download button with file size
  - "Process another file" secondary button

---

## Images

**No Hero Images**: This is a utility tool - no marketing hero needed. Focus on functional clarity.

**Iconography Only**: Use icon illustrations for:
- Empty upload states (cloud upload icon)
- File type indicators (PDF icon for previews)
- Success/error states (checkmark/X icons)

---

## Accessibility & Dark Mode

- All interactive elements have min height of 44px (touch-friendly)
- Focus states: ring-2 ring-primary ring-offset-2
- Dark mode: Consistently applied across all inputs, cards, and text
- Color contrast: Meets WCAG AA standards
- Form inputs maintain visible borders in dark mode

---

## Responsive Behavior

**Mobile (< 768px)**:
- Single column layout
- Full-width cards
- Stacked file previews
- Larger touch targets (h-14 for buttons)

**Desktop (≥ 768px)**:
- Two-column file grid for multiple uploads
- Horizontal navigation
- Wider max-width containers