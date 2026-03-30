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
    const lines = csv.split(/\r?\n/);
    if (lines.length < 1) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        
        // Handle quoted CSV values (naive but effective for most Google Sheets)
        const currentline = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
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
                console.error('❌ Unsupported import type! Try "altering".');
                return;
            }

            console.log(`%c📡 Initializing Import for: ${type}...`, 'color: #f5a81c; font-weight: bold;');
            
            const csvUrl = parseGoogleSheetUrl(url);
            if (!csvUrl) {
                console.error('❌ Invalid Google Sheet URL! Please provide a standard sharing link.');
                return;
            }

            try {
                console.log('📥 Fetching master sheet data...');
                const response = await fetch(csvUrl);
                const csvText = await response.text();
                
                console.log('⚙️ Parsing and normalizing records...');
                const jsonData = csvToJSON(csvText);
                
                console.log(`🚀 Sending ${jsonData.length} records to the backend...`);
                const { data } = await window.axios.post('/api/v1/admin/alterings/import', {
                    data: jsonData
                });
                
                console.log(`%c✅ SUCCESS! ${data.message}`, 'color: #00ff00; font-weight: bold;');
                console.log('%cReloading data in UI... (｡♥‿♥｡)', 'color: #d4af37;');
            } catch (err) {
                console.error('❌ Import failed! (ಥ﹏ಥ)', err);
            }
        }
    };

    // Auto-help on load for curious devs
    console.log('%cType %chika.help() %cfor secret admin commands! *(¬‿¬)*', 'color: #d4af37;', 'color: #f5a81c; font-weight: bold;', 'color: #d4af37;');
};
