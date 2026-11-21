# VYBE — Uma manhã rápida e eficaz

A página principal permite guardar fotografias de roupa, sapatos e acessórios, organizá-los e selecionar peças para compor um look visual. A página inicial mostra **VYBE** e o slogan **“Uma manhã rápida e eficaz”**. Não pede fotografia do corpo nem usa manequim.

## Reconhecimento automático

Ao escolher uma imagem, a aplicação tenta reconhecer no próprio navegador a categoria da peça: partes de cima, partes de baixo, vestidos/peças únicas, sapatos e acessórios. Para acessórios, tenta distinguir malas/carteiras, joalharia, chapéus, cintos, lenços/cachecóis, óculos, relógios, acessórios de cabelo e outros acessórios. A sugestão pode falhar; confirma ou altera a categoria antes de guardar.

O reconhecimento usa Transformers.js e o modelo CLIP `Xenova/clip-vit-base-patch32`. Na primeira utilização, o navegador descarrega a biblioteca e os pesos do modelo pela Internet. As imagens são analisadas localmente no navegador e não são enviadas a uma API de classificação. O desempenho depende do dispositivo; em computadores ou telemóveis mais lentos pode demorar, e sem Internet no primeiro carregamento é necessário escolher a categoria manualmente.

## Como usar

1. Abre a página VYBE e carrega em **Começar a organizar**.
2. Fotografa ou escolhe uma peça. Aguarda a sugestão automática e corrige-a se necessário.
3. Adiciona-a ao guarda-roupa.
4. Abre **Criar look**, seleciona as peças que queres combinar e, se quiseres, guarda uma imagem da composição.

As imagens são reduzidas e guardadas no armazenamento local do navegador. Limpar os dados do navegador pode apagar as peças guardadas. Não é necessária GPU NVIDIA nem chave de API para esta classificação de imagens.
