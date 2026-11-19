import test from 'node:test'
import assert from 'node:assert/strict'
import { reply, newState, analyze, clean } from '../src/services/localConversation.js'
// Rodar com: npm test. Conversas completas (várias mensagens) + estatísticas de variação sobre muitas execuções.
const chat = (msgs, ctx = {}) => { let s = newState(); return msgs.map(m => { const r = reply(s, m, ctx); s = r.state; return r }) }
const txt = (msgs, ctx) => chat(msgs, ctx).map(r => r.text)
const GENERIC = /(hum, interessante|contexto suficiente|outro ângulo|lado positivo|tudo acontece por uma raz|pense positivo|pensar positivo)/i
const BANSTART = /^(entend|compreend|poxa|puxa|hum|hm)/i
const first = t => t.split(/\s+/)[0].toLowerCase().replace(/[^\p{L}]/gu, '')
const CONVS = [['Oii', 'Tudo bem?', 'Meu dia foi ruim', 'Estou tendo problemas na faculdade', 'Foi com meu grupo', 'Eles não respondem minhas mensagens', 'Obrigado'], ['Estou feliz hoje', 'Consegui uma coisa que queria', 'Foi passar na prova', 'kkk', 'Obrigado', 'Tchau'], ['Não sei o que fazer', 'Estou entre sair do emprego ou ficar', 'Tenho medo de me arrepender', 'Meu chefe é difícil', 'Ele grita comigo'], ['Tenho dificuldade de fazer amigos', 'na faculdade principalmente', 'tenho vergonha de puxar assunto', 'sim', 'mais ou menos'], ['oi', 'mal', 'briguei com meu namorado', 'ele não me escuta', 'não sei', 'nada'], ['O que você acha de eu mudar de curso?', 'é que não gosto das aulas', 'mas meus pais pagam', 'Você tem sentimentos?', 'Obrigado']]
const PS = ['acolhedor', 'motivador', 'desafiador']
const stats = (ps, reps = 25) => { let n = 0, q = 0, ban = 0, dupFirst = 0; for (const p of ps) for (let i = 0; i < reps; i++) for (const c of CONVS) { let prev = null; for (const r of chat(c, { personality: p })) { n++; if (/\?\s*$/.test(r.text)) q++; if (BANSTART.test(r.text)) ban++; if (prev && first(r.text) === prev) dupFirst++; prev = first(r.text) } } return { n, q: q / n, ban: ban / n, dupFirst: dupFirst / n } }

