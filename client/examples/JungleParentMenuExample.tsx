import React from 'react';
import JungleAdventureNavV2 from '../components/JungleAdventureNavV2';
import { DEFAULT_PARENT_MENU_CONFIG } from '../lib/jungle-parent-menu-config';

/**
 * Example usage of the enhanced JungleAdventureNavV2 with Parent Menu Icon
 * 
 * This example demonstrates how to use the new Parent Menu functionality
 * that replaces the old "More ..." button with a jungle-themed parent menu.
 */

export default function JungleParentMenuExample() {
  const [activeId, setActiveId] = React.useState<string>('home');

  // Example: Custom parent menu click handler
  const handleParentMenuClick = () => {
    console.log('Parent menu clicked - custom handler');
    // You can implement custom logic here instead of using the default dialog
  };

  return (
    <div className="jungle-nav-example">
      <h2>🪵 Enhanced Jungle Adventure Navigation</h2>
      <p>The navigation now features a Parent Menu Icon (🪵 Carved Totem by default) on mobile!</p>
      
      {/* Default configuration - uses built-in dialog */}
      <div className="example-section">
        <h3>Default Parent Menu (Built-in Dialog)</h3>
        <JungleAdventureNavV2
          activeId={activeId}
          onNavigate={setActiveId}
          showParentMenuIcon={true}
          parentMenuIconVariant="totem"
          parentMenuAnimationStyle="breathing"
          parentDialogSections={{
            dashboard: true,
            settings: true,
            signOut: true,
          }}
        />
      </div>

      {/* Alternative icons */}
      <div className="example-section">
        <h3>🛡️ Tribal Shield Variant with Glow</h3>
        <JungleAdventureNavV2
          activeId={activeId}
          onNavigate={setActiveId}
          showParentMenuIcon={true}
          parentMenuIconVariant="shield"
          parentMenuAnimationStyle="glow"
          parentDialogSections={{
            dashboard: true,
            settings: false, // Hide settings
            signOut: true,
          }}
        />
      </div>

      <div className="example-section">
        <h3>🔑 Golden Key Variant (No Animation)</h3>
        <JungleAdventureNavV2
          activeId={activeId}
          onNavigate={setActiveId}
          showParentMenuIcon={true}
          parentMenuIconVariant="key"
          parentMenuAnimationStyle="none"
          parentDialogSections={{
            dashboard: false, // Hide dashboard
            settings: true,
            signOut: true,
          }}
        />
      </div>

      {/* Custom handler example */}
      <div className="example-section">
        <h3>🪵 Custom Parent Menu Handler</h3>
        <JungleAdventureNavV2
          activeId={activeId}
          onNavigate={setActiveId}
          showParentMenuIcon={true}
          parentMenuIconVariant="totem"
          parentMenuAnimationStyle="breathing"
          onParentMenuClick={handleParentMenuClick}
        />
      </div>

      {/* Legacy support */}
      <div className="example-section">
        <h3>Legacy "More ..." Button (Deprecated)</h3>
        <JungleAdventureNavV2
          activeId={activeId}
          onNavigate={setActiveId}
          showParentMenuIcon={false}
          showMobileMoreIcon={true}
          onMobileMoreClick={() => console.log('Legacy more clicked')}
        />
      </div>

      {/* Builder.io configuration example */}
      <div className="example-section">
        <h3>Builder.io Configuration Example</h3>
        <JungleAdventureNavV2
          activeId={activeId}
          onNavigate={setActiveId}
          {...DEFAULT_PARENT_MENU_CONFIG}
        />
      </div>

      <div className="accessibility-notes">
        <h3>♿ Accessibility Features</h3>
        <ul>
          <li>✅ Keyboard navigation support (Tab, Enter, Escape)</li>
          <li>✅ Screen reader compatible with ARIA labels</li>
          <li>✅ Respects <code>prefers-reduced-motion</code></li>
          <li>✅ Mobile-only behavior (hidden on desktop/tablet)</li>
          <li>✅ Large tap areas for child + parent friendly use</li>
          <li>✅ Focus indicators for keyboard users</li>
        </ul>
      </div>

      <div className="migration-notes">
        <h3>🔄 Migration from "More ..." button</h3>
        <p>To migrate from the old "More ..." button:</p>
        <ol>
          <li>Replace <code>showMobileMoreIcon</code> with <code>showParentMenuIcon</code></li>
          <li>Replace <code>onMobileMoreClick</code> with <code>onParentMenuClick</code></li>
          <li>Configure <code>parentMenuIconVariant</code> and <code>parentMenuAnimationStyle</code></li>
          <li>Set up <code>parentDialogSections</code> to control dialog content</li>
        </ol>
      </div>
    </div>
  );
}
