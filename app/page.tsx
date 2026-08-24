"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../components/SettingsProvider";

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [tickerNews, setTickerNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponses, setAiResponses] = useState([
    { role: 'assistant', text: 'שלום! אני Gemini, העוזר האישי שלך. איך אפשר לעזור היום?' }
  ]);
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  
  const activeTabRef = useRef(activeTab);
  const { articlesPerTab, disabledSources, disabledTabs, geminiApiKey, refreshInterval } = useSettings();

  let allNews = [...news];
  // Apply search filter if active
  if (searchQuery.trim() !== '') {
    const lowerQuery = searchQuery.toLowerCase();
    allNews = allNews.filter((item: any) => 
      (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(lowerQuery))
    );
  }
  
  const ALL_TABS = [
    { id: 'all', name: 'ראשי' },
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

  useEffect(() => {
    activeTabRef.current = activeTab;
    if (disabledTabs && disabledTabs.includes(activeTab)) {
      const firstAvailable = ALL_TABS.find(t => !disabledTabs.includes(t.id));
      if (firstAvailable) setActiveTab(firstAvailable.id);
    }
  }, [disabledTabs, activeTab]);

  const fetchTickerNews = async () => {
    try {
      const disabledQuery = disabledSources.length > 0 ? `&disabled=${disabledSources.join(',')}` : '';
      const response = await fetch(`/api/news?category=world${disabledQuery}`);
      if (response.ok) {
        const data = await response.json();
        const NEWS_SITES = ['Ynet', 'Channel 14', 'i24News', 'CNN', 'BBC News', 'TheMarker', 'Calcalist', 'Mako', 'Walla', 'Ynet Tech', 'NYTimes'];
        const filtered = (data.articles || []).filter((item: any) => NEWS_SITES.includes(item.source)).slice(0, 10);
        setTickerNews(filtered);
      }
    } catch (e) {
      console.error("Ticker fetch error", e);
    }
  };

  useEffect(() => {
    fetchTickerNews();
  }, [disabledSources]);

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const intervalMs = refreshInterval * 60 * 1000;
    const intervalId = setInterval(() => {
      fetchTickerNews();
      fetchNews(activeTabRef.current, true);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [refreshInterval, disabledSources]);

  const fetchNews = async (category = 'all', silent = false) => {
    if (!silent) setLoading(true);
    try {
      const disabledQuery = disabledSources.length > 0 ? `&disabled=${disabledSources.join(',')}` : '';
      let catQuery = category;
      if (category === 'all') {
         const activeIds = ALL_TABS.filter(t => t.id !== 'all' && !disabledTabs?.includes(t.id)).map(t => t.id);
         catQuery = activeIds.join(',');
      }
      const response = await fetch(`/api/news?category=${catQuery}${disabledQuery}`);
      if (response.ok) {
        const data = await response.json();
        setNews(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAiAction = async (actionId: string, displayActionText: string) => {
    setAiResponses(prev => [...prev, { role: 'user', text: displayActionText }]);
    setAiInput('');
    setIsAiLoading(true);
    
    // UI-only Actions (skip real API)
    if (actionId === 'search') {
      setIsAiLoading(false);
      setIsAiMenuOpen(false);
      setIsSearchOpen(true);
      setSearchQuery('AI');
      return;
    }
    
    if (actionId === 'notebooklm') {
      setTimeout(() => {
        setIsAiLoading(false);
        setAiResponses(prev => [...prev, { role: 'assistant', text: '🎧 מכין פודקאסט... (Audio Overview).\n\n▶ 00:00 / 03:45\n\n(זהו דמו לממשק אודיו של NotebookLM)' }]);
      }, 1200);
      return;
    }

    // If API key is provided, use the REAL Gemini model!
    if (geminiApiKey) {
      try {
        let systemPrompt = "You are a helpful AI assistant integrated into an Israeli tech news dashboard. Always respond in Hebrew unless explicitly asked otherwise. Keep answers concise, modern, and highly engaging.";
        let userPrompt = displayActionText;
        
        if (actionId === 'summarize') {
          const titles = allNews.slice(0, 5).map(n => n.title).join('\n');
          userPrompt = `Please summarize these top news headlines:\n${titles}`;
        } else if (actionId === 'translate') {
          const featuredTitle = allNews.length > 0 ? allNews[0].title : '';
          userPrompt = `Please translate this exact headline to English: "${featuredTitle}"`;
        } else {
           // For custom queries, give it context of current news
           const titlesContext = allNews.slice(0, 10).map(n => `- ${n.title}`).join('\n');
           userPrompt = `Here are the current top headlines on the user's dashboard:\n${titlesContext}\n\nUser asked: ${displayActionText}`;
        }

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nUSER PROMPT: ${userPrompt}` }] }]
          })
        });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API Status ${res.status}: ${errText}`);
        }
        
        const data = await res.json();
        const geminiText = data.candidates[0].content.parts[0].text;
        
        setAiResponses(prev => [...prev, { role: 'assistant', text: geminiText }]);
        setIsAiLoading(false);
        return;
      } catch (err) {
        console.error(err);
        setAiResponses(prev => [...prev, { role: 'assistant', text: `אופס, שגיאה בהתחברות ל-Gemini.\n\nפרטי שגיאה:\n${(err as any).message}\n\nאנא ודא שמפתח ה-API שלך בהגדרות תקין.` }]);
        setIsAiLoading(false);
        return;
      }
    }

    // FALLBACK LOGIC: If no API key is provided, use the local mock
    setTimeout(() => {
      setIsAiLoading(false);
      let responseText = '';
      
      switch(actionId) {
        case 'summarize':
          const topTitles = allNews.slice(0, 3).map(n => n.title);
          responseText = topTitles.length > 0 
            ? `הנה סיכום של 3 הכתבות המובילות עכשיו:\n\n1. ${topTitles[0]}\n2. ${topTitles[1]}\n3. ${topTitles[2]}` 
            : 'אין מספיק כתבות כרגע כדי לסכם.';
          break;
        case 'translate':
          const featuredTitle = allNews.length > 0 ? allNews[0].title : '';
          responseText = featuredTitle ? `תרגום הכתבה המרכזית לאנגלית:\n\n"Breaking News: ${featuredTitle} - Read more for details."` : 'אין כתבה מרכזית לתרגום.';
          break;
        default:
          const lowerQuery = displayActionText.toLowerCase();
          // Attempt to find articles matching the user's question
          const matches = allNews.filter(n => 
            (n.title && n.title.toLowerCase().includes(lowerQuery)) || 
            (n.contentSnippet && n.contentSnippet.toLowerCase().includes(lowerQuery))
          );
          
          if (matches.length > 0) {
            const topMatches = matches.slice(0, 3);
            responseText = `מצאתי ${matches.length} כתבות שקשורות ל"${displayActionText}". הנה המובילות:\n\n` + 
              topMatches.map(m => `🔹 ${m.title}`).join('\n\n') +
              (matches.length > 3 ? '\n\n(יש עוד כתבות בנושא זה בפיד שלך)' : '');
          } else {
            responseText = `חיפשתי בחדשות האחרונות ולא מצאתי כרגע מידע על "${displayActionText}". נסה לשאול על נושא אחר או חפש מילות מפתח אחרות.\n\n(טיפ: לשיחות מורכבות יותר, הוסף מפתח API חינמי של Gemini במסך ההגדרות!)`;
          }
      }
      
      setAiResponses(prev => [...prev, { role: 'assistant', text: responseText }]);
    }, 1200);
  };

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab, disabledSources, disabledTabs]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };



  const featured = allNews.length > 0 ? allNews[0] : null;
  // Use the global setting for the total number of articles (subtract 1 for the featured article)
  const restNews = allNews.length > 1 ? allNews.slice(1, articlesPerTab) : [];

  // Calculate dynamic grid distribution based on how many articles are in restNews
  // We distribute them roughly evenly across the 3 columns
  const colSize = Math.ceil(restNews.length / 3);
  const leftColNews = restNews.slice(0, colSize);
  const centerColNews = restNews.slice(colSize, colSize * 2);
  const rightColNews = restNews.slice(colSize * 2);

  return (
    <>
      <div className="futuristic-bg"></div>
      
      <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 flex flex-col items-center overflow-x-hidden">
        
        {/* Top Navigation Bar */}
        <header className="mt-8 mb-12 backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-full px-4 md:px-8 py-3 flex items-center justify-between w-[95%] max-w-6xl shadow-[0_0_30px_rgba(6,182,212,0.15)] relative z-20 gap-4 md:gap-6">
          <div className="flex items-center gap-4 flex-shrink-0">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`transition-colors ${isSearchOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button 
              onClick={() => setIsAiMenuOpen(true)}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 hover:scale-110 transition-transform flex items-center justify-center animate-pulse"
              title="Gemini AI Options"
            >
              <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"/>
              </svg>
            </button>
            {isSearchOpen && (
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..." 
                className="bg-transparent border-b border-cyan-400/50 text-white placeholder-slate-500 focus:outline-none text-sm w-32 md:w-48 transition-all animate-in fade-in slide-in-from-left-4"
                autoFocus
              />
            )}
          </div>

          <nav className="flex-1 flex items-center justify-start md:justify-center gap-5 md:gap-8 font-medium text-sm md:text-base text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-hide py-1" dir="rtl">
            {ALL_TABS.map(tab => {
              // Hide tabs that the user disabled in settings. Also if somehow more than 5 are active, 
              // we only show the first 5 active ones to enforce the 5-tab limit strictly on render.
              const activeTabsIds = ALL_TABS.filter(t => !disabledTabs?.includes(t.id)).map(t => t.id).slice(0, 5);
              if (!activeTabsIds.includes(tab.id)) return null;

              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`transition-all duration-300 flex-shrink-0 relative py-1 px-2 ${activeTab === tab.id ? "text-cyan-400 after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-1 after:bg-cyan-400 after:rounded-t-md after:shadow-[0_0_10px_#22d3ee]" : "hover:text-white"}`}
                >
                  {tab.name}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              תפריט
            </span>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Breaking News Ticker (Modern) */}
        {(() => {
          if (tickerNews.length === 0) return null;
          
          return (
            <div className="w-[95%] max-w-6xl mx-auto mb-12 -mt-6 backdrop-blur-xl bg-black/20 border border-white/5 rounded-2xl overflow-hidden flex items-center shadow-lg relative z-10 h-11" dir="rtl">
              
              {/* Modern "LIVE" Indicator */}
              <div className="flex items-center gap-3 px-6 h-full bg-gradient-to-l from-red-500/10 to-transparent border-l border-red-500/20 z-20 shrink-0">
                 <div className="relative flex items-center justify-center">
                   <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                 </div>
                 <span className="text-red-400 font-bold text-xs tracking-widest uppercase">מבזקים</span>
              </div>

              {/* Scrolling Content */}
              <div className="flex-1 overflow-hidden relative h-full mask-edges">
                <div className="animate-ticker-rtl flex items-center h-full">
                  {tickerNews.map((item, i) => (
                    <div key={i} className="flex items-center text-sm px-6 whitespace-nowrap">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-3 group">
                         <span className="text-red-400/60 text-xs font-semibold uppercase tracking-wider group-hover:text-red-400 transition-colors">[{item.source}]</span>
                         <span className="group-hover:text-cyan-400 transition-colors font-medium">{item.title}</span>
                      </a>
                      <span className="text-white/10 mx-6 select-none">/</span>
                    </div>
                  ))}
                  {/* Duplicate for seamless infinite scrolling */}
                  {tickerNews.map((item, i) => (
                    <div key={`dup-${i}`} className="flex items-center text-sm px-6 whitespace-nowrap">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-3 group">
                         <span className="text-red-400/60 text-xs font-semibold uppercase tracking-wider group-hover:text-red-400 transition-colors">[{item.source}]</span>
                         <span className="group-hover:text-cyan-400 transition-colors font-medium">{item.title}</span>
                      </a>
                      <span className="text-white/10 mx-6 select-none">/</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Slide-out Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
              onClick={() => setIsMenuOpen(false)}
            ></div>
            <div className="relative w-64 h-full bg-slate-900/90 backdrop-blur-xl border-l border-white/10 p-6 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col gap-8 animate-in slide-in-from-right duration-300">
              <button onClick={() => setIsMenuOpen(false)} className="self-start text-slate-400 hover:text-cyan-400 transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="text-xl font-bold text-cyan-400 border-b border-white/10 pb-4 text-right">תפריט</div>
              <nav className="flex flex-col gap-6 text-right" dir="rtl">
                <Link href="/" className="text-cyan-400 font-medium flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  ראשי
                </Link>
                <Link href="/sources" className="text-slate-200 hover:text-cyan-400 transition-colors font-medium flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" /></svg>
                  מקורות
                </Link>
                <Link href="/settings" className="text-slate-200 hover:text-cyan-400 transition-colors font-medium flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  הגדרות
                </Link>
              </nav>
            </div>
          </div>
        )}

        {/* Gemini AI Modal Overlay */}
        {isAiMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
              onClick={() => setIsAiMenuOpen(false)}
            ></div>
            <div className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col gap-6 animate-in zoom-in-95 duration-300" dir="rtl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-purple-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 6.627 12 0Z"/>
                  </svg>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Gemini AI
                  </span>
                </div>
                <button onClick={() => setIsAiMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full p-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Chat Interface */}
              <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 h-56 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
                {aiResponses.map((msg, i) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"/></svg>
                      </div>
                    )}
                    <div className={`px-4 py-3 text-sm rounded-2xl shadow-md whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-50 rounded-tl-none' 
                        : 'bg-slate-800 border border-white/10 text-slate-200 rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3 self-start animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"/></svg>
                    </div>
                    <div className="px-4 py-3 text-sm rounded-2xl bg-slate-800 border border-white/10 text-slate-400 rounded-tr-none flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <form 
                className="relative" 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (aiInput.trim()) handleAiAction('custom', aiInput);
                }}
              >
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="שאל את Gemini כל שאלה על החדשות..." 
                  className="w-full bg-slate-950/80 border border-purple-500/30 rounded-full px-6 py-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all pr-14"
                />
                <button 
                  type="submit"
                  disabled={!aiInput.trim() || isAiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                </button>
              </form>

              {/* Command Palette Options */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                <button 
                  onClick={() => handleAiAction('summarize', "סכם לי את 3 כותרות הייטק הכי חשובות של היום.")}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-purple-500/30 rounded-xl p-4 text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-xs font-bold text-slate-200">סיכום חכם</div>
                </button>

                <button 
                  onClick={() => handleAiAction('translate', "תרגם את הכתבה המרכזית מעולם לאנגלית.")}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-green-500/30 rounded-xl p-4 text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  </div>
                  <div className="text-xs font-bold text-slate-200">תרגום חי</div>
                </button>

                <button 
                  onClick={() => handleAiAction('search', "מצא לי כתבות מהשבוע האחרון על בינה מלאכותית ברפואה.")}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-orange-500/30 rounded-xl p-4 text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <div className="text-xs font-bold text-slate-200">חיפוש עמוק</div>
                </button>

                <button 
                  onClick={() => handleAiAction('notebooklm', "צור פודקאסט שמע (Audio Overview) בסגנון Google NotebookLM על כותרות היום.")}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-pink-500/30 rounded-xl p-4 text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <div className="text-xs font-bold text-slate-200">NotebookLM</div>
                </button>
                
                <Link 
                  href="/settings" 
                  onClick={() => setIsAiMenuOpen(false)} 
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 hover:border-slate-500/30 rounded-xl p-4 text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="text-xs font-bold text-slate-200">פתח הגדרות</div>
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="w-full max-w-[1400px] px-4 md:px-8 pb-20 relative z-10">
          
          {loading ? (
             <div className="flex items-center justify-center h-64">
               <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative">
              
              {/* Left Column */}
              <div className="md:col-span-4 flex flex-col gap-10">
                {leftColNews.map((item, idx) => (
                  <NewsCard 
                    key={`${item.id}-${idx}`} 
                    item={item} 
                    stripHtml={stripHtml} 
                    isExpanded={expandedArticleId === item.id}
                    onToggle={() => setExpandedArticleId(expandedArticleId === item.id ? null : item.id)}
                  />
                ))}
              </div>

              {/* Center Column (Featured Card + More Cards) */}
              <div className="md:col-span-4 flex flex-col gap-10 relative z-20">
                {featured && (
                  <div className="w-full mt-10 md:mt-0 transform md:scale-110 md:transform-origin-top mb-10">
                     <NewsCard 
                       item={featured} 
                       stripHtml={stripHtml} 
                       isFeatured 
                       isExpanded={expandedArticleId === featured.id}
                       onToggle={() => setExpandedArticleId(expandedArticleId === featured.id ? null : featured.id)}
                     />
                  </div>
                )}
                {centerColNews.map((item, idx) => (
                   <NewsCard 
                     key={`${item.id}-${idx}`} 
                     item={item} 
                     stripHtml={stripHtml} 
                     isExpanded={expandedArticleId === item.id}
                     onToggle={() => setExpandedArticleId(expandedArticleId === item.id ? null : item.id)}
                   />
                ))}
              </div>

              {/* Right Column */}
              <div className="md:col-span-4 flex flex-col gap-10">
                {rightColNews.map((item, idx) => (
                   <NewsCard 
                     key={`${item.id}-${idx}`} 
                     item={item} 
                     stripHtml={stripHtml} 
                     isExpanded={expandedArticleId === item.id}
                     onToggle={() => setExpandedArticleId(expandedArticleId === item.id ? null : item.id)}
                   />
                ))}
              </div>

            </div>
          )}

        </main>
      </div>
    </>
  );
}

function NewsCard({ item, stripHtml, isFeatured = false, isExpanded, onToggle }: any) {
  const handleLinkClick = (e: any) => {
    e.stopPropagation();
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    if (onToggle) onToggle();
  };

  const isHebrew = item.lang === 'he';

  return (
    <div 
      className={`layered-card-wrapper w-full transition-all duration-500 ease-in-out cursor-pointer ${
        isExpanded ? 'z-50' : 'z-10'
      } ${!isExpanded ? (isFeatured ? 'aspect-[4/3]' : 'aspect-video') : 'min-h-[400px]'}`}
      onClick={handleClick}
    >
      <div className="layered-card-bg-1"></div>
      <div className="layered-card-bg-2"></div>
      
      <div className="layered-card block w-full h-full p-1 group">
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 flex flex-col">
          
          {/* Background Image */}
          {item.image && (
            <div className={`absolute inset-0 w-full transition-all duration-700 ease-in-out ${isExpanded ? 'h-48' : 'h-full'}`}>
              <img 
                src={item.image} 
                alt={item.title} 
                className={`w-full h-full object-cover transition-all duration-700 ${isExpanded ? 'opacity-100' : 'opacity-60 group-hover:opacity-80 group-hover:scale-105'}`}
              />
              {/* Gradient for image when expanded */}
              {isExpanded && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>}
            </div>
          )}

          {/* Gradient Overlay for Unexpanded state */}
          {!isExpanded && (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          )}

          {/* Content */}
          <div className={`relative flex flex-col justify-end p-6 transition-all duration-500 flex-grow ${isExpanded ? (item.image ? 'mt-32' : 'mt-0') : 'h-full'}`} dir={isHebrew ? 'rtl' : 'ltr'}>
            
            {/* Top Badge */}
            <div className={`absolute ${isHebrew ? 'left-4' : 'right-4'} flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 transition-all ${isExpanded ? 'top-[-2rem]' : 'top-4'}`}>
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></span>
              <span className="text-xs text-cyan-50 font-medium">{item.source}</span>
            </div>

            <h3 className={`font-bold text-white leading-tight drop-shadow-lg transition-all duration-300 ${isExpanded ? 'text-2xl mb-4' : (isFeatured ? 'text-2xl md:text-3xl mb-2' : 'text-lg md:text-xl mb-2')} ${isHebrew ? 'font-heebo' : ''}`}>
              {item.title}
            </h3>
            
            {/* Snippet / Full Text */}
            <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar opacity-100' : (isFeatured ? 'max-h-20 opacity-0 group-hover:opacity-100' : 'max-h-0 opacity-0')}`}>
              <p className={`text-slate-300 drop-shadow-md transition-all duration-300 ${isExpanded ? 'text-base leading-relaxed' : 'text-sm line-clamp-2'} ${isHebrew ? 'font-heebo' : ''}`}>
                {stripHtml(isExpanded && item.content ? item.content : item.contentSnippet)}
              </p>

              {isExpanded && (
                <div className="mt-4 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {item.author && (
                     <div className="flex items-center gap-1.5 text-xs text-cyan-200/80 bg-slate-800/60 px-2.5 py-1 rounded-md border border-white/5">
                       <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       {item.author}
                     </div>
                  )}
                  {item.categories && item.categories.length > 0 && (
                    <div className="flex items-center gap-2">
                      {(item.categories || []).map((cat: any, idx: number) => (
                        <span key={idx} className="text-xs text-slate-300 bg-slate-800/40 px-2.5 py-1 rounded-md border border-white/5">
                          {typeof cat === 'string' ? cat : (cat._ || cat.$?.domain || 'Tag')}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.pubDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(item.pubDate).toLocaleString(isHebrew ? 'he-IL' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Expanded actions */}
            {isExpanded && (
              <div className={`mt-6 flex justify-between items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${isHebrew ? 'flex-row-reverse' : ''}`}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()} // Let link work when clicked directly
                  className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-full border border-cyan-500/50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {isHebrew ? 'קרא בכתבה המקורית' : 'Read original article'}
                  <svg className={`w-4 h-4 ${isHebrew ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <button className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                  {isHebrew ? 'סגור' : 'Close'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Date and Icon (Unexpanded only) */}
            {!isExpanded && (
              <div className={`mt-4 flex items-center justify-between text-xs text-cyan-200/70 font-medium tracking-wider ${isHebrew ? 'flex-row-reverse' : ''}`}>
                 <span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ''}</span>
                 <div className="w-6 h-6 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10">
                   <svg className={`w-3 h-3 text-cyan-400 transition-transform ${isFeatured ? 'group-hover:rotate-45' : ''} ${isHebrew ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                   </svg>
                 </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
