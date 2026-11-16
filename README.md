# Widget incorporável

Página separada de instalação e demonstração: `index.html`.
Projeto independente, sem build ou dependências. Repositório: https://github.com/OpenitDev/widget-meet.atendai.chat. Abra index.html por um servidor estático para testar.

```html
<script src="https://raw.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.0/script.js" data-slug="dev" defer></script>
```

Opções: `data-title` (título), `data-color` (hexadecimal com seis dígitos), `data-position` (`left` ou `right`) e `data-base-url` (origem do chat, quando o script estiver em uma CDN diferente). Por padrão, o chat usa https://meet.atendai.chat e a rota `/:slug/nova-conversa`.

O widget usa Shadow DOM para isolar os estilos e carrega o iframe apenas no primeiro clique. Fechar preserva o iframe e a conversa durante a navegação atual. O link no cabeçalho permite abrir o chat em outra aba.

## Hospedagem

Não é necessário um serviço de CDN separado: o script pode ser servido pelo próprio domínio do chat ou por uma CDN de arquivos estáticos. O domínio do chat já está configurado por padrão, mesmo quando o script é servido pelo raw.githack.com.

O site que incorpora deve permitir a origem do script em `script-src`, os estilos do widget em `style-src` e `https://meet.atendai.chat` em `frame-src`, caso utilize CSP. O domínio do chat deve permitir incorporação: `X-Frame-Options: SAMEORIGIN/DENY` ou CSP `frame-ancestors` restritiva no proxy impedem o iframe. Não é necessário liberar CORS na API para a origem do site: as chamadas continuam dentro do iframe do chat.

Microfone e câmera dependem de HTTPS e da política de permissões do site hospedeiro. Navegadores podem restringir armazenamento e notificações em iframes de terceiros; nesses casos, use o link para abrir em outra aba. Validar login e envio de mensagens em um domínio externo antes de distribuir para clientes.

## Publicar no raw.githack.com

O repositório precisa ser público. Envie os arquivos, crie a tag v1.0.0 e publique a tag. A URL de instalação está fixada nessa versão para evitar mudanças inesperadas nos sites dos clientes. Para uma atualização, publique outra tag e atualize a URL de instalação.

Para testar localmente: python -m http.server 8080 e abra http://localhost:8080.

## Escolher em quais páginas o widget aparece

Atualmente, o widget aparece em todas as páginas que carregam o script. Se ele estiver no HTML principal de uma aplicação React, aparecerá em todas as rotas. Para sites com páginas HTML independentes, inclua o script somente nas páginas desejadas.

### Proposta de filtros por rota (ainda não implementada)

Os atributos `data-include` e `data-exclude` abaixo são uma proposta de configuração. A versão `v1.0.0` não interpreta esses atributos: copiar este exemplo hoje não limita a exibição do widget.

```html
<script
  src="https://raw.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.0/script.js"
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

Quando os filtros forem implementados, será necessário publicar uma nova versão e atualizar a URL do script. A tag `v1.0.0` continuará sem esse recurso.