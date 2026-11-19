// Rede de segurança sobre a resposta do modelo: bloqueia diagnóstico afirmativo e orientação de medicamento. Se barrar, o cliente usa o motor local.
const DIAG = /(voc[êe] (tem|est[áa] com|sofre de|possui) (uma? )?(depress|ansiedade|transtorno|bipolar|borderline|tdah|burnout|s[íi]ndrome)|seu diagn[óo]stico (é|e)|isso (é|e) (uma )?(depress|transtorno))/i
const MED = /(tome|tomar|use|usar|aumente a dose|pare de tomar)\s+(\w+\s+){0,2}(rem[ée]dio|medicamento|antidepress|rivotril|ansiol[ií]tic|ritalina|fluoxetina)/i
export function sanitizeReply(text, max = 1200) {
  const t = String(text ?? '').replace(/[ \t]+\n/g, '\n').trim()
  if (!t || DIAG.test(t) || MED.test(t)) return null
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t
}
