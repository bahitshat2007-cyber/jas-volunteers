import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const EMOJI_LIST = ['📋','🌳','🐾','🎨','🍞','💻','🧹','🏥','🏠','🏗️','🔥','⚡','🎤','🌟','🏆','🚀','💡','🌍','🤝','❤️','💪','🛠️','🎓','🎁','⚽','🎸','🎭','🌿','🌈']
const MULTIPLIERS = [1, 2, 3, 4, 5]
const TAGS_MAP = {
  'Экология': 'filter_ecology',
  'Животные': 'filter_animals',
  'Образование': 'filter_education',
  'Благотворительность': 'filter_charity',
  'IT': 'filter_it',
  'Творчество': 'filter_creative',
  'Благоустройство': 'filter_improvement',
  'Социальная помощь': 'filter_social'
}
const AVAILABLE_TAGS = Object.keys(TAGS_MAP)

function EditEventModal({ isOpen, onClose, onSuccess, event }) {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '12:00',
    end_time: '',
    whatsapp_link: '',
    max_participants: 30,
    emoji: '📋',
    hours_multiplier: 1,
    tags: []
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_date: event.event_date || '',
        start_time: event.start_time ? event.start_time.slice(0,5) : '12:00',
        end_time: event.end_time ? event.end_time.slice(0,5) : '',
        whatsapp_link: event.whatsapp_link || '',
        max_participants: event.max_participants || 30,
        emoji: event.emoji || '📋',
        hours_multiplier: event.hours_multiplier || 1,
        tags: event.tags || []
      })
    }
  }, [event, isOpen])

  if (!isOpen || !event) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleTag = (tag) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) }
      } else {
        return { ...prev, tags: [...prev.tags, tag] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          whatsapp_link: formData.whatsapp_link.trim() || null,
          max_participants: parseInt(formData.max_participants) || 30,
          emoji: formData.emoji,
          hours_multiplier: parseInt(formData.hours_multiplier) || 1,
          tags: formData.tags
        })
        .eq('id', event.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (err) {
      alert(t('err_update_event') + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg card-shadow max-h-[90vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[var(--color-surface)] rounded-t-3xl">
          <h2 className="text-xl font-bold text-[var(--color-text-heading)]">{t('edit_event_title')}</h2>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="edit-event-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_event_title')}</label>
              <input 
                required 
                type="text" 
                name="title"
                value={formData.title} 
                onChange={handleChange}
                placeholder={t('placeholder_event_title')} 
                className="input bg-[var(--color-surface)] border-none rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]" 
              />
            </div>

            <div className="form-control">
              <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_desc')}</label>
              <textarea 
                required 
                name="description"
                value={formData.description} 
                onChange={handleChange}
                placeholder={t('placeholder_desc')} 
                className="textarea bg-[var(--color-surface)] border-none rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] h-24 resize-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label font-bold text-[var(--color-text-heading)] py-1 flex items-center gap-1">{t('label_emoji')}</label>
                <select name="emoji" value={formData.emoji} onChange={handleChange} className="select bg-[var(--color-surface)] border-none rounded-xl text-2xl">
                  {EMOJI_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label font-bold text-[var(--color-text-heading)] py-1 text-[11px] uppercase tracking-widest text-[var(--color-primary)]">{t('label_hours_multiplier')}</label>
                <select name="hours_multiplier" value={formData.hours_multiplier} onChange={handleChange} className="select bg-red-50 text-[var(--color-primary)] border-none rounded-xl font-black">
                  {MULTIPLIERS.map(m => (
                    <option key={m} value={m}>{m === 1 ? t('option_standard') : t('badge_hours_multiplier').replace('{multiplier}', m)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_tags')}</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`badge badge-lg border-0 transition-all cursor-pointer ${formData.tags.includes(tag) ? 'bg-[var(--color-primary)] text-white scale-105' : 'bg-[var(--color-surface-2)] text-[var(--color-text-body)] hover:bg-gray-200'}`}
                  >
                    {t(TAGS_MAP[tag])}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_date')}</label>
                <input required type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="input bg-[var(--color-surface)] border-none rounded-xl" />
              </div>
              <div className="form-control">
                <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_spots')}</label>
                <input required type="number" name="max_participants" min="1" value={formData.max_participants} onChange={handleChange} className="input bg-[var(--color-surface)] border-none rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_start')}</label>
                <div className="flex items-center gap-1">
                  <select 
                    required
                    value={formData.start_time?.split(':')[0] || ''} 
                    onChange={e => setFormData(p => ({...p, start_time: `${e.target.value}:${p.start_time?.split(':')[1] || '00'}`}))}
                    className="select flex-1 bg-[var(--color-surface)] border-none rounded-xl px-2 text-center"
                  >
                    {Array.from({length: 24}, (_, i) => {
                      const str = i.toString().padStart(2, '0')
                      return <option key={str} value={str}>{str}</option>
                    })}
                  </select>
                  <span className="font-bold">:</span>
                  <select 
                    required
                    value={formData.start_time?.split(':')[1] || ''} 
                    onChange={e => setFormData(p => ({...p, start_time: `${p.start_time?.split(':')[0] || '12'}:${e.target.value}`}))}
                    className="select flex-1 bg-[var(--color-surface)] border-none rounded-xl px-2 text-center"
                  >
                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(str => <option key={str} value={str}>{str}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-control">
                <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_end')}</label>
                <div className="flex items-center gap-1">
                  <select 
                    value={formData.end_time?.split(':')[0] || ''} 
                    onChange={e => setFormData(p => ({...p, end_time: e.target.value ? `${e.target.value}:${p.end_time?.split(':')[1] || '00'}` : ''}))}
                    className="select flex-1 bg-[var(--color-surface)] border-none rounded-xl px-2 text-center"
                  >
                    <option value="">-</option>
                    {Array.from({length: 24}, (_, i) => {
                      const str = i.toString().padStart(2, '0')
                      return <option key={str} value={str}>{str}</option>
                    })}
                  </select>
                  <span className="font-bold">:</span>
                  <select 
                    value={formData.end_time?.split(':')[1] || ''} 
                    onChange={e => setFormData(p => ({...p, end_time: e.target.value ? `${p.end_time?.split(':')[0] || '12'}:${e.target.value}` : ''}))}
                    className="select flex-1 bg-[var(--color-surface)] border-none rounded-xl px-2 text-center"
                  >
                    <option value="">-</option>
                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(str => <option key={str} value={str}>{str}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label font-bold text-[var(--color-text-heading)] py-1">{t('label_wa_link')}</label>
              <input 
                type="url" 
                name="whatsapp_link"
                value={formData.whatsapp_link} 
                onChange={handleChange}
                placeholder={t('placeholder_wa_link')} 
                className="input bg-[var(--color-surface)] border-none rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] placeholder-gray-400" 
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end rounded-b-3xl bg-[var(--color-surface)]">
          <button type="button" onClick={onClose} disabled={loading} className="btn btn-ghost rounded-xl">{t('btn_cancel_modal')}</button>
          <button type="submit" form="edit-event-form" disabled={loading} className="btn bg-[var(--color-primary)] hover:bg-red-800 text-white rounded-xl px-8 border-none">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : t('btn_save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditEventModal
