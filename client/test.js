// Simple JavaScript test
console.log('JavaScript is loading');

const element = document.getElementById("root");
if (element) {
  element.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>JavaScript Test</h1>
      <p>JS module is executing!</p>
      <p>Time: ${new Date().toLocaleTimeString()}</p>
    </div>
  `;
} else {
  console.error('Root element not found');
}
