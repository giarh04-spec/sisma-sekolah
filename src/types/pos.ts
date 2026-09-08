export type UserRole = 'admin' | 'kasir' | 'owner';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  branchId: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface Customer {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  totalSpent: number;
  createdAt: string;
}

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  categoryId: string;
  description?: string;
  photo?: string;
  unit: 'pcs' | 'box' | 'dus' | 'botol' | 'kg' | 'liter' | 'pack';
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  discount: number; // percentage or nominal
  supplierId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
  subtotal: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  barcode: string;
  price: number;
  purchasePrice: number;
  qty: number;
  discount: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'debit' | 'kredit' | 'ewallet';

export interface Transaction {
  id: string;
  trxNumber: string;
  date: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  customerId?: string;
  customerName?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountReceived: number;
  change: number;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'void' | 'pending';
}

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'opname' | 'sale';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  qtyChange: number;
  stockBefore: number;
  stockAfter: number;
  note: string;
  date: string;
  userId: string;
  userName: string;
  branchId: string;
}

export interface Promotion {
  id: string;
  title: string;
  type: 'percent' | 'nominal' | 'bogo' | 'bundle';
  productId?: string;
  categoryId?: string;
  minQty?: number;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number; // percentage, e.g., 0 or 11
  receiptHeader: string;
  receiptFooter: string;
  printerWidth: '58mm' | '80mm';
  activeBranchId: string;
}
