
export enum OrderStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  FAILED = 'Failed',
  REFUNDED = 'Refunded'
}

export interface Customer {
  name: string;
  email: string;
  address?: string;
  vatNumber?: string;
  country?: string;
}

export interface DeliveryInfo {
  status: 'sent' | 'delivered' | 'downloaded';
  deliveryId: string; // Unique hash for the download link
  sentAt: string;
  downloadCount: number;
  lastAccessedAt?: string;
  accessIp?: string;
  userAgent?: string; // Browser/Device info
}

export interface Order {
  id: string;
  customer: Customer;
  productName: string;
  price: number;
  currency: string;
  date: string; // ISO 8601 String (YYYY-MM-DDTHH:mm:ss)
  status: OrderStatus;
  paymentMethod?: string; // New Field for manual entry tracking
  notes?: string;
  invoiceNumber: string;
  transactionId?: string;
  delivery: DeliveryInfo; 
}

export interface PaymentSettings {
  paypal: {
    clientId: string;
    secretKey: string;
    isActive: boolean;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    isActive: boolean;
  };
}

export interface Chapter {
  number: number;
  title: string;
  bullets: string[];
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal: any;
  }
}
