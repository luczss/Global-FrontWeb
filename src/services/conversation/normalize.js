// Normalização do texto: minúsculas, sem acento, letras repetidas, abreviações e erros leves de digitação.
const ABBR = { to: 'estou', tou: 'estou', ta: 'esta', tb: 'tambem', tbm: 'tambem', vc: 'voce', q: 'que', pq: 'porque', n: 'nao', nn: 'nao', td: 'tudo', hj: 'hoje', blz: 'beleza', vlw: 'valeu', obg: 'obrigado', obgd: 'obrigado', eai: 'e ai', oie: 'oi', msm: 'mesmo', mt: 'muito', mto: 'muito', flw: 'falou', tdb: 'tudo bem', sdd: 'saudade' }
const KEYS = 'feliz triste ansioso ansiosa preocupado preocupada cansado cansada desanimado desanimada faculdade trabalho problema conquista consegui terminei obrigado estressado frustrado sozinho sozinha namorado chateado horrivel complicado incrivel otimo amigos familia dificil'.split(' ')
const near = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; const x = a.slice(i), y = b.slice(i); return x === y || x.slice(1) === y || x === y.slice(1) || x.slice(1) === y.slice(1) }
export function clean(s) {
  const t = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])\1{2,}/g, '$1').replace(/\?/g, ' ? ').replace(/[^a-z0-9? ]+/g, ' ')
  return t.split(/\s+/).filter(Boolean).map(w => ABBR[w] || (w.length >= 5 && !KEYS.includes(w) ? KEYS.find(k => near(w, k)) || w : w)).join(' ')
}
