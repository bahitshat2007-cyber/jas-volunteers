import { useNavigate } from 'react-router-dom'
import {
  RankNovice, RankVolunteer, RankActivist,
  RankVeteran, RankChampion, RankLegend
} from '../components/Ornaments.jsx'

const RANKS = [
  {
    id: 'novice',
    name: 'Новичок',
    hours: '0+',
    color: '#9ca3af',
    Icon: RankNovice,
    perk: 'Первый шаг в мире добра. Открывает доступ к базовым мероприятиям.',
    style: 'border-gray-200 bg-gray-50'
  },
  {
    id: 'volunteer',
    name: 'Доброволец',
    hours: '50+',
    color: '#10b981',
    Icon: RankVolunteer,
    perk: 'Вы уже не случайный гость. Приоритетный отбор на популярные ивенты.',
    style: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  {
    id: 'activist',
    name: 'Активист',
    hours: '200+',
    color: '#3b82f6',
    Icon: RankActivist,
    perk: 'Вас знают в лицо. Возможность помогать в организации малых групп.',
    style: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    hours: '500+',
    color: '#8b5cf6',
    Icon: RankVeteran,
    perk: 'Опытный боец. Эксклюзивный мерч и доступ к закрытым встречам лидеров.',
    style: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  {
    id: 'champion',
    name: 'Чемпион',
    hours: '1000+',
    color: '#f97316',
    Icon: RankChampion,
    perk: 'Мастер своего дела. Право координировать целые направления.',
    style: 'border-orange-200 bg-orange-50 text-orange-700'
  },
  {
    id: 'legend',
    name: 'Легенда',
    hours: '2500+',
    color: '#ef4444',
    Icon: RankLegend,
    perk: 'Живой символ Jas Volunteers. Право вето, личный профиль в Зале Славы и вечный почет.',
    style: 'border-red-200 bg-red-50 text-red-600'
  }
]

const ROLES = [
  {
    title: '🙋 Волонтер',
    desc: 'Сердце платформы. Участвует в ивентах, копит часы и растет в рангах.',
    powers: ['Запись на любые ивенты', 'Получение ачивок', 'Участие в жизни клана']
  },
  {
    title: '⚖️ Зам. координатора',
    desc: 'Правая рука лидера. Помогает следить за порядком и новостями.',
    powers: ['Публикация новостей', 'Помощь в управлении участниками', 'Прием заявок']
  },
  {
    title: '🛡️ Координатор',
    desc: 'Глава клана. Несет ответственность за весь коллектив.',
    powers: ['Полное управление составом', 'Начисление бонусных часов', 'Редактирование данных клана']
  }
]

function RanksPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
      {/* Header */}
      <section className="text-center space-y-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost btn-sm rounded-xl mb-4"
        >
          ← Назад в профиль
        </button>
        <h1 className="text-4xl font-brand text-[var(--color-text-heading)]">Иерархия Благодетеля</h1>
        <p className="text-[var(--color-text-body)] max-w-xl mx-auto">
          Твои добрые дела превращаются в опыт. Чем выше ранг, тем больше влияния ты имеешь на мир вокруг.
        </p>
      </section>

      {/* Ranks Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RANKS.map((rank) => (
          <div 
            key={rank.id} 
            className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] hover:shadow-xl flex items-center gap-6 group ${rank.style}`}
          >
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center p-3 bg-white rounded-2xl shadow-inner group-hover:rotate-6 transition-transform">
              <rank.Icon className="w-full h-full" style={{ color: rank.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-black uppercase tracking-tight">{rank.name}</h3>
                <span className="text-xs font-bold opacity-60">от {rank.hours} ч.</span>
              </div>
              <p className="text-xs leading-relaxed opacity-80">{rank.perk}</p>
              
              {/* Progress visual mock */}
              <div className="mt-3 w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-current opacity-20" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 py-6">
        <div className="h-px bg-gray-200 flex-1"></div>
        <div className="text-2xl">🛡️</div>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* Roles Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-brand text-[var(--color-text-heading)] mb-2">Роли в системе</h2>
          <p className="text-sm text-[var(--color-text-body)] opacity-70">Статус определяет твои возможности на портале</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map((role) => (
            <div key={role.title} className="bg-white rounded-[2rem] p-8 card-shadow border border-gray-50 flex flex-col h-full hover:border-[var(--color-primary)] transition-all">
              <h3 className="text-xl font-bold mb-3">{role.title}</h3>
              <p className="text-xs text-[var(--color-text-body)] mb-6 flex-1 leading-relaxed">
                {role.desc}
              </p>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Способности:</p>
                {role.powers.map(p => (
                  <div key={p} className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                    <span className="text-green-500">✔</span> {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clash style CTA */}
      <section className="bg-[var(--color-primary)] rounded-[3rem] p-10 text-white text-center space-y-6 shadow-2xl shadow-red-200">
        <div className="text-4xl">🚀</div>
        <h2 className="text-3xl font-brand">Твой путь только начинается!</h2>
        <p className="opacity-90 max-w-lg mx-auto text-sm">
          Каждый час помощи приближает тебя к статусу Легенды. Самые крутые волонтеры получают доступ к эксклюзивным стажировкам и рекомендациям.
        </p>
        <button 
          onClick={() => navigate('/events')}
          className="btn btn-lg bg-white text-[var(--color-primary)] border-none rounded-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-xs px-10"
        >
          За работу, боец! 🛠️
        </button>
      </section>
    </div>
  )
}

export default RanksPage
