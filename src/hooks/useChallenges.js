
import { useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { BASE_CHALLENGES } from '../data/challenges'
import {
  listRemoteChallenges,
  createRemoteChallenge,
  updateRemoteChallenge,
  deleteRemoteChallenge
} from '../services/api'
import { todayKey } from '../utils/format'

// Lógica de desafios, moedas e sincronização com a API de demonstração.
export default function useChallenges() {
  const [store, setStore] = useLocalStorage('bimo:challenges', {
    done: [],
    coins: 20,
    custom: [],
    spent: []
  })

  const [api, setApi] = useState({
    loading: true,
    error: null,
    count: 0
  })

  const [busy, setBusy] = useState(false)

  // READ: verifica a API ao carregar.
  useEffect(() => {
    let alive = true

    listRemoteChallenges(3)
      .then(result => {
        if (alive) {
          setApi({
            loading: false,
            error: null,
            count: result.length
          })
        }
      })
      .catch(error => {
        if (alive) {
          setApi({
            loading: false,
            error: error.message,
            count: 0
          })
        }
      })

    return () => {
      alive = false
    }
  }, [])

  const all = [...BASE_CHALLENGES, ...store.custom]
  const today = todayKey()

  // Usa a data já calculada, sem chamar Date.now() durante a renderização.
  const dayNumber = Math.floor(
    Date.parse(`${today}T00:00:00Z`) / 86400000
  )

  const daily = all[dayNumber % all.length]

  const isDone = id =>
    store.done.some(item => item.id === id && item.date === today)

  const days = new Set(store.done.map(item => item.date))

  const dayBefore = key => {
    const date = new Date(`${key}T12:00:00`)
    date.setDate(date.getDate() - 1)
    return date.toISOString().slice(0, 10)
  }

  let streak = 0
  let currentDay = days.has(today) ? today : dayBefore(today)

  while (days.has(currentDay)) {
    streak++
    currentDay = dayBefore(currentDay)
  }

  // Meta informativa: três desafios por dia.
  const progress = Math.min(
    100,
    Math.round(
      (store.done.filter(item => item.date === today).length / 3) * 100
    )
  )

  // UPDATE: concluir desafio.
  const complete = async challenge => {
    if (isDone(challenge.id)) {
      return {
        ok: false,
        msg: 'Desafio já concluído hoje.'
      }
    }

    setStore(currentStore => ({
      ...currentStore,
      coins: currentStore.coins + challenge.coins,
      done: [
        {
          id: challenge.id,
          title: challenge.title,
          coins: challenge.coins,
          date: today
        },
        ...currentStore.done
      ]
    }))

    setBusy(true)

    try {
      await updateRemoteChallenge(challenge.remoteId, {
        completed: true
      })

      return {
        ok: true,
        msg: `+${challenge.coins} moedas! Sincronizado com a API de demonstração.`
      }
    } catch (error) {
      return {
        ok: true,
        msg: `+${challenge.coins} moedas! Salvo localmente (${error.message})`
      }
    } finally {
      setBusy(false)
    }
  }

  // CREATE: criar desafio personalizado.
  const addCustom = async title => {
    const challenge = {
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: 'Desafio criado por você.',
      category: 'Meus desafios',
      steps: [],
      desc: title.trim(),
      coins: 10,
      custom: true,
      remoteId: null
    }

    setBusy(true)

    try {
      const result = await createRemoteChallenge(challenge.title)
      challenge.remoteId = result.id
    } catch {
      // Continua funcionando localmente se a API falhar.
    }

    setStore(currentStore => ({
      ...currentStore,
      custom: [...currentStore.custom, challenge]
    }))

    setBusy(false)

    return challenge
  }

  // DELETE: remover desafio personalizado.
  const removeCustom = async challenge => {
    setBusy(true)

    try {
      if (challenge.remoteId) {
        await deleteRemoteChallenge(challenge.remoteId)
      }
    } catch {
      // A remoção local prevalece.
    }

    setStore(currentStore => ({
      ...currentStore,
      custom: currentStore.custom.filter(
        item => item.id !== challenge.id
      )
    }))

    setBusy(false)
  }

  // Gastar moedas.
  const spend = item => {
    if (store.coins < item.cost) return false

    setStore(currentStore => ({
      ...currentStore,
      coins: currentStore.coins - item.cost,
      spent: [
        {
          id: item.id,
          name: item.name,
          cost: item.cost,
          date: today
        },
        ...currentStore.spent
      ]
    }))

    return true
  }

  // Reiniciar os dados dos desafios.
  const reset = () => {
    setStore({
      done: [],
      coins: 20,
      custom: [],
      spent: []
    })
  }

  return {
    ...store,
    streak,
    all,
    daily,
    isDone,
    progress,
    complete,
    addCustom,
    removeCustom,
    spend,
    reset,
    api,
    busy
  }
}
