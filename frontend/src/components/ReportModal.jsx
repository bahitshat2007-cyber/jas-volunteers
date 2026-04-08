import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function ReportModal({ isOpen, onClose }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [category, setCategory] = useState('bug')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `reports/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('report-images') // Make sure this bucket exists in Supabase
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('report-images')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrl
      }

      // Save report to database
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          category,
          content,
          image_url: imageUrl,
          status: 'pending'
        })

      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        setContent('')
        setImageFile(null)
      }, 3000)

    } catch (err) {
      console.error('Error submitting report:', err)
      alert(t('err_send_report') + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-gray-100 p-8">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">✕</button>

        {success ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('report_success_title')}</h2>
            <p className="text-gray-600">{t('report_success_desc')}</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-brand text-gray-900 mb-2">{t('report_title')}</h2>
            <p className="text-gray-600 text-sm mb-6">{t('report_subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">{t('label_category')}</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="bug">{t('option_bug')}</option>
                  <option value="harassment">{t('option_harassment')}</option>
                  <option value="other">{t('option_other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">{t('label_desc_report')}</label>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder={t('placeholder_desc_report')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">{t('label_screenshot_opt')}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? t('btn_sending') : t('btn_send_report')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
