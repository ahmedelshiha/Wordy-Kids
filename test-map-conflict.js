// Quick test to identify Map conflicts
console.log("Testing Map identifier conflicts...");

// Check if Map is the built-in constructor
console.log("Built-in Map exists:", typeof Map === 'function');
console.log("Map.prototype.set exists:", typeof Map.prototype.set === 'function');

// Test creating a Map
try {
  const testMap = new Map();
  console.log("Can create new Map:", true);
} catch (error) {
  console.error("Cannot create new Map:", error.message);
}

// Check if any other Map exists in window
if (typeof window !== 'undefined') {
  const mapKeys = Object.getOwnPropertyNames(window).filter(key => key.includes('Map'));
  console.log("Window properties containing 'Map':", mapKeys);
}

console.log("Map test completed");
