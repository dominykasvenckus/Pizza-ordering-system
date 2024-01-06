export interface Topping {
  toppingId: number;
  name: string;
  currentPrice: number;
}

export interface Size {
  sizeId: number;
  name: string;
  currentPrice: number;
}

export interface Pizza {
  pizzaId: number;
  description: string;
  orderPrice: number;
  orderedAt?: string;
  size: Size;
  toppings: Topping[];
}
