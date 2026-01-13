
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingItem, ViewMode } from './types';
import ShoppingItemRow from './components/ShoppingItemRow';
import VoiceMode from './components/VoiceMode';
import { getGeminiCategorization } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('smart_shop_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('smart_shop_items', JSON.stringify(items));
  }, [items]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(items.map(i => i.category))];
    return cats.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(i => i.category === filter);
  }, [items, filter]);

  const handleAddItem = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const result = await getGeminiCategorization(inputText);
      const newItems: ShoppingItem[] = result.items.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        completed: false
      }));
      setItems(prev => [...newItems, ...prev]);
      setInputText('');
    } catch (err) {
      console.error("AI Categorization failed, adding as 'Other'", err);
      setItems(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        name: inputText,
        category: 'Other',
        completed: false
      }, ...prev]);
      setInputText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.completed));
  };

  const handleVoiceResult = async (text: string) => {
    setInputText(text);
    // Auto-trigger the AI parsing
    setIsProcessing(true);
    try {
      const result = await getGeminiCategorization(text);
      const newItems: ShoppingItem[] = result.items.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        completed: false
      }));
      setItems(prev => [...newItems, ...prev]);
      setInputText('');
    } catch (err) {
      console.error("Voice AI fail", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 flex flex-col max-w-2xl mx-auto px-4 pt-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">SmartShop</h1>
          <p className="text-gray-500 font-medium">Your AI-powered shopping list</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setViewMode(ViewMode.VOICE)}
            className="p-3 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors shadow-sm"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Input Section */}
      <div className="sticky top-4 z-40 mb-6">
        <form 
          onSubmit={handleAddItem}
          className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add items or paste a recipe..."
            className="w-full py-5 pl-6 pr-32 focus:outline-none text-gray-700 font-medium text-lg placeholder-gray-400"
            disabled={isProcessing}
          />
          <button 
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Add"
            )}
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      {items.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                filter === cat 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* List Container */}
      <div className="flex-1">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">Your list is empty</h3>
            <p className="text-gray-600">Start typing above or use voice</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredItems.map(item => (
              <ShoppingItemRow 
                key={item.id} 
                item={item} 
                onToggle={toggleItem} 
                onDelete={deleteItem} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {items.some(i => i.completed) && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={clearCompleted}
            className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Completed
          </button>
        </div>
      )}

      {/* Modals */}
      {viewMode === ViewMode.VOICE && (
        <VoiceMode 
          onClose={() => setViewMode(ViewMode.LIST)}
          onItemsAdded={handleVoiceResult}
        />
      )}
    </div>
  );
};

export default App;
