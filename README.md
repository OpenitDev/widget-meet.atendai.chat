# Widget incorporável

Página separada de instalação e demonstração: `index.html`.
Projeto independente, sem build ou dependências. Repositório: https://github.com/OpenitDev/widget-meet.atendai.chat. Abra index.html por um servidor estático para testar.

```html
<script src="https://raw.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.2/script.js" data-slug="dev" defer></script>
```

Opções: `data-title` (título), `data-color` (hexadecimal com seis dígitos), `data-position` (`left` ou `right`) e `data-base-url` (origem do chat, quando o script estiver em uma CDN diferente). Por padrão, o chat usa https://meet.atendai.chat e a rota `/:slug/nova-conversa`.

O widget usa Shadow DOM para isolar os estilos e carrega o iframe apenas no primeiro clique. Fechar preserva o iframe e a conversa durante a navegação atual. O controle no canto superior direito permite abrir o chat em outra aba.

## Hospedagem

Não é necessário um serviço de CDN separado: o script pode ser servido pelo próprio domínio do chat ou por uma CDN de arquivos estáticos. O domínio do chat já está configurado por padrão, mesmo quando o script é servido pelo raw.githack.com.

O site que incorpora deve permitir a origem do script em `script-src`, os estilos do widget em `style-src` e `https://meet.atendai.chat` em `frame-src`, caso utilize CSP. O domínio do chat deve permitir incorporação: `X-Frame-Options: SAMEORIGIN/DENY` ou CSP `frame-ancestors` restritiva no proxy impedem o iframe. Não é necessário liberar CORS na API para a origem do site: as chamadas continuam dentro do iframe do chat.

Microfone e câmera dependem de HTTPS e da política de permissões do site hospedeiro. Navegadores podem restringir armazenamento e notificações em iframes de terceiros; nesses casos, use o link para abrir em outra aba. Validar login e envio de mensagens em um domínio externo antes de distribuir para clientes.

## Publicar no raw.githack.com

O repositório precisa ser público. Envie os arquivos, crie a tag v1.0.1 e publique a tag. A URL de instalação está fixada nessa versão para evitar mudanças inesperadas nos sites dos clientes. Para uma atualização, publique outra tag e atualize a URL de instalação.

Para testar localmente: python -m http.server 8080 e abra http://localhost:8080.

## Escolher em quais páginas o widget aparece

Atualmente, o widget aparece em todas as páginas que carregam o script. Se ele estiver no HTML principal de uma aplicação React, aparecerá em todas as rotas. Para sites com páginas HTML independentes, inclua o script somente nas páginas desejadas.

### Proposta de filtros por rota (ainda não implementada)

Os atributos `data-include` e `data-exclude` abaixo são uma proposta de configuração. A versão `v1.0.1` não interpreta esses atributos: copiar este exemplo hoje não limita a exibição do widget.

```html
<script
  src="https://raw.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.2/script.js"
  data-slug="dev"
  data-include="/contato,/produtos/*"
  data-exclude="/checkout/*"
  async
></script>
```

Comportamento previsto para uma futura implementação:

- `data-include`: caminhos permitidos, separados por vírgulas. Sem esse atributo, todas as páginas seriam permitidas.
- `data-exclude`: caminhos bloqueados, separados por vírgulas. Uma exclusão teria prioridade sobre uma inclusão.
- Um caminho como `/contato` corresponderia exatamente a essa página; `/produtos/*` corresponderia às páginas dentro de `/produtos/`.
- Os filtros considerariam o caminho da URL (`pathname`), sem parâmetros de consulta ou fragmentos.
- Em aplicações React e outras SPAs, a implementação precisaria acompanhar mudanças de rota sem recarregar a página para atualizar a visibilidade do botão.

No exemplo, o widget apareceria em `/contato` e nas páginas dentro de `/produtos/`. O filtro `/checkout/*` ilustra uma exclusão, embora essas páginas já estejam fora das inclusões desse exemplo.

Quando os filtros forem implementados, será necessário publicar uma nova versão e atualizar a URL do script. A tag `v1.0.1` continuará sem esse recurso.
## Personalizar o visual

### Pelo script de instalação

Estas opções já funcionam na versão `v1.0.1`:

