# Widget incorporável Atendai

Para instalar e usar o chat no seu site, consulte o **[Guia de integração](GUIA-INTEGRACAO.md)**: instalação, configurações, uso no celular, notificações, persistência e solução de problemas.

Projeto independente, sem build. Versão atual: **[v1.1.0](https://github.com/OpenitDev/widget-meet.atendai.chat/releases/tag/v1.1.0)**. A versão `v1.0.0` foi preservada.

## Instalar

Cole antes de `</body>`:

```html
<script
  src="https://rawcdn.githack.com/OpenitDev/widget-meet.atendai.chat/v1.1.0/script.js"
  data-slug="dev"
  data-color="#008252"
  data-theme="dark"
  async
></script>
```

A origem do chat é `https://meet.atendai.chat` e a rota inicial é `/:slug/nova-conversa`. No primeiro acesso, o iframe carrega no primeiro clique. A rota atual e o estado aberto/fechado são persistidos para restaurar o widget após recarregar ou navegar pelo site.

## Persistência da conversa

O widget salva no `localStorage` do site hospedeiro a chave `@atendai-widget:v1:<origem-do-chat>:<slug>`, com `{ version: 1, path, open, unreadCount, receivedMessageIds }`. A separação por origem e tenant evita misturar conversas de ambientes/clientes diferentes. Apenas rotas reconhecidas do mesmo tenant são restauradas; valores corrompidos ou de outra versão são ignorados.

- F5 com o painel aberto restaura a mesma rota e abre o painel, sem roubar o foco da página.
- Com mensagens não visualizadas, F5 restaura a contagem, a bolinha, o aviso clicável e o prefixo no título da aba, sem tocar novamente o som. Abrir a conversa com a página visível zera e salva a contagem; dispensar apenas o popup não marca mensagens como visualizadas.
- Estados antigos sem os campos de notificação continuam compatíveis. Contagens inválidas são tratadas como zero e IDs inválidos são descartados.
- Com o painel fechado em uma rota `/chat`, o iframe é restaurado em segundo plano para continuar recebendo avisos. As telas de entrada fechadas continuam com carregamento sob demanda.
- A autenticação permanece no storage já utilizado pelo chat externo, dentro da origem do iframe. O host não copia JWTs, nome, CPF, query de convite nem hash: persiste somente o caminho da rota, o estado do painel, a contagem de avisos e até 500 IDs opacos para evitar alertas duplicados após recarregar.
- Sair da conversa e voltar à entrada atualiza a rota persistida; o widget não escolhe novamente uma conversa antiga.
- Se o navegador bloquear o storage, o widget continua utilizável em memória, mas não poderá garantir a restauração após F5. Limpar os dados do navegador, perder a sessão ou restringir armazenamento de terceiros pode exigir novo login.

## Personalizar

| Atributo | Uso | Padrão |
| --- | --- | --- |
| `data-slug` | Cliente do chat; obrigatório | — |
| `data-title` | Descrição acessível do painel, botão e iframe | `Fale com a gente` |
| `data-color` | Cor do botão flutuante | `#008252` |
| `data-position` | `left` ou `right` | `right` |
| `data-theme` | `light`, `dark` ou `auto` | `auto` |
| `data-base-url` | Origem HTTP/HTTPS do chat | `https://meet.atendai.chat` |
| `data-notification-sound` | Use `false` para desativar o som de nova mensagem | `true` |

A cor aceita somente hexadecimal com seis dígitos, como `#008252`. Nomes de cores, `#fff` e `rgb(...)` usam a cor padrão. As opções são lidas quando o script executa: após alterar os atributos, recarregue a página.

O painel mostra o título centralizado. Abrir em outra aba fica à esquerda; expandir/restaurar e fechar ficam juntos à direita. Os controles têm 32px e os SVGs 17px, em uma faixa neutra de 40px integrada à superfície do chat. O botão flutuante alterna entre conversa e X com fade e rotação; a preferência por movimento reduzido é respeitada.

`light` usa superfície branca e ícones escuros; `dark` usa superfície escura e ícones claros; `auto` acompanha a preferência do sistema inicialmente. Após a integração com o chat, a faixa acompanha apenas o modo claro/escuro informado por ele e permanece cinza neutra. A cor de marca do tenant é usada somente no conteúdo interno do iframe, sem colorir a moldura ou a borda. `data-color` continua personalizando o botão flutuante.

## Tamanho e estilo avançado

Acima de 420px de largura, o painel mantém proporção vertical 9:16 (largura:altura), com largura máxima de 378px e altura máxima de 672px, sem reduzir o conteúdo por scale. Não há mais alternância para 3:4 em telas menores. O painel usa 90% das dimensões calculadas para a viewport, reduzindo em 10% também quando o tamanho é limitado pela tela, sem reduzir fontes ou controles. A largura também é limitada pela altura disponível, preservando a proporção e o espaço do botão flutuante. Em telas de até 420px, ocupa toda a área visível, respeita a safe area e acompanha o teclado via `visualViewport`. Nesse modo, expandir e o botão flutuante ficam ocultos enquanto o painel está aberto; o X superior fecha o chat e libera novamente a rolagem do site.

O botão de expandir aumenta largura e altura em até 30% (máximo aproximado de 491 × 874px), sempre limitado à área disponível da janela e mantendo 9:16. O mesmo botão restaura o tamanho padrão sem recriar o iframe ou perder a conversa. Fechar/reabrir mantém a expansão durante a página atual; após F5, volta ao tamanho padrão.

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
  src="https://rawcdn.githack.com/OpenitDev/widget-meet.atendai.chat/v1.1.0/script.js"
  data-slug="dev"
  data-include="/contato,/produtos/*"
  data-exclude="/checkout/*"
  async
></script>
```

O comportamento previsto é aceitar caminhos separados por vírgulas, com exclusões tendo prioridade. `/contato` seria exato, `/produtos/*` incluiria subpáginas, e os filtros considerariam apenas o pathname. SPAs precisariam acompanhar mudanças de rota sem recarregar a página.

## Testar e publicar

Execute `python -m http.server 8080` nesta pasta e abra `http://localhost:8080`. A demonstração permite personalizar e copiar o script.

O repositório precisa ser público. Publique alterações em novas tags/releases; não mova tags já publicadas. A release `v1.1.0` aponta para o commit `d072a8733dd737770b3ce33c64496a328bb9b0ae`. Atualize o `src` nos sites para essa versão: links fixados em versões anteriores não se atualizam automaticamente. Alterar somente os atributos de instalação não exige publicar o script.

## Incorporação e permissões

Se o site usa CSP, permita a origem do script em `script-src`, os estilos do widget em `style-src` e a origem do chat em `frame-src`. O servidor do chat precisa permitir incorporação: `X-Frame-Options` e `frame-ancestors` restritivos podem bloquear o iframe. A API continua sendo acessada dentro do iframe; não é necessário liberar CORS para a origem do site hospedeiro.

Câmera e microfone dependem de HTTPS e da política de permissões do site. Navegadores podem restringir armazenamento e notificações em iframes de terceiros; use abrir em outra aba nesses casos. Valide login e envio de mensagens em um domínio externo antes de distribuir.

Os exemplos usam `rawcdn.githack.com` com versão explícita. Caches de URLs antigas não são invalidados por um commit ou merge no GitHub. Confira a versão entregue e utilize uma nova URL ao atualizar, sem substituir tags existentes.


## Integração com o chat externo

O iframe recebe `?embed=widget`. O chat externo ativa sua entrada exclusiva somente quando essa flag está presente na URL inicial e a página está incorporada. O modo permanece durante a navegação SPA: marca no topo, formulário ocupando o painel, sem wallpaper ou card flutuante e com rolagem interna quando necessário, sem diminuir fontes por scale. A versão aberta em aba normal mantém o visual web. O chat integrado usa header de marca compacto e compositor em duas linhas, com ferramentas e assinatura OpenDev. A entrada inclui um FAQ recolhível sobre acesso e continuação de conversas.

A comunicação usa `postMessage`: o chat anuncia `atendai:widget:ready`, o host responde `atendai:widget:init` e recebe `atendai:widget:state` com URL atual, tema e, opcionalmente, `headerColor`. O campo `headerColor` é legado e não altera mais a faixa externa: o host mantém controles e moldura neutros, independentemente da cor usada pelo conteúdo do chat. O host valida a origem, a janela do iframe e o tenant da URL; o chat envia estado somente à origem do parent que fez o handshake. O link externo acompanha a rota atual e remove a flag `embed`, preservando os demais parâmetros. Não há transferência de credenciais entre armazenamentos: políticas de storage de terceiros ainda podem exigir nova autenticação na aba externa.

No primeiro carregamento, o painel usa cinza-claro com spinner e “Carregando chat…”, independentemente do tema inicial. O handshake `ready` sozinho não libera o conteúdo: o estado `loading: false` confirma que a consulta dos recursos terminou e o tema foi aplicado, e o iframe aparece com fade. Estados legados sem `loading` continuam compatíveis. Após 20 segundos sem conclusão, o painel oferece “Tentar novamente”; a preferência por movimento reduzido é respeitada.

O estado também informa `title`, exibido como texto entre os controles, com limite de 120 caracteres. O host envia `atendai:widget:visibility` após o handshake, ao abrir/fechar e ao trocar a visibilidade da página. O chat usa esse estado para não marcar mensagens como lidas enquanto o painel está fechado.

Para mensagens novas de terceiros, o chat envia `atendai:widget:incoming` com um ID opaco, sem texto da mensagem ou credenciais. Com o painel fechado, o host mostra uma bolinha no botão e um aviso genérico clicável; dispensar o aviso mantém a bolinha, e abrir a conversa limpa ambos. Eventos duplicados não reacendem o aviso. Isso independe da permissão de notificações e funciona enquanto a página e a conexão do iframe estiverem ativas; não é push com o site fechado. Mensagens próprias, observações, convites e histórico carregado não geram esse aviso.

O título da aba do site hospedeiro recebe um prefixo como `(2 novas mensagens)` quando chegam mensagens com o painel fechado ou a aba em segundo plano. Abrir o chat com a página visível limpa a contagem e restaura o título, inclusive se o site o tiver atualizado durante o aviso. Dispensar apenas o popup mantém a contagem e a bolinha.

O host também toca um tom curto e discreto via Web Audio, sem baixar arquivos ou enviar dados para serviços externos. O áudio só é preparado após uma interação confiável (toque/clique ou teclado) no site hospedeiro; o navegador pode bloqueá-lo ou suspendê-lo em segundo plano. Interações somente dentro do iframe não desbloqueiam o áudio do host. Há um intervalo mínimo de 1,5 segundo entre sons, sem descartar a contagem de mensagens; duplicados não geram novos alertas. Use `data-notification-sound="false"` no script para desativar somente o som. Não há solicitação de permissão de notificações do sistema e não funciona com o site fechado.

Os controles ficam fora do iframe em uma faixa de 40px (48px mais safe area no modo tela cheia); o chat não precisa reservar espaço para eles. O cadastro continua usando etapas em iframes baixos, e o histórico de mensagens mantém sua rolagem atual.


A versão atual de instalação é `v1.1.0`. Para fixar o conteúdo pelo commit, use `https://rawcdn.githack.com/OpenitDev/widget-meet.atendai.chat/d072a8733dd737770b3ce33c64496a328bb9b0ae/script.js`. O chat externo dentro do iframe possui deploy independente do script do widget.
