import React from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

const NewsCard = ({ news, onReadMore, onEdit, onDelete, currentUserId, isAdmin }) => {
  const { t } = useLanguage()
  const isLong = news.content.length > 200
  const displayContent = isLong ? news.content.substring(0, 200) + '...' : news.content
  const canManage = currentUserId === news.author_id || isAdmin

  const ActionButtons = () => (
    <div className="absolute top-4 right-4 flex gap-2 z-20">
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(news); }}
        className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs hover:bg-white/20 transition-all text-white shadow-lg"
        title={t('title_edit')}
      >
        ✏️
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(news.id); }}
        className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 flex items-center justify-center text-xs hover:bg-red-500/40 transition-all text-white shadow-lg"
        title={t('title_delete')}
      >
        🗑️
      </button>
    </div>
  )

  if (news.type === 'epic') {
    return (
      <div className="news-card-responsive group relative">
        <div className="absolute inset-0 bg-slate-950 rounded-[2.5rem] border-2 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
        
        {/* Animated Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2.5rem]" />
        
        {/* Simple Animated Accent Layer */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />

        <div className="relative z-10 bg-slate-900/90 backdrop-blur-xl rounded-[2.3rem] p-7 h-full flex flex-col border border-white/5 m-1">
           {canManage && <ActionButtons />}
           
           {/* Header: Team Logo + Name */}
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg ring-2 ring-indigo-500/50 flex items-center justify-center">
                 {news.teams?.logo_url ? <img src={news.teams.logo_url} className="w-full h-full object-cover rounded-xl" /> : <span className="text-xl">📢</span>}
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">UNPRECEDENTED</h4>
                <p className="text-white font-black text-xs truncate max-w-[120px]">{news.teams?.name || 'Jas Volunteers'}</p>
              </div>
              <div className="ml-auto bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-lg animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]">EPIC</div>
           </div>

           <h3 className="text-2xl font-black text-white mb-4 leading-tight group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
              {news.title}
           </h3>

           <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 overflow-hidden">
              {displayContent}
           </p>

           <div className="flex items-center justify-between mt-auto pt-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(news.created_at).toLocaleDateString()}</span>
              <button 
                onClick={() => onReadMore(news)} 
                className="bg-white text-slate-950 px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all transform active:scale-95 shadow-xl"
              >
                  {isLong ? t('btn_read_full') : t('btn_open')}
              </button>
           </div>
        </div>
      </div>
    )
  }

  if (news.type === 'org') {
    return (
      <div className="news-card-responsive bg-white rounded-[2.5rem] p-8 card-shadow border-2 border-[var(--color-primary)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 flex flex-col">
        {canManage && (
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button title={t('title_edit')} onClick={(e) => { e.stopPropagation(); onEdit(news); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs hover:bg-gray-200 transition-all border border-gray-200">✏️</button>
            <button title={t('title_delete')} onClick={(e) => { e.stopPropagation(); onDelete(news.id); }} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-xs hover:bg-red-100 transition-all border border-red-100">🗑️</button>
          </div>
        )}
        
        {/* Subtle Background Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-6">
           <div className="w-10 h-10 rounded-xl bg-gray-50 p-0.5 border border-gray-100 flex items-center justify-center">
              {news.teams?.logo_url ? <img src={news.teams.logo_url} className="w-full h-full object-cover rounded-lg" /> : <span className="text-lg">📢</span>}
           </div>
           <div>
              <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest leading-none mb-1">{t('global_update')}</p>
              <p className="text-xs font-bold text-gray-500">{news.teams?.name || 'Jas Volunteers'}</p>
           </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-3 leading-tight">{news.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 overflow-hidden">{displayContent}</p>

        <div className="flex items-center justify-between mt-auto">
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(news.created_at).toLocaleDateString()}</span>
           <button onClick={() => onReadMore(news)} className="text-[var(--color-primary)] font-black text-[11px] uppercase tracking-widest hover:underline px-2">
              {t('btn_details_arrow')}
           </button>
        </div>
      </div>
    )
  }

  // DEFAULT / TEAM NEWS
  return (
    <div className="news-card-responsive bg-white rounded-[2.5rem] p-7 card-shadow border border-gray-100 hover:border-gray-200 transition-all group flex flex-col relative">
      {canManage && (
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button title={t('title_edit')} onClick={(e) => { e.stopPropagation(); onEdit(news); }} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs hover:bg-gray-100 transition-all border border-gray-100">✏️</button>
            <button title={t('title_delete')} onClick={(e) => { e.stopPropagation(); onDelete(news.id); }} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-xs hover:bg-red-100 transition-all border border-red-200">🗑️</button>
          </div>
        )}

      <div className="flex items-center gap-3 mb-5">
         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs opacity-60">
            {news.teams?.logo_url ? <img src={news.teams.logo_url} className="w-full h-full object-cover rounded-lg" /> : '👥'}
         </div>
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{news.teams?.name || t('team_news_fallback')}</span>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{news.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1 overflow-hidden">{news.content}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
         <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{new Date(news.created_at).toLocaleDateString()}</span>
         <button onClick={() => onReadMore(news)} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
           {t('btn_details')}
         </button>
      </div>
    </div>
  )
}

export default NewsCard
