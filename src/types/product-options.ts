// src/types/product-options.ts
export interface OptionItem {
  id: number;
  option_id: number;
  name: string;
  price_addition: number;
}

export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
}

export interface SelectedOption {
  option_id: number;
  option_name: string;
  selected_items: {
    item_id: number;
    item_name: string;
    price_addition: number;
  }[];
}

// Extender la interfaz Product existente
import { Product as BaseProduct } from './commerce';

export interface Product extends BaseProduct {
  options?: ProductOption[];
  selected_options?: SelectedOption[];
}