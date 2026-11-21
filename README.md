# VYBE — Provador virtual com modelo open-source

A aplicação web continua em `index.html`. A página `ai-tryon.html` usa o **FASHN VTON v1.5**, modelo open-source executado num serviço Python que controlas. Não precisa da API paga nem de uma chave `FASHN_API_KEY`.

## Importante: o que é gratuito e o que não é

O código e os pesos do modelo estão sob a licença Apache 2.0. Não há cobrança por pedido a uma API externa. No entanto, a geração precisa de uma GPU NVIDIA compatível: se já tens uma máquina adequada, podes executá-la nela; alugar uma GPU na nuvem normalmente custa dinheiro. A Vercel/GitHub Pages não fornece GPU para executar o modelo. A página web, por si só, não consegue fazer a geração.

## Testar localmente numa máquina com GPU NVIDIA/CUDA

O serviço exige uma máquina Linux ou Windows com controladores NVIDIA/CUDA compatíveis, Python e espaço em disco para os pesos (cerca de 2 GB, além dos componentes descarregados automaticamente). Consulta primeiro o README oficial do modelo para requisitos atualizados: https://github.com/fashn-AI/fashn-vton-1.5

1. Instala Git, Python e os controladores NVIDIA adequados.
2. Clona o repositório oficial do modelo e instala-o num ambiente virtual, seguindo exatamente as instruções oficiais:

   ```bash
   git clone https://github.com/fashn-AI/fashn-vton-1.5.git
   cd fashn-vton-1.5
   python -m venv .venv
   ```

   Activa o ambiente virtual antes de continuar. No Windows, usa o comando de ativação indicado pela tua versão de PowerShell; no Linux/macOS, normalmente é `source .venv/bin/activate`.

3. Instala PyTorch com suporte CUDA para a tua versão de CUDA a partir do selector oficial: https://pytorch.org/get-started/locally/ . Depois, instala o modelo e descarrega os pesos:

   ```bash
   pip install -e .
   python scripts/download_weights.py --weights-dir ./weights
   ```

4. Copia a pasta `gpu-api` deste repositório para a pasta `fashn-vton-1.5` que clonaste. A estrutura deve ficar assim:

   ```text
   fashn-vton-1.5/
   ├── gpu-api/
   │   ├── main.py
   │   └── requirements.txt
   └── weights/
   ```

5. No mesmo ambiente virtual, instala as dependências do pequeno servidor e inicia-o:

   ```bash
   pip install -r gpu-api/requirements.txt
   uvicorn main:app --app-dir gpu-api --host 127.0.0.1 --port 8000
   ```

   Deixa esta janela do terminal aberta enquanto usas o provador. A primeira inicialização carrega o modelo para a GPU. Para confirmar que está ligado, abre http://127.0.0.1:8000/health — deve aparecer `"status":"ok"` e o nome da GPU.

6. Para abrir a página web localmente, abre um segundo terminal na pasta deste projeto e executa:

   ```bash
   python -m http.server 5500
   ```

   No mesmo computador, abre http://127.0.0.1:5500/ai-tryon.html, escolhe as duas imagens e gera a prova. Usa fotografias tuas ou imagens para as quais tens autorização.

## Usar a página publicada na Vercel

A página publicada na Vercel não consegue aceder ao `127.0.0.1` do teu computador. Para a ligar a uma GPU na Internet, tens de alojar este serviço num servidor com GPU e HTTPS, configurar `VYBE_ALLOWED_ORIGINS` com o domínio da tua página e indicar o URL HTTPS desse servidor na secção **Configuração do servidor local** da página.

**Não exponhas este exemplo diretamente à Internet:** ainda não inclui autenticação, limites por utilizador nem proteção contra abuso. Para um serviço público é necessário acrescentar essas proteções e, geralmente, alugar uma máquina GPU. Uma GPU na nuvem não é garantidamente gratuita.

## Licença e API paga antiga

O modelo FASHN VTON v1.5 está sob licença Apache 2.0 (consulta também as licenças dos componentes incluídos). A integração antiga com a API paga não é utilizada por esta página. Não precisas de criar uma chave API nem de definir `FASHN_API_KEY`.
