// Simple script to analyze word database categories
const fs = require('fs');

// Read the words database file
const content = fs.readFileSync('./client/data/wordsDatabase.ts', 'utf8');

// Extract all category assignments using regex
const categoryMatches = content.match(/category:\s*["']([^"']+)["']/g);

if (categoryMatches) {
  // Extract just the category names
  const categories = categoryMatches.map(match => 
    match.replace(/category:\s*["']([^"']+)["']/, '$1')
  );
  
  // Count unique categories
  const uniqueCategories = [...new Set(categories)].sort();
  
  console.log('=== WORD DATABASE ANALYSIS ===\n');
  console.log(`Total unique categories: ${uniqueCategories.length}\n`);
  
  console.log('Available categories:');
  uniqueCategories.forEach((category, index) => {
    const count = categories.filter(c => c === category).length;
    console.log(`${index + 1}. ${category} (${count} words)`);
  });
  
  console.log(`\nTotal words in database: ${categories.length}`);
  
  // Category breakdown
  console.log('\n=== DETAILED BREAKDOWN ===');
  const categoryStats = {};
  uniqueCategories.forEach(category => {
    categoryStats[category] = categories.filter(c => c === category).length;
  });
  
  // Sort by word count
  const sortedStats = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a);
    
  console.log('\nCategories by word count:');
  sortedStats.forEach(([category, count], index) => {
    console.log(`${index + 1}. ${category}: ${count} words`);
  });
  
} else {
  console.log('No categories found in the database');
}
