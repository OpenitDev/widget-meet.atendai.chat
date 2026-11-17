# Como integrar o chat Atendai no seu site

Guia de instalação e uso do widget: o botão flutuante que abre o atendimento sem tirar o visitante do site.

## 1. O que você precisa

- O **slug do cliente** cadastrado no Atendai, como `minha-empresa`.
- A URL do chat externo. O padrão é `https://meet.atendai.chat`.
- Acesso ao HTML do site ou a uma ferramenta que permita inserir scripts.
- Uma URL pública para o arquivo `script.js` deste projeto, por hospedagem própria ou CDN.

Não é necessário instalar pacotes, fazer build do widget ou colocar uma chave de API no site.

> Use a versão atual de `script.js`. Uma URL de CDN fixada em uma revisão antiga não recebe automaticamente as melhorias de layout, som e persistência.

## 2. Instalação rápida

### Hospedar o script

Copie o arquivo `script.js` deste projeto para uma pasta pública do seu site. Neste guia, usamos o exemplo `/atendai/script.js`.

Acesse essa URL no navegador e confirme que ela entrega JavaScript, não uma página HTML, um erro 404 ou uma tela de login.

Se preferir CDN, use a URL pública da revisão que você publicou no lugar de `/atendai/script.js`.

### Adicionar ao site

Cole antes de `</body>`:

```html
<script
  src="/atendai/script.js"
  data-slug="minha-empresa"
  async
></script>
```

Substitua `minha-empresa` pelo slug real do cliente. O widget abrirá o chat em:

```text
https://meet.atendai.chat/minha-empresa/nova-conversa
```

Adicione também ao `<head>`, caso o site ainda não tenha:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Instale apenas uma vez por página.** Não é necessário adicionar um iframe manualmente.

## 3. Exemplo com todas as opções

```html
<script
  src="/atendai/script.js"
  data-slug="minha-empresa"
  data-title="Fale com nossa equipe"
  data-color="#008252"
  data-position="right"
  data-theme="auto"
  data-base-url="https://meet.atendai.chat"
  data-notification-sound="true"
  async
></script>
```

| Atributo | Para que serve | Padrão |
| --- | --- | --- |
| `src` | URL pública do arquivo JavaScript do widget | Obrigatório |
| `data-slug` | Identifica o cliente no Atendai | Obrigatório |
| `data-title` | Título inicial e descrição acessível do widget | `Fale com a gente` |
| `data-color` | Cor do botão flutuante | `#008252` |
| `data-position` | Lado do botão: `left` ou `right` | `right` |
| `data-theme` | Tema inicial da moldura: `light`, `dark` ou `auto` | `auto` |
| `data-base-url` | Origem do chat externo, sem rota de cliente | `https://meet.atendai.chat` |
| `data-notification-sound` | Use `false` para desativar somente o som | Ativado |

**Observações:**

- A cor precisa ter seis dígitos hexadecimais, como `#008252`. Formatos como `#fff` e `rgb(...)` usam a cor padrão.
- `auto` acompanha inicialmente a preferência clara/escura do dispositivo.
- Depois de carregar, o chat pode atualizar o título e o tema da moldura.
- `data-color` muda o botão, não a identidade visual interna. Logo, imagem, cor do conteúdo e opções de entrada vêm das configurações do cliente no Atendai.
- As opções são lidas na execução do script. Após alterá-las, recarregue a página.
- Não coloque CPF, nome, senha ou token nos atributos do script.

## 4. Onde instalar

### HTML tradicional

Inclua o script em todas as páginas que devem mostrar o widget. Para manter a conversa ao navegar, utilize o mesmo slug e a mesma origem do chat.

### React, Vue e outras SPAs

Inclua o script uma única vez no HTML principal, antes de `</body>`. Evite carregá-lo em componentes que desmontam e montam a cada mudança de rota.

Navegar entre rotas da SPA não exige reinstalar o widget.

### WordPress e construtores de sites

Use a área de **scripts personalizados**, **código no rodapé** ou equivalente. Em instalações globais, o chat aparece em todas as páginas que carregarem o script.

Alguns editores removem tags `<script>` de blocos de conteúdo. Nesse caso, use a ferramenta de inserção de scripts disponibilizada pela plataforma.

### Mostrar somente em determinadas páginas

Inclua o script apenas nessas páginas ou controle sua inclusão pelo próprio site.

Os atributos `data-include` e `data-exclude` **não estão implementados**. Não os use como filtro.

## 5. Como funciona para o visitante