```html
<script
  src="https://raw.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.2/script.js"
  data-slug="dev"
  data-title="Converse com nosso time"
  data-color="#16a34a"
  data-position="left"
  async
></script>
```

| Atributo | O que altera | Padrão |
| --- | --- | --- |
| `data-title` | Descrição acessível do painel, do botão e do iframe | `Fale com a gente` |
| `data-color` | Cor de fundo do botão flutuante | `#008252` |
| `data-position` | Lado em que o botão e o painel aparecem: `left` ou `right` | `right` |

A cor deve ser hexadecimal com seis dígitos, incluindo `#`. Por exemplo: `#16a34a`, `#7c3aed` ou `#111827`. Valores como `red`, `#fff` e `rgb(...)` não são aceitos; nesses casos, o widget usa a cor padrão. Escolha uma cor que mantenha o texto e o ícone brancos legíveis.

Desde a v1.0.2, o painel não exibe cabeçalho ou título visível; data-title define apenas as descrições acessíveis. O botão fechado mostra somente o ícone. As configurações são lidas quando o script executa; depois de editar os atributos no HTML, recarregue a página para ver o resultado.

Para testar sem editar o site, abra a página `index.html` deste repositório por um servidor estático: ela permite escolher título, cor e posição e copiar o código pronto.

### Tamanho, espaçamento, bordas e ícone

Essas opções ainda não têm atributos de configuração. Para alterá-las de forma permanente, edite `script.js` neste repositório:

| Trecho | O que personalizar |
| --- | --- |
| `.launcher` em `style.textContent` | Tamanho do botão (`60px`), distância das bordas, arredondamento e sombra |
| `.launcher svg` | Tamanho do ícone (`28px`) |
| `.panel` | Largura máxima (`480px`, com mínimo de `350px`), proporção responsiva (`3:4` ou `9:16`), distância inferior, bordas e sombra |
| `.panel-control`, `.close` e `.external` | Visual e posição dos controles de fechar e abrir em outra aba |
| `@media(max-width:480px)` | Dimensões e espaçamento do painel em celulares |
| `launcher.innerHTML` | SVG do ícone do botão |

Por exemplo, dentro de `style.textContent`, altere `width:60px;height:60px` em `.launcher` para `width:68px;height:68px` para aumentar o botão. Ajuste também a distância inferior de `.panel` para o painel não se sobrepor ao botão. Preserve os limites baseados na viewport e a área segura dos celulares.

O CSS interno fica em uma string JavaScript. Preserve as aspas, as concatenações e os trechos que usam `color` e `left` ao editar. Para conferir a sintaxe, execute `node --check script.js`.

### CSS do site e aparência do chat

O botão e o painel usam Shadow DOM: regras comuns do CSS do site, como `.launcher { ... }`, não alcançam seus elementos internos. A personalização permanente deve ser feita pelos atributos disponíveis ou no estilo interno de `script.js`. Não há suporte a um atributo `data-style` nesta versão.

O conteúdo da conversa é uma página separada, carregada em um iframe de `https://meet.atendai.chat`. Os estilos do widget alteram o botão e a moldura externa; para mudar cores, fontes ou componentes dentro da conversa, altere o projeto do chat externo (`wopen-chat-externo-frontend`).

### Publicar alterações de visual

Mudanças nos atributos de instalação não exigem publicar outra versão do widget. Mudanças em `script.js` exigem commit, push e uma nova tag (por exemplo, `v1.0.1`); depois, atualize a versão na URL de instalação dos sites. Não mova a tag `v1.0.1`, pois sites existentes usam essa versão fixa.

## Dimensões padrão a partir da v1.0.1

O painel usa largura mínima de 350px e máxima de 480px. Abaixo de 1600px de largura da viewport, usa proporção 3:4; a partir de 1600px, usa 9:16. O tamanho considera o espaço disponível na viewport. A largura mínima tem prioridade: em telas muito estreitas ou baixas, o painel pode ultrapassar a área disponível. A cor padrão é #008252 e continua configurável por data-color.

Esses estilos já fazem parte do script; não é necessário injetar CSS pelo site que o incorpora.


## Controles do painel — v1.0.2

O painel não possui faixa de cabeçalho. O botão X fica no canto superior esquerdo e o botão de abrir em outra aba no canto superior direito, sobre o conteúdo. Ambos possuem descrição acessível. O iframe ocupa toda a área do painel.
