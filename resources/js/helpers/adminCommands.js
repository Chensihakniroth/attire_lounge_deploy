import axios from 'axios';

/**
 * 🎮 Hikari Pixel's Admin Utility Suite ("Cheat Codes")
 * Built for quick developer power-tools, data syncs, and diagnostics right from DevTools.
 */

// Known default spreadsheet shortcuts for fast sync
const DEFAULT_SHEETS = {
    'customer-profiles': 'https://docs.google.com/spreadsheets/d/1jUuSk2Cx23W_ERDuLbOMl3VGTd9pjg5ra4hOYgZwF0k/edit?gid=925131477#gid=925131477',
    'alterings': 'https://docs.google.com/spreadsheets/d/1HLAHoQhpbDZUcuQS1AZt4_C_A8BcAUTDsWE6SI0hraI/edit?gid=1486139775#gid=1486139775',
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    const outlet = localStorage.getItem('active_outlet') || 'attire_lounge';
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Active-Outlet': outlet,
        'Accept': 'application/json',
    };
};

const parseGoogleSheetUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);

    if (!idMatch) return null;

    const id = idMatch[1];
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
};

const csvToJSON = (csv) => {
    if (!csv || typeof csv !== 'string') return [];
    // Strip UTF-8 BOM if present
    const cleanedCsv = csv.replace(/^\uFEFF/, '');
    const lines = cleanedCsv.split(/\r?\n/);
    if (lines.length < 1) return [];

    // Split headers safely (handling quotes if headers are quoted)
    const splitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const headers = lines[0].split(splitRegex).map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const currentline = lines[i].split(splitRegex);
        const obj = {};

        headers.forEach((header, index) => {
            let val = currentline[index] || '';
            val = val.trim().replace(/^"|"$/g, '');
            obj[header] = val;
        });

        result.push(obj);
    }
    return result;
};