1. O visitante clica no botão flutuante.
2. O widget carrega a entrada do atendimento.
3. Conforme a configuração do cliente, identifica-se com CPF/CNPJ ou escolhe continuar com o nome.
4. Ao consultar CPF/CNPJ, pode selecionar um atendimento existente ou iniciar uma nova conversa, conforme as regras disponíveis.
5. A seleção e, quando exigida, a senha do atendimento aparecem no próprio card do widget, sem uma tela intermediária de entrada.
6. Após autenticar, a conversa abre dentro do widget.

A consulta, sozinha, não autentica todos os atendimentos listados. A entrada em um atendimento existente depende da seleção do visitante.

Se já houver uma conversa autenticada em andamento, a tela inicial oferece o retorno a ela, em vez de liberar outra abertura por esse fluxo.

### Controles do cabeçalho

- **Abrir em nova aba:** abre a rota atual do atendimento fora do widget.
- **Expandir/restaurar:** aumenta ou restaura a janela no desktop.
- **X:** fecha o painel, sem finalizar a conversa nem sair da sessão.

Abrir em outra aba pode exigir nova autenticação, dependendo das políticas de armazenamento do navegador.

### Desktop e celular

| Largura da janela do site | Comportamento |
| --- | --- |
| Até **420px**, inclusive | Tela cheia; fecha pelo X superior |
| Acima de **420px** | Janela flutuante, ajustada ao espaço disponível |

Na janela flutuante, o tamanho padrão máximo é **378 × 672px**, em proporção 9:16. Expandir aumenta as dimensões em até 30%, limitado ao espaço da tela.

No modo tela cheia, o botão flutuante e a ação de expandir ficam ocultos enquanto o painel está aberto. O widget acompanha a área visível e o teclado virtual, respeitando as áreas de segurança do dispositivo. Ao fechar, o botão reaparece e a rolagem do site é liberada.

## 6. Notificações de novas mensagens

Quando chega uma mensagem com o painel fechado ou a aba em segundo plano, o widget pode:

- Mostrar uma bolinha vermelha no botão.
- Exibir o aviso clicável **“Você recebeu uma nova mensagem. Abrir conversa”** quando o painel está fechado.
- Atualizar o título da aba, por exemplo: **`(3 novas mensagens) Nome do site`**.
- Tocar um som curto e discreto, quando o navegador permitir.

| Ação | Resultado |
| --- | --- |
| Clicar no aviso ou no botão e abrir o chat com a aba visível | Limpa os avisos e zera o contador salvo |
| Fechar apenas o aviso pelo X dele | Esconde o popup, mas mantém a bolinha e a contagem |
| Dar F5 com mensagens não visualizadas | Restaura os avisos e a contagem, sem repetir o som |
| Receber mensagens com o chat aberto e a aba visível | Não gera esses alertas de pendência |

A contagem é de eventos de mensagens recebidos pelo widget enquanto a conversa não estava visível. Não é uma consulta ao total histórico de mensagens não lidas do servidor.

### Sobre o som

- É preparado após uma interação real com o site, como clicar no botão do widget ou usar o teclado.
- Uma interação apenas dentro do iframe não desbloqueia o áudio da página hospedeira.
- O navegador pode bloquear ou suspender o áudio, especialmente em segundo plano.
- Há um intervalo mínimo de **1,5 segundo** entre sons para evitar uma sequência de toques.
- Desativar o som não desativa os avisos visuais.

Para desativar:

```html
<script
  src="/atendai/script.js"
  data-slug="minha-empresa"
  data-notification-sound="false"
  async
></script>
```

**Não é push:** os avisos dependem de o site e a conexão do chat estarem ativos. Não chegam com o navegador ou o site fechado. Não é solicitada permissão de notificação do sistema.

## 7. O que permanece após F5

O widget guarda no `localStorage` do site:

- A rota reconhecida do atendimento.
- O estado aberto ou fechado do painel.
- A quantidade de mensagens não visualizadas.
- Até 500 IDs opacos de mensagens para evitar alertas duplicados após recarregar.

A chave utilizada é:

```text
@atendai-widget:v1:<origem-do-chat>:<slug>
```

Isso separa os dados por site hospedeiro, origem do chat e cliente.

- Painel aberto: restaura a rota e abre novamente, sem roubar o foco.
- Painel fechado em uma rota de conversa `/chat`: restaura o iframe em segundo plano para continuar recebendo avisos.
- Entrada fechada, sem conversa: mantém o carregamento sob demanda.
- Expansão da janela: não é persistida; após F5, retorna ao tamanho padrão.

O host **não copia JWT, senha, nome, CPF, conteúdo de mensagens, query de convite ou hash** para esse estado. A autenticação permanece sob responsabilidade do chat externo, na origem do iframe.

