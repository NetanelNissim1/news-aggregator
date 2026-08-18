"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sources() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <Link href="/sources" className="text-cyan-400 font-medium flex items-center gap-3">מקורות</Link>
                <Link href="/settings" className="text-slate-200 hover:text-cyan-400 transition-colors font-medium flex items-center gap-3">הגדרות</Link>
              </nav>
            </div>
          </div>
        )}

        <main className="w-full max-w-[1400px] px-4 md:px-8 pb-20 relative z-10" dir="rtl">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6">מקורות החדשות שלנו</h1>
            <p className="text-slate-300 mb-6 text-lg">
              אנו אוספים חדשות בזמן אמת מהמקורות המובילים בעולם ובישראל:
            </p>
            <ul className="space-y-4 text-slate-200">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <strong>Ynet</strong> - חדשות, טק, עתיד וסגנון חיים
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <strong>CNN</strong> - Global news, tech, space, entertainment
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <strong>BBC News</strong> - Global news and arts
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <strong>The Verge, TechCrunch, Wired</strong> - Technology and science
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <strong>גיקטיים, כלכליסט, דה מרקר, אנשים ומחשבים</strong> - טכנולוגיה וכלכלה בישראל
              </li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
