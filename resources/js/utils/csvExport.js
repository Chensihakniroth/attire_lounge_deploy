import axios from 'axios';

/* ------------------------------------------------------------------ */
/*  Shared CSV export helpers                                          */
/*  Single source of truth for list exports across admin pages.        */
/*  Used by: SalesHistoryManager, CustomerProfileManager,              */
/*           InventoryManager.                                         */
/* ------------------------------------------------------------------ */

// Convert a 2D array of rows into a CSV string with proper quoting.
export const toCSV = (rows) =>
    rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

// Trigger a browser download of a CSV file. BOM prefix makes Excel
// render UTF-8 (names like "MOUYCHORN" / Khmer text) correctly.
export const downloadCSV = (rows, filename) => {
    const csv = toCSV(rows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

// Fetch EVERY page of a paginated admin endpoint, honouring the current
// search/status/date filters. Uses the Laravel paginator shape:
// { data: [...], current_page, last_page, ... }
export const fetchAllPages = async (url, params = {}) => {
    const all = [];
    let page = 1;
    for (;;) {
        const { data } = await axios.get(url, { params: { ...params, page, per_page: 500 } });
        all.push(...(data.data || []));
        if (page >= (data.last_page ?? 1)) break;
        page += 1;
    }
    return all;
};
