const fs = require('fs');

// Read the words database file
const content = fs.readFileSync('client/data/wordsDatabase.ts', 'utf8');

// Extract all category assignments
const categoryMatches = content.match(/category: "[^"]+"/g);

if (categoryMatches) {
  const categories = {};
  
  categoryMatches.forEach(match => {
    const category = match.match(/"([^"]+)"/)[1];
    categories[category] = (categories[category] || 0) + 1;
  });
  
  console.log('Categories found in the words database:');
  console.log('='.repeat(50));
  
  Object.entries(categories)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, count]) => {
      console.log(`${category.padEnd(25)} : ${count} words`);
    });
  
  console.log('='.repeat(50));
  console.log(`Total categories: ${Object.keys(categories).length}`);
  console.log(`Total words: ${Object.values(categories).reduce((a, b) => a + b, 0)}`);
  
  // Check against the static categories list
  const staticCategoriesContent = content.substring(content.indexOf('export const categories = ['));
  const staticCategoryMatches = staticCategoriesContent.match(/id: "[^"]+"/g);
  
  if (staticCategoryMatches) {
    const staticCategories = staticCategoryMatches
      .map(match => match.match(/"([^"]+)"/)[1])
      .filter(id => id !== 'all');
    
    console.log('\nStatic categories defined:');
    console.log('='.repeat(50));
    staticCategories.forEach(cat => console.log(cat));
    
    console.log('\nCategories with words but not in static list:');
    console.log('='.repeat(50));
    const actualCategories = Object.keys(categories);
    const missingFromStatic = actualCategories.filter(cat => !staticCategories.includes(cat));
    if (missingFromStatic.length > 0) {
      missingFromStatic.forEach(cat => console.log(`❌ ${cat} (${categories[cat]} words)`));
    } else {
      console.log('✅ All categories with words are in the static list');
    }
    
    console.log('\nStatic categories without words:');
    console.log('='.repeat(50));
    const emptyStatic = staticCategories.filter(cat => !actualCategories.includes(cat));
    if (emptyStatic.length > 0) {
      emptyStatic.forEach(cat => console.log(`⚠️  ${cat} (no words)`));
    } else {
      console.log('✅ All static categories have words');
    }
  }
}
