import test from 'node:test'
import assert from 'node:assert/strict'
import { reply, newState } from '../src/services/localConversation.js'
// Conversas completas por cenário (npm test). Cada teste roda a conversa várias vezes porque as respostas variam.
const chat = (msgs, ctx = {}) => { let s = newState(); return msgs.map(m => { const r = reply(s, m, ctx); s = r.state; return r }) }
const txt = (m, c) => chat(m, c).map(r => r.text)
const rep = (n, f) => { for (let i = 0; i < n; i++) f() }
const LECTURE = /(lado positivo|tudo acontece por uma raz|pense positivo|te deixar mais forte|aprender com (os )?erros|nao desista|acredite em voce)/i
const first = t => t.split(/\s+/)[0].toLowerCase().replace(/[^\p{L}]/gu, '')
test('1. faculdade: problemas → grupo → ninguém fez a parte → "resolver tudo"', () => rep(25, () => {
  const r = txt(['Estou tendo problemas na faculdade', 'É por causa do meu grupo', 'Ninguém fez a parte que combinou', 'Sim, e agora estou tendo que resolver tudo'])
  assert.match(r[0], /faculdade/i); assert.match(r[1], /grupo/i); assert.match(r[2], /responsabilidade|carregar|sozinho/i); assert.match(r[3], /padr|frequ|desgast|fal|pontual|vez/i); assert.ok(r.every(x => !/n[ãa]o tenho certeza|Fiquei na d[úu]vida/.test(x)))
}))
test('2. trabalho em grupo direto: reconhece, pergunta recorrência e se já conversou', () => rep(25, () => {
  const [a, b, c] = txt(['Meu grupo não fez a parte deles', 'Já aconteceu outras vezes', 'Ainda não falei com eles'])
  assert.match(a, /grupo|responsabilidade/i); assert.match(a, /outras vezes|pontual/i); assert.match(b, /padr|frequ|desgast/i); assert.match(b, /falar|conversar/i); assert.match(c, /(grupo|mensagem|fal|pressa|passo|noção)/i)
}))
test('3. conquista (estágio): reconhece e demonstra interesse, sem conselho nem palestra', () => rep(25, () => {
  const r = txt(['Consegui um estágio!', 'Foi numa empresa de tecnologia', 'Começo semana que vem'])
  assert.match(r[0], /conquista|parab[ée]ns|passo concreto/i); assert.match(r[0], /\?/); assert.ok(r.every(x => !LECTURE.test(x))); assert.ok(r.every(x => !/n[ãa]o se esque[çc]a|voc[êe] deve/i.test(x)))
}))
test('4. frustração após prova: reconhece sem palestra motivacional', () => rep(25, () => {
  const r = txt(['Fui mal na prova', 'Estudei bastante e mesmo assim errei muito', 'Foi só uma prova'])
  assert.match(r[0], /nota|esperava|frustra/i); assert.ok(r.every(x => !LECTURE.test(x))); assert.doesNotMatch(r[0], /passo pequeno|olhar a prova corrigida/i)
}))
test('5. problema com amigo: entende o conflito antes de sugerir; "não sei explicar" é acolhido', () => rep(25, () => {
  const r = txt(['Briguei com minha melhor amiga', 'Ela me ignorou na festa', 'Não sei explicar'])
  assert.match(r[0], /amig|pessoa importa|aconteceu entre/i); assert.doesNotMatch(r[0], /mensagem simples|uma possibilidade/i); assert.match(r[2], /sem problema|por partes|tudo bem|pedaço/i)
}))
test('6. cansaço: reconhece o cansaço e investiga antes de propor pausa', () => rep(25, () => {
  const r = txt(['Estou muito cansado ultimamente', 'Mais da cabeça, é muita coisa ao mesmo tempo'])
  assert.match(r[0], /cansa[çc]o|pesa em tudo|corpo|cabe[çc]a/i); assert.doesNotMatch(r[0], /que tal|15 minutos/i); assert.match(r[1], /\?|energia|respiro/i)
}))
test('7. mensagens curtas e ambíguas não reiniciam a conversa', () => rep(25, () => {
  const a = txt(['Fui mal na prova', 'sim']); assert.match(a[1], /\?|prova|padr|pontual|vez/i); assert.doesNotMatch(a[1], /^Oi|Olá/)
  assert.match(txt(['Fui mal na prova', 'deixa pra lá'])[1], /tudo bem|sem problema|de lado/i); assert.match(txt(['Fui mal na prova', 'Na verdade, é outra coisa'])[1], /outra coisa/i)
  assert.match(txt(['Fui mal na prova', 'mais ou menos'])[1], /menos|mais ou menos/i); assert.match(txt(['Fui mal na prova', 'foi isso'])[1], /Di[áa]rio|por ora|mais alguma/i)
  const t = txt(['Meu dia foi ruim', 'talvez', 'aconteceu de novo']); assert.ok(t.every(x => x.length > 5 && !/^(Oi|Olá)/.test(x)))
}))
test('8. mudança de assunto no meio da conversa é acompanhada', () => rep(25, () => {
  const r = chat(['Fui mal na prova', 'Foi só uma prova', 'Mudando de assunto, briguei com minha melhor amiga']); assert.match(r[2].text, /amig|pessoa importa|aconteceu entre/i); assert.doesNotMatch(r[2].text, /nota|prova/i)
}))
test('9. retomada de assunto anterior', () => rep(25, () => {
  const r = txt(['Fui mal na prova', 'Foi uma prova só', 'Briguei com minha melhor amiga', 'Voltando à prova, ainda estou chateado']); assert.match(r[3], /Voltando para a prova/i); assert.doesNotMatch(r[3], /amig/i)
}))
test('10. conversa sem conteúdo emocional não é forçada', () => rep(25, () => {
  const r = txt(['Meu dia foi normal', 'Fui ao mercado e comprei pão']); assert.doesNotMatch(r.join(' '), /sente|sentiu|emo[çc]|dif[íi]cil|reflex/i); assert.ok(r[0].length < 110)
}))
test('11. acidente/risco: prioriza segurança, não pergunta "quer me contar mais"', () => rep(25, () => {
  const r = chat(['Eu fui atropelado hoje', 'Estava atravessando a rua e eu não vi o carro', 'Estou com dor na perna', 'Estou sozinho'])
  assert.match(r[0].text, /SAMU|192|pronto-socorro|seguran[çc]a/i); assert.doesNotMatch(r[0].text, /mais sobre isso|me conta mais/i); assert.equal(r[0].mood, 'reflexivo'); assert.match(r[2].text, /192|pronto-socorro|atendimento/i); assert.match(r[3].text, /192|por perto|vizinho/i)
  const ok = txt(['Eu bati o carro hoje', 'Estou bem, só o susto', 'Foi rápido']); assert.match(ok[1], /bom|ainda bem|certo/i); assert.match(ok[2], /\?/)
  assert.match(txt(['Quase fui atropelado hoje'])[0], /susto|assusta|tudo bem com voc/i); assert.doesNotMatch(txt(['Vi um acidente na rua ontem'])[0], /atendimento de emerg/i)
}))
test('12. as três personalidades entendem o mesmo contexto e respondem diferente', () => rep(25, () => {
  const M = ['Estou tendo problemas na faculdade', 'Foi com meu grupo', 'Ninguém fez a parte que combinou', 'Sim, sempre', 'Ainda não falei com eles']
  const [a, m, d] = ['acolhedor', 'motivador', 'desafiador'].map(p => txt(M, { personality: p })[4]); assert.match(m, /passo pequeno/i); assert.match(d, /noção|\?/); assert.doesNotMatch(a, /passo pequeno/i); assert.doesNotMatch(d, /passo pequeno/i)
  assert.ok(new Set([a, m, d]).size === 3)
}))
test('13. prevenção de respostas repetitivas em conversas por cenário', () => {
  for (const p of ['acolhedor', 'motivador', 'desafiador']) rep(20, () => {
    const rs = chat(['Estou tendo problemas na faculdade', 'Foi com meu grupo', 'Ninguém fez a parte que combinou', 'Sim, sempre', 'Ainda não falei com eles', 'Acho que vou mandar uma mensagem'], { personality: p }); const t = rs.map(r => r.text)
    assert.equal(new Set(t).size, t.length); rs.forEach((r, k) => { assert.deepEqual(r.checks, []); if (k) assert.notEqual(first(r.text), first(t[k - 1]), t.join(' | ')) })
    const qs = t.flatMap(x => x.match(/[^.?!]+\?/g) || []).map(x => x.trim()); assert.equal(new Set(qs).size, qs.length, t.join(' | '))
  })
})
test('14. conversa longa com continuidade (8 mensagens) e encerramento que conecta com pessoas', () => rep(25, () => {
  const rs = chat(['Estou tendo problemas na faculdade', 'É por causa do meu grupo', 'Ninguém fez a parte que combinou', 'Sim, e agora estou tendo que resolver tudo', 'Já aconteceu outras vezes com esse grupo', 'Ainda não falei com eles', 'Acho que vou mandar uma mensagem', 'Obrigado']); const t = rs.map(r => r.text)
  assert.ok(t.slice(0, 7).filter(x => /faculdade|grupo|trabalho|responsabilidade/i.test(x)).length >= 3); assert.ok(rs.every(r => r.kind !== 'clarify')); assert.match(t[6], /caminho|primeiro passo|conversar|conta como foi/i); assert.doesNotMatch(t[4], /Bom que você tentou/); assert.match(t.slice(3, 7).join(' '), /algu[ée]m|pr[óo]ximo|Di[áa]rio|pessoa|grupo/i); assert.ok(t[7].length < 60 && !t[7].includes('?'))
}))
