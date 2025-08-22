import React, { useState } from "react";
import JungleAdventureIconNav from "@/components/JungleAdventureIconNav";

export default function IconNavTest() {
  const [activeTab, setActiveTab] = useState("home");

  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    console.log(`Navigated to: ${tabId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-8">
          🌿 Jungle Adventure Icon Navigation Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            Current Active Tab: <span className="text-green-900 capitalize">{activeTab}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-600">Navigation Features:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ PNG icons floating above navigation bar</li>
                <li>✅ Responsive design (12vw width, max 48px)</li>
                <li>✅ Desktop: -20px elevation</li>
                <li>✅ Mobile: -28px elevation</li>
                <li>✅ Drop shadows for depth</li>
                <li>✅ Bounce animations on tap</li>
                <li>✅ Color-coded labels</li>
                <li>✅ Accessibility support</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-600">Icon Labels & Colors:</h3>
              <ul className="space-y-2 text-gray-700">
                <li><span className="font-semibold" style={{color: "#FFD700"}}>Home</span> - #FFD700 (Gold)</li>
                <li><span className="font-semibold" style={{color: "#FFFFFF", textShadow: "0 0 2px #000"}}>Jungle</span> - #FFFFFF (White)</li>
                <li><span className="font-semibold" style={{color: "#FFFFFF", textShadow: "0 0 2px #000"}}>Quiz</span> - #FFFFFF (White)</li>
                <li><span className="font-semibold" style={{color: "#FFFFFF", textShadow: "0 0 2px #000"}}>Trophy</span> - #FFFFFF (White)</li>
                <li><span className="font-semibold" style={{color: "#FFD700"}}>Parents</span> - #FFD700 (Gold)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            📱 Test Instructions
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>1. <strong>Desktop:</strong> Hover over icons to see smooth hover effects</p>
            <p>2. <strong>Mobile:</strong> Tap icons to see bounce animations</p>
            <p>3. <strong>Responsive:</strong> Resize browser to test mobile/tablet/desktop layouts</p>
            <p>4. <strong>Accessibility:</strong> Use Tab key to navigate, Enter/Space to activate</p>
            <p>5. <strong>Visual:</strong> Notice how icons float above the dark green navigation bar</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-20">
          <p className="text-yellow-800">
            <strong>Note:</strong> The navigation bar is fixed at the bottom of the screen. 
            Scroll down to see how it stays in place and test the floating icon effect!
          </p>
        </div>

        {/* Spacer content to test bottom navigation */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].map((section) => (
            <div key={section} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Test Section {section}
              </h3>
              <p className="text-gray-600 mb-4">
                This is test content to demonstrate that the navigation bar stays fixed 
                at the bottom while scrolling. The icons should remain floating above 
                the dark green background.
              </p>
              <div className="bg-gray-100 rounded p-4">
                <p className="text-sm text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                  quis nostrud exercitation ullamco laboris.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The new navigation component */}
      <JungleAdventureIconNav
        activeId={activeTab}
        onNavigate={handleNavigation}
      />
    </div>
  );
}
