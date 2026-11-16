# Widget incorporável Atendai

Projeto independente, sem build. A única versão publicada é `v1.0.0`, com todas as modificações atuais.

## Instalar

Cole antes de `</body>`:

```html
<script
  src="https://rawcdn.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.0/script.js"
  data-slug="dev"
  data-color="#008252"
  data-theme="dark"
  async
></script>
```

A origem do chat é `https://meet.atendai.chat` e a rota é `/:slug/nova-conversa`. O iframe carrega no primeiro clique; fechar e reabrir preserva a conversa durante a página atual.

## Personalizar

| Atributo | Uso | Padrão |
| --- | --- | --- |
| `data-slug` | Cliente do chat; obrigatório | — |
| `data-title` | Descrição acessível do painel, botão e iframe | `Fale com a gente` |
| `data-color` | Cor do botão flutuante e da faixa dos controles | `#008252` |
| `data-position` | `left` ou `right` | `right` |
| `data-theme` | `light`, `dark` ou `auto` | `auto` |
| `data-base-url` | Origem HTTP/HTTPS do chat | `https://meet.atendai.chat` |

A cor aceita somente hexadecimal com seis dígitos, como `#008252`. Nomes de cores, `#fff` e `rgb(...)` usam a cor padrão. As opções são lidas quando o script executa: após alterar os atributos, recarregue a página.

O painel não possui título visível. Abrir em outra aba fica à esquerda e o X à direita. Os controles têm 28px e os SVGs 18px, sem fundo próprio, borda ou sombra. A faixa usa `data-color` e reserva 12px de padding inferior antes do iframe, evitando sobreposição com o chat.

`light` usa ícones escuros com hover branco. `dark` usa ícones claros com hover verde claro. `auto` acompanha a preferência do sistema. O tema afeta os controles; o conteúdo do chat tem seu próprio tema. Escolha o tema que ofereça contraste com `data-color`.

## Tamanho e estilo avançado

O painel tem largura mínima de 350px e máxima de 480px. Abaixo de 1600px de largura da viewport, a proporção é 3:4; a partir de 1600px, é 9:16. O cálculo considera a altura disponível. A largura mínima tem prioridade e pode ultrapassar telas muito estreitas ou baixas.

Para alterar o estilo permanentemente, edite `script.js`:

| Seletor ou trecho | Personalização |
| --- | --- |
| `.launcher` | Tamanho, posição, bordas e sombra do botão flutuante |
| `.panel` e suas media queries | Largura, proporção e aparência do painel |
| `.panel-controls` | Espaçamento da faixa dos controles |
| `.panel-control` e `.panel-control svg` | Tamanho dos controles e ícones |
| `--control-color` e `--control-hover` | Cores de cada tema |
| `launcher.innerHTML`, `external.innerHTML`, `close.innerHTML` | SVGs |

O CSS está em strings JavaScript: preserve as aspas e concatenações. Confira a sintaxe com `node --check script.js`.

O Shadow DOM isola o widget: CSS comum do site não alcança os elementos internos. Não há atributo `data-style`. Para mudar a aparência dentro da conversa, altere o projeto `wopen-chat-externo-frontend`; o iframe mantém seus próprios estilos.

## Escolher páginas

Atualmente, o widget aparece em todas as páginas que carregam o script. Em sites com HTML independente, inclua somente nas páginas desejadas. Em aplicações React, o script no HTML principal aparece em todas as rotas.

### Filtros propostos, ainda não implementados

`data-include` e `data-exclude` não são interpretados pela versão atual. Este exemplo ilustra uma configuração futura e **não restringe a exibição hoje**:

```html
<script
  src="https://rawcdn.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.0/script.js"
  data-slug="dev"
  data-include="/contato,/produtos/*"
  data-exclude="/checkout/*"
  async
></script>
```

O comportamento previsto é aceitar caminhos separados por vírgulas, com exclusões tendo prioridade. `/contato` seria exato, `/produtos/*` incluiria subpáginas, e os filtros considerariam apenas o pathname. SPAs precisariam acompanhar mudanças de rota sem recarregar a página.

## Testar e publicar

Execute `python -m http.server 8080` nesta pasta e abra `http://localhost:8080`. A demonstração permite personalizar e copiar o script.

O repositório precisa ser público. A tag `v1.0.0` aponta para o código atual; as demais tags foram removidas. Após atualizar essa tag, caches da CDN e do navegador podem continuar entregando o arquivo anterior até serem renovados. Alterar os atributos de instalação não exige publicar o script.

## Incorporação e permissões

Se o site usa CSP, permita a origem do script em `script-src`, os estilos do widget em `style-src` e a origem do chat em `frame-src`. O servidor do chat precisa permitir incorporação: `X-Frame-Options` e `frame-ancestors` restritivos podem bloquear o iframe. A API continua sendo acessada dentro do iframe; não é necessário liberar CORS para a origem do site hospedeiro.

Câmera e microfone dependem de HTTPS e da política de permissões do site. Navegadores podem restringir armazenamento e notificações em iframes de terceiros; use abrir em outra aba nesses casos. Valide login e envio de mensagens em um domínio externo antes de distribuir.

O endereço antigo em raw.githack.com manteve uma cópia anterior da tag v1.0.0 mesmo após a atualização. Os exemplos usam rawcdn.githack.com, verificado com o conteúdo atual. Ao substituir uma tag existente, confirme o arquivo entregue pela CDN, pois atualizar o GitHub não invalida automaticamente os caches externos.
