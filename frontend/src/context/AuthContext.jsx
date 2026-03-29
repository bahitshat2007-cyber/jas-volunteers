import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Define auth state handler
    const handleAuthChange = (event, session) => {
      if (!mounted) return
      
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    // 1. Subscribe to auth events BEFORE anything else
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // 2. Fetch initial session (Supabase sometimes skips INITIAL_SESSION event in v2)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
      if (error) {
        console.error('Session error:', error.message)
        setLoading(false)
        return
      }

      // If no session, we must ensure loading is false
      if (!session) {
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else {
        // If there is a session, handleAuthChange will likely cover it, but just in case:
        setUser(session.user)
        setLoading(false)
        fetchProfile(session.user.id)
      }
    }).catch(err => {
      if (mounted) setLoading(false)
    })


    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, teams(id, name, status)')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message)
      }
      setProfile(data || null)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Profile fetch failed:', err.message)
      }
    }
    // Removed setLoading(false) from finally because it's now handled in the listener
  }

  async function signUp({ email, password, firstName, lastName, firstNameEn, lastNameEn, role, teamId }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          first_name_en: firstNameEn || null,
          last_name_en: lastNameEn || null,
          role: role,
          team_id: teamId,
        },
      },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }



  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
