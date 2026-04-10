# Revamp Bulk Edit & Unified Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify the product editing experience by using the main "Add Product" form for both single and bulk editing, removing the separate modal, and redesigning the floating action bar.

**Architecture:**
1.  **Redesign Floating Bar:** Scale down and refine the floating action bar that appears upon selection.
2.  **Unified Form:** Update `PosProductManager` to use the `view === 'form'` state (the existing "Add Product" form) for single edits as well.
3.  **Bulk Edit via Form:** Enhance the "Add Product" form to accept bulk input or multiple product IDs.
4.  **Rename Label:** Update "New Category Name" to "Product Group".
5.  **Clean Up:** Remove unused modal code.

**Tech Stack:** React, Tailwind CSS.

---

### Task 1: Rename "New Category Name" to "Product Group"

**Files:**
- Modify: `resources/js/components/pages/admin/pos/BulkActionDialog.jsx`

**Step 1: Rename label**
Change the label text in the category section of the dialog from "New Category Name" to "Product Group".

---

### Task 2: Redesign Floating Action Bar

**Files:**
- Modify: `resources/js/components/pages/admin/PosProductManager.jsx`

**Step 1: Scale down and style**
Refine the floating container in `PosProductManager.jsx` (the `AnimatePresence` block with `fixed bottom-10`). Make it smaller, more compact, and refine its shadows and borders.

---

### Task 3: Unify Edit Form and Remove Modal

**Files:**
- Modify: `resources/js/components/pages/admin/PosProductManager.jsx`

**Step 1: Remove Old Edit Modal**
Identify where the old edit modal was called/defined and remove it.

**Step 2: Connect Form to Single Edit**
Ensure `handleEditClick` routes the single product to the existing `view === 'form'` state (which is currently used for Add).

**Step 3: Bulk Edit Integration**
Update the form to support multiple IDs if `selectedIds` has more than one item, allowing bulk updates via the primary form.

---

### Task 4: Verify and Build

**Step 1: Run Build**

Run: `npm run build`
Expected: Success

---
