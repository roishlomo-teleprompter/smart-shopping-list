
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShoppingBag, Share2, Check, ListChecks, Star, 
  Trash2, ShoppingCart, Plus, MessageCircle, 
  CheckCircle2, Circle, PlusCircle 
} from 'lucide-react';

// --- Types ---
interface ShoppingItem {
  id: string;
  name: string;
  isPurchased: boolean;
  isFavorite: boolean;
  createdAt: number;
  purchasedAt?: number;
}

// --- Header Component ---
const Header = () => {
  const [copied, setCopied] = useState(false);
  const handleShareApp = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'רשימת קניות', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">רשימת קניות</h1>
      </div>
      <button onClick={handleShareApp} className="p-2 text-slate-400">
        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
      </button>
    </header>
  );
};

// --- List Item Component ---
// Added React.FC typing to explicitly allow React-specific props like 'key' and improve type checking
const ListItem: React.FC<{
  item: ShoppingItem;
  onToggle: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}> = ({ item, onToggle, onFavorite, onDelete }) => (
  <div className={`group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-[0.98] ${item.isPurchased ? 'bg-slate-50 opacity-70' : ''}`}>
    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onToggle}>
      {item.isPurchased ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-300" />}
      <span className={`text-base font-medium transition-all ${item.isPurchased ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.name}</span>
    </div>
    <div className="flex items-center gap-1">
      <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} className={`p-2 transition-all ${item.isFavorite ? 'text-amber-500' : 'text-slate-200'}`}>
        <Star className={`w-5 h-5 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-200 hover:text-rose-500 transition-all"><Trash2 className="w-5 h-5" /></button>
    </div>
  </div>
);

// --- Main App Component ---
const App = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'favorites'>('list');
  const [inputValue, setInputValue] = useState('');

  // Storage
  useEffect(() => {
    const saved = localStorage.getItem('shopping_data_v2');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('shopping_data_v2', JSON.stringify(items));
  }, [items]);

  const addItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: inputValue.trim(),
      isPurchased: false,
      isFavorite: false,
      createdAt: Date.now()
    };
    setItems([newItem, ...items]);
    setInputValue('');
  };

  const togglePurchased = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isPurchased: !i.isPurchased, purchasedAt: !i.isPurchased ? Date.now() : undefined } : i));
  };

  const toggleFavorite = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
  };

  const deleteItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const shareViaWhatsApp = () => {
    const text = items.filter(i => !i.isPurchased).map(i => `• ${i.name}`).join('\n');
    const msg = encodeURIComponent(`*רשימת קניות:*\n\n${text}\n\nנשלח מהאפליקציה שלי 🛒`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const activeItems = items.filter(i => !i.isPurchased).sort((a,b) => b.createdAt - a.createdAt);
  const purchasedItems = items.filter(i => i.isPurchased).sort((a,b) => (b.purchasedAt || 0) - (a.purchasedAt || 0));
  const favoriteItems = items.filter(i => i.isFavorite);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 relative pb-24 shadow-2xl overflow-hidden">
      <Header />
      
      <main className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar">
        {activeTab === 'list' ? (
          <>
            <form onSubmit={addItem} className="relative group">
              <input 
                type="text"
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)}
                placeholder="מה תרצו לקנות?" 
                className="w-full p-4 pr-14 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
              />
              <button type="submit" className="absolute left-2 top-2 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </form>

            {items.length === 0 ? (
              <div className="text-center py-20 text-slate-300">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">הרשימה שלך ריקה</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  {activeItems.map(item => (
                    <ListItem key={item.id} item={item} onToggle={() => togglePurchased(item.id)} onFavorite={() => toggleFavorite(item.id)} onDelete={() => deleteItem(item.id)} />
                  ))}
                </div>
                {purchasedItems.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 px-2 uppercase tracking-widest">נקנו ({purchasedItems.length})</h3>
                    {purchasedItems.map(item => (
                      <ListItem key={item.id} item={item} onToggle={() => togglePurchased(item.id)} onFavorite={() => toggleFavorite(item.id)} onDelete={() => deleteItem(item.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold px-2 text-slate-800">מועדפים</h2>
            {favoriteItems.length === 0 ? (
              <div className="text-center py-20 text-slate-300">
                <Star className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>אין פריטים מועדפים</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {favoriteItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <button 
                      onClick={() => {
                        const exists = items.find(i => i.name === item.name && !i.isPurchased);
                        if (!exists) {
                          setItems([{ ...item, id: crypto.randomUUID(), isPurchased: false, createdAt: Date.now() }, ...items]);
                        }
                        setActiveTab('list');
                      }}
                      className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
                    >
                      הוסף לרשימה
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {activeTab === 'list' && activeItems.length > 0 && (
        <button 
          onClick={shareViaWhatsApp} 
          className="fixed bottom-24 left-6 bg-emerald-500 text-white px-6 py-4 rounded-full shadow-lg shadow-emerald-200 flex items-center gap-2 font-bold z-30 active:scale-95 transition-all"
        >
          <MessageCircle className="w-6 h-6" />
          שתף רשימה
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-100 h-20 flex justify-around items-center z-20 pb-4">
        <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <ListChecks className="w-6 h-6" />
          <span className="text-[10px] font-bold">רשימה</span>
        </button>
        <button onClick={() => setActiveTab('favorites')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'favorites' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Star className="w-6 h-6" />
          <span className="text-[10px] font-bold">מועדפים</span>
        </button>
      </nav>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
