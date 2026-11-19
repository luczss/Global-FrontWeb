// Composição das respostas: escolhe uma resposta COMPLETA coerente com o plano e a personalidade, preenche com o que a pessoa contou
// e controla o ritmo (nem toda resposta termina em pergunta; aberturas não se repetem).
import { PERS, SUGGEST_LEAD } from './personalities.js'
const TQ = { faculdade: ['Foi alguma dificuldade com as matérias ou com alguma situação com alguém?', 'O problema é com as matérias, com a rotina ou com alguém de lá?'], trabalho: ['Foi alguma tarefa específica ou uma situação com alguém do trabalho?', 'O que pegou mais: a carga, as pessoas ou alguma situação em particular?'], relacionamento: ['O que aconteceu entre vocês?', 'Foi uma situação específica ou algo que vem se repetindo?'], familia: ['O que aconteceu em casa?', 'Foi uma conversa difícil ou algo que vem se repetindo?'], amizades: ['O que aconteceu com seus amigos?', 'Foi uma situação específica ou um afastamento?'] }
const HELP = [[/psicolog|terapeut|medic|diagnost/, 'Eu não sou psicólogo, terapeuta nem profissional de saúde, e não faço diagnósticos. Sou um apoio para você expressar e organizar o que sente. Para algo mais profundo, vale procurar um profissional ou alguém de confiança.'], [/diario/, 'No Diário você registra acontecimentos, edita e apaga quando quiser. Tudo fica só no seu dispositivo. Você pode escolher compartilhar um registro comigo, com autorização a cada vez.'], [/memoria/, 'A memória é opcional e começa desligada. Você escreve o que eu posso lembrar, e pode ver, editar, apagar ou conversar sem ela.'], [/personalidade/, 'Tenho três jeitos de conversar: Acolhedor, Motivador e Desafiador. Você escolhe ao lado da conversa.'], [/./, 'Sou o Bimo, um robô de apoio à expressão emocional. Aqui eu converso por regras locais no seu navegador, sem modelo de IA generativa, então tenho limites. Ajudo em três etapas: expressar, refletir e conectar.']]
const SHARED = {
  bye: ['Até mais! Foi bom conversar. Volte quando quiser.', 'Cuide-se! Estou por aqui quando precisar.', 'Tchau! Se quiser continuar depois, é só chamar.'],
  thanks: ['De nada!', 'Imagina, fico feliz em ajudar.', 'Por nada! Estou por aqui se precisar.'],
  laugh: ['Haha, o que foi?', 'Pelo visto foi engraçado. Quer contar?', 'Gostei da risada. Conta aí.'],
  compliment: ['Obrigado! Fico contente em ajudar. E se tiver alguém de confiança, vale levar essas conversas pra essa pessoa também.', 'Que bom que você se sente à vontade aqui. Só lembro que sou um robô: as pessoas ao seu redor também podem te ouvir.'],
  about_bot: ['Sou o Bimo, um robô de apoio. Não sinto como uma pessoa, mas estou aqui acompanhando a conversa.', 'Meu nome é Bimo. Sou um robô, então não tenho sentimentos como os seus, mas posso ouvir e ajudar a organizar o que você quiser contar.', 'Sou um robô feito pra apoiar a expressão do que você sente. Não tenho uma vida como a sua, mas pode contar comigo pra conversar.'],
  dependency: ['Fico feliz em ser um espaço para conversar, mas não quero ser o único. Sou um robô e não substituo pessoas. Existe alguém com quem você poderia compartilhar um pouco do que falamos aqui?'],
  devolve: ['Por aqui é só conversa mesmo, sou um robô. E o seu dia, como está sendo?', 'Estou bem, do meu jeito de robô. E você?'],
  action_plan: ['Parece um bom caminho. E se não sair do jeito que você imagina, tudo bem: você pode voltar aqui pra contar como foi.', 'Dar esse primeiro passo já é bastante. Se quiser, me conta depois como foi a conversa.', 'Boa ideia. Conversar com a pessoa diretamente costuma esclarecer mais do que pensar sozinho.'],
  dia_normal: ['Dia normal também é dia. Se algo pequeno valeu a pena, pode contar; se não, tudo bem.', 'Tranquilo, então. Rotina também tem seu valor.', 'Beleza, um dia comum. Quer só conversar à toa ou tem algo na cabeça?'],
  casual: ['Dá pra só bater papo, sem pauta nenhuma. Por onde quer começar?', 'Tudo bem ficar à toa por aqui. Pode falar de qualquer coisa.', 'Dia sem muita coisa também vale. O que passou pela sua cabeça hoje?'],
  relato: ['Beleza, rotina também conta.', 'Anotado. Se algo disso te marcou, pode contar.', 'Ah, sei. Mais alguma coisa que valha comentar?', 'Certo. Rolou mais alguma coisa?'],
  checkin: ['Tudo certo por aqui! E com você?', 'Por aqui tudo bem, obrigado. E você, como está?', 'Tudo tranquilo. E você?'],
  feel_pos: ['{back}Que bom! Aconteceu algo de especial hoje ou foi só um dia tranquilo?', '{back}Boa! Quer me contar como foi o dia?', '{back}Bom saber. Tem algo que você queira comentar?'],
  feel_meh: ['{back}Dia mais ou menos, então. Tem algo em particular na sua cabeça?', '{back}Nem bom nem ruim, acontece. Quer falar de alguma coisa?', '{back}Ok, então. Se tiver algo pesando, pode soltar por aqui.'],
  listen_neg_vague: ['Aconteceu alguma coisa que te deixou assim, ou é algo que vem acompanhando você há um tempo?', 'Foi algo de hoje ou já faz um tempo que você anda assim?', 'Veio de algum acontecimento ou é mais uma sensação difusa?'],
  persist: ['Então vem de um tempo. Em que momentos isso pesa mais?', 'Faz tempo, então. Tem algo que costuma piorar ou aliviar?', 'Já acompanha você há um tempo. O que você mais sente quando isso aparece?'],
  unknown_reason: ['Tudo bem não saber o motivo. Como tem sido seu dia até agora?', 'Às vezes não tem uma causa clara. Quer me contar do seu dia?'],
  where_social: ['{Where}, então. O que costuma acontecer nesses momentos?', 'Ah, {where}. O que você pensa ou sente quando isso acontece?'],
  narrate_mirror: ['Então {mirror}. Como isso tem afetado você?', '{Mirror}. Pode continuar, estou lendo.', 'Ou seja, {mirror}. Quer me contar mais sobre isso?', '{Mirror}. Isso complica a situação.'],
  pos_follow: ['Que bom! {q}', 'Boa. {q}', 'Isso é bom de ouvir. Quer contar mais?'],
  close_pos: ['Foi bom ouvir tudo isso. Quer registrar esse momento no Diário?', 'Dá pra guardar esse momento no Diário, se quiser.'],
  organize_more: ['Isso entra na balança. O que mais pesa pra você agora?', 'É um ponto importante. Tem mais alguma coisa pesando nessa decisão?', 'E se esse medo ou limitação não existisse por um minuto, o que você escolheria?'],
  recurrent: ['Então não é um episódio isolado, é um padrão, e isso cansa mais. Você já chegou a conversar com eles sobre isso?', 'Se acontece com frequência, o desgaste acumula. Você já falou com eles sobre isso?'],
  one_off: ['Então parece ter sido pontual. Aconteceu algo diferente dessa vez?', 'Ok, um episódio isolado. O que tornou essa vez diferente?'],
  talked_yes: ['E como eles reagiram quando você falou?', 'O que eles responderam?'],
  talked_no: ['Às vezes falta o momento certo pra abrir esse assunto. Quer que a gente pense junto em como puxar essa conversa?', 'Faz sentido ainda não ter falado. Quer pensar comigo em como começar?'],
  long_generic: ['Você contou bastante coisa. Qual parte disso pesa mais agora?', 'Tem muita coisa nessa história. Por onde você quer começar a olhar?', 'Li tudo com atenção. Se quiser, escolha um pedaço pra gente aprofundar.'],
  listen_only_ack: ['Combinado: eu só escuto, sem conselhos. Pode falar.', 'Fechado. Vou ouvir e acompanhar, sem empurrar ideia nenhuma.'],
  suggest_confirm: ['Você tinha pedido pra eu só ouvir, então não vou empurrar ideias. Se quiser uma sugestão mesmo assim, é só dizer "sim".'],
  close_listen: ['Obrigado por contar. Estou por aqui se quiser continuar, ou registrar no Diário.', 'Foi bom ouvir isso tudo. Se quiser, pode guardar no Diário, ou seguir falando comigo.'],
  mem: ['Você tinha me pedido pra lembrar: “{mem}”. Isso tem a ver com o que está vivendo agora?', 'Lembrei de algo que você pediu pra eu guardar: “{mem}”. Isso se conecta com o que você contou?'],
  clarify: ['Acho que não peguei bem. Pode explicar de outro jeito?', 'Fiquei na dúvida sobre o que você quis dizer. Me conta mais?', 'Não tenho certeza se entendi. Do que você está falando?'],
  clarify_short: ['Quer me contar mais?', 'Pode continuar, estou ouvindo.', 'Pode explicar um pouco mais?'],
  suggest_ctx: ['Claro! Pra sugerir algo que faça sentido, me conta: é sobre se aproximar de alguém ou sobre organizar o que você está sentindo?'],
  closing_yes: ['Combinado! O Diário está no menu, e eu continuo por aqui se quiser falar mais.'], closing_no: ['Tudo bem. Estou por aqui quando quiser continuar.'],
  open_yes: ['Claro, pode começar por onde preferir.'], open_no: ['Sem problema. Podemos só conversar à toa, ou posso explicar como o Bimo funciona.'],
}
const LABEL = { sobrecarga: 'sobrecarga', sem_retorno: 'falta de retorno', conflito: 'conflito', prazo: 'pressão de prazo', injustica: 'sensação de injustiça', materia: 'dificuldade com a matéria', cobranca: 'cobrança' }
const FR = { // [reflexões, perguntas] por tipo de situação relatada
  sobrecarga: [['Aí a responsabilidade acaba ficando concentrada em você{grp}.', 'Então a parte de todo mundo sobrou pra você{grp}.', 'Dividir e ainda assim carregar tudo sozinho pesa{grp}.'], ['Isso já aconteceu outras vezes ou foi algo pontual?', 'Isso é recorrente ou foi só dessa vez?']],
  sem_retorno: [['Ficar sem retorno atrapalha a organização e também incomoda.', 'Sem resposta, fica difícil até saber como seguir.', 'Falar e não ter retorno deixa a gente no escuro.'], ['Foi só dessa vez ou isso já vinha acontecendo?', 'Isso é comum por lá ou foi diferente agora?']],
  conflito: [['Então houve um conflito de verdade.', 'A coisa esquentou, pelo jeito.'], ['O que foi dito ou feito que mais pesou pra você?', 'Como terminou essa conversa?']],
  prazo: [['Prazo apertado complica ainda mais.', 'Com a data chegando, tudo fica mais tenso.'], ['Falta muito pra entrega?', 'O que ainda precisa ficar pronto?']],
  injustica: [['Sentir que a conta caiu só em você é pesado.', 'Pelo que você conta, a situação foi injusta com você.'], ['O que você gostaria que fosse reconhecido ali?', 'Alguém chegou a perceber isso?']],
  materia: [['Quando a matéria não encaixa, o esforço parece não render.', 'Nota baixa tira a segurança, mesmo quando a pessoa estuda.'], ['É em alguma matéria específica?', 'O que trava mais: entender o conteúdo ou ter tempo pra estudar?']],
  cobranca: [['Ser cobrado o tempo todo cansa.', 'Pressão constante desgasta.'], ['Quem está cobrando mais?', 'Essa cobrança vem de fora ou também de você?']],
}
const BAN = /^(entend|compreend|poxa|puxa|hum|hm|obrigado|faz sentido|sinto)/i
const first = t => (t.split(/\s+/)[0] || '').replace(/[^\p{L}]/gu, '').toLowerCase()
export const okOpener = (t, s) => !s.openers.slice(-2).includes(first(t)) && !(BAN.test(t) && s.openers.slice(-4).some(o => ['entendo', 'entendi', 'compreendo', 'poxa', 'puxa', 'hum', 'obrigado', 'faz', 'sinto'].includes(o)))
const cap = x => x ? x[0].toUpperCase() + x.slice(1) : ''
const fill = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => ({ ...o, Thing: cap(o.thing), Where: cap(o.where), Feel: cap(o.feel), Mirror: cap(o.mirror) })[k] ?? '')
function pickT(pool, s, pl, p, sl) {
  let c = pool.filter(t => !s.used.includes(t)); if (!c.length) c = pool
  if (!pl.q) c = c.filter(t => !t.includes('{q}')) || c; if (!c.length) c = pool
  const good = c.filter(t => okOpener(fill(t, sl), s)); if (good.length) c = good
  if (s.brief || s.userLong) { const by = [...c].sort((a, b) => fill(a, sl).length - fill(b, sl).length), h = Math.max(1, Math.ceil(by.length / (s.brief ? 3 : 2))); c = s.brief ? by.slice(0, h) : by.slice(-h) } // respostas curtas se pedido; mais desenvolvidas para relatos longos
  if (pl.canSkip && (s.qRun >= 2 || (s.lastQ && Math.random() > PERS[p].pQuestion))) { const st = c.filter(t => !/\?\s*$/.test(fill(t, sl))); if (st.length) c = st } // nem tudo termina em pergunta
  const t = c[Math.floor(Math.random() * c.length)]; s.used = [...s.used, t].slice(-80); return fill(t, sl)
}
const FILLER = /^(Sem pressa|Se quiser|Pode continuar|Quando quiser|Pode ir|Estou (aqui|lendo|ouvindo)|Pode falar|Pode mandar|Obrigado)/
const shorten = t => { // modo "respostas mais curtas": tira convites e limita a 2 frases (mantém a reflexão e a pergunta final)
  const ss = (t.match(/[^.?!]+[.?!]+\s*/g) || [t]).map(x => x.trim()); if (ss.length <= 1) return t
  const keep = ss.filter((x, i) => i === ss.length - 1 || !FILLER.test(x)); return (keep.length > 2 ? [keep[0], keep[keep.length - 1]] : keep).join(' ')
}
export function compose(pl, s, p) {
  const k = pl.kind, sl = { ...pl, back: pl.back ? 'Por aqui está tudo certo, obrigado! ' : '', c: pl.c }
  let pool
  if (pl.pool) pool = pl.pool
  else if (k === 'about_bimo') pool = [HELP.find(([re]) => re.test(pl.t))[1]]
  else if (k === 'frame') { const [R, Q] = FR[pl.frame], grp = pl.detail === 'grupo' && pl.frame === 'sobrecarga' ? ', mesmo sendo um trabalho em grupo' : ''; pool = R.flatMap(r => [...Q.map(q => r.replace('{grp}', grp) + ' ' + q), ...(pl.pending === 'recurrence' ? [] : [r.replace('{grp}', grp) + ' Pode continuar, se quiser.'])]) }
  else if (k === 'long_story') { const [x, y] = pl.labels.map(l => LABEL[l]); pool = [`Pelo que você contou, tem ${x} e ${y} nessa história. Qual dessas partes você quer olhar primeiro?`, `Foi bastante coisa: ${x} e ${y}. Por qual delas você quer começar?`] }
  else if (k === 'close' && s.listenOnly) pool = SHARED.close_listen
  else if (k === 'topic_q') pool = TQ[pl.topic].flatMap(q => ['{Where}, então. ' + q, 'Ah, {where}. ' + q])
  else if (k === 'suggest') pool = [`${SUGGEST_LEAD[p]} “{c}”. Só se fizer sentido pra você hoje. Parece possível?`, `${SUGGEST_LEAD[p]} “{c}”. É opcional: se hoje não for o dia, tudo bem.`]
  else if (k === 'listen_neg' && pl.vague) pool = SHARED.listen_neg_vague
  else if (k === 'listen_pos' && pl.proj) pool = ['Que conquista! Você estava trabalhando nele há bastante tempo?', 'Parabéns! Esse trabalho levou bastante tempo?', ...PERS[p].listen_pos]
  else pool = PERS[p][k] || SHARED[k] || SHARED.clarify
  if (k === 'narrate_generic' && pl.mirror && Math.random() < .6) pool = SHARED.narrate_mirror
  if (k === 'clarify' && pl.short) pool = SHARED.clarify_short
  let text = pickT(pool, s, pl, p, sl)
  if (s.brief && !['about_bimo', 'dependency'].includes(k)) text = shorten(text)
  s.openers = [...s.openers, first(text)].slice(-6); s.lastQ = /\?\s*$/.test(text); s.qRun = s.lastQ ? s.qRun + 1 : 0
  return text
}
