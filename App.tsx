
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingItem, Tab } from './types.ts';
import Navbar from './components/Navbar.tsx';
import ShoppingList from './components/ShoppingList.tsx';
import FavoritesList from './components/FavoritesList.tsx';
import Header from './components/Header.tsx';
import ShareButton from './components/ShareButton.tsx';

const STORAGE_KEY = 'shopping_list_data';

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('list');

  // Load initial data
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored items", e);
      }
    }
  }, []);

  // Save on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((name: string) => {
    if (!name.trim()) return;
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      isPurchased: false,
      isFavorite: false,
      createdAt: Date.now(),
    };
    setItems(prev => [newItem, ...prev]);
  }, []);

  const togglePurchased = useCallback((id: string) => {
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
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearPurchased = useCallback(() => {
    setItems(prev => prev.filter(item => !item.isPurchased));
  }, []);

  const addFromFavorite = useCallback((item: ShoppingItem) => {
    const existing = items.find(i => i.name === item.name);
    if (existing) {
      if (existing.isPurchased) {
        togglePurchased(existing.id);
      }
    } else {
      addItem(item.name);
    }
    setActiveTab('list');
  }, [items, addItem, togglePurchased]);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-slate-50 shadow-xl pb-24">
      <Header />
      
      <main className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        {activeTab === 'list' ? (
          <ShoppingList 
            items={items} 
            onTogglePurchased={togglePurchased}
            onToggleFavorite={toggleFavorite}
            onDeleteItem={deleteItem}
            onAddItem={addItem}
            onClearPurchased={clearPurchased}
          />
        ) : (
          <FavoritesList 
            items={items}
            onAddToList={addFromFavorite}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </main>

      {activeTab === 'list' && items.length > 0 && (
        <ShareButton items={items.filter(i => !i.isPurchased)} />
      )}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
