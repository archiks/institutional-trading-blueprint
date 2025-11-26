
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, OrderStatus, PaymentSettings } from '../types';

interface StoreContextType {
  orders: Order[];
  paymentSettings: PaymentSettings;
  updateOrder: (updatedOrder: Order) => void;
  addOrder: (order: Order) => void;
  updatePaymentSettings: (settings: PaymentSettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Initial Data
const initialOrders: Order[] = [
  {
    id: 'ord_001',
    invoiceNumber: 'INV-2023-001',
    date: '2023-10-24T14:30:00',
    productName: 'The Institutional Trading Blueprint™',
    price: 250,
    currency: 'EUR',
    status: OrderStatus.COMPLETED,
    paymentMethod: 'PayPal',
    customer: {
      name: 'Alexander Hamilton',
      email: 'alex.h@example.com',
      address: '10 Wall St, New York, NY',
      vatNumber: 'US998877',
      country: 'US'
    },
    delivery: {
      status: 'downloaded',
      deliveryId: 'dl_8f7a9c2b',
      sentAt: '2023-10-24T14:30:05',
      downloadCount: 3,
      lastAccessedAt: '2023-10-24T16:45:12',
      accessIp: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    notes: 'VIP Customer'
  },
  {
    id: 'ord_002',
    invoiceNumber: 'INV-2023-002',
    date: '2023-10-25T09:15:00',
    productName: 'The Institutional Trading Blueprint™',
    price: 250,
    currency: 'EUR',
    status: OrderStatus.PENDING,
    paymentMethod: 'Stripe',
    customer: {
      name: 'Sarah Connor',
      email: 'sarah.c@skynet.com',
      country: 'US'
    },
    delivery: {
      status: 'sent',
      deliveryId: 'dl_3d2e1f0a',
      sentAt: '2023-10-25T09:15:05',
      downloadCount: 0
    },
    notes: 'Payment verification needed'
  },
  {
    id: 'ord_003',
    invoiceNumber: 'INV-2023-003',
    date: '2023-10-26T18:45:00',
    productName: 'The Institutional Trading Blueprint™',
    price: 250,
    currency: 'EUR',
    status: OrderStatus.COMPLETED,
    paymentMethod: 'Bank Transfer',
    customer: {
      name: 'James Bond',
      email: '007@mi6.gov.uk',
      address: 'Vauxhall Cross, London',
      country: 'GB'
    },
    delivery: {
      status: 'downloaded',
      deliveryId: 'dl_007x99z',
      sentAt: '2023-10-26T18:45:05',
      downloadCount: 1,
      lastAccessedAt: '2023-10-26T19:00:00',
      accessIp: '203.0.113.19',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    }
  }
];

const initialPaymentSettings: PaymentSettings = {
  paypal: {
    clientId: '',
    secretKey: '',
    isActive: false
  },
  stripe: {
    publishableKey: '',
    secretKey: '',
    isActive: false
  }
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(initialPaymentSettings);

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updatePaymentSettings = (settings: PaymentSettings) => {
    setPaymentSettings(settings);
  };

  return (
    <StoreContext.Provider value={{ orders, updateOrder, addOrder, paymentSettings, updatePaymentSettings }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
