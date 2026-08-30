# Direção de Design — Obras

## Três abordagens consideradas

| Tema | Introdução breve | Probabilidade |
| --- | --- | --- |
| Caderno de Campo | Um diário de obra claro e tátil, com o conforto de anotações bem organizadas e fotografias que reconhecem o lugar. | 0,07 |
| Cartão de Endereço | Uma interface de alta legibilidade onde cada imóvel se comporta como um cartão de localização, com contraste calmo e ações imediatas. | 0,04 |
| Oficina Editorial | Um visual de revista contemporânea que combina tipografia marcante, branco quente e fotografia documental. | 0,09 |

## Abordagem escolhida — Caderno de Campo

### Movimento de design

**Minimalismo editorial tátil**, inspirado em notas de campo cuidadosamente organizadas e na clareza funcional dos aplicativos nativos de produtividade. A interface deve transmitir trabalho prático, confiança e rapidez, sem parecer uma ferramenta corporativa.

### Princípios centrais

1. **Localização primeiro:** endereço, código e rota são as informações de maior escala e contraste em todos os contextos relevantes.
2. **Reconhecimento pela imagem:** fotografias autênticas da fachada funcionam como âncoras visuais para identificar a obra em segundos.
3. **Uma ação por momento:** as escolhas são diretas, com poucas opções simultâneas e trajetos de retorno inequívocos.
4. **Calma operacional:** muito espaço em branco, componentes reduzidos e informações agrupadas como páginas de um caderno de trabalho.

### Filosofia de cor

O fundo em **marfim de gesso** reduz a dureza do branco puro e lembra materiais de obra acabados. O **azul grafite** dá a legibilidade e a confiança de uma ferramenta profissional; o **laranja cal** é o sinal proprietário para navegação, ação e progresso, remetendo à marcação no canteiro sem dominar a tela.

### Paradigma de layout

O produto usa uma **pilha de cartões fotográficos em coluna**, como fichas físicas de endereços guardadas em um caderno. No desktop, a área continua intencionalmente estreita e semelhante a um app, preservando a leitura mobile-first em vez de se converter em dashboard.

### Elementos de assinatura

1. Uma faixa vertical laranja-cal no limite dos cartões ativos, indicando uma obra em andamento.
2. Chips de código de acesso com caracteres monoespaçados, lembrando uma etiqueta prática de chaveiro.
3. Linhas finas pontilhadas em timelines e separadores, evocando marcações de caderno de campo.

### Filosofia de interação

Toques devem reduzir atrito: o cartão inteiro abre detalhes; o código copia com um toque; a rota abre um seletor conciso. Estados de confirmação são discretos, visíveis e reversíveis quando apropriado.

### Animação

Entradas de cartões usam uma subida de 8 px com opacidade em cascata de 45 ms. Toques em botões usam escala de 0,97 em 140 ms. Painéis e folhas inferiores entram em 220 ms com `cubic-bezier(0.23, 1, 0.32, 1)`. Animações não essenciais são removidas para preferências de movimento reduzido.

### Sistema tipográfico

**DM Sans** sustenta a leitura cotidiana pela clareza e gentileza. **DM Mono** distingue códigos, datas e pequenas referências operacionais. Endereços usam DM Sans em peso 700; descrições em peso 500; metadados e datas usam DM Mono em caixa baixa e espaçamento sutil.

### Essência da marca

**Obras é o caderno de campo mobile para profissionais que precisam encontrar o local, entrar e retomar o serviço sem procurar conversas.**

Personalidade: **direta, confiável e prática**.

### Voz da marca

Headlines e microcopy soam claras e orientadas à ação; evitam tecnicismo, excesso de entusiasmo ou instruções vagas.

> “A obra certa, sem procurar conversa.”

> “Código copiado. Agora é só entrar.”

### Wordmark e logotipo

O símbolo é um **marcador de localização modular**, formado por uma casa geométrica branca recortada em um pino laranja-cal. Ele é simples o bastante para funcionar como ícone de aplicativo e associa lugar, imóvel e movimento.

### Cor de assinatura

**Laranja Cal — `#E86A33`**

## Decisões de estilo

O produto não usará dashboards, gradientes chamativos, cantos excessivamente arredondados ou layouts centralizados genéricos. Cada decisão deve reforçar a sensação de uma ferramenta rápida de campo: familiar, serena e pronta para uso com uma mão.

### Complementos de revisão visual

Fotografias serão tratadas como registros documentais de fachada — úteis para reconhecer o local na chegada, nunca como imagens aspiracionais de anúncio imobiliário. Separadores pontilhados, códigos monoespaçados, identificadores de ficha e pequenas réguas editoriais devem atuar como linguagem de sistema em todo o aplicativo. A microcopy será curta e operacional: cada frase deve ajudar a encontrar, entrar, navegar ou continuar o serviço.
