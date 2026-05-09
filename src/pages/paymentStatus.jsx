import React from 'react'
import { useTranslation } from 'react-i18next'

export default function PaymentStatus() {
  const { t } = useTranslation()

  return (
    <div>
      <>
        <div className='text-lg text-red-500 font-semibold'>
          {t("payment_success_redirecting")}
        </div>
      </>
    </div>
  )
}