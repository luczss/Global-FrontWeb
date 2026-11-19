import hero from '../assets/characters/hero.png'
import happy from '../assets/characters/happy.png'
import sleepy from '../assets/characters/sleepy.png'
import curious from '../assets/characters/curious.png'
import wink from '../assets/characters/wink.png'
import sad from '../assets/characters/sad.png'
import love from '../assets/characters/love.png'
import { SHOP } from '../data/shop'
const IMGS = { hero, happy, sleepy, curious, wink, sad, love }
// Personagem Bimo com expressão e acessórios desbloqueados.
export default function BimoCharacter({ mood = 'hero', size = 'w-40', accessories = [], float = false }) {
  return (
    <div className={`relative ${size} ${float ? 'bob' : ''}`}>
      <img src={IMGS[mood] || hero} alt={`Bimo, expressão ${mood}`} className="w-full h-auto rounded-3xl mix-blend-multiply select-none" draggable="false" />
      {SHOP.filter(i => accessories.includes(i.id)).map(i => (
        <svg key={i.id} viewBox="0 0 24 24" className={`absolute w-[16%] ${i.pos}`} fill={i.color} aria-label={i.name}>
          {i.id === 'estrela' ? <path d="M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z" /> : i.id === 'coracao' ? <path d="M12 21s-8-5.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.600-8 11-8 11z" /> : i.id === 'laco' ? <path d="M12 12L3 6v12zm0 0l9-6v12zm0 0a2 2 0 1 0 .01 0z" /> : <path d="M3 21C3 9 12 3 21 3c0 9-6 18-18 18z" />}
        </svg>
      ))}
    </div>
  )
}
