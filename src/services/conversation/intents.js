// Identificação de intenção, assunto e detalhe. Combina regras, léxico de valência (positivo/negativo, com negação) e o contexto da conversa.
import { clean } from './normalize.js'
export const RISK = /(me matar|suicid|quero morrer|nao quero mais viver|acabar com a minha vida|tirar minha vida|me machucar|me cortar|automutila|me ferir|sumir para sempre)/
const TOPICS = [['faculdade', /(faculdade|escola|aula|curso|universidade|estud|prova|tcc|professor)/], ['trabalho', /(trabalho|emprego|empresa|reuniao|chefe|servico|estagio)/], ['relacionamento', /(namor|parceir|relacionamento|ficante|casamento)/], ['familia', /(\bmae\b|\bpai\b|familia|irmao|irma|\bavo)/], ['amizades', /(amig|colega)/]]
const DETAILS = [['grupo', /(grupo|equipe)/], ['prova', /(prova|exame|\bnota)/], ['professor', /(professor|orientador)/], ['chefe', /(chefe|gerente|lider)/], ['projeto', /(projeto|tcc|atividade|entrega|apresentacao|seminario)/], ['colega', /colega/], ['parceiro', /(namorad|parceir|ficante|marido|esposa)/], ['familiar', /(\bmae\b|\bpai\b|irmao|irma|\bavo)/]]
const NEGW = /(exaust|esgotad|arrasad|sem energia|sem animo|na pior|destruid|acabado|desgastad|sobrecarregad|travad|esmagad|ruim|pessim|horrivel|chato|odio|cansad|sobrecarreg|sufoc|pesad|errado|falhei|reprovei|perdi|briguei|discuti|ignor|sozinh|pior|\bmal\b|culpa|vergonha|medo|nervos|desanim|trist|estress|frustr|irrit|magoa|decepc|insegur|nao aguento|grita|humilh)/
const POSW = /(realizad|satisfeit|confiante|motivad|aliviad|\bleve\b|\bbom\b|otimo|incrivel|feliz|legal|consegui|passei|aprovad|ganhei|adorei|amei|gostei|orgulh|animad|melhor|tranquil|alivi|\bpaz\b|maravilh|deu certo)/
function valence(t) { // soma de palavras positivas/negativas; "não" próximo inverte
  const w = t.split(' '); let v = 0
  w.forEach((x, i) => { const neg = w[i - 1] === 'nao' || w[i - 2] === 'nao'; if (POSW.test(x)) v += neg ? -1 : 1; else if (NEGW.test(x)) v += neg ? 0 : -1 })
  return v
}
const FRAMES = [['sobrecarga', /(ninguem (fez|ajud|colaborou)|fiz tudo|fiquei com tudo|so eu (fiz|faco)|sobrou pra mim|nao fizeram|nao fez a parte|nao (combin|cumpr))/], ['sem_retorno', /(nao respond|me ignor|visto e nao|nao me ouv|nao escut|sem resposta|sumiram|sumiu)/], ['conflito', /(brig|discut|gritou|grit|desrespeit|humilh|xingou|ofendeu)/], ['prazo', /(prazo|atrasad|pra amanha|correndo)/], ['injustica', /(injust|nao e justo|colocaram a culpa|culpa em mim)/], ['materia', /(nao entend|nao consigo aprender|materia (e )?dificil|reprov|nota baixa)/], ['cobranca', /(cobr|pressionand|exigem|exigindo)/]]
const W = (re, max = 99) => (t, n) => n <= max && re.test(t)
const RULES = [ // [intenção, teste, confiança]: a ordem define a prioridade
  ['despedida', W(/(tchau|ate mais|ate logo|ate amanha|ate a proxima|vou dormir|vou indo|falou)/, 6), .9],
  ['agradecimento', W(/(obrigad|valeu|agradec|gratidao|\bgrato|\bgrata)/, 7), .9],
  ['dependencia', W(/(unico amigo|so converso com voce|so tenho voce|prefiro voce|nao preciso de mais ninguem)/), .9],
  ['so_ouvir', W(/(so quero (desabafar|conversar|falar|ser ouvid)|nao quero (conselho|dica|sugest)|sem conselho|so (me )?(ouve|escuta)|so escuta)/), .9],
  ['dia_normal', W(/(dia (foi )?(normal|tranquilo|de boa|comum|mais ou menos)|nada (de )?(novo|demais|especial)|dia normal|dia comum)/), .85],
  ['riso', W(/^(k+|(ha)+h?|(he)+|(rs)+)( |$)/, 3), .9],
  ['elogio', W(/(voce (e|eh) (muito )?(legal|incrivel|demais|otimo|fofo)|gosto de (conversar com )?voce|voce me ajuda)/), .85],
  ['sobre_bot', W(/(voce (tem|sente|gosta|sabe|dorme|come)|qual (e )?(o )?seu nome|voce (e|eh) real|quantos anos voce)/), .9],
  ['sobre_bimo', W(/(o que (e|eh) (o )?bimo|como funciona|quem (e|eh) voce|voce (e|eh) (um |uma )?(psicolog|terapeut|medic|ia\b|robo|humano)|para que serve|psicolog|terapeut|diario|memoria|personalidade)/), .9],
  ['devolve', W(/^e (voce|contigo|com voce)\b/, 4), .9],
  ['checkin', W(/(tudo bem|tudo bom|como (voce )?(esta|vai|anda|ta)|como voce se sente|beleza ?\?)/, 8), .9],
  ['saudacao', W(/^(o+i+e*|o+l+a+|e ai|salve|hey|hello|opa+|bom dia|boa tarde|boa noite)\b/, 4), .95],
  ['dia_ruim', W(/((dia|hoje|manha|tarde|semana).{0,25}(ruim|pesad|horrivel|pessimo|complicad|dificil|estressante|cansativ|nao (esta|foi|ta) (muito |tao )?(bom|legal|bem|otimo))|nao (estou|esta|me sinto|ando) (muito |tao |la |nada )?(bem|bom|legal|feliz|animad|otimo)|nao (esta|foi|ta) (muito |tao )?(bom|legal))/), .9],
  ['ansiedade', W(/(ansios|ansiedade|nervos|aflit)/), .9],
  ['tristeza', W(/(triste|chateado|chorei|chorar|pra baixo|desanimad|abatid|me sinto mal|estou mal|estou meio mal)/), .9],
  ['preocupacao', W(/(preocup|\bmedo|receio|inseguran|angusti|tenso)/), .85],
  ['frustracao', W(/(frustr|irrit|raiva|estress|cansad|saco cheio|nao consegui|deu errado)/), .85],
  ['solidao', W(/(sozinh|solidao|ninguem (liga|fala|me)|isolad|sem amigos)/), .9],
  ['conquista', W(/((?<!nao )consegui|passei|aprovad|promovid|terminei|conclui|finalizei|me sai bem|orgulh|venci|ganhei|entreguei|conquista)/), .9],
  ['dia_bom', W(/(dia.{0,14}(incrivel|otimo|maravilhos|bom|legal|perfeito|especial)|(hoje|dia).{0,10}(incrivel|maravilhos|perfeito|especial)|coisa (boa|legal)|boas? noticia)/), .9],
  ['felicidade', W(/(feliz|alegr|contente|animad|empolgad|radiante|em paz|estou bem|me sinto bem|muito bem)/), .85],
  ['nao_sei', W(/(nao sei (o que )?(fazer|dizer|explicar|bem)|perdid|sei la|indeciso|nao sei)/), .85],
  ['opiniao', W(/(o que (voce )?(acha|pensa)|opiniao|voce concorda)/), .85],
  ['conselho', W(/(conselho|o que (voce )?faria|devo |deveria|qual (a )?melhor|como (eu )?(faco|resolvo|lido))/), .85],
  ['plano_acao', W(/(vou (mandar|falar|conversar|ligar|chamar|escrever|tentar|procurar|convidar)|acho que vou|decidi (falar|mandar|conversar))/), .85],
  ['decisao', W(/(entre .{2,40} ou |dividid|em duvida|largar|mudar de (curso|emprego|trabalho|cidade)|trocar de (curso|emprego|trabalho))/), .8],
  ['sugestao', W(/(suger|ideia|desafio|\bdica)/), .85],
  ['socializacao', W(/(me aproximar|timid|vergonha de|conhecer pessoas|fazer amigos|dificuldade (de|em) (conversar|socializ)|socializ)/), .85],
  ['problema', W(/(problema|briga|discuti|conflito|dificuldade|confus|complicad|dificil)/), .8],
  ['casual', W(/(estou com (sono|fome|preguica|calor|frio|tedio)|entediad|tedio|nada demais|de boa|que (calor|frio|sono))/), .7],
  ['relato', W(/(\bhoje\b|ontem|aconteceu|\bfui\b|\btive\b|esta semana)/), .55],
]
export function analyze(raw, state) {
  const t = clean(raw), n = t.split(' ').filter(w => w !== '?').length
  const topic = (TOPICS.find(([, re]) => re.test(t)) || [])[0], detail = (DETAILS.find(([, re]) => re.test(t)) || [])[0]
  let [intent, conf] = ['desconhecido', .2]
  for (const [id, test, c] of RULES) if (test(t, n)) { [intent, conf] = [id, c]; break }
  if (conf < .6) { const v = valence(t); if (v <= -1) [intent, conf] = ['desabafo', .65]; else if (v >= 1) [intent, conf] = ['noticia_boa', .65] }
  if (conf < .6 && (topic || detail)) [intent, conf] = ['relato', .6]
  if (conf < .6 && n >= 3 && ['what_happened', 'topic_detail', 'organize', 'event_or_persistent'].includes(state?.pending)) [intent, conf] = ['relato', .6]
  const feel = /(nao (estou |to |esta |foi )?(muito |tao )?(bom|bem|legal|feliz)|\bmal\b|ruim|cansad|pessim|chatead|triste|desanim|estressad)/.test(t) ? 'neg' : /(mais ou menos|normal|\bok\b|tanto faz|meio)/.test(t) ? 'meh' : /(\bbem\b|otim|tranquil|de boa|feliz|tudo certo|tudo bem|tudo bom|legal|show|\bbom\b)/.test(t) ? 'pos' : null
  const meta = n > 9 ? null : /^(deixa (pra|para) la|esquece|deixa quieto|nao quero (falar|continuar))/.test(t) ? 'deixa' : /(na verdade (e|eh)|e outra coisa|nao (e|eh) isso|outra coisa)/.test(t) ? 'outra' : /^(foi isso|so isso|era isso|e isso)/.test(t) ? 'foi_isso' : /(nao sei (explicar|dizer|como (falar|explicar))|dificil explicar)/.test(t) ? 'nao_sei_explicar' : /(de novo|aconteceu novamente|outra vez|mais uma vez)/.test(t) ? 'de_novo' : /^(mais ou menos|meio|em parte|talvez)/.test(t) ? 'mais_ou_menos' : /(voltando|sobre aquilo|aquele assunto|retomando|lembra do que)/.test(t) ? 'retomar' : null
  return { raw, t, n, meta, long: n >= 18, frames: FRAMES.filter(([, re]) => re.test(t)).map(f => f[0]), intent, conf, topic, detail, feel, q: t.includes('?'), yes: n <= 4 && /^(sim|isso|aham|uhum|claro|quero|pode|com certeza|ss)\b/.test(t), no: n <= 4 && /^(nao|nada|agora nao|nn)\b/.test(t) }
}