export const initAdminCommands = () => {
    if (typeof window === 'undefined') return;

    const hika = {
        /**
         * 📖 Show All Available Utilities & Commands
         */
        help: () => hika.list(),

        list: () => {
            console.log(
                '%c🎮 ✦ HIKARI PIXEL — ADMIN UTILITY SUITE ✦ 🎮',
                'background: #0d3542; color: #d4af37; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 6px; border: 1px solid #d4af37;'
            );
            console.log('%cDirect browser console tools for monitoring, data syncing, and rapid testing.\n', 'color: #8b949e; font-style: italic;');

            const commands = [
                { Command: 'hika.list() / hika.help()', Purpose: 'Displays this command cheat sheet', Example: 'hika.list()' },
                { Command: 'hika.status() / hika.pulse()', Purpose: 'Inspects active outlet, token, and system health', Example: 'hika.pulse()' },
                { Command: 'hika.stats()', Purpose: 'Fetches and displays live business metrics table', Example: 'await hika.stats()' },
                { Command: 'hika.import(type, url?)', Purpose: 'Syncs data from Google Sheet (profiles or alterings)', Example: 'await hika.import("customer-profile")' },
                { Command: 'hika.customers(search?)', Purpose: 'Quickly query customer profiles table', Example: 'await hika.customers("john")' },
                { Command: 'hika.alterings(status?)', Purpose: 'Quickly query alteration jobs (pending/ready/all)', Example: 'await hika.alterings("pending")' },
                { Command: 'hika.outlet(name?)', Purpose: 'Get or switch active outlet (attire_lounge, caffeine, kravat)', Example: 'hika.outlet("caffeine")' },
                { Command: 'hika.posProducts(search?)', Purpose: 'Query POS inventory products & stock levels', Example: 'await hika.posProducts()' },
                { Command: 'hika.clearCache()', Purpose: 'Purges React Query cache and local temp tokens', Example: 'hika.clearCache()' },
            ];

            console.table(commands);
            console.log('%c💡 Tip: You can await any async command (e.g. `const s = await hika.stats()`). (¬‿¬)', 'color: #58a6ff; font-weight: bold;');
            return '✦ Ready to assist!';
        },

        cmds: () => hika.list(),

        /**
         * 📡 System Pulse & Health Diagnostic
         */
        status: async () => {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const outlet = localStorage.getItem('active_outlet') || 'attire_lounge';
            const headers = getAuthHeaders();

            console.log('%c📡 Running System Diagnostics...', 'color: #58a6ff; font-weight: bold;');

            const diagnostic = {
                'Active Outlet': outlet,
                'Auth Token': token ? `Present (${token.substring(0, 10)}...)` : 'Missing / Unauthenticated',
                'Storage Mode': localStorage.getItem('admin_token') ? 'localStorage (Persistent)' : 'sessionStorage',
                'Reverb WS': window.Echo ? 'Active' : 'Not Connected',
                'API Base': window.location.origin + '/api/v1',
            };

            try {
                const t0 = performance.now();
                const res = await axios.get('/api/v1/admin/stats', { headers });
                const ping = Math.round(performance.now() - t0);
                diagnostic['API Latency'] = `${ping}ms`;
                diagnostic['Backend Status'] = res.status === 200 ? '✅ 200 OK' : `⚠️ HTTP ${res.status}`;
            } catch (err) {
                diagnostic['Backend Status'] = `❌ Error (${err.response?.status || err.message})`;
            }

            console.table(diagnostic);
            return diagnostic;
        },

        pulse: () => hika.status(),

        /**
         * 📊 Live Business Metrics & KPIs
         */
        stats: async () => {
            console.log('%c📊 Fetching Live Business Intelligence...', 'color: #d4af37; font-weight: bold;');
            try {
                const { data } = await axios.get('/api/v1/admin/stats', { headers: getAuthHeaders() });
                console.log('%c✦ Core Platform Statistics:', 'color: #58a6ff; font-weight: bold;');
                console.table(data);
                return data;
            } catch (err) {
                console.error('❌ Failed to fetch stats:', err.response?.data || err.message);
                throw err;
            }
        },

        /**
         * 🏢 Get or Switch Active Outlet
         */
        outlet: (name) => {
            const valid = ['attire_lounge', 'caffeine', 'kravat'];
            const current = localStorage.getItem('active_outlet') || 'attire_lounge';

            if (!name) {
                console.log(`%c🏢 Active Outlet: %c${current}`, 'color: #8b949e;', 'color: #d4af37; font-weight: bold;');
                console.log(`Available outlets: ${valid.join(', ')}`);
                return current;
            }

            const target = name.toLowerCase().trim().replace(/[-\s]/g, '_');
            if (!valid.includes(target)) {
                console.warn(`⚠️ Invalid outlet "${name}". Choose one of: ${valid.join(', ')}`);
                return current;
            }

            localStorage.setItem('active_outlet', target);
            console.log(`%c✅ Switched active outlet to: %c${target}`, 'color: #10b981;', 'color: #d4af37; font-weight: bold;');
            console.log('🔄 Reloading page to apply changes...');
            setTimeout(() => window.location.reload(), 500);
            return target;
        },

        /**
         * 📥 Import / Sync Spreadsheet Records
         */
        import: async (type = 'customer-profile', customUrl = null) => {
            const normalizedType = (type || '').toLowerCase().replace(/_/g, '-');
            let endpoint = '';
            let defaultUrl = '';

            if (['altering', 'alterings', 'tailor', 'tailoring'].includes(normalizedType)) {
                endpoint = '/api/v1/admin/alterings/import';
                defaultUrl = DEFAULT_SHEETS['alterings'];
            } else if (['customer', 'customer-profile', 'customer-profiles', 'customers', 'profile', 'profiles'].includes(normalizedType)) {
                endpoint = '/api/v1/admin/customer-profiles/import';
                defaultUrl = DEFAULT_SHEETS['customer-profiles'];
            } else {
                console.error(`❌ Unsupported import type: "${type}".\nValid options: "customer-profile", "alterings"`);
                return;
            }

            const rawUrl = customUrl || defaultUrl;
            const csvUrl = parseGoogleSheetUrl(rawUrl);

            if (!csvUrl) {
                console.error('❌ Invalid Google Sheet URL provided.');
                return;
            }

            console.log(`%c📥 Fetching spreadsheet for ${normalizedType}...`, 'color: #f5a81c; font-weight: bold;');
            console.log(`%c🔗 ${rawUrl}`, 'color: #8b949e; font-size: 11px;');

            try {
                const response = await fetch(csvUrl);
                if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}`);
                const csvText = await response.text();
                const jsonData = csvToJSON(csvText);

                if (jsonData.length === 0) {
                    console.warn('⚠️ No records found in the sheet.');
                    return { count: 0 };
                }

                console.log(`%c⏳ Syncing ${jsonData.length} parsed records to server...`, 'color: #58a6ff;');
                const { data } = await axios.post(endpoint, { data: jsonData }, { headers: getAuthHeaders() });

                console.log(
                    `%c✅ Sync Complete: ${data.message || 'Records processed.'}`,
                    'color: #10b981; font-weight: bold; font-size: 12px;'
                );
                return data;
            } catch (err) {
                console.error('❌ Import failed:', err.response?.data || err.message);
                throw err;
            }
        },

        /**
         * 👥 Quick Query: Customer Profiles
         */
        customers: async (search = '') => {
            console.log(`%c🔍 Querying customer profiles (search: "${search}")...`, 'color: #58a6ff;');
            try {
                const { data } = await axios.get('/api/v1/admin/customer-profiles', {
                    params: { search, per_page: 25 },
                    headers: getAuthHeaders(),
                });
                console.table(data.data.map(p => ({
                    ID: p.id,
                    Name: p.name,
                    Phone: p.phone || '—',
                    Status: p.client_status,
                    Host: p.host || '—',
                    VIP: p.is_vip ? '★ VIP' : 'No',
                })));
                return data;
            } catch (err) {
                console.error('❌ Failed to fetch profiles:', err.response?.data || err.message);
                throw err;
            }
        },

        /**
         * ✂️ Quick Query: Alterations
         */
        alterings: async (status = 'all') => {
            console.log(`%c✂️ Querying alterings (status: "${status}")...`, 'color: #58a6ff;');
            try {
                const { data } = await axios.get('/api/v1/admin/alterings', {
                    params: { status },
                    headers: getAuthHeaders(),
                });
                console.table(data.data.map(a => ({
                    ID: a.id,
                    Customer: a.customer_name,
                    Order: `#${a.order_no || '—'}`,
                    Product: a.product,
                    Cost: `$${a.altering_cost || 0}`,
                    Status: a.status,
                    Ready: a.ready_at || 'TBD',
                })));
                return data;
            } catch (err) {
                console.error('❌ Failed to fetch alterings:', err.response?.data || err.message);
                throw err;
            }
        },

        /**
         * 📦 Quick Query: POS Products & Stock
         */
        posProducts: async (search = '') => {
            console.log(`%c📦 Querying POS Products...`, 'color: #58a6ff;');
            try {
                const { data } = await axios.get('/api/v1/admin/pos/products', {
                    params: { search, per_page: 20 },
                    headers: getAuthHeaders(),
                });
                console.table((data.data || []).map(p => ({
                    ID: p.id,
                    Name: p.name,
                    SKU: p.sku,
                    Price: `$${p.price}`,
                    Stock: p.stock_quantity,
                    Category: p.category || '—',
                    Outlet: p.outlet,
                })));
                return data;
            } catch (err) {
                console.error('❌ Failed to fetch POS products:', err.response?.data || err.message);
                throw err;
            }
        },

        /**
         * 🧹 Clear Client Query Caches
         */
        clearCache: () => {
            sessionStorage.clear();
            console.log('%c🧹 Client temporary cache cleared. Refreshing in 300ms...', 'color: #10b981; font-weight: bold;');
            setTimeout(() => window.location.reload(), 300);
        },
    };

    window.hika = hika;

    // Friendly intro banner in console
    console.log(
        '%c🎮 Hikari Pixel tools active! %cType %chika.list()%c or %chika.help()%c for the cheat menu. (≧◡≦)',
        'color: #58a6ff; font-weight: bold;',
        'color: #8b949e;',
        'color: #d4af37; font-weight: bold; text-decoration: underline;',
        'color: #8b949e;',
        'color: #d4af37; font-weight: bold; text-decoration: underline;',
        'color: #8b949e;'
    );
};

