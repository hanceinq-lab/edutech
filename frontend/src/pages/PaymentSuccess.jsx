import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId      = searchParams.get('session_id');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give the webhook a moment to process before showing the dashboard link
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">
          You&apos;re now enrolled. Start learning right away from your dashboard.
        </p>
        {ready ? (
          <Link
            to="/dashboard"
            className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Confirming enrollment…</span>
          </div>
        )}
        {sessionId && (
          <p className="mt-4 text-xs text-gray-400">Session: {sessionId.slice(0, 20)}…</p>
        )}
      </div>
    </div>
  );
}
