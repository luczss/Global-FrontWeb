# Caminho REAL: navegador -> /api/chat -> SDK oficial @google/genai -> servidor Gemini SIMULADO (porta 4599). Não usa a rede nem gasta crédito.
# Uso: node tests/helpers/runFakeGemini.mjs & GEMINI_API_KEY=test-key GEMINI_API_BASE_URL=http://127.0.0.1:4599 npx vite preview --port 4173 & python3 tests/e2e-gemini.py
import json, sys
from playwright.sync_api import sync_playwright
URL = 'http://localhost:4173'; res = []
def check(n, ok, e=''): res.append((n, bool(ok), e))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 800}).new_page(); pg.goto(URL); pg.wait_for_selector('section[aria-label="Configuração inicial"]')
    pg.get_by_role('button', name='Começar', exact=True).click(); pg.get_by_label('Nome ou apelido').fill('Lucas')
    for _ in range(3): pg.get_by_role('button', name='Continuar').click()
    pg.get_by_role('button', name='Começar a usar o Bimo').click(); pg.wait_for_selector('main')
    pg.locator('aside button:has-text("Conversa")').click(); pg.wait_for_timeout(900); check('real: a conversa usa a IA automaticamente e avisa o usuário (sem nenhuma opção)', 'Google Gemini' in pg.get_by_test_id('ai-info').inner_text())
    pg.get_by_label('Mensagem').fill('Tive um dia difícil na faculdade'); pg.get_by_role('button', name='Enviar').click(); pg.wait_for_timeout(2500)
    log = pg.locator('[role=log]').inner_text(); check('real: resposta veio do Gemini (via SDK) e aparece na conversa com a etiqueta', 'Que dia puxado. O que pesou mais?' in log and 'IA · Google Gemini' in log)
    pg.get_by_label('Mensagem').fill('Eu fui atropelado hoje'); pg.get_by_role('button', name='Enviar').click(); pg.wait_for_timeout(1800)
    check('real: situação de risco ficou com o motor local (192)', '192' in pg.locator('[role=log]').inner_text())
    html = pg.content(); check('real: a chave não aparece no HTML do navegador', 'test-key' not in html and 'x-goog-api-key' not in html)
    b.close()
lines = [json.loads(l) for l in open('/tmp/fake-gemini.log') if l.strip()]
check('real: o servidor Gemini recebeu 1 chamada (a de risco não foi enviada)', len(lines) == 1, str(len(lines)))
if lines:
    l = lines[0]; txt = json.dumps(l['body'], ensure_ascii=False)
    check('real: chave enviada no cabeçalho pelo servidor (não no corpo)', l['key'] == 'test-key' and 'test-key' not in txt)
    check('real: prompt tem personalidade, segurança e limites; sem diário nem memória', 'PERSONALIDADE ATUAL' in txt and 'SAMU 192' in txt and 'registro_do_diario' not in txt and 'memoria_autorizada' not in txt)
    check('real: texto do risco não foi ao Gemini', 'atropelado' not in txt)
for n, ok, e in res: print('PASS' if ok else 'FAIL', n, e)
sys.exit(0 if all(o for _, o, _ in res) else 1)
