// Serviço de API externa: JSONPlaceholder (https://jsonplaceholder.typicode.com).
// LIMITAÇÃO: é uma API de demonstração; escritas retornam sucesso mas NÃO são persistidas
// (e PATCH em ids novos, como 201, retorna erro). Só trafegam dados NÃO sensíveis (desafios).
const BASE = 'https://jsonplaceholder.typicode.com/todos'
async function request(url = BASE, options) {
  let res
  try { res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options }) }
  catch { throw new Error('Sem conexão com a API de demonstração.') }
  if (!res.ok) throw new Error(`A API respondeu com erro ${res.status}.`)
  return res.json()
}
export const listRemoteChallenges = (limit = 5) => request(`${BASE}?_limit=${limit}`)            // READ
export const createRemoteChallenge = title => request(BASE, { method: 'POST', body: JSON.stringify({ title, completed: false, userId: 1 }) }) // CREATE
export const updateRemoteChallenge = (id, data) => request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })                 // UPDATE
export const deleteRemoteChallenge = id => request(`${BASE}/${id}`, { method: 'DELETE' })                                                    // DELETE
