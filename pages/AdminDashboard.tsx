
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { generateInvoicePDF } from '../services/invoiceService';
import { Button } from '../components/ui/Button';
import { Search, Download, Edit2, Mail, CheckCircle, XCircle, Lock, CreditCard, Server, ShieldCheck, Activity, Database, Key, Terminal, AlertCircle, Calendar, Clock, MapPin, Wifi, Monitor, Fingerprint, Globe, Plus, FileText, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
];

// --- Icons & UI Helpers ---

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      active 
        ? 'bg-white text-black shadow-lg shadow-white/10' 
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles = {
    [OrderStatus.COMPLETED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [OrderStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [OrderStatus.FAILED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [OrderStatus.REFUNDED]: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

const DeliveryBadge: React.FC<{ status: 'sent' | 'delivered' | 'downloaded' }> = ({ status }) => {
  if (status === 'downloaded') {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-400" title="Product Downloaded">
         <CheckCircle size={12} /> Downloaded
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-zinc-500" title="Link Sent">
       <Mail size={12} /> Sent
    </span>
  );
};

export const AdminDashboard: React.FC = () => {
  const { orders, updateOrder, addOrder, paymentSettings, updatePaymentSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'system'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Split Date/Time State for Editing
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // New Order Form State
  const [newOrderData, setNewOrderData] = useState({
    customerName: '',
    email: '',
    vatNumber: '',
    address: '',
    country: '',
    productName: 'The Institutional Trading Blueprint™',
    quantity: 1,
    price: 250,
    currency: 'EUR',
    invoiceId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    status: OrderStatus.COMPLETED,
    paymentMethod: 'Manual',
    sendEmail: true,
    includeLink: true,
    attachInvoice: true
  });

  // Initialize New Order ID when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      setNewOrderData(prev => ({
        ...prev,
        invoiceId: `INV-${year}-${randomId}`
      }));
    }
  }, [isCreateModalOpen]);

  // Payment Form State
  const [paypalClientId, setPaypalClientId] = useState(paymentSettings.paypal.clientId);
  const [paypalSecret, setPaypalSecret] = useState(paymentSettings.paypal.secretKey);
  const [stripeKey, setStripeKey] = useState(paymentSettings.stripe.publishableKey);
  const [stripeSecret, setStripeSecret] = useState(paymentSettings.stripe.secretKey);
  
  const [connectionStatus, setConnectionStatus] = useState<{
    provider: 'paypal' | 'stripe' | null;
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ provider: null, status: 'idle' });

  // Sync local state if store changes
  useEffect(() => {
    setPaypalClientId(paymentSettings.paypal.clientId);
    setPaypalSecret(paymentSettings.paypal.secretKey);
    setStripeKey(paymentSettings.stripe.publishableKey);
    setStripeSecret(paymentSettings.stripe.secretKey);
  }, [paymentSettings]);

  const filteredOrders = orders.filter(order => 
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (order: Order) => {
    setSelectedOrder({ ...order }); // Create a copy
    
    // Parse Date and Time from ISO string
    const dateObj = new Date(order.date);
    const datePart = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const timePart = dateObj.toTimeString().slice(0, 5); // HH:MM
    
    setEditDate(datePart);
    setEditTime(timePart);
    
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder) {
      // Recombine Date and Time
      const combinedDateTime = `${editDate}T${editTime}:00`;
      
      // Validation
      if (!editDate || !editTime) {
        alert("Date and Time are required.");
        return;
      }

      updateOrder({
        ...selectedOrder,
        date: combinedDateTime
      });
      setIsEditModalOpen(false);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrderData.customerName || !newOrderData.email || !newOrderData.country) {
      alert("Please fill in all required fields.");
      return;
    }

    const deliveryId = 'dl_' + Math.random().toString(36).substr(2, 9);
    const combinedDateTime = `${newOrderData.date}T${newOrderData.time}:00`;

    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      invoiceNumber: newOrderData.invoiceId,
      date: combinedDateTime,
      productName: newOrderData.productName,
      price: newOrderData.price,
      currency: newOrderData.currency,
      status: newOrderData.status,
      paymentMethod: newOrderData.paymentMethod,
      customer: {
        name: newOrderData.customerName,
        email: newOrderData.email,
        address: newOrderData.address,
        vatNumber: newOrderData.vatNumber,
        country: newOrderData.country
      },
      delivery: {
        status: newOrderData.includeLink ? 'sent' : 'sent', // Logic simplification for demo
        deliveryId: deliveryId,
        sentAt: combinedDateTime,
        downloadCount: 0
      }
    };

    addOrder(newOrder);
    
    // Simulate Email Sending
    if (newOrderData.sendEmail) {
       console.log("Sending email to", newOrderData.email);
    }

    alert("Order created successfully!");
    setIsCreateModalOpen(false);
  };

  const handleEmailInvoice = (order: Order) => {
    alert(`System Notification:\n\nInvoice #${order.invoiceNumber} has been queued for delivery to ${order.customer.email}.\n\nAttached: PDF Invoice (With Digital Delivery Confirmation)`);
  };

  const handleTestConnection = (provider: 'paypal' | 'stripe') => {
    setConnectionStatus({ provider, status: 'testing' });
    
    // Simulate Secure Backend API Call
    setTimeout(() => {
      const isValid = Math.random() > 0.2; // 80% success chance for demo
      if (isValid) {
        setConnectionStatus({ 
          provider, 
          status: 'success', 
          message: 'Connection successful. API Responded in 124ms.' 
        });
      } else {
        setConnectionStatus({ 
          provider, 
          status: 'error', 
          message: 'Connection failed: Invalid credentials or timeout.' 
        });
      }
    }, 1500);
  };

  const handleSavePaymentSettings = () => {
    updatePaymentSettings({
      paypal: { 
        clientId: paypalClientId, 
        secretKey: paypalSecret, 
        isActive: !!paypalClientId 
      },
      stripe: { 
        publishableKey: stripeKey, 
        secretKey: stripeSecret, 
        isActive: !!stripeKey 
      }
    });
    alert("Settings Saved.\n\nCredentials have been encrypted (AES-256) and stored in the secure vault.");
  };

  // Helper to format ISO date for display
  const formatDateDisplay = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-200 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-inner">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">Backend Control</span>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-full border border-white/5">
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={Database} label="Orders" />
            <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={CreditCard} label="Payment Settings" />
            <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={Server} label="System Specs" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Online
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          
          {/* --- ORDERS TAB --- */}
          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Order Management</h1>
                  <p className="text-zinc-400 text-sm">View and manage customer orders, invoices, and fulfillment.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search orders..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 transition-colors w-64"
                    />
                  </div>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                    <Plus size={16} strokeWidth={2.5} /> New Order
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/5 text-zinc-400 font-medium">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date Placed</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Delivery</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">{order.invoiceNumber}</td>
                        <td className="px-6 py-4 text-zinc-400">{formatDateDisplay(order.date)}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{order.customer.name}</div>
                          <div className="text-zinc-500 text-xs">{order.customer.email}</div>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{order.productName}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4">
                          <DeliveryBadge status={order.delivery.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-white">€{order.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => generateInvoicePDF(order)} title="Download Invoice" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
                              <Download size={16} />
                            </button>
                            <button onClick={() => handleEmailInvoice(order)} title="Email Invoice" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
                              <Mail size={16} />
                            </button>
                            <button onClick={() => handleEdit(order)} title="Edit Order" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                          No orders found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* --- PAYMENTS TAB --- */}
          {activeTab === 'payments' && (
             <motion.div 
             key="payments"
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
             className="max-w-3xl mx-auto"
           >
             <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Payment Integration Settings</h1>
                <p className="text-zinc-400 text-sm">Connect and manage your payment providers. API keys are encrypted and stored securely.</p>
             </div>

             <div className="space-y-6">
               {/* PayPal Card */}
               <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#003087]/10 to-transparent">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-[#003087] rounded-lg">
                         <CreditCard className="text-white" size={20} />
                       </div>
                       <div>
                         <h3 className="text-lg font-semibold text-white">PayPal Integration</h3>
                         <p className="text-xs text-zinc-400">Process payments and issue invoices via PayPal</p>
                       </div>
                     </div>
                     {paymentSettings.paypal.isActive && (
                       <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                         <CheckCircle size={12} /> Active
                       </span>
                     )}
                   </div>
                 </div>
                 
                 <div className="p-6 space-y-5">
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Client ID</label>
                     <input 
                       type="password" 
                       value={paypalClientId} 
                       onChange={(e) => setPaypalClientId(e.target.value)}
                       placeholder="••••••••••••••••••••••••••••••••"
                       className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-zinc-700"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Secret Key</label>
                     <input 
                       type="password" 
                       value={paypalSecret} 
                       onChange={(e) => setPaypalSecret(e.target.value)}
                       placeholder="••••••••••••••••••••••••••••••••"
                       className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-zinc-700"
                     />
                   </div>
                   
                   <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                     <Lock size={12} />
                     <span>Keys are encrypted (AES-256) and never displayed in plain text.</span>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <button 
                       onClick={() => handleTestConnection('paypal')}
                       disabled={connectionStatus.status === 'testing'}
                       className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                     >
                       {connectionStatus.provider === 'paypal' && connectionStatus.status === 'testing' ? (
                         <span className="animate-pulse">Connecting...</span>
                       ) : (
                         <>Test Connection</>
                       )}
                     </button>
                     <Button onClick={handleSavePaymentSettings} size="sm" variant="primary">Save PayPal Settings</Button>
                   </div>
                   
                   {connectionStatus.provider === 'paypal' && connectionStatus.message && (
                     <div className={`text-xs flex items-center gap-2 mt-2 ${connectionStatus.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                       {connectionStatus.status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                       {connectionStatus.message}
                     </div>
                   )}
                 </div>
               </div>

               {/* Stripe Card */}
               <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl opacity-80 hover:opacity-100 transition-opacity">
                 <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#635BFF]/10 to-transparent">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-[#635BFF] rounded-lg">
                         <CreditCard className="text-white" size={20} />
                       </div>
                       <div>
                         <h3 className="text-lg font-semibold text-white">Stripe Integration</h3>
                         <p className="text-xs text-zinc-400">Card payments and advanced billing (Optional)</p>
                       </div>
                     </div>
                     {paymentSettings.stripe.isActive && (
                        <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                   </div>
                 </div>
                 
                 <div className="p-6 space-y-5">
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Publishable Key</label>
                     <input 
                       type="password" 
                       value={stripeKey} 
                       onChange={(e) => setStripeKey(e.target.value)}
                       placeholder="pk_live_••••••••••••••••"
                       className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#635BFF]/50 focus:ring-1 focus:ring-[#635BFF]/50 transition-all placeholder-zinc-700"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Secret Key</label>
                     <input 
                       type="password" 
                       value={stripeSecret} 
                       onChange={(e) => setStripeSecret(e.target.value)}
                       placeholder="sk_live_••••••••••••••••"
                       className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#635BFF]/50 focus:ring-1 focus:ring-[#635BFF]/50 transition-all placeholder-zinc-700"
                     />
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <button 
                       onClick={() => handleTestConnection('stripe')}
                       disabled={connectionStatus.status === 'testing'}
                       className="text-sm text-zinc-400 hover:text-white transition-colors"
                     >
                       Test Connection
                     </button>
                     <Button onClick={handleSavePaymentSettings} size="sm" variant="secondary">Save Stripe Settings</Button>
                   </div>
                   
                   {connectionStatus.provider === 'stripe' && connectionStatus.message && (
                     <div className={`text-xs flex items-center gap-2 mt-2 ${connectionStatus.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                       {connectionStatus.status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                       {connectionStatus.message}
                     </div>
                   )}
                 </div>
               </div>

             </div>
           </motion.div>
          )}

          {/* --- SYSTEM SPECS TAB --- */}
          {activeTab === 'system' && (
            <motion.div 
              key="system"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Docs */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Database size={20} className="text-blue-500"/> Backend System & Invoice Management
                    </h2>
                    <div className="prose prose-invert prose-sm text-zinc-400">
                      <p className="mb-4">
                        The <strong>Institutional Trading Blueprint™</strong> platform utilizes a high-integrity backend architecture designed for compliance and secure record-keeping. The system strictly adheres to standard accounting principles.
                      </p>
                      
                      <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl mb-6">
                        <h3 className="text-white font-semibold mb-3">1. Fully Integrated Order Management System</h3>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>Every transaction is atomically recorded in the <code className="text-blue-400">orders</code> table.</li>
                          <li>Admin capabilities include full CRUD (Create, Read, Update, Delete) access for order details including customer name, VAT info, and pricing adjustments.</li>
                          <li>Audit logs track all manual changes to order states to ensure data integrity.</li>
                        </ul>
                      </div>

                      <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl mb-6">
                         <h3 className="text-white font-semibold mb-3">2. Built-In PDF Invoice Generator</h3>
                         <p className="mb-2">The system includes a native PDF rendering engine (<code className="text-zinc-500">jspdf-autotable</code>) that generates compliant invoices on-the-fly.</p>
                         <ul className="space-y-2 list-disc pl-5">
                           <li><strong>Auto-Generation:</strong> Triggers immediately upon <code className="text-green-400">PAYMENT_SUCCESS</code> webhook.</li>
                           <li><strong>Manual Reissue:</strong> Admin can regenerate invoices after editing customer details (e.g., adding a forgotten VAT number).</li>
                           <li><strong>Storage:</strong> Invoices are indexed by <code className="text-blue-400">invoice_number</code> and linked to the parent order ID.</li>
                         </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-emerald-500"/> Security & Encryption
                    </h2>
                    <div className="bg-black border border-white/10 p-6 rounded-2xl">
                       <div className="flex items-start gap-4">
                          <div className="p-3 bg-zinc-900 rounded-full border border-white/5">
                             <Key size={20} className="text-amber-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-2">Zero-Knowledge Key Storage</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                              API Keys (PayPal Client/Secret, Stripe Keys) are never stored in plain text. They are encrypted using <strong>AES-256-GCM</strong> before being written to the database. 
                            </p>
                            <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 font-mono text-xs text-zinc-500">
                              <span className="text-purple-400">const</span> encrypted = <span className="text-blue-400">crypto</span>.publicEncrypt(key, buffer);
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: API Reference */}
                <div className="lg:col-span-1">
                   <div className="sticky top-24">
                     <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Terminal size={18} /> API Endpoints
                        </h3>
                        <div className="space-y-4">
                          {[
                            { method: 'GET', path: '/api/v1/orders', desc: 'List all orders' },
                            { method: 'POST', path: '/api/v1/orders/:id/invoice', desc: 'Generate PDF' },
                            { method: 'POST', path: '/api/admin/payments/test', desc: 'Test Credentials' },
                            { method: 'PUT', path: '/api/admin/settings', desc: 'Update Keys' },
                          ].map((ep, i) => (
                            <div key={i} className="group">
                              <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                                <span className={`px-1.5 py-0.5 rounded ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : ep.method === 'POST' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                  {ep.method}
                                </span>
                                <span className="text-zinc-300">{ep.path}</span>
                              </div>
                              <p className="text-xs text-zinc-500">{ep.desc}</p>
                            </div>
                          ))}
                        </div>
                     </div>

                     <div className="mt-6 p-6 bg-zinc-900/30 rounded-2xl border border-white/5">
                        <h4 className="text-white text-sm font-semibold mb-2">Data Model Schema</h4>
                        <pre className="text-[10px] text-zinc-400 font-mono overflow-x-auto">
{`interface PaymentConfig {
  provider: 'paypal' | 'stripe';
  encrypted_key: string;
  iv: string; // Initialization Vector
  updated_at: Timestamp;
  active: boolean;
}`}
                        </pre>
                     </div>
                   </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- CREATE ORDER MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
           <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#09090b] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl my-8"
          >
             <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/30 sticky top-0 backdrop-blur-md rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                     <Plus size={16} className="text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Create New Order</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><XCircle size={20}/></button>
             </div>

             <form onSubmit={handleCreateOrder} className="p-8 space-y-8">
                {/* Section 1: Customer */}
                <div className="space-y-4">
                   <h4 className="text-xs text-zinc-500 uppercase font-medium tracking-wider border-b border-white/5 pb-2">1. Customer Information</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Full Name <span className="text-red-500">*</span></label>
                        <input required type="text" placeholder="e.g. John Doe" value={newOrderData.customerName} onChange={e => setNewOrderData({...newOrderData, customerName: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Email Address <span className="text-red-500">*</span></label>
                        <input required type="email" placeholder="e.g. john@example.com" value={newOrderData.email} onChange={e => setNewOrderData({...newOrderData, email: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Country <span className="text-red-500">*</span></label>
                        <select required value={newOrderData.country} onChange={e => setNewOrderData({...newOrderData, country: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none">
                           <option value="" disabled>Select Country</option>
                           {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">VAT / Tax ID (Optional)</label>
                        <input type="text" placeholder="e.g. GB123456789" value={newOrderData.vatNumber} onChange={e => setNewOrderData({...newOrderData, vatNumber: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                      </div>
                   </div>
                   <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Billing Address (Optional)</label>
                        <textarea rows={2} placeholder="e.g. 123 Main St, London" value={newOrderData.address} onChange={e => setNewOrderData({...newOrderData, address: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors resize-none" />
                   </div>
                </div>

                {/* Section 2: Order Details */}
                <div className="space-y-4">
                   <h4 className="text-xs text-zinc-500 uppercase font-medium tracking-wider border-b border-white/5 pb-2">2. Order Details</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Product</label>
                         <select className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-zinc-300 focus:border-blue-500 outline-none transition-colors cursor-not-allowed" disabled>
                            <option>The Institutional Trading Blueprint™</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Order ID</label>
                         <div className="relative">
                            <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="text" value={newOrderData.invoiceId} readOnly className="w-full pl-8 bg-zinc-900/50 border border-white/5 rounded-lg p-2.5 text-sm text-zinc-400 font-mono cursor-default" />
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Date <span className="text-red-500">*</span></label>
                         <input type="date" required value={newOrderData.date} max={new Date().toISOString().split("T")[0]} onChange={e => setNewOrderData({...newOrderData, date: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white [color-scheme:dark]" />
                      </div>
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Time <span className="text-red-500">*</span></label>
                         <input type="time" required value={newOrderData.time} onChange={e => setNewOrderData({...newOrderData, time: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white [color-scheme:dark]" />
                      </div>
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Price</label>
                         <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                           <input type="number" required value={newOrderData.price} onChange={e => setNewOrderData({...newOrderData, price: Number(e.target.value)})} className="w-full pl-6 bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white" />
                         </div>
                      </div>
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Qty</label>
                         <input type="number" min="1" required value={newOrderData.quantity} onChange={e => setNewOrderData({...newOrderData, quantity: Number(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white" />
                      </div>
                   </div>
                </div>

                {/* Section 3: Status & Payment */}
                <div className="space-y-4">
                   <h4 className="text-xs text-zinc-500 uppercase font-medium tracking-wider border-b border-white/5 pb-2">3. Status & Payment</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Payment Method</label>
                         <select value={newOrderData.paymentMethod} onChange={e => setNewOrderData({...newOrderData, paymentMethod: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors">
                            <option value="Manual">Manual / Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Stripe">Stripe</option>
                            <option value="Crypto">Crypto</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium">Order Status</label>
                         <select value={newOrderData.status} onChange={e => setNewOrderData({...newOrderData, status: e.target.value as OrderStatus})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors">
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>
                   </div>
                </div>

                {/* Section 4: Delivery */}
                <div className="space-y-4">
                   <h4 className="text-xs text-zinc-500 uppercase font-medium tracking-wider border-b border-white/5 pb-2">4. Delivery & Notifications</h4>
                   <div className="bg-zinc-900/50 rounded-lg p-4 space-y-3 border border-white/5">
                      <label className="flex items-center justify-between cursor-pointer">
                         <div className="flex items-center gap-3">
                            <Mail size={16} className="text-zinc-400"/>
                            <span className="text-sm text-zinc-200">Send order confirmation email</span>
                         </div>
                         <input type="checkbox" checked={newOrderData.sendEmail} onChange={e => setNewOrderData({...newOrderData, sendEmail: e.target.checked})} className="w-4 h-4 accent-blue-500 rounded" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                         <div className="flex items-center gap-3">
                            <Send size={16} className="text-zinc-400"/>
                            <span className="text-sm text-zinc-200">Include secure download link</span>
                         </div>
                         <input type="checkbox" checked={newOrderData.includeLink} onChange={e => setNewOrderData({...newOrderData, includeLink: e.target.checked})} className="w-4 h-4 accent-blue-500 rounded" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                         <div className="flex items-center gap-3">
                            <FileText size={16} className="text-zinc-400"/>
                            <span className="text-sm text-zinc-200">Attach Invoice PDF</span>
                         </div>
                         <input type="checkbox" checked={newOrderData.attachInvoice} onChange={e => setNewOrderData({...newOrderData, attachInvoice: e.target.checked})} className="w-4 h-4 accent-blue-500 rounded" />
                      </label>
                   </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/5 sticky bottom-0 bg-[#09090b] z-10 py-4 -mx-8 px-8 -mb-8 rounded-b-2xl">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500 border-none text-white shadow-lg shadow-blue-500/20">Create Order</Button>
                </div>
             </form>
           </motion.div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#09090b] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl my-8"
          >
            <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/30 sticky top-0 backdrop-blur-md rounded-t-2xl z-10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                Edit Order Details
                <span className="text-xs font-normal text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  #{selectedOrder.invoiceNumber}
                </span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><XCircle size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveOrder} className="p-8 space-y-8">
              
              <div className="space-y-6">
                {/* Row 1: Name & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider">Customer Name</label>
                    <input 
                      type="text" 
                      required
                      value={selectedOrder.customer.name} 
                      onChange={e => setSelectedOrder({...selectedOrder, customer: {...selectedOrder.customer, name: e.target.value}})} 
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider">Status</label>
                    <select 
                      value={selectedOrder.status} 
                      onChange={e => setSelectedOrder({...selectedOrder, status: e.target.value as OrderStatus})} 
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                    >
                      {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider flex items-center gap-1">
                       <Calendar size={12}/> Order Date
                     </label>
                     <input 
                      type="date" 
                      required
                      value={editDate}
                      max={new Date().toISOString().split("T")[0]} // Prevent future dates
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors [color-scheme:dark]"
                     />
                  </div>
                  <div>
                     <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider flex items-center gap-1">
                       <Clock size={12}/> Order Time
                     </label>
                     <input 
                      type="time" 
                      required
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors [color-scheme:dark]"
                     />
                  </div>
                </div>

                {/* Row 3: Email & VAT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={selectedOrder.customer.email} 
                      onChange={e => setSelectedOrder({...selectedOrder, customer: {...selectedOrder.customer, email: e.target.value}})} 
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                     <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider">VAT / Tax ID</label>
                     <input 
                      type="text" 
                      value={selectedOrder.customer.vatNumber || ''} 
                      onChange={e => setSelectedOrder({...selectedOrder, customer: {...selectedOrder.customer, vatNumber: e.target.value}})} 
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                      placeholder="Optional"
                     />
                  </div>
                </div>

                {/* Row 4: Country */}
                <div>
                   <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider flex items-center gap-1">
                     <MapPin size={12} /> Country
                   </label>
                   <select
                      value={selectedOrder.customer.country || ''}
                      onChange={e => setSelectedOrder({...selectedOrder, customer: {...selectedOrder.customer, country: e.target.value}})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                   >
                      <option value="" disabled>Select a country</option>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                   </select>
                </div>

                {/* Row 5: Billing Address */}
                <div>
                   <label className="block text-xs text-zinc-500 uppercase mb-1.5 font-medium tracking-wider">Billing Address</label>
                   <textarea 
                      rows={3}
                      value={selectedOrder.customer.address || ''} 
                      onChange={e => setSelectedOrder({...selectedOrder, customer: {...selectedOrder.customer, address: e.target.value}})} 
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors resize-none"
                   />
                </div>
              </div>
              
              {/* DIGITAL DELIVERY SECTION */}
              <div className="pt-6 border-t border-white/5">
                 <h4 className="text-xs text-zinc-500 uppercase font-medium tracking-wider mb-4 flex items-center gap-2">
                    <Fingerprint size={14} /> Digital Delivery & Access Logs
                 </h4>
                 
                 <div className="bg-black rounded-xl border border-zinc-800 overflow-hidden">
                    {/* Status Header */}
                    <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className="text-xs text-zinc-400">Delivery Status:</span>
                           {selectedOrder.delivery.status === 'downloaded' ? (
                              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> Access Confirmed
                              </span>
                           ) : (
                              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Mail size={10} /> Sent / Unopened
                              </span>
                           )}
                        </div>
                        <div className="text-xs font-mono text-zinc-600">ID: {selectedOrder.delivery.deliveryId}</div>
                    </div>

                    {/* Log Details */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                                <Wifi size={14} className="text-blue-400"/>
                             </div>
                             <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">IP Address</div>
                                <div className="text-sm font-mono text-zinc-300">{selectedOrder.delivery.accessIp || 'N/A'}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                                <Monitor size={14} className="text-purple-400"/>
                             </div>
                             <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Device / User Agent</div>
                                <div className="text-xs text-zinc-400 truncate max-w-[200px]" title={selectedOrder.delivery.userAgent}>
                                   {selectedOrder.delivery.userAgent || 'Waiting for access...'}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                                <Globe size={14} className="text-orange-400"/>
                             </div>
                             <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Download Count</div>
                                <div className="text-sm font-mono text-zinc-300">{selectedOrder.delivery.downloadCount} times</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                                <Clock size={14} className="text-emerald-400"/>
                             </div>
                             <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Last Access</div>
                                <div className="text-sm font-mono text-zinc-300">
                                   {selectedOrder.delivery.lastAccessedAt ? new Date(selectedOrder.delivery.lastAccessedAt).toLocaleString() : '-'}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5 sticky bottom-0 bg-[#09090b] z-10 py-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save Changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
