/**
 * 🎮 Hika's Admin Commands Utility
 * "Cheat codes" for your admin panel!
 */

const parseGoogleSheetUrl = (url) => {
    // Expected: https://docs.google.com/spreadsheets/d/[ID]/edit#gid=[GID]
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);
    
    if (!idMatch) return null;
    
    const id = idMatch[1];
    const gid = gidMatch ? gidMatch[1] : '0';
    
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
};

const csvToJSON = (csv) => {
    // 🛡️ Strip UTF-8 BOM if present
    const cleanedCsv = csv.replace(/^\uFEFF/, '');
    const lines = cleanedCsv.split(/\r?\n/);
    if (lines.length < 1) return [];
    
    // Split headers safely (handling quotes if headers are quoted)
    const splitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const headers = lines[0].split(splitRegex).map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Handle quoted CSV values safely (splits only on commas NOT inside quotes)
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

    window.hika = {
        help: () => {
            console.log('%c--- 🎮 Hika\'s Cheat Menu ---', 'color: #f5a81c; font-weight: bold; font-size: 14px;');
            console.log('%chika.import(type, url) %c- Sync data from a Google Sheet', 'color: #d4af37; font-weight: bold;', 'color: inherit;');
            console.log('%chika.status() %c- Check system pulse', 'color: #d4af37; font-weight: bold;', 'color: inherit;');
            console.log('---------------------------');
        },
        
        status: () => {
            console.log('%c📡 System Pulse: %cOPTIMAL %c(•̀ᴗ•́)و', 'color: #3498db;', 'color: #00ff00; font-weight: bold;', 'color: #f5a81c;');
        },

        import: async (type, url) => {
            if (type !== 'altering') {
                console.error(`❌ Unsupported import type: "${type}". Try "altering".`);
                return;
            }

            const csvUrl = parseGoogleSheetUrl(url);
            if (!csvUrl) {
                console.error('❌ Invalid Google Sheet URL.');
                return;
            }

            console.log(`%c📥 Importing ${type}...`, 'color: #f5a81c;');
            try {
                const response = await fetch(csvUrl);
                const csvText = await response.text();
                const jsonData = csvToJSON(csvText);
                const { data } = await window.axios.post('/api/v1/admin/alterings/import', {
                    data: jsonData
                });
                console.log(`%c✅ ${data.message} (${jsonData.length} records)`, 'color: #00cc88; font-weight: bold;');
            } catch (err) {
                console.error('❌ Import failed:', err);
            }
        }
    };

    // Hint for curious devs
    console.log('%chika.help() %c→ admin commands', 'color: #f5a81c; font-weight: bold;', 'color: #888;');
};
