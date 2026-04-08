import React from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function TeamSwitchModal({ isOpen, onClose, onConfirm, teamName, currentTeamName }) {
  const { t } = useLanguage()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-gray-100 p-8 text-center animate-in zoom-in duration-300">
        
        <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-6 flex items-center justify-center relative">
           <div className="absolute inset-0 bg-indigo-100 scale-110 blur-2xl opacity-40 rounded-full animate-pulse"></div>
           <div className="relative z-10 text-5xl">🐿️</div>
        </div>

        <h2 className="text-2xl font-brand text-gray-900 mb-4">{t('switch_title')}</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 text-sm leading-relaxed">
            {t('switch_desc1')} <span className="font-bold text-indigo-600">"{currentTeamName}"</span> {t('switch_desc2')}
          </p>
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest text-center">
              {t('switch_question')} "{teamName}"?
            </p>
          </div>
          <p className="text-[10px] text-gray-400 italic">
            {t('switch_note')}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-gray-200"
          >
            {t('btn_stay')}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 rounded-2xl font-bold text-sm bg-gray-900 text-white hover:bg-black active:scale-95 transition-all shadow-lg"
          >
            {t('btn_leave_anyway')}
          </button>
        </div>
      </div>
    </div>
  )
}