Se o navegador bloquear o armazenamento ou o usuário limpar os dados do site, a restauração pode não funcionar. O widget continua operando em memória, mas pode ser necessário autenticar novamente.

## 8. Segurança e permissões

- Use **HTTPS em produção** no site, no script e no chat.
- Não use credenciais ou tokens fixos no código de integração.
- Para câmera e microfone, o navegador pode pedir autorização e exigir uma política de permissões compatível.
- Se o site usa **Content Security Policy (CSP)**, permita a origem do script em `script-src`, a origem do chat em `frame-src` e os estilos inseridos pelo widget em `style-src`, conforme a política adotada. O widget atual injeta estilos inline; uma CSP estrita pode exigir adaptação técnica.
- A hospedagem do chat precisa permitir incorporação pelo site. Cabeçalhos `X-Frame-Options` e `Content-Security-Policy: frame-ancestors` podem impedir a abertura.
- As requisições da API acontecem dentro do chat; instalar o widget não exige, por si só, liberar a API por CORS para o site hospedeiro.
- Bloqueios de armazenamento de terceiros podem afetar a sessão. Use a opção de abrir em nova aba quando necessário.

O script isola sua interface por Shadow DOM e o chat é carregado em iframe. Para alterar o conteúdo interno, use as configurações do cliente ou o projeto do chat externo; CSS comum do site não personaliza o interior do chat.

## 9. Teste antes de publicar

- [ ] A URL do script entrega o arquivo JavaScript correto.
- [ ] O slug e a origem do chat são os do ambiente desejado.
- [ ] O botão aparece e abre a entrada.
- [ ] O fluxo de identificação e envio de mensagem funciona.
- [ ] Fechar e reabrir mantém a conversa.
- [ ] F5 mantém a rota e os avisos pendentes.
- [ ] Clicar na notificação abre a conversa, limpa os avisos e mantém o contador zerado após outro F5.
- [ ] Em até 420px, abre em tela cheia; acima disso, permanece flutuante.
- [ ] O teclado do celular não encobre o compositor.
- [ ] Abrir em nova aba funciona.
- [ ] O navegador não apresenta bloqueios de script, iframe ou CSP no console.

Para testar uma cópia local do widget, sirva a pasta do projeto por HTTP, por exemplo:

```sh
python3 -m http.server 8080
```

Esse comando deve ser executado dentro da pasta `widget-meet.atendai.chat`. Acesse `http://localhost:8080` para abrir a demonstração. Para testar as alterações locais no seu próprio site, aponte o `src` diretamente para o arquivo local servido; confira a URL do snippet gerado pela demonstração antes de usá-lo, pois ele pode apontar para uma revisão publicada na CDN.

## 10. Problemas comuns

| Problema | O que verificar |
| --- | --- |
| O botão não aparece | URL do script, `data-slug`, console, CSP e bloqueadores de conteúdo |
| Aparece o cliente errado | Slug informado e `data-base-url` |
| Fica em “Carregando chat…” | Disponibilidade do chat/API, bloqueio de iframe, CSP e rede; após 20 segundos, há a opção “Tentar novamente” |
| Alterei o script, mas nada mudou | Cache do navegador/CDN e revisão usada no `src` |
| O som não toca | Interação prévia com o site, aba silenciada, `data-notification-sound`, permissões e suspensão de áudio do navegador |
| Os avisos somem após F5 | Uso da versão atual, acesso ao `localStorage` e manutenção do mesmo site, slug e origem do chat |
| A sessão não é restaurada | Dados do site removidos, sessão expirada ou armazenamento de terceiros bloqueado |
| O celular não abre em tela cheia | Largura real da janela acima de 420px ou ausência da meta tag `viewport` |
| A cor interna não acompanha `data-color` | Esse atributo altera apenas o botão; a identidade interna vem das configurações do cliente |
| O chat aparece em páginas indesejadas | Controle em quais páginas o site inclui o script; não há filtros `data-include`/`data-exclude` |

## 11. Atualizar a integração

1. Publique o `script.js` atualizado na hospedagem ou CDN escolhida.
2. Se usar URL por revisão/commit, altere o `src` para a nova revisão.
3. Se mantiver a mesma URL, renove ou invalide o cache conforme a hospedagem.
4. Confirme no navegador o conteúdo efetivamente entregue.
5. Repita o checklist de instalação.

Alterar apenas os atributos de configuração não exige modificar o arquivo JavaScript. Já as melhorias feitas no código local só chegam aos visitantes depois de publicar o arquivo correspondente.
