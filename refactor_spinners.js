const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('resources/js/components');
let changedFiles = [];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Check if file uses LumaSpin with size sm, 14, 16, or no size but used inline like button
    const regex = /<LumaSpin[^>]*?(?:size=[\"']sm[\"']|size=\{1[46]\}|className=[\"'][^>]*animate-spin[^>]*[\"'])[^>]*?\/?>(?:<\/LumaSpin>)?/g;
    
    if (regex.test(content)) {
        content = content.replace(regex, (match) => {
            let classNameMatch = match.match(/className=([\"'].*?[\"']|\{.*?\})/);
            let className = classNameMatch ? classNameMatch[1] : '';
            
            if(className) {
                 className = className.replace(/animate-spin\s*/, '');
                 if(className === '""' || className === "''") className = '';
            }

            if(className) {
                let inner = className.substring(1, className.length - 1);
                return `<Loader2 className="animate-spin ${inner}" size={16} />`;
            }
            return `<Loader2 className="animate-spin" size={16} />`;
        });
        
        if (!content.includes('Loader2')) {
            if (content.includes('lucide-react')) {
                content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['\"]lucide-react['\"];?/, (m, imports) => {
                    return `import { ${imports.trim()}, Loader2 } from 'lucide-react';`;
                });
            } else {
                content = `import { Loader2 } from 'lucide-react';\n` + content;
            }
        }
        
        if (!content.includes('<LumaSpin')) {
            content = content.replace(/import\s+\{?\s*LumaSpin\s*\}?\s*from\s+['\"].*?luma-spin.*?['\"];?\n?/g, '');
        }
        
        fs.writeFileSync(file, content);
        changedFiles.push(file);
    }
});

console.log('Modified files:', changedFiles.length);
changedFiles.forEach(f => console.log(' - ' + f));
