
export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ProductVariation {
  id: string;
  productId: string;
  color: string;
  size: string;
  stock: number;
  reserved: number;
  available: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE';
  costPrice: number;
  salePrice: number;
  imageUrl: string;
  variations: ProductVariation[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  segment: 'VIP' | 'GOLD' | 'BRONZE' | 'NEW';
}

export interface OrderItem {
  variationId: string;
  qty: number;
  unitPrice: number;
}

export type OrderStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export interface Order {
  id: string;
  clientId: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export type ConditionalStatus = 'OPEN' | 'FINALIZED' | 'CONVERTED' | 'OVERDUE';

export interface Conditional {
  id: string;
  clientId: string;
  status: ConditionalStatus;
  deadline: string;
  totalValue: number;
  items: OrderItem[];
  createdAt: string;
}

export interface CashMovement {
  id: string;
  type: 'IN' | 'OUT';
  description: string;
  category: string;
  method: string;
  value: number;
  createdAt: string;
}
