# Revamp Bulk Edit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow bulk editing by Group Name and revamp the bulk edit dialog for better usability and features.

**Architecture:** Update `PosProductManager.jsx` to group products by `category` (Group Name) and expose this group for bulk selection. Update `BulkActionDialog.jsx` to handle the new selection context and provide a cleaner, more intuitive interface for bulk operations.

**Tech Stack:** React, Tailwind CSS, Framer Motion.

---

### Task 1: Update PosProductManager Bulk Selection

**Files:**
- Modify: `resources/js/components/pages/admin/PosProductManager.jsx`

**Step 1: Implement "Bulk Select Group"**
Add a "Select Group" checkbox or button next to each group header in `PosProductManager.jsx`.
When clicked, it should toggle selection for all products within that group.

---

### Task 2: Revamp BulkActionDialog Interface

**Files:**
- Modify: `resources/js/components/pages/admin/pos/BulkActionDialog.jsx`

**Step 1: Enhance Dialog**
- Improve visual feedback for the bulk operation being performed.
- Add "Select All" functionality within the preview step if applicable.
- Ensure the selected products are clearly displayed with their current group/category context.

---

### Task 3: Verify and Build

**Step 1: Run Build**

Run: `npm run build`
Expected: Success

---
