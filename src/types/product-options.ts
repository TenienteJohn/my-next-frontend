// src/types/product-options.ts
import { Product as BaseProduct } from './commerce';
import { ItemTag, OptionTag, ProductTag } from './tags';

export interface OptionItem {
  id: number;
  option_id: number;
  name: string;
  price_addition: number;
  available: boolean;
  image_url?: string;
  tags?: ItemTag[]; // Agregamos etiquetas a los ítems
}

export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
  tags?: OptionTag[]; // Agregamos etiquetas a las opciones
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
export interface Product extends BaseProduct {
  options?: ProductOption[];
  selected_options?: SelectedOption[];
  tags?: ProductTag[]; // Agregamos etiquetas a los productos
}