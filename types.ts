
export interface ShoppingItem {
  id: string;
  name: string;
  isPurchased: boolean;
  isFavorite: boolean;
  createdAt: number;
  purchasedAt?: number;
}

export type Tab = 'list' | 'favorites';
