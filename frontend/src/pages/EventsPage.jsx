import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import CreateEventModal from '../components/CreateEventModal.jsx'
import EditEventModal from '../components/EditEventModal.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'

const filterKeys = {
  'Все': 'filter_all',
  'Экология': 'filter_ecology',
  'Животные': 'filter_animals',
  'Образование': 'filter_education',
  'Благотворительность': 'filter_charity',
  'IT': 'filter_it',
  'Творчество': 'filter_creative',
  'Благоустройство': 'filter_improvement',
  'Социальная помощь': 'filter_social'
};

function EventsPage() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Все')
  const [search, setSearch] = useState('')
  const [registering, setRegistering] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [eventToCancel, setEventToCancel] = useState(null)
  const [joinedEventWhatsApp, setJoinedEventWhatsApp] = useState(null)
  
  // Custom Modal State for Leaving Event
  const [leaveConfirmEvent, setLeaveConfirmEvent] = useState(null)

  const filters = ['Все', 'Экология', 'Животные', 'Образование', 'Благотворительность', 'IT', 'Творчество', 'Благоустройство', 'Социальная помощь']

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        teams(name, logo_url),
        event_participants(id, user_id, status)
      `)
      .eq('status', 'active')
      .order('event_date', { ascending: true })

    if (!error && data) {
      setEvents(data)
    }
    setLoading(false)
  }

  async function handleRegister(eventId) {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setRegistering(eventId)
    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: user.id })
    if (!error) {
      await fetchEvents()
      // Show WhatsApp link if the event has it
      const eventJoined = events.find(e => e.id === eventId) || displayEvents.find(e => e.id === eventId)
      if (eventJoined?.whatsapp_link) {
         setJoinedEventWhatsApp(eventJoined.whatsapp_link)
      }
    } else {
      alert(t('err_register'))
    }
    setRegistering(null)
  }

  async function handleLeaveClick(event) {
    if (!user) return
    const eventTimeStr = event.event_date + (event.start_time ? 'T' + event.start_time : 'T00:00')
    const eventDate = new Date(eventTimeStr)
    const hoursDifference = (eventDate - new Date()) / (1000 * 60 * 60)
    
    if (hoursDifference < 24) {
      alert(t('err_cancel_time'))
      return
    }

    // Open custom beautiful modal instead of native confirm()
    setLeaveConfirmEvent(event)
  }

  async function executeLeaveEvent() {
    if (!leaveConfirmEvent || !user) return
    const event = leaveConfirmEvent
    setLeaveConfirmEvent(null)
    
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', user.id)
    
    if (!error) await fetchEvents()
    else alert(t('err_cancel_db'))
  }

  async function executeCancelEvent() {
    if (!eventToCancel) return

    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', eventToCancel.id)
    
    if (!error) {
      await fetchEvents()
      setIsCancelModalOpen(false)
      setEventToCancel(null)
    } else {
      alert(t('err_delete'))
    }
  }

  function handleCancelClick(event) {
    setEventToCancel(event)
    setIsCancelModalOpen(true)
  }

  function handleEditClick(event) {
    const eventTimeStr = event.event_date + (event.start_time ? 'T' + event.start_time : 'T00:00')
    const eventDate = new Date(eventTimeStr)
    const hoursDifference = (eventDate - new Date()) / (1000 * 60 * 60)
    
    if (hoursDifference < 24) {
      alert(t('err_edit_time'))
      return
    }
    setEventToEdit(event)
    setIsEditModalOpen(true)
  }

  const filtered = events.filter((e) => {
    const matchesFilter = activeFilter === 'Все' || (e.tags && e.tags.includes(activeFilter))
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.teams?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const displayEvents = filtered

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const canCreate = profile?.role === 'coordinator' || profile?.role === 'sub_coordinator'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">{t('events_page_title')}</h1>
        {canCreate && (
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="btn bg-[var(--color-primary)] text-white hover:bg-red-800 border-none rounded-xl shadow-md px-6 font-black uppercase tracking-widest text-xs"
          >
            {t('btn_create')}
          </button>
        )}
      </div>

      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchEvents}
      />

      <EditEventModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEventToEdit(null); }} 
        onSuccess={fetchEvents}
        event={eventToEdit}
      />

      {/* Cancel Event Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🗑️
            </div>
            <h3 className="text-2xl font-black text-[var(--color-text-heading)] mb-3">{t('delete_modal_title')}</h3>
            <p className="text-[var(--color-text-body)] mb-8 leading-relaxed">
              {t('delete_modal_desc')} <span className="font-bold text-red-600">«{eventToCancel?.title}»</span>? 
              {t('delete_modal_desc2')}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeCancelEvent}
                className="btn h-14 bg-red-600 hover:bg-red-700 text-white border-none rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                {t('delete_modal_yes')}
              </button>
              <button 
                onClick={() => { setIsCancelModalOpen(false); setEventToCancel(null); }}
                className="btn h-14 btn-ghost text-[var(--color-text-body)] rounded-2xl font-bold"
              >
                {t('delete_modal_no')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl card-shadow p-4 space-y-3">
        <input
          type="text"
          placeholder={t('search_placeholder')}
          className="input input-bordered w-full rounded-xl bg-[var(--color-surface)] border-gray-200 focus:border-[var(--color-primary)] focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="event-search"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`badge badge-lg cursor-pointer transition-colors rounded-xl border-0 ${
                activeFilter === f
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-body)] hover:bg-gray-200'
              }`}
            >
              {t(filterKeys[f] || f)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingScreen message={t('loading_events')} />}

      {/* Events List */}
      {!loading && (
        <div className="space-y-4">
          {displayEvents.length === 0 && (
            <div className="bg-white rounded-2xl card-shadow p-10 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-[var(--color-text-body)]">{t('not_found_events')}</p>
            </div>
          )}

          {displayEvents.map((event) => {
            const spots = event.event_participants?.length || 0
            const maxSpots = event.max_participants || 30
            const isFull = spots >= maxSpots
            const isRegistered = user && event.event_participants?.some(p => p.user_id === user.id)

            return (
              <div 
                key={event.id} 
                className={`rounded-3xl card-shadow p-6 transition-transform relative overflow-hidden border border-gray-50 ${
                  isRegistered ? 'bg-gradient-to-br from-white to-green-50 ring-2 ring-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]' : 'bg-white card-hover'
                }`}
              >
                {/* Множитель Часов (Epic Badge) */}
                {event.hours_multiplier && event.hours_multiplier > 1 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-[#FF4500] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg rotate-2 z-10 animate-bounce-subtle border border-white/30 backdrop-blur-sm">
                    {t('badge_hours_multiplier').replace('{multiplier}', event.hours_multiplier)}
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Левая колонка - Эмодзи и Лого команды */}
                  <div className="flex flex-col items-center gap-3 hidden sm:flex">
                    <div className="text-5xl bg-gray-50 rounded-2xl w-20 h-20 flex items-center justify-center card-shadow overflow-hidden">
                      {event.emoji?.length > 2 && event.emoji.includes('http') ? (
                        <img src={event.emoji} alt="icon" className="w-full h-full object-cover" />
                      ) : (
                         event.emoji || '📋'
                      )}
                    </div>
                    
                    {/* Логотип команды */}
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center overflow-hidden border-2 border-[var(--color-primary)] shadow-sm" title={event.teams?.name}>
                      {event.teams?.logo_url ? (
                        <img src={event.teams.logo_url} className="w-full h-full object-cover" alt="team_logo" />
                      ) : (
                        <span className="text-[var(--color-primary)] font-black text-xs">{event.teams?.name ? event.teams.name[0].toUpperCase() : 'О'}</span>
                      )}
                    </div>
                  </div>

                  {/* Правая колонка - Основная инфа */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-[var(--color-text-heading)] text-lg mb-1 pr-24">
                          <span className="sm:hidden mr-2">{event.emoji || '📋'}</span>
                          {event.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-body)] font-medium flex items-center gap-1.5">
                           {/* Мобильный логотип команды */}
                           <span className="w-4 h-4 inline-flex items-center justify-center bg-[var(--color-primary)] rounded-full text-[8px] text-white font-black sm:hidden">
                             {event.teams?.name ? event.teams.name[0].toUpperCase() : 'О'}
                           </span>
                           👥 {event.teams?.name || 'Организатор'}
                        </p>
                      </div>
                      {isRegistered ? (
                        <span className="badge bg-green-50 text-green-700 border-0 rounded-lg whitespace-nowrap">{t('badge_registered')}</span>
                      ) : isFull ? (
                        <span className="badge bg-gray-200 text-[var(--color-text-body)] border-0 rounded-lg whitespace-nowrap">{t('badge_no_spots')}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {(profile?.role === 'coordinator' || profile?.role === 'sub_coordinator') && event.team_id === profile?.team_id && (
                             <div className="flex gap-2 mr-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditClick(event) }} 
                                  className="btn btn-xs btn-ghost text-indigo-500 hover:bg-indigo-50 rounded-lg"
                                  title={t('btn_edit')}
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCancelClick(event) }} 
                                  className="btn btn-xs btn-ghost text-red-400 hover:bg-red-50 rounded-lg"
                                  title={t('btn_delete_full')}
                                >
                                  🗑️
                                </button>
                             </div>
                          )}
                          <span className="badge bg-green-50 text-green-700 border-0 rounded-lg whitespace-nowrap">{t('badge_has_spots')}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-[var(--color-text-body)] mb-3">{event.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-body)] mb-3">
                      <span>📅 {formatDate(event.event_date)}</span>
                      {event.start_time && <span>🕐 {event.start_time?.slice(0,5)}{event.end_time ? ` – ${event.end_time.slice(0,5)}` : ''}</span>}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {event.tags.map((tag) => (
                          <span key={tag} className="badge badge-sm bg-[var(--color-surface-2)] text-[var(--color-text-body)] border-0 rounded-lg">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between text-xs text-[var(--color-text-body)] mb-1">
                          <span>{t('event_enrolled')}</span>
                          <span>{spots}/{maxSpots}</span>
                        </div>
                        <progress className="progress progress-error w-full h-2" value={spots} max={maxSpots} />
                      </div>
                      {isRegistered ? (
                        <div className="flex flex-col md:flex-row items-center gap-2 shrink-0">
                           <button onClick={(e) => { e.stopPropagation(); handleLeaveClick(event) }} className="btn btn-sm btn-ghost text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl whitespace-nowrap">{t('btn_cancel')}</button>
                           <span className="btn btn-sm btn-disabled rounded-xl bg-green-100 text-green-800 font-bold border-none px-4">{t('btn_you_registered')}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => !showMock && handleRegister(event.id)}
                          className={`btn btn-sm rounded-xl whitespace-nowrap ${isFull ? 'btn-disabled' : 'btn-jas'}`}
                          disabled={isFull || registering === event.id}
                        >
                          {registering === event.id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : isFull ? t('badge_no_spots') : t('event_btn_enroll')}
                        </button>
                      )}
                    </div>

                    {/* Показ WhatsApp ссылки если записан */}
                    {isRegistered && event.whatsapp_link && (
                      <div className="mt-4 pt-4 border-t border-green-100 w-full animate-fade-in">
                         <a href={event.whatsapp_link} target="_blank" rel="noopener noreferrer" className="btn w-full bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg border-none flex items-center justify-center gap-2">
                            <span className="text-xl">💬</span> <span className="font-black uppercase tracking-widest text-xs truncate">{t('wa_group_btn')}</span>
                         </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* WhatsApp Popup Modal */}
      {joinedEventWhatsApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative card-shadow animate-fade-in-up">
             <div className="text-6xl mb-4 animate-bounce">💚</div>
             <h2 className="text-2xl font-black text-gray-900 mb-2">{t('wa_modal_title')}</h2>
             <p className="text-gray-600 mb-6 text-sm leading-relaxed">{t('wa_modal_desc')}</p>
             <div className="flex flex-col gap-3">
               <a href={joinedEventWhatsApp} target="_blank" rel="noopener noreferrer" className="btn bg-green-500 hover:bg-green-600 border-none text-white rounded-xl w-full font-black uppercase tracking-widest relative overflow-hidden">
                  <span className="absolute inset-0 bg-white/20 hover:animate-ping opacity-0 hover:opacity-100 transition-opacity"></span>
                  {t('wa_modal_go')}
               </a>
               <button onClick={() => setJoinedEventWhatsApp(null)} className="btn btn-ghost rounded-xl w-full text-gray-400">{t('wa_modal_later')}</button>
             </div>
          </div>
        </div>
      )}

      {/* Красивое окно подтверждения отмены */}
      {leaveConfirmEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative card-shadow animate-scale-in">
             <div className="text-6xl mb-4">💔</div>
             <h2 className="text-2xl font-black text-gray-900 mb-2">{t('cancel_modal_title')}</h2>
             <p className="text-gray-600 mb-6 text-sm leading-relaxed">
               {t('cancel_modal_desc')} <br/>
               <span className="font-bold text-gray-800">«{leaveConfirmEvent.title}»</span>?
             </p>
             <div className="flex flex-col gap-3">
               <button onClick={() => setLeaveConfirmEvent(null)} className="btn bg-green-500 hover:bg-green-600 border-none text-white rounded-xl w-full font-bold">
                  {t('cancel_modal_no')}
               </button>
               <button onClick={executeLeaveEvent} className="btn btn-ghost rounded-xl w-full text-red-500 font-bold">
                  {t('cancel_modal_yes')}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventsPage
