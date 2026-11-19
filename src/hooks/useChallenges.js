import { useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { BASE_CHALLENGES } from '../data/challenges'
import { listRemoteChallenges, createRemoteChallenge, updateRemoteChallenge, deleteRemoteChallenge } from '../services/api'
import { todayKey } from '../utils/format'
// Lógica de desafios, moedas e sincronização com a API de demonstração (dados não sensíveis).
export default function useChallenges() {
  const [store, setStore] = useLocalStorage('bimo:challenges', { done: [], coins: 20, custom: [], spent: [] })
  const [api, setApi] = useState({ loading: true, error: null, count: 0 })
  const [busy, setBusy] = useState(false)

  useEffect(() => { // READ: verifica a API ao carregar
    let alive = true
    listRemoteChallenges(3).then(r => alive && setApi({ loading: false, error: null, count: r.length })).catch(e => alive && setApi({ loading: false, error: e.message, count: 0 }))
    return () => { alive = false }
  }, [])

  const all = [...BASE_CHALLENGES, ...store.custom]
  const today = todayKey()
  const daily = all[Math.floor(Date.now() / 86400000) % all.length]
  const isDone = id => store.done.some(d => d.id === id && d.date === today)
  const days = new Set(store.done.map(d => d.date)), dayBefore = k => { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) }
  let streak = 0, k = days.has(today) ? today : dayBefore(today); while (days.has(k)) { streak++; k = dayBefore(k) } // dias seguidos (só informativo)
  const progress = Math.min(100, Math.round((store.done.filter(d => d.date === today).length / 3) * 100)) // meta: 3 por dia

  const complete = async c => { // UPDATE
    if (isDone(c.id)) return { ok: false, msg: 'Desafio já concluído hoje.' }
    setStore(s => ({ ...s, coins: s.coins + c.coins, done: [{ id: c.id, title: c.title, coins: c.coins, date: today }, ...s.done] }))
    setBusy(true)
    try { await updateRemoteChallenge(c.remoteId, { completed: true }); return { ok: true, msg: `+${c.coins} moedas! Sincronizado com a API de demonstração.` } }
    catch (e) { return { ok: true, msg: `+${c.coins} moedas! Salvo localmente (${e.message})` } }
    finally { setBusy(false) }
  }
  const addCustom = async title => { // CREATE
    const c = { id: crypto.randomUUID(), title: title.trim(), goal: 'Desafio criado por você.', category: 'Meus desafios', steps: [], desc: title.trim(), coins: 10, custom: true, remoteId: null }
    setBusy(true)
    try { const r = await createRemoteChallenge(c.title); c.remoteId = r.id } catch { /* segue local */ }
    setStore(s => ({ ...s, custom: [...s.custom, c] })); setBusy(false); return c
  }
  const removeCustom = async c => { // DELETE
    setBusy(true)
    try { if (c.remoteId) await deleteRemoteChallenge(c.remoteId) } catch { /* ignora: remoção local prevalece */ }
    setStore(s => ({ ...s, custom: s.custom.filter(x => x.id !== c.id) })); setBusy(false)
  }
  const spend = (item) => { if (store.coins < item.cost) return false; setStore(s => ({ ...s, coins: s.coins - item.cost, spent: [{ id: item.id, name: item.name, cost: item.cost, date: today }, ...s.spent] })); return true }
  const reset = () => setStore({ done: [], coins: 20, custom: [], spent: [] })
  return { ...store, streak, all, daily, isDone, progress, complete, addCustom, removeCustom, spend, reset, api, busy }
}
