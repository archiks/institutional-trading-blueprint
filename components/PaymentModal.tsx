import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (details: any) => void;
  productName: string;
  price: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, onSuccess, productName, price 
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setErrorMessage(null);
    setIsLoading(true);

    const initializePaypalButtons = () => {
       if (!window.paypal) {
         if (isMounted) {
            setErrorMessage("PayPal failed to load.");
            setIsLoading(false);
         }
         return;
       }

       try {
          // Clear container
          if (paypalRef.current) {
             paypalRef.current.innerHTML = '';
             
             window.paypal.Buttons({
                style: {
                  layout: 'vertical',
                  color: 'black',
                  shape: 'rect',
                  label: 'pay',
                  height: 45
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                createOrder: (data: any, actions: any) => {
                  return actions.order.create({
                    purchase_units: [{
                      description: productName,
                      amount: {
                        currency_code: 'EUR',
                        value: price.toString()
                      }
                    }]
                  });
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onApprove: async (data: any, actions: any) => {
                  try {
                    const order = await actions.order.capture();
                    if(isMounted) onSuccess(order);
                  } catch(err) {
                    console.error("Capture Error", err);
                    if(isMounted) setErrorMessage("Payment capture failed.");
                  }
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (err: any) => {
                  console.error("PayPal Button Error:", err);
                  if(isMounted) setErrorMessage("An error occurred with PayPal.");
                }
              }).render(paypalRef.current).then(() => {
                 if(isMounted) setIsLoading(false);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }).catch((err: any) => {
                 console.error("Render Error", err);
              });
          }
       } catch (error) {
         console.error("Initialization Error", error);
         if(isMounted) {
            setErrorMessage("Could not initialize payment buttons.");
            setIsLoading(false);
         }
       }
    };

    // Dynamic Script Loading
    const scriptId = 'paypal-js-sdk';
    if (!window.paypal) {
      // Check if script tag already exists to avoid duplicates
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=EUR&intent=capture&components=buttons";
        script.async = true;
        script.onload = () => {
           if(isMounted) initializePaypalButtons();
        };
        script.onerror = () => {
           if(isMounted) {
             setErrorMessage("Failed to connect to PayPal.");
             setIsLoading(false);
           }
        };
        document.body.appendChild(script);
      } else {
        const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
        if(existingScript) {
             existingScript.addEventListener('load', initializePaypalButtons);
        }
      }
    } else {
      initializePaypalButtons();
    }

    return () => {
      isMounted = false;
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [isOpen, price, productName, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#09090b] w-full max-w-md rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-green-500" />
            <span className="text-sm font-medium text-zinc-400">Secure Checkout</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Product Summary */}
          <div className="mb-8 text-center">
             <p className="text-zinc-500 text-sm mb-2">You are purchasing</p>
             <h3 className="text-xl font-bold text-white mb-2">{productName}</h3>
             <div className="text-3xl font-bold text-white">€{price}</div>
          </div>

          {/* PayPal Container */}
          <div className="mb-6 min-h-[150px] relative">
            {isLoading && !errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs">Connecting to secure server...</span>
              </div>
            )}
            
            {errorMessage ? (
               <div className="flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center gap-2">
                  <AlertCircle size={20} />
                  <p>{errorMessage}</p>
                  <p className="text-xs text-zinc-500">Please check your connection.</p>
               </div>
            ) : (
               <div ref={paypalRef} className="w-full relative z-10"></div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
            <ShieldCheck size={12} />
            <span>Encrypted 256-bit SSL Payment</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};