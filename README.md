# Widget incorporável

Página separada de instalação e demonstração: `index.html`.
Projeto independente, sem build ou dependências. Repositório: https://github.com/OpenitDev/widget-meet.atendai.chat. Abra index.html por um servidor estático para testar.

```html
<script src="https://cdn.jsdelivr.net/gh/OpenitDev/widget-meet.atendai.chat@v1.0.0/script.js" data-slug="dev" defer></script>
```

Opções: `data-title` (título), `data-color` (hexadecimal com seis dígitos), `data-position` (`left` ou `right`) e `data-base-url` (origem do chat, quando o script estiver em uma CDN diferente). Por padrão, o chat usa https://meet.atendai.chat e a rota `/:slug/nova-conversa`.

O widget usa Shadow DOM para isolar os estilos e carrega o iframe apenas no primeiro clique. Fechar preserva o iframe e a conversa durante a navegação atual. O link no cabeçalho permite abrir o chat em outra aba.

## Hospedagem

Não é necessário um serviço de CDN separado: o script pode ser servido pelo próprio domínio do chat ou por uma CDN de arquivos estáticos. O domínio do chat já está configurado por padrão, mesmo quando o script é servido pelo jsDelivr.

O site que incorpora deve permitir a origem do script em `script-src`, os estilos do widget em `style-src` e `https://meet.atendai.chat` em `frame-src`, caso utilize CSP. O domínio do chat deve permitir incorporação: `X-Frame-Options: SAMEORIGIN/DENY` ou CSP `frame-ancestors` restritiva no proxy impedem o iframe. Não é necessário liberar CORS na API para a origem do site: as chamadas continuam dentro do iframe do chat.

Microfone e câmera dependem de HTTPS e da política de permissões do site hospedeiro. Navegadores podem restringir armazenamento e notificações em iframes de terceiros; nesses casos, use o link para abrir em outra aba. Validar login e envio de mensagens em um domínio externo antes de distribuir para clientes.

## Publicar no jsDelivr

O repositório precisa ser público. Envie os arquivos, crie a tag v1.0.0 e publique a tag. A URL de instalação está fixada nessa versão para evitar mudanças inesperadas nos sites dos clientes. Para uma atualização, publique outra tag e atualize a URL de instalação.

Para testar localmente: python -m http.server 8080 e abra http://localhost:8080.
