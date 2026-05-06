const fs = require('fs');
const path = require('path');

const baseDir = path.resolve('resources/js');
const componentsDir = path.join(baseDir, 'components');
const adminDir = path.join(componentsDir, 'admin');
const posDir = path.join(componentsDir, 'pos');

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        // Exclude admin and pos folders entirely
        if (filePath.startsWith(adminDir) || filePath.startsWith(posDir)) {
            continue;
        }
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.match(/\.(js|jsx|ts|tsx)$/)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// All JS/TS files to search in
const allAppFiles = [];
function getAppFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAppFiles(filePath);
        } else if (filePath.match(/\.(js|jsx|ts|tsx)$/)) {
            allAppFiles.push(filePath);
        }
    }
}
getAppFiles(baseDir);

const componentFiles = getAllFiles(componentsDir);

const unreferenced = [];

for (const comp of componentFiles) {
    const parsed = path.parse(comp);
    const name = parsed.name;
    const isIndex = name === 'index';
    const folderName = path.basename(parsed.dir);
    const searchName = isIndex ? folderName : name;
    
    let isReferenced = false;
    for (const appFile of allAppFiles) {
        if (appFile === comp) continue;
        
        const content = fs.readFileSync(appFile, 'utf8');
        // Simple search for the component name as a word
        const regex = new RegExp(`\\b${searchName}\\b`, 'g');
        if (regex.test(content)) {
            isReferenced = true;
            break;
        }
    }
    
    if (!isReferenced) {
        unreferenced.push(comp.replace(baseDir, ''));
    }
}

console.log("Potentially unreferenced files in Storefront:");
console.log(unreferenced.join('\n'));
