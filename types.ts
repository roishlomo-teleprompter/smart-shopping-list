
export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  quantity?: string;
}

export enum ViewMode {
  LIST = 'LIST',
  VOICE = 'VOICE',
  RECIPE = 'RECIPE'
}

export interface GeminiCategorization {
  items: Array<{
    name: string;
    category: string;
    quantity?: string;
  }>;
}
