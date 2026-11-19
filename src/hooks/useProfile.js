import useLocalStorage from './useLocalStorage'
// Perfil do usuário (persistido no localStorage). Separado da página "Personalizar" (acessórios do mascote).
const INITIAL_PROFILE = { name: '', personality: 'acolhedor', goals: [], owned: [], equipped: [], onboarded: false, prefs: { reminders: true, confirmDelete: true, externalAi: false, saveHistory: false, replyLength: 'normal', listenOnly: false } }
export default function useProfile() {
  const [raw, setProfile] = useLocalStorage('bimo:profile', INITIAL_PROFILE)
  const profile = { ...INITIAL_PROFILE, ...raw, prefs: { ...INITIAL_PROFILE.prefs, ...raw.prefs } }
  // perfis antigos que já tinham nome contam como configurados; "refazer" grava onboarded:false de forma explícita
  const needsOnboarding = raw.onboarded === false || (raw.onboarded === undefined && !raw.name)
  const complete = d => setProfile(p => ({ ...p, name: d.name, personality: d.personality, goals: d.goals, prefs: { ...INITIAL_PROFILE.prefs, ...p.prefs, ...d.prefs }, onboarded: true }))
  return { profile, setProfile, needsOnboarding, complete }
}
