
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateScene } from './services/geminiService.ts';
import { SceneConfig, Message, StickyNote } from './types.ts';
import ThreeViewer from './components/ThreeViewer.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import CardGenerator from './components/CardGenerator.tsx';
import GiftBoxSurprise from './components/GiftBoxSurprise.tsx';
import { Layers, Code, Settings, MousePointer2, Sparkles, X, Trash2, Download, UploadCloud, Heart, Play } from 'lucide-react';

const STORAGE_KEY = 'lumina_xmas_cards_v1';

const INITIAL_CONFIG: SceneConfig = {
  objects: [
    {
      id: 'cinematic-tree-01',
      type: 'particleTree',
      position: { x: 0, y: -2.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.1, y: 1.1, z: 1.1 },
      color: '#041a12', 
      wireframe: false,
      metalness: 0.9,
      roughness: 0.1,
      intensity: 1.5
    }
  ],
  ambientLightIntensity: 0.2,
  pointLightColor: '#ffd700',
  pointLightPosition: { x: 5, y: 10, z: 5 },
  backgroundColor: '#010103',
  showSnow: true
};

const App: React.FC = () => {
  const [config, setConfig] = useState<SceneConfig>(INITIAL_CONFIG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'code'>('design');
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const savedCards = localStorage.getItem(STORAGE_KEY);
    if (savedCards) {
      try {
        setNotes(JSON.parse(savedCards));
      } catch (e) {
        console.error("Failed to load saved cards", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { text, config: newConfig } = await generateScene(content);
      const assistantMsg: Message = { role: 'assistant', content: text, timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);
      setConfig(newConfig);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddNote = (note: StickyNote) => setNotes(prev => [...prev, note]);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const removeNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  const downloadCard = (note: StickyNote) => {
    if (!note.imageUrl) return;
    const link = document.createElement('a');
    link.href = note.imageUrl;
    link.download = `xmas-card-${note.name}.png`;
    link.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#010103] text-white">
      {!isUnwrapped && <GiftBoxSurprise onOpen={() => setIsUnwrapped(true)} />}

      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} loop />}
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />

      <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-8 bg-[#020205] z-50">
        <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <Heart size={20} className="text-white fill-current" />
        </div>
        <nav className="flex flex-col gap-4">
          <button className="p-3 text-[#ff4d4d] bg-white/5 rounded-2xl transition-all"><MousePointer2 size={20} /></button>
          <button className="p-3 text-gray-600 hover:text-white rounded-2xl transition-all"><Sparkles size={20} /></button>
        </nav>
      </div>

      <div className={`flex-1 flex flex-col relative transition-all duration-1000 ${isUnwrapped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#010103]/60 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black tracking-widest text-white uppercase">For my dear friend ⭐</h1>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic font-mono uppercase">2025 Creative Spatial</span>
          </div>
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button onClick={() => setActiveTab('design')} className={`px-4 py-1.5 text-[10px] uppercase font-black rounded-full transition-all ${activeTab === 'design' ? 'bg-[#ff4d4d] text-white' : 'text-gray-500'}`}>Visual</button>
            <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 text-[10px] uppercase font-black rounded-full transition-all ${activeTab === 'code' ? 'bg-[#ff4d4d] text-white' : 'text-gray-500'}`}>System</button>
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden">
          {activeTab === 'design' ? (
            <ThreeViewer ref={viewerRef} config={config} onTreeClick={() => setIsCardOpen(true)} />
          ) : (
            <div className="p-12 h-full overflow-y-auto bg-[#010103]">
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 max-w-2xl mx-auto shadow-2xl">
                <pre className="text-pink-200/60 text-xs font-mono">{JSON.stringify(config, null, 2)}</pre>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
             <div className="absolute bottom-10 left-10 flex flex-col gap-4 z-30 animate-in fade-in slide-in-from-bottom duration-1000">
               <div className="flex items-center gap-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 shadow-2xl">
                 <button 
                   onClick={() => setIsMyCardsOpen(true)}
                   className="px-8 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white rounded-[2rem] transition-all active:scale-90 shadow-xl shadow-red-500/10 group relative"
                 >
                   <span className="text-[12px] font-black uppercase tracking-[0.2em]">我的贺卡</span>
                   {notes.length > 0 && (
                     <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#4ade80] text-black text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#010103] animate-bounce">
                       {notes.length}
                     </span>
                   )}
                 </button>
                 <div className="w-[1px] h-6 bg-white/10 mx-2" />
                 <button 
                   onClick={() => audioInputRef.current?.click()}
                   className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-[#4ade80] text-gray-400 hover:text-black rounded-full transition-all active:scale-90 shadow-inner"
                 >
                   <UploadCloud size={20} />
                 </button>
                 <button 
                   onClick={togglePlay}
                   disabled={!audioUrl}
                   className={`w-14 h-14 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-xl ${
                     !audioUrl ? 'opacity-10' : 'bg-[#4ade80] text-black hover:bg-[#39c56b]'
                   }`}
                 >
                   {isPlaying ? (
                     <div className="flex items-end gap-[1px] h-3">
                       {[1,2,3].map(i => <div key={i} className="w-[3px] bg-black animate-music-bar" style={{ animationDelay: `${i*0.1}s` }} />)}
                     </div>
                   ) : <Play size={20} fill="currentColor" />}
                 </button>
               </div>
               <p className="ml-6 text-[10px] text-pink-200/40 uppercase font-black tracking-[0.5em] italic">Merry Xmas & Happy 2025</p>
             </div>
          )}
        </main>
      </div>

      <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />

      {isMyCardsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[4rem] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-12 flex items-center justify-between border-b border-white/5">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Memory Archive</h2>
              <button onClick={() => setIsMyCardsOpen(false)} className="w-16 h-16 bg-white/5 hover:bg-[#ff4d4d] rounded-full transition-all flex items-center justify-center group">
                <X size={32} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-12 pb-12 custom-scrollbar">
              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-800 gap-4 opacity-50">
                  <Heart size={80} strokeWidth={0.5} />
                  <p className="text-xs uppercase tracking-widest font-black italic">No memories yet...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
                  {notes.map((note) => (
                    <div key={note.id} className="group bg-[#141417] rounded-[3rem] p-6 hover:scale-[1.03] transition-all shadow-2xl border border-white/5">
                      <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-6 bg-black relative shadow-inner">
                        {note.imageUrl && <img src={note.imageUrl} className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                           <button onClick={() => downloadCard(note)} className="w-full py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest">Download</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-[#ff4d4d] uppercase tracking-[0.1em]">From {note.name}</span>
                        <button onClick={() => removeNote(note.id)} className="text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed italic line-clamp-3">"{note.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCardOpen && <CardGenerator onClose={() => setIsCardOpen(false)} onSubmit={handleAddNote} />}

      <style>{`
        @keyframes music-bar { 0%, 100% { height: 4px; } 50% { height: 12px; } }
        .animate-music-bar { animation: music-bar 0.8s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
};

export default App;
