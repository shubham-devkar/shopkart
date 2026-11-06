
export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  active?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
