(function () {
  "use strict";
  var form = document.getElementById("settings");
  var snippet = document.getElementById("snippet");
  var status = document.getElementById("status");
  function escape(value) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function update() {
    var slug = document.getElementById("slug").value.trim();
    var title = document.getElementById("title").value.trim();
    var color = document.getElementById("color").value;
    var position = document.getElementById("position").value;
    var theme = document.getElementById("theme").value;
    snippet.textContent = '<script\n  src="https://raw.githack.com/OpenitDev/widget-meet.atendai.chat/v1.0.3/script.js"\n  data-slug="' + escape(slug) + '"\n  data-title="' + escape(title) + '"\n  data-color="' + color + '"\n  data-position="' + position + '"\n  data-theme="' + theme + '"\n  defer\n></script>';
    document.getElementById("direct").href = "https://meet.atendai.chat/" + encodeURIComponent(slug) + "/nova-conversa";
    document.getElementById("atendai-widget")?.remove();
    document.getElementById("widget-loader")?.remove();
    var loader = document.createElement("script");
    loader.id = "widget-loader";
    loader.src = "./script.js";
    loader.dataset.slug = slug;
    loader.dataset.title = title;
    loader.dataset.color = color;
    loader.dataset.position = position;
    loader.dataset.theme = theme;
    loader.dataset.baseUrl = "https://meet.atendai.chat";
    document.body.appendChild(loader);
    status.textContent = "";
  }
  form.addEventListener("submit", function (event) { event.preventDefault(); update(); });
  document.getElementById("copy").addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(snippet.textContent);
      status.textContent = "Código copiado!";
    } catch {
      status.textContent = "Selecione o código acima e copie manualmente.";
    }
  });
  update();
})();
