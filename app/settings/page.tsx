"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSettings } from "../../components/SettingsProvider";

const ALL_SOURCES = [
  'Ynet', 'CNN', 'BBC News', 'TheMarker', 'Calcalist', 'Mako', 'Walla', 
  'Reddit', 'TechCrunch', 'Wired', 'Geektime', 'People & Computers', 
  'Ynet Tech', 'Calcalist Tech', 'The Verge', 'X',
  'Channel 14', 'i24News', 'MSN', 'NYTimes', 'Google News', 'Business Insider', 'Forbes'
];

const ALL_TABS = [
  { id: 'world', name: 'עולם' },
  { id: 'hightech', name: 'הייטק' },
  { id: 'startups', name: 'סטארט-אפים והשקעות' },
  { id: 'ai', name: 'AI' },
  { id: 'cyber', name: 'אבטחת מידע וסייבר' },
  { id: 'infosec', name: 'אבטחת מידע' },
  { id: 'economy', name: 'כלכלה' },
  { id: 'ev', name: 'עולם הרכב החשמלי' },
  { id: 'autotech', name: 'טכנולוגיות רכב' },
  { id: 'gaming', name: 'גיימינג ותעשיית המשחקים' },
  { id: 'future', name: 'עתיד' },
  { id: 'lifestyle', name: 'סגנון חיים' }
];

