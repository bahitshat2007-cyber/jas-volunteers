import { useNavigate } from 'react-router-dom'
import {
  RankNovice, RankVolunteer, RankActivist,
  RankVeteran, RankChampion, RankLegend
} from '../components/Ornaments.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

function RanksPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const RANKS = [
    {
      id: 'novice',
      name: t('rank_novice'),
      hours: '0+',
      color: '#9ca3af',
      Icon: RankNovice,
      perk: t('rank_novice_perk'),
      style: 'border-gray-200 bg-gray-50'
    },
    {
      id: 'volunteer',
      name: t('rank_volunteer'),
      hours: '50+',
      color: '#10b981',
      Icon: RankVolunteer,
      perk: t('rank_volunteer_perk'),
      style: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    },
    {
      id: 'activist',
      name: t('rank_activist'),
      hours: '200+',
      color: '#3b82f6',
      Icon: RankActivist,
      perk: t('rank_activist_perk'),
      style: 'border-blue-200 bg-blue-50 text-blue-700'
    },
    {
      id: 'veteran',
      name: t('rank_veteran'),
      hours: '500+',
      color: '#8b5cf6',
      Icon: RankVeteran,
      perk: t('rank_veteran_perk'),
      style: 'border-violet-200 bg-violet-50 text-violet-700'
    },
    {
      id: 'champion',
      name: t('rank_champion'),
      hours: '1000+',
      color: '#f97316',
      Icon: RankChampion,
      perk: t('rank_champion_perk'),
      style: 'border-orange-200 bg-orange-50 text-orange-700'
    },
    {
      id: 'legend',
      name: t('rank_legend'),
      hours: '2500+',
      color: '#ef4444',
      Icon: RankLegend,
      perk: t('rank_legend_perk'),
      style: 'border-red-200 bg-red-50 text-red-600'
    }
  ]

  const ROLES = [
    {
      title: t('role_volunteer'),
      desc: t('role_vol_desc'),
      powers: [t('role_vol_p1'), t('role_vol_p2'), t('role_vol_p3')]
    },
    {
      title: t('role_sub_coordinator'),
      desc: t('role_sub_desc'),
      powers: [t('role_sub_p1'), t('role_sub_p2'), t('role_sub_p3')]
    },
    {
      title: t('role_coordinator'),
      desc: t('role_coord_desc'),
      powers: [t('role_coord_p1'), t('role_coord_p2'), t('role_coord_p3')]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in">
      {/* Header */}
      <section className="text-center space-y-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost btn-sm rounded-xl mb-4"
        >
          {t('btn_back_profile')}
        </button>
        <h1 className="text-4xl font-brand text-[var(--color-text-heading)]">{t('hierarchy_title')}</h1>
        <p className="text-[var(--color-text-body)] max-w-xl mx-auto">
          {t('hierarchy_desc')}
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
                <span className="text-xs font-bold opacity-60">{t('hours_from')} {rank.hours} {t('rank_hours')}</span>
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
          <h2 className="text-3xl font-brand text-[var(--color-text-heading)] mb-2">{t('roles_system_title')}</h2>
          <p className="text-sm text-[var(--color-text-body)] opacity-70">{t('roles_system_desc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map((role) => (
            <div key={role.title} className="bg-white rounded-[2rem] p-8 card-shadow border border-gray-50 flex flex-col h-full hover:border-[var(--color-primary)] transition-all">
              <h3 className="text-xl font-bold mb-3">{role.title}</h3>
              <p className="text-xs text-[var(--color-text-body)] mb-6 flex-1 leading-relaxed">
                {role.desc}
              </p>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('abilities_label')}</p>
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
        <h2 className="text-3xl font-brand">{t('cta_path_title')}</h2>
        <p className="opacity-90 max-w-lg mx-auto text-sm">
          {t('cta_path_desc')}
        </p>
        <button 
          onClick={() => navigate('/events')}
          className="btn btn-lg bg-white text-[var(--color-primary)] border-none rounded-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-xs px-10"
        >
          {t('btn_to_work')}
        </button>
      </section>
    </div>
  )
}

export default RanksPage
