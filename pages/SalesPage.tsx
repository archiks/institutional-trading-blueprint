
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Star, ShieldCheck, Lock, TrendingUp, Activity, BarChart2, Zap, Smartphone, BookOpen, Monitor } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { Chapter, FAQItem, OrderStatus, Order } from '../types';
import { useStore } from '../context/StoreContext';
import { PaymentModal } from '../components/PaymentModal';

// --- Data ---

const chapters: Chapter[] = [
  { number: 1, title: "The Retail vs. Institutional Mindset", bullets: ["Why 90% of traders fail before they start.", "The psychological gap between gambling and probability."] },
  { number: 2, title: "Understanding Liquidity Pools", bullets: ["How banks trap retail traders.", "Identifying where the 'smart money' enters and exits."] },
  { number: 3, title: "Market Structure Mastery", bullets: ["Mapping the true DNA of the charts.", "Distinguishing between noise and trend shifts."] },
  { number: 4, title: "The Order Block Phenomenon", bullets: ["How to spot institutional footprints.", "Drawing high-probability zones precisely."] },
  { number: 5, title: "Wyckoff Logic Simplified", bullets: ["Accumulation and Distribution explained simply.", "Timing the market cycle perfectly."] },
  { number: 6, title: "Risk Management Protocols", bullets: ["The mathematics of compounding.", "Position sizing like a hedge fund manager."] },
  { number: 7, title: "Algorithmic Price Delivery", bullets: ["How the Interbank Price Delivery Algorithm (IPDA) works.", "Predicting daily bias with high accuracy."] },
  { number: 8, title: "Time & Price Theory", bullets: ["The specific hours banks trade.", "Killzones: When to execute and when to sit out."] },
  { number: 9, title: "Top-Down Analysis Framework", bullets: ["From Monthly charts to 1-minute entries.", "Aligning timeframes for explosive moves."] },
  { number: 10, title: "Entry Models & Triggers", bullets: ["3 specific entry patterns used by institutions.", "Reducing drawdown to near zero."] },
  { number: 11, title: "Trade Management & Scaling", bullets: ["When to take partials.", "Pyramiding winners without increasing risk."] },
  { number: 12, title: "Developing Your Trading Plan", bullets: ["Creating a rigid rule-based system.", "The pre-market checklist professional traders use."] },
  { number: 13, title: "Psychology & Emotional Control", bullets: ["Entering the 'Flow State'.", "Eliminating FOMO and revenge trading forever."] },
  { number: 14, title: "The 90-Day Roadmap", bullets: ["A day-by-day guide to profitability.", "Transitioning from demo to funded accounts."] },
];

const faqs: FAQItem[] = [
  { question: "Is this suitable for beginners?", answer: "Yes, but it moves quickly. We strip away bad habits and rebuild your understanding from the ground up using institutional logic." },
  { question: "Does this work for Crypto and Forex?", answer: "Absolutely. Liquidity and Market Structure are universal concepts that apply to Forex, Crypto, Indices, and Commodities." },
  { question: "Can I receive an invoice for my purchase?", answer: "Yes. Our system features a built-in backend compliance engine. Upon purchase, you can request a fully tax-compliant PDF invoice with your VAT details, address, and business name. You can even request amendments via our support admin panel." },
  { question: "How is the content delivered?", answer: "Instant digital download (PDF) secured via your unique email ID." },
  { question: "What is the refund policy?", answer: "We offer a 30-Day Confidence Guarantee. If the strategies don't align with your trading style, simply email us." }
];

