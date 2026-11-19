import { useEffect, useState } from 'react'
import { getAiStatus } from '../../services/ai'
import BimoCharacter from '../BimoCharacter'
import ProgressBar from '../ProgressBar'
import { STEPS, MOOD, StepWelcome, StepName, StepPersonality, StepPrefs, StepDone } from './OnboardingSteps'
// Configuração inicial do perfil, em etapas. Não obriga a informar nada pessoal.
export default function Onboarding({ initial, onFinish }) {
  const [step, setStep] = useState(0), [error, setError] = useState(''), [ai, setAi] = useState('checking')
  useEffect(() => { let alive = true; getAiStatus().then(s => alive && setAi(s.state)); return () => { alive = false } }, []) // só para avisar, na etapa final, se a IA está ativa
  const [d, setD] = useState({ name: initial.name || '', personality: initial.personality || 'acolhedor', goals: initial.goals || [], replyLength: initial.prefs.replyLength, listenOnly: initial.prefs.listenOnly })
  const set = patch => { setD(x => ({ ...x, ...patch })); setError('') }
  const last = STEPS.length - 1, id = STEPS[step]
  const next = () => {
    if (id === 'name' && d.name.trim() && d.name.trim().length < 2) return setError('Use pelo menos 2 letras, ou toque em "Pular".')
    if (step === last) return onFinish({ name: d.name.trim(), personality: d.personality, goals: d.goals, prefs: { replyLength: d.replyLength, listenOnly: d.listenOnly } })
    setStep(s => s + 1)
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-bruma via-bruma to-salvia/20">
      <section aria-label="Configuração inicial" className="card pop w-full max-w-3xl bg-white/80 p-6 sm:p-10">
        <div className="mb-6"><ProgressBar value={Math.round((step / last) * 100)} label={`Etapa ${step + 1} de ${STEPS.length}`} /></div>
        <div className="grid gap-6 md:grid-cols-[200px_1fr] items-center">
          <div className="flex justify-center"><BimoCharacter mood={MOOD[id]} size="w-36 md:w-48" float /></div>
          <div key={id} className="pop min-h-[18rem]" aria-live="polite">
            {id === 'welcome' && <StepWelcome />}{id === 'name' && <StepName d={d} set={set} error={error} onEnter={next} />}{id === 'personality' && <StepPersonality d={d} set={set} />}{id === 'prefs' && <StepPrefs d={d} set={set} />}{id === 'done' && <StepDone d={d} ai={ai} />}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-areia">
          <button className="btn-soft" onClick={() => { setError(''); setStep(s => s - 1) }} disabled={step === 0}>Voltar</button>
          <div className="flex gap-2">{id === 'name' && !d.name.trim() && <button className="btn-soft" onClick={() => { set({ name: '' }); setStep(s => s + 1) }}>Pular</button>}
            <button className="btn-primary" onClick={next}>{step === 0 ? 'Começar' : step === last ? 'Começar a usar o Bimo' : 'Continuar'}</button></div>
        </div>
      </section>
    </div>
  )
}
