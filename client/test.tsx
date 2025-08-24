// Absolutely minimal React test
const element = document.getElementById("root");
if (element) {
  element.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Direct DOM Test</h1>
      <p>If you see this, the HTML and JS are loading</p>
      <p>Time: ${new Date().toLocaleTimeString()}</p>
    </div>
  `;
}
