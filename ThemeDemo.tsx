import React, { useEffect, useState } from 'react';
import JungleThemeOverlay from '../components/JungleThemeOverlay';
import { JungleAdventureThemeManager as Themes } from '../components/JungleAdventureThemeManager';
import './demo.css';

export default function ThemeDemo() {
  const [theme, setTheme] = useState(Themes.getTheme());
  const [fx, setFx] = useState({ fireflies:true, fog:true, glow:true, ripples:false });

  useEffect(() => { Themes.applyTheme(theme); }, [theme]);
  useEffect(() => { Themes.init(); }, []);

  return (
    <div className={`jng-surface`} style={{minHeight:'100vh'}}>
      <JungleThemeOverlay {...fx} />
      <div style={{position:'relative', zIndex:1, padding:'24px', color:'white'}}>
        <h1>Jungle Theme Demo</h1>
        <p>Select a theme and toggle overlays. Reduced-motion disables animations.</p>
        <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
          {(['parchment','jungle','canopy','river','sunset'] as const).map(t => (
            <button key={t} onClick={()=>setTheme(t)} style={{padding:'8px 12px', borderRadius:8}}>
              {t}
            </button>
          ))}
        </div>
        <div style={{marginTop:16, display:'flex', gap:12, flexWrap:'wrap'}}>
          {(['fireflies','fog','glow','ripples'] as const).map(k => (
            <label key={k} style={{display:'flex', gap:6, alignItems:'center'}}>
              <input
                type="checkbox"
                checked={(fx as any)[k]}
                onChange={(e)=> setFx(prev=> ({...prev, [k]: e.target.checked}))}
              />
              {k}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}