const tickers = [
  { symbol: "EURUSD", price: "1.0845", change: "+0.32%", isUp: true, data: [40, 45, 42, 50, 48, 55, 60, 58, 65] },
  { symbol: "NAS100", price: "15,240", change: "+1.12%", isUp: true, data: [20, 25, 30, 28, 35, 40, 38, 50, 60] },
  { symbol: "XAUUSD", price: "1,985.20", change: "-0.45%", isUp: false, data: [60, 55, 58, 50, 48, 45, 40, 42, 35] },
  { symbol: "GBPUSD", price: "1.2450", change: "+0.15%", isUp: true, data: [40, 42, 41, 44, 43, 46, 48, 50, 52] },
  { symbol: "BTCUSD", price: "34,500", change: "+2.4%", isUp: true, data: [30, 35, 32, 40, 45, 42, 50, 55, 60] }
];

// --- Visual Components ---

const CandlestickBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-20">
    <svg width="100%" height="100%" className="absolute inset-0 blur-[2px]">
      <pattern id="candles" x="0" y="0" width="100" height="200" patternUnits="userSpaceOnUse">
        {/* Bullish Candle */}
        <rect x="20" y="120" width="1" height="60" fill="#10b981" opacity="0.3" />
        <rect x="15" y="140" width="11" height="30" rx="1" fill="#10b981" opacity="0.5" />
        
        {/* Bearish Candle */}
        <rect x="60" y="40" width="1" height="80" fill="#f43f5e" opacity="0.3" />
        <rect x="55" y="60" width="11" height="40" rx="1" fill="#f43f5e" opacity="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#candles)" />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
  </div>
);

