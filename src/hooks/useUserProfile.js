import { useState, useCallback } from 'react'

const STORAGE_KEY = 'pour_decisions_profile'

const DEFAULT_PROFILE = {
  tried: [],
  want_to_try: [],
  preferences: {
    sweetness: null,
    spice: null,
    price_max: null,
    proof_preference: null,
  },
  session_history: [],
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PROFILE
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // localStorage unavailable (private browsing quota, etc.)
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState(loadProfile)

  const updateProfile = useCallback((updater) => {
    setProfile((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveProfile(next)
      return next
    })
  }, [])

  const markTried = useCallback((bourbonId, rating, notes = '') => {
    updateProfile((prev) => {
      const existing = prev.tried.findIndex((t) => t.id === bourbonId)
      const entry = { id: bourbonId, rating, notes, date: new Date().toISOString().slice(0, 10) }
      const tried =
        existing >= 0
          ? prev.tried.map((t, i) => (i === existing ? entry : t))
          : [...prev.tried, entry]
      // Remove from want_to_try if present
      const want_to_try = prev.want_to_try.filter((id) => id !== bourbonId)
      return { ...prev, tried, want_to_try }
    })
  }, [updateProfile])

  const addWantToTry = useCallback((bourbonId) => {
    updateProfile((prev) => {
      if (prev.want_to_try.includes(bourbonId)) return prev
      return { ...prev, want_to_try: [...prev.want_to_try, bourbonId] }
    })
  }, [updateProfile])

  const removeWantToTry = useCallback((bourbonId) => {
    updateProfile((prev) => ({
      ...prev,
      want_to_try: prev.want_to_try.filter((id) => id !== bourbonId),
    }))
  }, [updateProfile])

  const getTriedEntry = useCallback((bourbonId) => {
    return profile.tried.find((t) => t.id === bourbonId) ?? null
  }, [profile.tried])

  const isWantToTry = useCallback((bourbonId) => {
    return profile.want_to_try.includes(bourbonId)
  }, [profile.want_to_try])

  const appendSessionMessage = useCallback((message) => {
    updateProfile((prev) => ({
      ...prev,
      session_history: [...prev.session_history, message],
    }))
  }, [updateProfile])

  return {
    profile,
    updateProfile,
    markTried,
    addWantToTry,
    removeWantToTry,
    getTriedEntry,
    isWantToTry,
    appendSessionMessage,
  }
}
