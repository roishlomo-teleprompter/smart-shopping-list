
import React from 'react';
import { ShoppingItem } from '../types';

interface Props {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const ShoppingItemRow: React.FC<Props> = ({ item, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center justify-between p-4 mb-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-all ${item.completed ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => onToggle(item.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'
          }`}
        >
          {item.completed && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex flex-col">
          <span className={`text-gray-800 font-medium ${item.completed ? 'line-through text-gray-400' : ''}`}>
            {item.name} {item.quantity && <span className="text-gray-400 text-sm ml-1">({item.quantity})</span>}
          </span>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            {item.category}
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => onDelete(item.id)}
        className="text-gray-300 hover:text-red-500 transition-colors p-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default ShoppingItemRow;