export default function Settings() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme, articlesPerTab, setArticlesPerTab, disabledSources, setDisabledSources, disabledTabs, setDisabledTabs, geminiApiKey, setGeminiApiKey, refreshInterval, setRefreshInterval } = useSettings();
  
  // Local state so changes only apply on "Save"
  const [localDisabledSources, setLocalDisabledSources] = useState<string[]>([]);
  const [localDisabledTabs, setLocalDisabledTabs] = useState<string[]>([]);
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState<string>('');
  const [localRefreshInterval, setLocalRefreshInterval] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalDisabledSources(disabledSources);
    setLocalDisabledTabs(disabledTabs);
    setLocalGeminiApiKey(geminiApiKey || '');
    setLocalRefreshInterval(refreshInterval);
  }, [disabledSources, disabledTabs, geminiApiKey, refreshInterval]);

  const handleToggleSource = (source: string) => {
    setLocalDisabledSources(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
    setIsSaved(false);
  };

  const handleToggleTab = (tabId: string) => {
    setLocalDisabledTabs(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
    setIsSaved(false);
  };

  const handleSave = () => {
    setDisabledSources(localDisabledSources);
    setDisabledTabs(localDisabledTabs);
    setGeminiApiKey(localGeminiApiKey);
    setRefreshInterval(localRefreshInterval);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <>
      <div className="futuristic-bg"></div>
      <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 flex flex-col items-center">
        
        {/* Header (Simplified) */}
        <header className="mt-8 mb-12 backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-full px-8 py-3 flex items-center justify-between w-[90%] max-w-4xl shadow-[0_0_30px_rgba(6,182,212,0.15)] relative z-20">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-cyan-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              תפריט
            </span>
            <button onClick={() => setIsMenuOpen(true)} className="text-slate-300 hover:text-cyan-400 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Slide-out Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)}></div>
            <div className="relative w-64 h-full bg-slate-900/90 backdrop-blur-xl border-l border-white/10 p-6 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col gap-8 animate-in slide-in-from-right duration-300">
              <button onClick={() => setIsMenuOpen(false)} className="self-start text-slate-400 hover:text-cyan-400 transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="text-xl font-bold text-cyan-400 border-b border-white/10 pb-4 text-right">תפריט</div>
              <nav className="flex flex-col gap-6 text-right" dir="rtl">
                <Link href="/" className="text-slate-200 hover:text-cyan-400 transition-colors font-medium flex items-center gap-3">ראשי</Link>
                <Link href="/sources" className="text-slate-200 hover:text-cyan-400 transition-colors font-medium flex items-center gap-3">מקורות</Link>
                <Link href="/settings" className="text-cyan-400 font-medium flex items-center gap-3">הגדרות</Link>
              </nav>
            </div>
          </div>
        )}

        <main className="w-full max-w-[1400px] px-4 md:px-8 pb-20 relative z-10" dir="rtl">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-cyan-400 mb-8">הגדרות</h1>
            
            <div className="space-y-8 text-slate-200">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">ערכת נושא (Theme)</label>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'dark' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-700 hover:border-cyan-400/50'}`}
                  >
                    כהה (Dark)
                  </button>
                  <button 
                    onClick={() => setTheme('cyberpunk')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'cyberpunk' ? 'bg-pink-500/20 border-pink-400 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-slate-700 hover:border-pink-400/50'}`}
                  >
                    סייברפאנק (Cyberpunk)
                  </button>
                  <button 
                    onClick={() => setTheme('ocean')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'ocean' ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-slate-700 hover:border-sky-400/50'}`}
                  >
                    אוקיינוס (Ocean)
                  </button>
                  <button 
                    onClick={() => setTheme('forest')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'forest' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-700 hover:border-emerald-400/50'}`}
                  >
                    יער (Forest)
                  </button>
                  <button 
                    onClick={() => setTheme('sunset')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'sunset' ? 'bg-orange-500/20 border-orange-400 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-slate-700 hover:border-orange-400/50'}`}
                  >
                    שקיעה (Sunset)
                  </button>
                  <button 
                    onClick={() => setTheme('dracula')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'dracula' ? 'bg-purple-500/20 border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(189,147,249,0.3)]' : 'border-slate-700 hover:border-purple-400/50'}`}
                  >
                    דרקולה (Dracula)
                  </button>
                  <button 
                    onClick={() => setTheme('light')}
                    className={`px-6 py-2 rounded-full border transition-all ${theme === 'light' ? 'bg-slate-200 border-slate-400 text-slate-800 shadow-[0_0_15px_rgba(148,163,184,0.3)]' : 'border-slate-700 hover:border-slate-400/50'}`}
                  >
                    בהיר עדין (Soft Light)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">מאמרים בכל קטגוריה ({articlesPerTab})</label>
                <div className="flex items-center gap-4 w-full md:w-64">
                  <span className="text-xs text-slate-400">5</span>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    step="1"
                    value={articlesPerTab} 
                    onChange={(e) => setArticlesPerTab(parseInt(e.target.value))} 
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-xs text-slate-400">30</span>
                </div>
                <p className="text-xs text-slate-400">הגדר כמה כתבות להציג בכל לשונית. פחות כתבות = טעינה מהירה יותר.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">רענון אוטומטי (דקות)</label>
                <div className="flex items-center gap-4 w-full md:w-64">
                  <select 
                    value={localRefreshInterval}
                    onChange={(e) => setLocalRefreshInterval(parseInt(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors appearance-none"
                    dir="rtl"
                  >
                    <option value={0}>לעולם לא (ידני)</option>
                    <option value={1}>כל דקה</option>
                    <option value={5}>כל 5 דקות</option>
                    <option value={10}>כל 10 דקות</option>
                    <option value={15}>כל 15 דקות</option>
                    <option value={30}>כל חצי שעה</option>
                    <option value={60}>כל שעה</option>
                  </select>
                </div>
                <p className="text-xs text-slate-400">בחר כל כמה זמן האתר ימשוך חדשות עדכניות באופן אוטומטי ברקע.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">ניהול קטגוריות (לשוניות)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  {ALL_TABS.map(tab => {
                    const activeCount = ALL_TABS.length - localDisabledTabs.length;
                    const isChecked = !localDisabledTabs.includes(tab.id);
                    const isDisabled = (isChecked && activeCount <= 1) || (!isChecked && activeCount >= 5);

                    return (
                      <label key={tab.id} className={`flex items-center gap-3 group ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border border-slate-600 rounded bg-slate-800 checked:bg-cyan-500 checked:border-cyan-400 transition-all disabled:cursor-not-allowed"
                            checked={isChecked}
                            onChange={() => !isDisabled && handleToggleTab(tab.id)}
                            disabled={isDisabled}
                          />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm transition-colors select-none ${isDisabled ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {tab.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">בחר אילו קטגוריות יוצגו בסרגל הניווט הראשי (ניתן לבחור עד 5 לשוניות).</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">ניהול מקורות מידע</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  {ALL_SOURCES.map(source => (
                    <label key={source} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border border-slate-600 rounded bg-slate-800 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          checked={!localDisabledSources.includes(source)}
                          onChange={() => handleToggleSource(source)}
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors select-none">{source}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500">הסר את הסימון ממקורות שאינך מעוניין לראות בפיד שלך.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">חיבור ל-Gemini AI (אופציונלי)</label>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
                  <div className="relative z-10 flex flex-col gap-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      אם ברצונך לקבל תגובות אמיתיות וחכמות מ-Gemini (ולא רק דמו מקומי), הזן כאן את מפתח ה-API שלך. 
                      המפתח נשמר רק בדפדפן שלך בצורה מאובטחת.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                      <input 
                        type="password" 
                        placeholder="הדבק את מפתח ה-API שלך כאן... (AIzaSy...)" 
                        value={localGeminiApiKey}
                        onChange={(e) => setLocalGeminiApiKey(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                        dir="ltr"
                      />
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="whitespace-nowrap px-4 py-3 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl border border-purple-500/20 transition-colors flex items-center gap-2"
                      >
                        קבל מפתח בחינם
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 flex items-center gap-4 border-t border-white/10">
              <button 
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
              >
                שמור הגדרות
              </button>
              {isSaved && <span className="text-sm text-emerald-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                נשמר בהצלחה!
              </span>}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
