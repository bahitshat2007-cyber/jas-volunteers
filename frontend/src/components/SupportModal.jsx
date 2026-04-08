import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function SupportModal({ isOpen, onClose }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [step, setStep] = useState(1) // 1: Method Select, 2: Payment Info, 3: Confirm, 4: Success
  const [method, setMethod] = useState('kaspi') // 'kaspi' | 'da'
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  
  // Form state
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const kaspiNumber = "+7 705 210 90 90"
  const holderName = "Бахитшат Г."
  const donationAlertsUrl = "https://dalink.to/bakhi"

  if (!isOpen) return null

  const handleCopy = () => {
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleBaBah = () => {
    setIsExploding(true)
    // Close after the explosion animates fully
    setTimeout(() => {
      setIsExploding(false)
      onClose()
      setStep(1)
    }, 1800)
  }

  const handleSubmitConfirmation = async (e) => {
    e.preventDefault()
    if (!user) {
      alert(t('err_login_support'))
      return
    }
    setLoading(true)

    try {
      let imageUrl = null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `donations/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('donation-receipts')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('donation-receipts')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrl
      }

      const { error } = await supabase
        .from('donations')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount) || 0,
          method: method,
          comment: comment,
          image_url: imageUrl,
          status: 'pending'
        })

      if (error) throw error
      setStep(4)

    } catch (err) {
      console.error('Error:', err)
      alert(t('err_general') + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 ${isExploding ? 'animate-babah-bg' : ''}`}>
      <div className={`bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative transform transition-all scale-100 border border-gray-100 ${isExploding ? 'animate-babah-exit' : ''}`}>
        
        {/* Close Button - HIDDEN ON STEP 4 */}
        {step !== 4 && (
          <button 
            onClick={() => { onClose(); setStep(1); }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-2"
          >
            ✕
          </button>
        )}

        {step === 1 && (
          <div className="p-8 pb-4 text-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-indigo-100 scale-110 blur-2xl opacity-40 rounded-full animate-pulse"></div>
               <div className="relative z-10 text-5xl">🐈☕</div>
            </div>

            <h2 className="text-2xl font-brand text-gray-900 mb-2">{t('support_title')}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {t('support_subtitle')}
            </p>

            <div className="space-y-3 mb-6">
              <button 
                onClick={() => { setMethod('kaspi'); setStep(2); }}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🇰🇿</div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">{t('kaspi_transfer')}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">{t('kz_region')}</div>
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-indigo-500">→</div>
              </button>

              <button 
                onClick={() => { setMethod('da'); setStep(2); }}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🌍</div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">{t('global_pay')}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('global_region')}</div>
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-orange-500">→</div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 pb-4 text-center">
            {method === 'kaspi' ? (
              <>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 text-left">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1 text-center">{t('kaspi_bank')}</div>
                  <div className="text-xl font-bold text-gray-900 mb-1 text-center">{kaspiNumber}</div>
                  <div className="text-xs text-gray-500 mb-4 text-center">{holderName}</div>
                  
                  <button 
                    onClick={handleCopy}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-3 ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black active:scale-95'
                    }`}
                  >
                    {copied ? t('btn_copied') : t('btn_copy')}
                  </button>

                  <button 
                    onClick={() => setStep(3)}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm"
                  >
                    {t('btn_already_paid')}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('global_pay_title')}</h3>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  {t('global_pay_desc')}
                </p>
                <p className="text-[10px] text-indigo-400 font-bold mb-6 flex items-center justify-center gap-1">
                  <span>🇰🇿</span> <span>{t('global_pay_convert')}</span>
                </p>
                
                <a 
                  href={donationAlertsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-4 bg-[#FF7300] text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-95 transition-all mb-4"
                >
                  {t('btn_go_pay')}
                </a>

                <button 
                  onClick={() => setStep(3)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 transition-all"
                >
                  {t('btn_donated')}
                </button>
              </div>
            )}
            
            <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest mb-4">
              {t('btn_choose_other')}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('confirm_title')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('confirm_desc')}</p>
            
            <form onSubmit={handleSubmitConfirmation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('label_amount')}</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" 
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('label_screenshot')}</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('label_comment')}</label>
                <input 
                  type="text" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" 
                  placeholder={t('placeholder_comment')}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  {t('btn_back')}
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? t('btn_sending') : t('btn_send')}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 text-center animate-in zoom-in duration-300">
             <div className="w-40 h-40 bg-green-50 rounded-full mx-auto mb-6 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-green-100 scale-110 blur-2xl opacity-40 rounded-full animate-pulse"></div>
               <div className="relative z-10 text-6xl">😻☕</div>
            </div>
            <h2 className="text-2xl font-brand text-gray-900 mb-2">{t('success_thanks_title')}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {t('success_thanks_desc')}
            </p>
            <div className="relative">
              {isExploding && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   {/* Custom CSS Explosion (NOT confetti) */}
                   <div className="babah-shockwave"></div>
                   {[...Array(24)].map((_, i) => (
                     <div key={i} className={`babah-particle p-${(i % 12) + 1}`}></div>
                   ))}
                </div>
              )}
              <button 
                onClick={handleBaBah}
                className={`w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all relative overflow-hidden ${isExploding ? 'opacity-0 scale-150 transition-all duration-300' : ''}`}
              >
                {t('btn_babah')}
              </button>
            </div>
          </div>
        )}

        <div className="p-4 bg-indigo-50 text-indigo-600 text-center text-[10px] font-bold tracking-widest uppercase">
          {t('footer_made_in_kz')}
        </div>
      </div>
    </div>
  )
}