test('reconhecimento de intenções (variações, abreviações, erros)', () => {
  const T = [['oi', 'saudacao'], ['oie', 'saudacao'], ['oii', 'saudacao'], ['eai', 'saudacao'], ['e aí', 'saudacao'], ['bom dia', 'saudacao'], ['tudo bem?', 'checkin'], ['tchau, até mais', 'despedida'], ['obrigado', 'agradecimento'], ['vlw', 'agradecimento'],
    ['meu dia foi ruim', 'dia_ruim'], ['hoje não foi legal', 'dia_ruim'], ['não estou muito bem', 'dia_ruim'], ['tô feliz', 'felicidade'], ['aconteceu uma coisa boa', 'dia_bom'], ['consegui terminar meu projeto', 'conquista'], ['passei na prova!', 'conquista'],
    ['estou ansioso', 'ansiedade'], ['tô mt tristi hj', 'tristeza'], ['estou preocupado com a prova', 'preocupacao'], ['estou frustrado', 'frustracao'], ['me sinto sozinho', 'solidao'], ['tenho dificuldade de socializar', 'socializacao'], ['tive problemas na faculdade', 'problema'],
    ['não sei o que fazer', 'nao_sei'], ['o que você acha disso?', 'opiniao'], ['me dá um conselho', 'conselho'], ['estou entre sair ou ficar', 'decisao'], ['acho que vou mandar uma mensagem', 'plano_acao'], ['pode sugerir um desafio', 'sugestao'], ['quero uma dica de como me aproximar de alguém', 'sugestao'],
    ['você é psicólogo?', 'sobre_bimo'], ['você tem sentimentos?', 'sobre_bot'], ['kkkk', 'riso'], ['haha', 'riso'], ['e você?', 'devolve'], ['você é muito legal', 'elogio'], ['estou com sono', 'casual'], ['meu chefe me ignorou e eu fiquei sem graça', 'desabafo']]
  for (const [m, i] of T) assert.equal(analyze(m).intent, i, `"${m}" deveria ser ${i}, foi ${analyze(m).intent}`)
  assert.equal(analyze('facudade esta dificil').topic, 'faculdade'); assert.equal(clean('Vc tá bem?'), 'voce esta bem ?')
})
test('saudação breve e natural; "tudo bem?" responde e devolve', () => {
  for (let i = 0; i < 20; i++) { const [a, b] = chat(['Oii']).concat(chat(['Tudo bem?'])); assert.ok(a.text.length < 80); assert.match(a.text, /oi|olá/i); assert.equal(b.intent, 'checkin'); assert.match(b.text, /e (com )?você/i) }
})
test('dia ruim acolhe e abre espaço; conquista é reconhecida; obrigado é breve', () => {
  for (let i = 0; i < 25; i++) { const r = chat(['Meu dia foi ruim'])[0]; assert.match(r.text, /sinto muito|fácil|difícil|cansa|aqui|obrigado|vamos|chato|acontece|rolou|houve|desabafar|pesado|ouvindo|comigo|entendendo|nessa|mais te pegou|acúmulo/i); assert.doesNotMatch(r.text, /que bom|parabéns/i)
    assert.match(chat(['Consegui uma coisa que queria'])[0].text, /(bom|boa|legal|parab|conquista|notícia|ouvir|gostei|saber|mandou bem|comemor|batalh|ponto de virada|aprendeu|fez|mão|ajudou)/i)
    const t = chat(['Meu dia foi ruim', 'Obrigado'])[1].text; assert.ok(t.length < 60 && !t.includes('?'), t) }
})
test('"não sei o que fazer" ajuda a organizar sem dar conselho; com opções, cita as opções', () => {
  for (let i = 0; i < 20; i++) { const [a, b] = chat(['Não sei o que fazer', 'Estou entre sair do emprego ou ficar']); assert.equal(a.kind, 'organize'); assert.doesNotMatch(a.text, /que tal|você deveria|faça/i); assert.match(b.text, /sair do emprego ou ficar/) }
})
test('continuidade: faculdade → grupo mantém o assunto e não é genérico', () => {
  for (let i = 0; i < 25; i++) { const r = txt(['Estou tendo problemas na faculdade', 'Foi com meu grupo']); assert.match(r[0], /faculdade|matérias|alguém/i); assert.match(r[1], /grupo/i); assert.match(r[1], /faculdade/i); assert.doesNotMatch(r[1], GENERIC) }
})
test('não pergunta de novo o que já foi respondido', () => {
  for (let i = 0; i < 20; i++) { const r = txt(['Tive problemas na faculdade', 'Foi com meu grupo', 'Eles não respondem minhas mensagens', 'Fiquei fazendo tudo sozinho']); const qs = r.flatMap(x => x.match(/[^.?!]+\?/g) || []).map(x => x.trim()); assert.equal(new Set(qs).size, qs.length); assert.doesNotMatch(r[1], /matérias/i) }
})
test('respostas curtas dependem da pergunta anterior', () => {
  assert.match(txt(['oi', 'bem e vc?'])[1], /por aqui|que bom|boa/i); assert.match(txt(['oi', 'mal'])[1], /sinto muito|fácil|difícil|aqui|obrigado|rolou|aconteceu|vamos|chato|cansa|houve|desabafar|pesado|ouvindo|comigo|entendendo|nessa|mais te pegou|acúmulo|incomodou|ponto/i)
  assert.match(txt(['oi', 'mais ou menos'])[1], /mais ou menos|nem bom|ok, então/i); const r = txt(['Estou meio desanimado', 'faz tempo']); assert.match(r[1], /tempo|acompanha/i)
  assert.match(txt(['Tenho dificuldade de fazer amigos', 'na faculdade principalmente'])[1], /na faculdade/i)
})
test('mudança de assunto é acompanhada', () => {
  const r = chat(['Meu dia foi ruim', 'Tive problemas no trabalho', 'Aliás, consegui terminar meu curso hoje!']); assert.equal(r[2].intent, 'conquista'); assert.doesNotMatch(r[2].text, /chefia|tarefa/i)
  const m = chat(['Estou feliz hoje', 'Meu dia não está bom'])[1]; assert.equal(m.intent, 'dia_ruim'); assert.doesNotMatch(m.text, /que bom|boa/i)
  assert.match(chat(['Meu dia foi ruim', 'Você tem sentimentos?'])[1].text, /robô/i)
})
test('espelha o que a pessoa disse (sem inventar)', () => { let hit = 0; for (let i = 0; i < 40; i++) if (/suas coisas/i.test(txt(['Meu dia foi ruim', 'Tive problemas no condomínio', 'Minha vizinha deixa minhas coisas na porta'])[2])) hit++; assert.ok(hit >= 5, `hit=${hit}`) })
test('conversas longas (5+ mensagens): sem frases genéricas, sem repetir pergunta nem abertura', () => {
  for (const p of PS) for (let i = 0; i < 15; i++) for (const c of CONVS) { const rs = chat(c, { personality: p }); const all = rs.map(r => r.text); const qs = all.flatMap(x => x.match(/[^.?!]+\?/g) || []).map(x => x.trim())
    assert.equal(new Set(qs).size, qs.length, all.join(' | ')); rs.forEach((r, k) => { assert.doesNotMatch(r.text, GENERIC); assert.deepEqual(r.checks, []); if (k) assert.notEqual(first(r.text), first(all[k - 1]), all.join(' | ')) }) }
})
test('variação: a mesma mensagem não recebe sempre a mesma resposta', () => {
  assert.ok(new Set(Array.from({ length: 60 }, () => txt(['Meu dia foi ruim'])[0])).size >= 6); assert.ok(new Set(Array.from({ length: 60 }, () => txt(['Consegui passar na prova'])[0])).size >= 5)
})
test('naturalidade medida: poucas aberturas repetitivas e nem tudo termina em pergunta', () => {
  const s = stats(PS); assert.ok(s.ban <= .1, `abertura Entendo/Poxa/Hum: ${s.ban}`); assert.ok(s.q <= .75, `terminam em pergunta: ${s.q}`); assert.ok(s.q >= .3, `perguntas demais raras: ${s.q}`); assert.equal(s.dupFirst, 0)
})
test('personalidades mudam as respostas e o ritmo', () => {
  const sets = PS.map(p => new Set(Array.from({ length: 40 }, () => txt(['Meu dia foi ruim'], { personality: p })[0]))); for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) assert.equal([...sets[a]].filter(x => sets[b].has(x)).length, 0)
  const qr = p => stats([p], 30).q; const [a, m, d] = PS.map(qr); assert.ok(d > a + .03, `desafiador ${d} vs acolhedor ${a}`); assert.ok(m >= a - .02)
  assert.match(txt(['Consegui passar na prova'], { personality: 'desafiador' })[0], /\?/); assert.match(txt(['Consegui passar na prova'], { personality: 'motivador' }).join(' '), /./)
})
test('segurança, limites, memória e diário', () => {
  assert.match(reply(newState(), 'às vezes eu quero morrer').text, /188/); assert.match(txt(['você é meu único amigo'])[0], /não quero ser o único/i); assert.match(txt(['tenho 14 anos e estou triste'])[0], /adulto de confiança/i)
  assert.match(txt(['Você é psicólogo?'])[0], /não sou psicólogo/i)
  const m = txt(['Oi', 'Me sinto sozinho na faculdade', 'Foi uma situação'], { memory: ['Quero me aproximar dos colegas'] }).filter(x => x.includes('Quero me aproximar dos colegas')); assert.ok(m.length <= 1)
  const e = reply(newState(), 'x', { entry: { title: 'Prova difícil', text: 'Fui mal na prova hoje e fiquei chateado.' }, personality: 'desafiador' }); assert.match(e.text, /Prova difícil/); assert.match(e.text, /\?/)
  assert.match(txt(['Me sinto sozinho', 'Faz tempo', 'Pode sugerir um desafio?'], { challenges: ['Mandar uma mensagem de saudade'] })[2], /Mandar uma mensagem de saudade/); assert.match(txt(['Pode sugerir algo?'])[0], /me conta/i)
})

