import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Call stripe.confirmCardPayment
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      onPaymentSuccess(payload.paymentIntent); // Inform parent component to finalize
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#1e293b", // text-slate-800
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#94a3b8" // text-slate-400
        }
      },
      invalid: {
        color: "#ef4444", // text-red-500
        iconColor: "#ef4444"
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Card Details</label>
        <div className="p-3 bg-white border border-slate-300 rounded-lg shadow-sm">
           <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-3 bg-white border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          <span>{processing ? 'Processing...' : `Pay ₹${amount.toLocaleString()}`}</span>
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
