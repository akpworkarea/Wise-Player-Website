import React, { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, XCircle, Flame } from 'lucide-react'

// PayPal returns here via successUrl/cancelUrl built in utils/checkoutFlow.js.
// It replaces a dead route (the old successUrl pointed at /invoice, which was
// never registered, so the buyer was dumped back onto the marketing page).
export default function PaymentStatus() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const status = params.get('paymentStatus')
  const deviceId = params.get('deviceId') || ''
  const invoiceNo = params.get('invoiceNo') || ''

  const isSuccess = status === 'success'
  const isCancelled = status === 'cancel' || status === 'cancelled'

  // Never leave a gateway token sitting in the address bar.
  useEffect(() => {
    const clean = new URLSearchParams(params)
    ;['token', 'PayerID', 'paymentId', 'orderId'].forEach((k) => clean.delete(k))
    window.history.replaceState({}, document.title, `${window.location.pathname}${clean.toString() ? `?${clean}` : ''}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const backToMac = () => navigate('/upload-list')

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden text-center">
        <div className="h-1.5 w-full bg-[#800000]" />

        <div className="p-8 sm:p-10">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border mb-5">
            {isSuccess ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-60" />
                <div className="relative w-16 h-16 flex items-center justify-center bg-green-50 rounded-full border border-green-200">
                  <CheckCircle2 size={34} className="text-green-600" />
                </div>
              </div>
            ) : isCancelled ? (
              <div className="w-16 h-16 flex items-center justify-center bg-amber-50 rounded-full border border-amber-200">
                <XCircle size={32} className="text-amber-600" />
              </div>
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full border border-blue-200">
                <Loader2 size={30} className="text-blue-600 animate-spin" />
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
            {isSuccess
              ? t('paymentStatus.successTitle')
              : isCancelled
                ? t('paymentStatus.cancelledTitle')
                : t('paymentStatus.processingTitle')}
          </h1>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {isSuccess
              ? t('paymentStatus.successDesc')
              : isCancelled
                ? t('paymentStatus.cancelledDesc')
                : t('paymentStatus.processingDesc')}
          </p>

          {(deviceId || invoiceNo) && (
            <div className="mt-6 w-full bg-gray-50 border border-black/[0.06] rounded-xl px-4 py-3 text-left">
              {invoiceNo && (
                <p className="text-xs text-gray-400 mb-1">
                  {t('paymentStatus.invoiceLabel')}:{' '}
                  <span className="font-mono font-bold text-[#1a1a1a]">{invoiceNo}</span>
                </p>
              )}
              {deviceId && (
                <p className="text-xs text-gray-400">
                  {t('paymentStatus.deviceLabel')}:{' '}
                  <span className="font-mono font-bold text-[#1a1a1a]">{deviceId}</span>
                </p>
              )}
            </div>
          )}

          <button
            onClick={backToMac}
            className="mt-7 w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#800000] hover:bg-[#6a0000] active:scale-[0.98] transition-all duration-200 border-0"
          >
            {t('paymentStatus.continueToPlaylists')}
          </button>

          <Link
            to="/home"
            className="mt-3 w-full py-3.5 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:border-[#800000] hover:text-[#800000] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Flame size={16} fill="currentColor" />
            {t('paymentStatus.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
