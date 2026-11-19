// Detecção determinística de risco (palavras-chave). É uma camada simples e limitada, não um classificador clínico.
const RISK = /(me matar|suicid|quero morrer|nao quero mais viver|acabar com a minha vida|tirar minha vida|me machucar|me cortar|automutila|me ferir|sumir para sempre)/
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
export const isRisk = text => RISK.test(norm(text))
export const CRISIS_REPLY = 'Sinto muito que você esteja passando por isso, e fico feliz que tenha me contado. Eu sou um robô de apoio à expressão e não consigo oferecer o cuidado que você merece agora. Por favor, fale com alguém de confiança hoje, perto de você. Você também pode ligar para o CVV, gratuitamente e a qualquer hora, pelo 188, ou para o SAMU (192) se estiver em perigo. Se puder, não fique sozinho(a) neste momento.'
