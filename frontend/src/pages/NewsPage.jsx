import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LoadingScreen from '../components/LoadingScreen'
import NewsCard from '../components/NewsCard'
import CreateNewsModal from '../components/CreateNewsModal'

function NewsPage() {
  const { profile, user } = useAuth()
  const { t } = useLanguage()
  
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState(null)

  const isAdmin = ['admin', 'developer'].includes(profile?.role)
  const canPost = ['coordinator', 'sub_coordinator', 'manager', 'admin', 'developer'].includes(profile?.role)

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*, teams(name, logo_url)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNewsList(data || [])
    } catch (err) {
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) return
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId)
      
      if (error) throw error
      setNewsList(prev => prev.filter(n => n.id !== newsId))
    } catch (err) {
      console.error('Error deleting news:', err)
      alert('Не удалось удалить новость.')
    }
  }

  const handleEditNews = (news) => {
    setEditingNews(news)
    setIsCreateModalOpen(true)
  }

  useEffect(() => {
    fetchNews()
  }, [])

  if (loading) return <LoadingScreen message="Загрузка новостей..." />

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-brand text-gray-900 mb-2">
            {t('nav_news')} <span className="text-[var(--color-primary)]">.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg">
            Узнавайте первыми о главных событиях, изменениях в командах и жизни Jas Volunteers.
          </p>
        </div>
        
        {canPost && (
          <button 
            onClick={() => { setEditingNews(null); setIsCreateModalOpen(true); }}
            className="btn btn-jas rounded-2xl px-8 h-14 font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:scale-105 transition-all text-xs"
          >
            📢 ОПУБЛИКОВАТЬ НОВОСТЬ
          </button>
        )}
      </div>

      {/* NEWS GRID */}
      {newsList.length === 0 ? (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
           <div className="text-6xl mb-6 opacity-20">📭</div>
           <h3 className="text-xl font-bold text-gray-400">Новостей пока нет</h3>
           <p className="text-gray-400 text-sm mt-2">Будьте первым, кто расскажет о важном!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.map(news => (
            <NewsCard 
              key={news.id} 
              news={news} 
              onReadMore={(n) => setSelectedNews(n)} 
              onEdit={handleEditNews}
              onDelete={handleDeleteNews}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* DETAIL MODAL - REDESIGNED FOR VERTICAL SCROLLING */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-12 duration-500">
             {/* Header with scroll progress indicator hint */}
             <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white p-1.5 border shadow-sm flex items-center justify-center">
                      {selectedNews.teams?.logo_url ? <img src={selectedNews.teams.logo_url} className="w-full h-full object-cover rounded" /> : '📢'}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 leading-none mb-1">Новости</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[200px]">{selectedNews.teams?.name || 'Организация'}</span>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)} 
                  className="w-12 h-12 rounded-full hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-2xl text-gray-300 transition-all active:scale-90"
                >
                  ✕
                </button>
             </div>

             {/* Content - Narrower width, vertical scrolling emphasized */}
             <div className="p-10 md:p-12 overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
                <div className="max-w-md mx-auto"> {/* Extra constraint for better readability */}
                  <div className="mb-4 flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                       selectedNews.type === 'epic' ? 'bg-indigo-600 text-white' : 
                       selectedNews.type === 'org' ? 'bg-red-100 text-red-600' : 
                       'bg-gray-100 text-gray-500'
                     }`}>
                       {selectedNews.type}
                     </span>
                     <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <h2 className="text-3xl font-black text-gray-900 mb-8 leading-tight tracking-tight border-l-4 border-indigo-500 pl-4 break-words">
                    {selectedNews.title}
                  </h2>
                  
                  <div className="text-gray-600 leading-[1.8] whitespace-pre-wrap text-lg font-medium selection:bg-indigo-100 italic font-serif break-words overflow-hidden">
                    {selectedNews.content}
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-dashed border-gray-100 text-center">
                     <p className="text-xs text-gray-300 font-bold uppercase tracking-widest mb-4">Конец публикации</p>
                     <div className="flex justify-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20"></div>
                     </div>
                  </div>
                </div>
             </div>

             {/* Footer */}
             <div className="p-6 bg-gray-50 border-t flex justify-center">
                <button 
                  onClick={() => setSelectedNews(null)} 
                  className="btn btn-jas bg-gray-900 hover:bg-black text-white rounded-2xl px-12 py-3 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                >
                  Закрыть
                </button>
             </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isCreateModalOpen && (
        <CreateNewsModal 
          onClose={() => { setIsCreateModalOpen(false); setEditingNews(null); }} 
          editingNews={editingNews}
          onCreated={() => {
            setIsCreateModalOpen(false)
            setEditingNews(null)
            fetchNews()
          }} 
        />
      )}
    </div>
  )
}

export default NewsPage
