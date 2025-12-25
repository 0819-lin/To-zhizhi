
import React, { useState, useRef } from 'react';
import { X, Mail, ImagePlus, ChevronRight, Sparkles } from 'lucide-react';
import { StickyNote } from '../types';

interface CardGeneratorProps {
  onClose: () => void;
  onSubmit: (note: StickyNote) => void;
}

const CardGenerator: React.FC<CardGeneratorProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    message: '愿你的2025充满魔法与光明！',
    imageUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入您的姓名以便署名');
      return;
    }
    
    setIsSubmitting(true);
    
    // Direct submission - no longer placing on 3D tree
    setTimeout(() => {
      const newNote: StickyNote = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        message: formData.message,
        imageUrl: formData.imageUrl,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      };
      onSubmit(newNote);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Left: Card Render */}
        <div className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center p-12 border-r border-white/5">
          <div className="relative w-full max-w-[280px] aspect-[3/4]">
            {step === 'edit' ? (
              <div className="absolute inset-0 bg-[#b91c1c] rounded-[2rem] shadow-2xl p-8 flex flex-col border border-yellow-600/30 overflow-hidden">
                <div className="absolute top-6 left-8 text-yellow-500/80 font-black tracking-[0.3em] text-xs">2025</div>
                <div className="flex-1 flex items-center justify-center relative opacity-20">
                   <svg viewBox="0 0 100 120" className="w-40 h-40 text-yellow-500">
                      <path d="M50 10 L85 100 L15 100 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                   </svg>
                </div>
                <div className="absolute bottom-12 right-0 bg-yellow-600/10 py-4 px-6 rounded-l-2xl border-y border-l border-yellow-500/20">
                   <div className="text-[9px] uppercase tracking-widest text-yellow-500/60 mb-1">To My Friend</div>
                   <div className="font-serif text-lg text-yellow-400 italic truncate max-w-[120px]">
                     {formData.name || "姓名"}
                   </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                <div className="flex-1 rounded-[1.5rem] bg-gray-50 overflow-hidden border border-gray-100 relative shadow-inner">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Upload" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                      <Mail size={32} strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-4 px-2">
                  <p className="font-serif text-gray-800 text-md leading-relaxed italic text-center italic">
                    {formData.message}
                  </p>
                  <div className="text-right border-t border-gray-50 pt-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">— {formData.name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-8 flex gap-2">
            <button onClick={() => setStep('edit')} className={`w-2 h-2 rounded-full transition-all ${step === 'edit' ? 'bg-[#ff4d4d] w-6' : 'bg-white/20'}`} />
            <button onClick={() => setStep('preview')} className={`w-2 h-2 rounded-full transition-all ${step === 'preview' ? 'bg-[#ff4d4d] w-6' : 'bg-white/20'}`} />
          </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="w-80 p-10 flex flex-col gap-6 bg-[#0f0f12]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Create Wish</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">署名</label>
              <input 
                type="text" 
                placeholder="Name..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#ff4d4d] transition-all text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">记忆照片</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all overflow-hidden shadow-inner"
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <Mail size={24} className="text-gray-700" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">祝福语</label>
              <textarea 
                rows={3}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#ff4d4d] transition-all resize-none text-white"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
            <button 
              onClick={() => setStep(step === 'edit' ? 'preview' : 'edit')}
              className="w-full py-4 bg-white/5 text-gray-500 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-white/10 transition-all"
            >
              {step === 'edit' ? '预览内页' : '查看封面'}
            </button>
            <button 
              onClick={handleSaveAndSubmit}
              disabled={!formData.name.trim() || isSubmitting}
              className={`w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl ${
                !formData.name.trim() || isSubmitting
                  ? 'bg-white/5 text-gray-800'
                  : 'bg-[#ff4d4d] hover:bg-[#ff3333] text-white shadow-red-500/20 active:scale-95'
              }`}
            >
              {isSubmitting ? "..." : <><Sparkles size={16} /> 保存贺卡</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
