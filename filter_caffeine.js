const caffeine = require('./storage/caffeine_products.json');

const categoriesToRemove = ['1800s', 'BEER', 'Bottle', 'Brandy', 'CLASSICS'];

const filtered = caffeine.filter(item => {
  const cat = item.category || 'UNCATEGORIZED';
  return !categoriesToRemove.includes(cat);
});

console.log(JSON.stringify(filtered, null, 2));
console.log(`\n// Removed ${caffeine.length - filtered.length} items. New total: ${filtered.length} items`);