test('encadeamento: faculdade → grupo → ninguém fez a parte → recorrência → já falou?', () => {
  for (let i = 0; i < 20; i++) {
    const r = txt(['Estou tendo problemas na faculdade', 'Foi com meu grupo', 'Ninguém fez a parte que combinou', 'Já aconteceu outras vezes', 'Ainda não falei com eles', 'sim'])
    assert.match(r[2], /responsabilidade|sobrou pra você|carregar tudo/i); assert.match(r[2], /grupo/i); assert.match(r[2], /outras vezes|recorrente|pontual|só dessa vez/i)
    assert.match(r[3], /padrão|frequência|desgaste|falar|falou/i); assert.match(r[4], /(mensagem|grupo|falar|sem pressa|passo|noção)/i); assert.match(r[5], /(alguém|Diário|próximo)/i)
  }
})
test('"só quero desabafar" é respeitado: não oferece conselhos sem confirmar', () => {
  for (let i = 0; i < 15; i++) { const r = chat(['Só quero desabafar, sem conselhos', 'Pode sugerir um desafio?', 'sim'], {}); assert.equal(r[0].kind, 'listen_only_ack'); assert.equal(r[1].kind, 'suggest_confirm'); assert.match(r[2].text, /opcional/i) }
  const pref = chat(['Pode sugerir um desafio?'], { listenOnly: true })[0]; assert.equal(pref.kind, 'suggest_confirm')
  const f = chat(['Estou exausto e sem energia', 'Foi o trabalho', 'Meu chefe cobra demais', 'Ninguém ajuda', 'Estou cansado disso'], { listenOnly: true, personality: 'motivador' }); assert.ok(f.every(r => !/passo (bem )?pequeno/i.test(r.text)))
})
test('preferência de respostas curtas e relatos longos mais desenvolvidos', () => {
  const avg = (ctx, msgs) => { let n = 0, c = 0; for (let i = 0; i < 80; i++) for (const r of chat(msgs, ctx)) { n++; c += r.text.length } return c / n }
  const M = ['Meu dia foi ruim', 'Tive problemas na faculdade', 'Foi com meu grupo', 'Ninguém fez a parte que combinou', 'Sim, sempre', 'Ainda não falei com eles']; assert.ok(avg({ brief: true }, M) < avg({}, M) * .92, 'brief deveria ser mais curto')
  const long = chat(['Estou exausto e sobrecarregado com tudo, o chefe cobra demais e ninguém ajuda, e ainda tenho um prazo apertado pra amanhã'])[0]; assert.equal(long.kind, 'long_story'); assert.match(long.text, /sobrecarga|cobrança|prazo/i)
})
test('sentimentos em outras palavras e conversa sem querer conselho', () => {
  for (const [m, i] of [['estou exausto e sem energia', 'desabafo'], ['me sinto realizado hoje', 'noticia_boa'], ['estou arrasado', 'desabafo'], ['finalmente me sinto leve', 'noticia_boa']]) assert.equal(analyze(m).intent, i, m)
})
