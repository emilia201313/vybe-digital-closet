# VYBE — Provador virtual com FASHN AI

A página original da aplicação continua em `index.html`. A experiência de provador com IA está em `ai-tryon.html` e a chave do fornecedor é usada apenas pelo endpoint servidor `api/tryon.js`.

## Configuração e publicação na Vercel

1. Importa o repositório `emilia201313/vybe-digital-closet` em https://vercel.com/new.
2. Em **Project Settings → Environment Variables**, adiciona `FASHN_API_KEY` com a chave privada obtida na conta FASHN AI. Não a coloques em ficheiros públicos nem no GitHub.
3. Faz o deploy do projeto. A Vercel publica a página e a função `/api/tryon` no mesmo domínio.
4. Abre `https://<domínio-do-projeto>.vercel.app/ai-tryon.html` para experimentar. A página GitHub Pages, por si só, não executa funções de servidor; usa o domínio Vercel para esta funcionalidade.

O serviço inclui créditos de teste limitados. Confirma os preços e as condições atuais na página oficial antes de usar em produção. As imagens selecionadas são enviadas ao fornecedor para processamento. A API deste exemplo limita cada imagem a cerca de 5 MB e usa o modelo `tryon-v1.6`. A integração inicial aceita partes de cima, partes de baixo e peças únicas; não inclui calçado.
