# DatePicker Pop-out Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing inline `DatePicker` into a centered, portal-based modal system to prevent container clipping and enhance UX.

**Architecture:** Utilize React Portals to render the calendar in a centered overlay with a high-blur backdrop. The existing `DatePicker` component will be refactored to toggle visibility of this modal.

**Tech Stack:** React, Vanilla CSS, React Portals.

---

### Task 1: Create Modal Backdrop Component

**Files:**
- Create: `resources/jsx/components/ModalBackdrop.jsx`

**Step 1: Write minimal component**

```jsx
import React from 'react';

const ModalBackdrop = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default ModalBackdrop;
```

---

### Task 2: Refactor DatePicker to use Portal

**Files:**
- Modify: `resources/jsx/components/DatePicker.jsx`

**Step 1: Implement Portal rendering**

1. Add state for `isOpen`.
2. Wrap calendar component in `ModalBackdrop` (rendered via `ReactDOM.createPortal`).
3. Toggle state on input click.

---

### Task 3: Verify and Build

**Step 1: Run Build**

Run: `npm run build`
Expected: Success

---