const Sparkline: React.FC<{ data: number[], isUp: boolean }> = ({ data, isUp }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 60;
  const height = 20;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.polyline
        points={points}
        fill="none"
        stroke={isUp ? "#10b981" : "#f43f5e"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

// --- Main Component ---

export const SalesPage: React.FC = () => {
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { addOrder } = useStore();

  const handleBuy = () => {
    setIsPaymentOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaymentSuccess = (details: any) => {
    setIsPaymentOpen(false);
    
    const payer = details.payer;
    const newOrder: Order = {
      id: details.id || `ord_${Math.floor(Math.random() * 10000)}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      productName: 'The Institutional Trading Blueprint™',
      price: 250,
      currency: 'EUR',
      status: OrderStatus.COMPLETED,
      transactionId: details.id,
      customer: {
        name: `${payer.name.given_name} ${payer.name.surname}`,
        email: payer.email_address,
        address: payer.address ? `${payer.address.address_line_1}, ${payer.address.admin_area_2}` : undefined,
      },
      notes: 'Paid via PayPal',
      delivery: {
        status: 'sent',
        deliveryId: `dl_${Math.random().toString(36).substring(2, 9)}`,
        sentAt: new Date().toISOString(),
        downloadCount: 0
      }
    };
    addOrder(newOrder);
    
    alert(`Payment Successful! \n\nThank you ${payer.name.given_name}. Your order has been processed. You can now access the Admin Dashboard to view your invoice.`);
  };

  return (
    <div className="bg-[#000000] text-zinc-300 font-sans overflow-x-hidden selection:bg-white/20 selection:text-white">
      
      {/* Sticky Nav */}
      <motion.div 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ delay: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <span className="font-semibold text-white tracking-tight flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
             Institutional Trading Blueprint™
           </span>
           <Button onClick={handleBuy} size="sm" variant="primary">Buy Now • €250</Button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <Section className="pt-32 pb-20 md:pt-48 md:pb-24 text-center relative overflow-hidden">
        <CandlestickBackground />
        
        {/* Floating Stats Chips */}
        <div className="absolute top-32 right-[10%] hidden lg:flex flex-col gap-3 z-10">
          <motion.div 
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-white flex items-center gap-2 shadow-lg"
          >
            <Zap size={12} className="text-yellow-400 fill-yellow-400" />
            Avg R:R: 1:3.2
          </motion.div>
          <motion.div 
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-white flex items-center gap-2 shadow-lg"
          >
             <Activity size={12} className="text-emerald-400" />
             Focus: SMC & Liquidity
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium tracking-wider text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Professional Trading Systems
            </span>
            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight leading-[1.1] mb-8">
              Trade Like <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                The Institutions.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Stop guessing. Start executing. A complete roadmap to high-probability, liquidity-based trading setups used by banks and hedge funds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={handleBuy} size="lg" className="w-full sm:w-auto min-w-[200px] bg-white text-black hover:bg-zinc-200">Get The Blueprint • €250</Button>
              <p className="text-sm text-zinc-500 mt-4 sm:mt-0 flex items-center gap-2">
                <Lock size={12} /> Instant Digital Access
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Market Snapshot Strip */}
      <div className="w-full border-y border-white/5 bg-black/50 backdrop-blur-sm py-6 overflow-hidden relative">
        {/* Title - Centered */}
        <div className="max-w-7xl mx-auto px-6 mb-5 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Market Context (Illustrative)</span>
        </div>
        
        {/* Scrolling Container - Centered on Desktop */}
        <div className="flex items-center gap-4 px-6 overflow-x-auto no-scrollbar pb-2 lg:justify-center">
          {tickers.map((t, i) => (
             <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[200px] bg-[#0A0A0A] border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-all group cursor-default shrink-0"
             >
                <div className="flex justify-between items-start mb-3">
                   <div>
                      <div className="font-semibold text-sm text-white">{t.symbol}</div>
                      <div className="text-xs text-zinc-500">{t.price}</div>
                   </div>
                   <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${t.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {t.change}
                   </div>
                </div>
                <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                  <Sparkline data={t.data} isUp={t.isUp} />
                </div>
             </motion.div>
          ))}
        </div>
        <div className="text-center mt-3">
          <span className="text-[10px] text-zinc-700">Data shown is illustrative to reflect trading context – not live prices.</span>
        </div>
      </div>

      {/* Visual Comparison Section */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How You'll Trade Differently</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Shift your perspective from retail chaos to institutional precision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
           {/* Left: Retail */}
           <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden aspect-[4/3] group"
           >
              <div className="absolute inset-0 opacity-30 p-8">
                 {/* Messy Chart SVG */}
                 <svg width="100%" height="100%" viewBox="0 0 400 300" className="stroke-zinc-600 fill-none stroke-[1]">
                    <path d="M0 200 Q 50 100, 100 220 T 200 150 T 300 250 T 400 180" stroke="orange" strokeDasharray="4 4" />
                    <path d="M0 180 Q 50 250, 100 180 T 200 200 T 300 150 T 400 220" stroke="purple" strokeOpacity="0.5" />
                    <path d="M0 220 L 400 100" stroke="red" strokeWidth="2" />
                    <rect x="50" y="50" width="300" height="200" className="stroke-zinc-800" />
                    {/* RSI Chaos at bottom */}
                    <path d="M50 280 L 350 280" stroke="zinc" />
                    <path d="M50 280 Q 100 260, 150 290 T 250 270 T 350 280" stroke="cyan" />
                 </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                 <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-full w-fit mb-3">
                    Retail Mindset
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Indicators & Noise</h3>
                 <p className="text-sm text-zinc-400">Reliance on lagging indicators (RSI, MACD) and subjective trendlines that banks hunt for liquidity.</p>
              </div>
           </motion.div>

           {/* Right: Institutional */}
           <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative bg-zinc-900 border border-blue-500/20 rounded-3xl overflow-hidden aspect-[4/3] shadow-[0_0_50px_rgba(59,130,246,0.1)]"
           >
              <div className="absolute inset-0 p-8">
                 {/* Clean Chart SVG */}
                 <svg width="100%" height="100%" viewBox="0 0 400 300" className="fill-none">
                    {/* Order Block */}
                    <rect x="50" y="200" width="300" height="40" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeOpacity="0.3" />
                    <text x="60" y="225" fill="#3b82f6" fontSize="10" fontFamily="monospace">DEMAND ZONE / ORDER BLOCK</text>
                    
                    {/* Price Action */}
                    <path d="M50 100 L 100 150 L 150 120 L 200 210 L 250 160 L 350 80" stroke="#10b981" strokeWidth="2" />
                    
                    {/* BOS Marker */}
                    <line x1="250" y1="160" x2="350" y2="160" stroke="white" strokeOpacity="0.5" strokeDasharray="2 2" />
                    <text x="360" y="165" fill="white" fillOpacity="0.5" fontSize="10">BOS</text>
                 </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                 <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium rounded-full w-fit mb-3">
                    Institutional Logic
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Structure & Liquidity</h3>
                 <p className="text-sm text-zinc-400">Clean charts focusing on price delivery algorithms, order blocks, and liquidity voids.</p>
              </div>
           </motion.div>
        </div>
      </Section>

      {/* Product Mockup / "What You Get" */}
      <Section className="bg-zinc-900/20 border-y border-white/5">
         <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="flex-1 space-y-8">
               <h2 className="text-3xl md:text-5xl font-bold text-white">A Complete Trading System in Your Pocket.</h2>
               <ul className="space-y-4">
                  {[
                    { icon: BookOpen, title: "14 In-Depth Chapters", desc: "Zero fluff. Just actionable strategy." },
                    { icon: Monitor, title: "High-Res Chart Examples", desc: "See exactly how to annotate your charts." },
                    { icon: Smartphone, title: "Optimized for Any Device", desc: "Study on your phone, trade on your desktop." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          <item.icon size={20} className="text-blue-400" />
                       </div>
                       <div>
                          <h4 className="text-white font-semibold">{item.title}</h4>
                          <p className="text-sm text-zinc-500">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </ul>
               <div className="pt-4">
                 <Button onClick={handleBuy}>Get Instant Access</Button>
               </div>
            </div>
            
            {/* Device Mockup */}
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
               <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative bg-[#000000] border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] max-w-lg mx-auto"
               >
                  {/* Fake Browser UI */}
                  <div className="h-8 bg-zinc-900 border-b border-white/5 flex items-center px-4 gap-2">
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                     </div>
                     <div className="mx-auto text-[10px] text-zinc-600 font-medium">The Institutional Blueprint.pdf</div>
                  </div>
                  
                  {/* Screen Content */}
                  <div className="flex h-full">
                     {/* Sidebar */}
                     <div className="w-1/3 border-r border-white/5 bg-zinc-900/20 p-4 space-y-3 hidden sm:block">
                        <div className="h-2 w-20 bg-zinc-800 rounded mb-6"></div>
                        {[1,2,3,4,5,6].map(i => (
                           <div key={i} className="flex gap-2 items-center">
                              <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                              <div className={`h-1.5 rounded bg-zinc-800 ${i === 3 ? 'w-16 bg-blue-500/50' : 'w-24'}`}></div>
                           </div>
                        ))}
                     </div>
                     {/* Main Area */}
                     <div className="flex-1 p-6 bg-[#050505]">
                        <div className="h-4 w-32 bg-zinc-800 rounded mb-4"></div>
                        <div className="h-2 w-full bg-zinc-800/50 rounded mb-2"></div>
                        <div className="h-2 w-5/6 bg-zinc-800/50 rounded mb-6"></div>
                        
                        {/* Mini Chart in Mockup */}
                        <div className="w-full aspect-video bg-zinc-900 rounded-lg border border-white/5 relative overflow-hidden p-4">
                           <svg width="100%" height="100%" viewBox="0 0 200 100" className="stroke-emerald-500 fill-none stroke-[1.5]">
                              <path d="M0 80 L 40 70 L 60 40 L 90 60 L 120 30 L 160 50 L 200 20" />
                              <rect x="0" y="0" width="200" height="100" fill="url(#grid)" />
                           </svg>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </Section>

      {/* What's Inside - Chapters */}
      <Section className="relative">
        <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3 sticky top-32 h-fit">
            <h2 className="text-4xl font-bold text-white mb-6">Inside the <br/> Blueprint.</h2>
            <p className="text-zinc-400 mb-8">14 Comprehensive Chapters taking you from novice to institutional competence.</p>
            <Button onClick={handleBuy} fullWidth>Start Reading Now</Button>
          </div>
          <div className="md:w-2/3 space-y-4">
            {chapters.map((chapter) => (
              <div key={chapter.number} className="group">
                <button 
                  onClick={() => setOpenChapter(openChapter === chapter.number ? null : chapter.number)}
                  className="w-full flex items-center justify-between p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-600 font-mono text-sm">0{chapter.number}</span>
                    <span className="text-lg font-medium text-white">{chapter.title}</span>
                  </div>
                  {openChapter === chapter.number ? <ChevronUp className="text-zinc-500"/> : <ChevronDown className="text-zinc-500"/>}
                </button>
                <AnimatePresence>
                  {openChapter === chapter.number && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pl-16 text-zinc-400 space-y-2 border-l border-white/5 ml-6">
                        {chapter.bullets.map((bullet, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <h2 className="text-3xl font-bold text-white text-center mb-12">What Traders Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Marcus L.", role: "Forex Trader", text: "I failed 3 prop firm challenges before this. After Chapter 6, I passed my first 100k account." },
            { name: "Sarah J.", role: "Crypto Analyst", text: "The section on Order Blocks changed how I view Bitcoin charts forever. The precision is scary." },
            { name: "David K.", role: "Day Trader", text: "Finally, no fluff. Just pure, actionable institutional logic. Worth 10x the price." }
          ].map((t, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="flex gap-1 mb-4 text-blue-400">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor"/>)}
              </div>
              <p className="text-zinc-300 mb-6 leading-relaxed">"{t.text}"</p>
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Bonuses */}
      <Section className="bg-gradient-to-b from-zinc-900 to-black border-y border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Included Bonuses</h2>
          <p className="text-zinc-400">Value that pays for itself.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Trading Plan Template", val: "€49 Value" },
            { title: "Risk Calculator Tool", val: "€29 Value" },
            { title: "Daily Routine Checklist", val: "€19 Value" },
            { title: "Private Discord Access", val: "Priceless" }
          ].map((b, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/10 bg-black text-center">
              <h4 className="text-white font-semibold mb-2">{b.title}</h4>
              <span className="text-xs text-blue-400 font-medium uppercase border border-blue-500/30 px-2 py-1 rounded">{b.val}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Guarantee */}
      <Section className="text-center">
        <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/10">
          <ShieldCheck size={48} className="text-white mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-4">30-Day Confidence Guarantee</h2>
          <p className="text-zinc-400 mb-0">
            We are so confident in the quality of this material that if you don't feel like your understanding of the markets has improved within 30 days, we will fully refund your investment. No questions asked.
          </p>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <button 
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
              >
                <span className="text-lg text-zinc-200 font-medium">{faq.question}</span>
                {openFAQ === i ? <ChevronUp className="text-zinc-500"/> : <ChevronDown className="text-zinc-500"/>}
              </button>
              <AnimatePresence>
                {openFAQ === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-zinc-400 pb-4 pr-8 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-32 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Start Trading Like <br/> a Professional — Today</h2>
        <Button onClick={handleBuy} size="lg" className="shadow-[0_0_40px_rgba(255,255,255,0.15)]">Buy Now • €250</Button>
        <p className="mt-6 text-zinc-500 text-sm">Secure SSL Payment • Instant Access</p>
      </Section>

      <footer className="border-t border-white/5 bg-black py-12 text-center text-zinc-600 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2023 Institutional Trading Blueprint. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400">Terms</a>
            <a href="#" className="hover:text-zinc-400">Privacy</a>
            <a href="#" className="hover:text-zinc-400">Contact</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isPaymentOpen && (
          <PaymentModal 
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            onSuccess={handlePaymentSuccess}
            productName="The Institutional Trading Blueprint™"
            price={250}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
