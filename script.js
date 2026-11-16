(function () {
  "use strict";
  var script = document.currentScript;
  if (!script || document.getElementById("atendai-widget")) return;
  var slug = (script.dataset.slug || "").trim();
  if (!slug || slug === "." || slug === ".." || /[/?#\\]/.test(slug)) {
    console.error("Atendai: informe um data-slug válido no script.");
    return;
  }
  var base = new URL(script.dataset.baseUrl || "https://meet.atendai.chat");
  if (!/^https?:$/.test(base.protocol)) return;
  var url = new URL("/" + encodeURIComponent(slug) + "/nova-conversa", base).href;
  var title = script.dataset.title || "Fale com a gente";
  var color = /^#[0-9a-f]{6}$/i.test(script.dataset.color || "") ? script.dataset.color : "#008252";
  var left = script.dataset.position === "left";
  var theme = ["light", "dark"].includes(script.dataset.theme) ? script.dataset.theme : "auto";

  function mount() {
    if (document.getElementById("atendai-widget")) return;
    var host = document.createElement("div");
    host.id = "atendai-widget";
    host.dataset.theme = theme;
    host.style.cssText = "all:initial!important;position:fixed!important;bottom:0!important;" + (left ? "left" : "right") + ":0!important;z-index:2147483647!important;";
    var root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = ":host{font-family:system-ui,sans-serif;color:#172033}*{box-sizing:border-box}button,a{-webkit-tap-highlight-color:transparent}button{cursor:pointer;font:inherit}button:focus-visible,a:focus-visible{outline:3px solid #60a5fa;outline-offset:3px}.launcher{position:absolute;bottom:max(20px,env(safe-area-inset-bottom));" + (left ? "left" : "right") + ":20px;width:60px;height:60px;border:0;border-radius:50%;background:" + color + ";color:white;box-shadow:0 6px 24px #0003;display:grid;place-items:center}.launcher svg{width:28px;height:28px}.panel{position:absolute;bottom:92px;" + (left ? "left" : "right") + ":20px;width:min(400px,calc(100vw - 40px));height:min(680px,calc(100dvh - 112px));background:" + color + ";border-radius:18px;box-shadow:0 12px 48px #0003;overflow:hidden;display:flex;flex-direction:column}.panel[hidden]{display:none}.panel-controls{display:flex;align-items:center;justify-content:space-between;flex-shrink:0;height:44px;padding:8px}.panel-control{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--control-color);box-shadow:none;transition:color .15s ease;text-decoration:none;font-size:24px;line-height:1;padding:0}.panel-control:hover{color:var(--control-hover)}.panel-control svg{width:18px;height:18px}iframe{display:block;border:0;width:100%;flex:1;min-height:0;background:#fff}@media(max-width:480px){.panel{width:calc(100vw - 16px);" + (left ? "left" : "right") + ":8px;bottom:88px;height:calc(100dvh - 104px);border-radius:14px}}";
    // Dimensões padrão: painel mais largo em HD e proporção 9:16 em telas maiores.
    style.textContent += `
      :host { --control-color: #334155; --control-hover: #ffffff; }
      :host([data-theme="dark"]) { --control-color: #e2e8f0; --control-hover: #6ee7b7; }
      @media (prefers-color-scheme: dark) {
        :host([data-theme="auto"]) { --control-color: #e2e8f0; --control-hover: #6ee7b7; }
      }
      .panel {
        width: min(480px, calc(100vw - 40px), calc((100dvh - 112px) * 3 / 4));
        min-width: 350px;
        height: auto;
        min-height: 0;
        aspect-ratio: 3 / 4;
      }
      @media (min-width: 1600px) {
        .panel {
          width: min(480px, calc(100vw - 40px), calc((100dvh - 112px) * 9 / 16));
          aspect-ratio: 9 / 16;
        }
      }
    `;
    style.textContent += "@media(max-width:480px){.panel{width:calc(100vw - 16px);min-width:min(350px,calc(100vw - 16px));height:calc(100dvh - 104px);max-height:800px;aspect-ratio:auto}}";
    root.appendChild(style);
    var panel = document.createElement("section");
    panel.id = "chat-panel";
    panel.className = "panel";
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", title);



    var external = document.createElement("a");
    external.href = url;
    external.target = "_blank";
    external.rel = "noopener noreferrer";
    external.className = "panel-control external";
    external.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M15 3h6v6M21 3l-9 9\"/><path d=\"M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5\"/></svg>";
    external.setAttribute("aria-label", "Abrir em nova aba");
    external.title = "Abrir em nova aba";
    var close = document.createElement("button");
    close.type = "button";
    close.className = "panel-control close";
    close.title = "Fechar chat";
    close.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m6 6 12 12M18 6 6 18\"/></svg>";
    close.setAttribute("aria-label", "Fechar chat");
    var controls = document.createElement("div");
    controls.className = "panel-controls";
    controls.append(external, close);
    panel.appendChild(controls);

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "launcher";
    launcher.setAttribute("aria-label", title);
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", panel.id);
    launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>';
    var frame;
    function toggle(open) {
      if (open && !frame) {
        frame = document.createElement("iframe");
        frame.title = title;
        frame.allow = "camera; microphone; fullscreen";
        frame.src = url;
        panel.appendChild(frame);
      }
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      if (open) close.focus();
      else launcher.focus();
    }
    launcher.addEventListener("click", function () { toggle(panel.hidden); });
    close.addEventListener("click", function () { toggle(false); });
    root.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) toggle(false);
    });
    root.append(panel, launcher);
    document.body.appendChild(host);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
})();
