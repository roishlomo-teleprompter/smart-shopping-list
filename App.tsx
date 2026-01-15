
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShoppingBag, Share2, Star, Trash2, 
  ShoppingCart, Plus, Minus, MessageCircle, 
  CheckCircle2, Circle, ListChecks, Check, X, AlertCircle,
  FileText, Sparkles, LogOut, User
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ShoppingItem, ShoppingList, Tab } from './types.ts';

// Note: In a real production app, you would initialize Firebase here.
// Since we are in a demo environment, we will mock the backend logic 
// but provide the UI and logic structure requested in the spec.

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [inputValue, setInputValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Mock User State
  const [user, setUser] = useState<{ uid: string; displayName: string } | null>({ 
    uid: 'demo-user', 
    displayName: 'משתמש דמו' 
  });

  // Load from Local Storage (Mocking Firestore Sync)
  useEffect(() => {
    const savedItems = localStorage.getItem('sl_items_v7');
    const savedFavs = localStorage.getItem('sl_favs_v7');
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  useEffect(() => {
    localStorage.setItem('sl_items_v7', JSON.stringify(items));
    localStorage.setItem('sl_favs_v7', JSON.stringify(favorites));
  }, [items, favorites]);

  const addItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: inputValue.trim(),
      quantity: 1,
      isPurchased: false,
      isFavorite: false,
      createdAt: Date.now()
    };
    setItems(prev => [newItem, ...prev]);
    setInputValue('');
  };

  const togglePurchased = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const isNowPurchased = !item.isPurchased;
        return {
          ...item,
          isPurchased: isNowPurchased,
          purchasedAt: isNowPurchased ? Date.now() : undefined
        };
      }
      return item;
    }));
  };

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const clearList = () => {
    setItems([]);
    setShowClearConfirm(false);
  };

  const getAiSuggestions = async () => {
    setIsAiLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const currentList = items.map(i => i.name).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `אני מכין רשימת קניות. הפריטים הנוכחיים שלי הם: ${currentList}. תן לי 5 הצעות לפריטים נוספים שחסרים לי בדרך כלל עם פריטים אלו. החזר רק רשימה מופרדת בפסיקים של שמות הפריטים בעברית.`,
      });
      
      const suggestions = response.text?.split(',').map(s => s.trim()) || [];
      // Add first suggestion for demo
      if (suggestions.length > 0) {
        setInputValue(suggestions[0]);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const shareWhatsApp = () => {
    const active = items.filter(i => !i.isPurchased);
    if (active.length === 0) return;
    const listText = active.map(i => `${i.name} x${i.quantity}`).join('\n');
    const message = encodeURIComponent(`*רשימת קניות*\n\n${listText}\n\nנשלח מהרשימה החכמה 🛒`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const activeItems = useMemo(() => items.filter(i => !i.isPurchased).sort((a,b) => b.createdAt - a.createdAt), [items]);
  const purchasedItems = useMemo(() => items.filter(i => i.isPurchased).sort((a,b) => (b.purchasedAt || 0) - (a.purchasedAt || 0)), [items]);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 relative pb-32 shadow-2xl overflow-hidden dir-rtl" dir="rtl">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
           <button 
             onClick={getAiSuggestions}
             className={`p-2 rounded-full transition-all ${isAiLoading ? 'bg-indigo-100 animate-pulse' : 'bg-slate-100 hover:bg-indigo-50 text-indigo-600'}`}
             title="הצעות חכמות"
           >
             <Sparkles className="w-5 h-5" />
           </button>
           <button className="p-2 text-slate-400 hover:text-rose-500" onClick={() => setShowClearConfirm(true)}>
             <Trash2 className="w-5 h-5" />
           </button>
           <button 
             onClick={() => {
               navigator.clipboard.writeText(window.location.href);
               setIsCopied(true);
               setTimeout(() => setIsCopied(false), 2000);
             }}
             className="p-2 text-slate-400"
           >
             {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
           </button>
        </div>
        
        <h1 className="text-xl font-extrabold text-slate-800">הרשימה שלי</h1>
        
        <button className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 active:scale-90 transition-transform">
          <FileText className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-6 overflow-y-auto no-scrollbar">
        {activeTab === 'list' ? (
          <>
            <form onSubmit={addItem} className="relative">
              <input 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)}
                placeholder="מה להוסיף לרשימה?" 
                className="w-full p-4 pr-4 pl-14 rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 bg-white text-right"
              />
              <button type="submit" className="absolute left-2.5 top-2.5 bg-indigo-600 text-white p-2.5 rounded-xl shadow-md active:scale-90 transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </form>

            {items.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <ShoppingCart className="w-20 h-20 mx-auto mb-4 stroke-1" />
                <p className="text-lg font-bold">הרשימה ריקה</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {activeItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => toggleFavorite(item.name)} className={`p-2 transition-colors ${favorites.includes(item.name) ? 'text-amber-500' : 'text-slate-300'}`}>
                          <Star className={`w-4 h-4 ${favorites.includes(item.name) ? 'fill-amber-500' : ''}`} />
                        </button>
                        
                        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100 mr-2">
                           <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400"><Minus className="w-3 h-3" /></button>
                           <span className="text-sm font-black text-slate-700 min-w-[1rem] text-center">{item.quantity}</span>
                           <button onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-400"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 overflow-hidden flex-1 justify-end cursor-pointer" onClick={() => togglePurchased(item.id)}>
                        <span className="text-base font-bold text-slate-700 truncate">{item.name}</span>
                        <Circle className="w-6 h-6 text-slate-300 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>

                {purchasedItems.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right mb-2">נקנו ({purchasedItems.length})</h3>
                    {purchasedItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-100/50 rounded-2xl opacity-60 grayscale transition-all">
                        <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-300"><Trash2 className="w-4 h-4" /></button>
                        <div className="flex items-center gap-3 flex-1 justify-end cursor-pointer" onClick={() => togglePurchased(item.id)}>
                          <span className="text-base font-bold text-slate-500 line-through truncate">{item.name} x{item.quantity}</span>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">מועדפים</h2>
              <p className="text-sm text-slate-400 font-bold">פריטים שחוזרים לסל</p>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-20 opacity-20"><Star className="w-16 h-16 mx-auto mb-4 stroke-1" /><p className="font-bold">אין מועדפים עדיין</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {favorites.map(favName => (
                  <div key={favName} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <button 
                      onClick={() => {
                        const existing = items.find(i => i.name === favName && !i.isPurchased);
                        if (existing) {
                          updateQty(existing.id, 1);
                        } else {
                          setItems(prev => [{ id: crypto.randomUUID(), name: favName, quantity: 1, isPurchased: false, isFavorite: true, createdAt: Date.now() }, ...prev]);
                        }
                        setActiveTab('list');
                      }}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                    >הוסף לרשימה</button>
                    <span className="font-bold text-slate-700">{favName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* WhatsApp Button */}
      {activeTab === 'list' && activeItems.length > 0 && (
        <button 
          onClick={shareWhatsApp} 
          className="fixed bottom-28 left-6 right-6 bg-emerald-500 text-white py-4 rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 font-black z-30 active:scale-95 transition-all border-2 border-white"
        >
          <MessageCircle className="w-6 h-6" />
          <span>שתף רשימה בוואטסאפ</span>
        </button>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-100 h-24 flex justify-around items-center z-50 pb-8 px-10">
        <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
          <ListChecks className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">רשימה</span>
        </button>
        <button onClick={() => setActiveTab('favorites')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'favorites' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
          <Star className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">מועדפים</span>
        </button>
      </nav>

      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl text-center space-y-6 animate-pop">
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">למחוק את כל הרשימה?</h3>
              <p className="text-sm text-slate-400 font-bold">הפעולה לא תמחק את המועדפים שלך.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold">ביטול</button>
              <button onClick={clearList} className="py-4 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-100">מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
