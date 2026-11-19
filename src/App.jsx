import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Onboarding from './components/onboarding/Onboarding'
import useProfile from './hooks/useProfile'
import useMemory from './hooks/useMemory'
import useDiary from './hooks/useDiary'
import useChallenges from './hooks/useChallenges'
import Dashboard from './pages/Dashboard'
import Conversation from './pages/Conversation'
import Diary from './pages/Diary'
import Challenges from './pages/Challenges'
import Personality from './pages/Personality'
import Personalization from './pages/Personalization'
import Memory from './pages/Memory'
import Settings from './pages/Settings'
const PAGES = { dashboard: Dashboard, chat: Conversation, diary: Diary, challenges: Challenges, personality: Personality, customize: Personalization, memory: Memory, settings: Settings }
export default function App() {
  const [page, setPage] = useState('dashboard'), [toast, setToast] = useState(null)
  const { profile, setProfile, needsOnboarding, complete } = useProfile()
  const memory = useMemory(), diary = useDiary(), ch = useChallenges()
  const notify = useCallback((msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200) }, [])
  if (needsOnboarding) return <Onboarding initial={profile} onFinish={d => { complete(d); setPage('dashboard') }} />
  const Page = PAGES[page]
  return (
    <div className="min-h-screen">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-floresta focus:text-bruma focus:rounded-full focus:px-4 focus:py-2">Pular para o conteúdo</a>
      <Sidebar page={page} onNavigate={setPage} /><Toast toast={toast} />
      <main id="conteudo" className="md:ml-60 px-4 py-6 sm:px-6 md:px-8 xl:px-12 pb-28 md:pb-8">
        <div key={page} className="pop mx-auto w-full max-w-[1320px]"><Page profile={profile} setProfile={setProfile} diary={diary} ch={ch} memory={memory} notify={notify} go={setPage} /></div>
      </main>
    </div>
  )
}
