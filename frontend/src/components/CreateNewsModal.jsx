import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function CreateNewsModal({ onClose, onCreated, editingNews = null }) {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('team')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Инициализация при редактировании
  useEffect(() => {
    if (editingNews) {
      setTitle(editingNews.title)
      setContent(editingNews.content)
      setType(editingNews.type)
    }
  }, [editingNews])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (editingNews) {
        // РЕЖИМ РЕДАКТИРОВАНИЯ
        const { error: updateError } = await supabase
          .from('news')
          .update({
            title: title.trim(),
            content: content.trim(),
            type,
            team_id: type === 'team' ? profile?.team_id : null
          })
          .eq('id', editingNews.id)
        
        if (updateError) throw updateError
      } else {
        // РЕЖИМ СОЗДАНИЯ
        const { error: postError } = await supabase
          .from('news')
          .insert([{
            title: title.trim(),
            content: content.trim(),
            type,
            author_id: user.id,
            team_id: type === 'team' ? profile?.team_id : null
          }])
        
        if (postError) throw postError
      }
      
      onCreated()
    } catch (err) {
      console.error('Error saving news:', err)
      setError(editingNews 
        ? 'Не удалось обновить новость. Проверьте права доступа.' 
        : 'Не удалось опубликовать новость. Проверьте права доступа.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-3xl font-brand text-gray-900 mb-1">
              {editingNews ? 'Редактировать' : 'Создать новость'}
            </h3>
            <p className="text-sm text-gray-500">
              {editingNews ? 'Внесите изменения в публикацию' : 'Поделитесь важным событием с волонтерами'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl text-gray-400 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Заголовок новости</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Название новости..." 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold placeholder:font-normal"
            />
          </div>

          <div>
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Тип новости (Визуальный стиль)</label>
             <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setType('team')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${type === 'team' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                   <span className="text-xl">🏠</span>
                   <span className="text-[10px] font-black uppercase tracking-tighter">Командная</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setType('org')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${type === 'org' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                   <span className="text-xl">🌍</span>
                   <span className="text-[10px] font-black uppercase tracking-tighter">Орг-масштаб</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setType('epic')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${type === 'epic' ? 'border-purple-600 bg-slate-900 text-purple-400 shadow-xl' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                   <span className="text-xl">⚡️</span>
                   <span className="text-[10px] font-black uppercase tracking-tighter">EPIC</span>
                </button>
             </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Текст новости</label>
            <textarea 
              required 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Подробное описание..." 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none h-40 text-sm leading-relaxed"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 text-xs"
          >
            {loading ? 'СОХРАНЕНИЕ...' : (editingNews ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ 💾' : 'ОПУБЛИКОВАТЬ ⚡️')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateNewsModal
