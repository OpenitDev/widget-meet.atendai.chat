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
  var url = new URL("/" + encodeURIComponent(slug) + "/nova-conversa", base);
  var storageKey = "@atendai-widget:v1:" + url.origin + ":" + slug;
  // Persiste rota e metadados de avisos, nunca conteúdo, documentos ou credenciais.
  function getPersistablePath(value) {
    if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[?#\\\\]/.test(value)) return null;
    var segments = value.split("/");
    if (segments[1] !== encodeURIComponent(slug)) return null;
    if (segments.length === 2) return value;
    if (segments.length === 3 && segments[2] === "nova-conversa") return value;
    if ((segments.length !== 3 && segments.length !== 4) || !segments[2]) return null;
    try {
      var id = decodeURIComponent(segments[2]);
      if (id === "." || id === ".." || /[/?#\\\\]/.test(id) || ["404", "nova-conversa"].includes(id)) return null;
    } catch (_) { return null; }
    if (segments.length === 4 && !["chat", "entrar", "nova-conversa"].includes(segments[3])) return null;
    return value;
  }
  var savedState = null;
  try {
    var stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored && stored.version === 1 && typeof stored.open === "boolean" && getPersistablePath(stored.path)) savedState = stored;
  } catch (_) { /* Storage bloqueado ou inválido não impede o uso do widget. */ }
  var currentPath = savedState ? savedState.path : url.pathname;
  var embeddedUrl = new URL(currentPath, url.origin);
  embeddedUrl.searchParams.set("embed", "widget");
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
    style.textContent = `
      :host { font-family: system-ui, sans-serif; color: #27272a; --panel-bg: #fff; --header-bg: #f4f4f5; --control-color: #71717a; --control-hover: #27272a; }
      :host([data-theme="dark"]) { --panel-bg: #18181b; --header-bg: #242426; --control-color: #d4d4d8; --control-hover: #fff; }
      @media (prefers-color-scheme: dark) {
        :host([data-theme="auto"]) { --panel-bg: #18181b; --header-bg: #242426; --control-color: #d4d4d8; --control-hover: #fff; }
      }
      * { box-sizing: border-box; font-family: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
      button, a { -webkit-tap-highlight-color: transparent; }
      button { cursor: pointer; font: inherit; }
      button:focus-visible, a:focus-visible { outline: 3px solid #60a5fa; outline-offset: 2px; }
      .launcher {
        position: absolute; bottom: max(20px, env(safe-area-inset-bottom)); ${left ? "left" : "right"}: 20px;
        display: grid; place-items: center; width: 60px; height: 60px; padding: 0;
        border: 0; border-radius: 50%; background: ${color}; color: white;
        box-shadow: 0 6px 24px #0003; transition: box-shadow .2s ease, transform .2s ease;
      }
      .launcher:hover { box-shadow: 0 8px 28px #0004; transform: translateY(-2px); }
      .launcher:active { transform: scale(.96); }
      .launcher svg { grid-area: 1 / 1; width: 28px; height: 28px; transition: opacity .18s ease, transform .24s ease; }
      .launcher-close { opacity: 0; transform: rotate(-70deg) scale(.7); }
      .launcher[aria-expanded="true"] .launcher-chat { opacity: 0; transform: rotate(35deg) scale(.7); }
      .launcher[aria-expanded="true"] .launcher-close { opacity: 1; transform: rotate(0) scale(1); }
      .panel {
        position: absolute; bottom: max(92px, calc(env(safe-area-inset-bottom) + 92px)); ${left ? "left" : "right"}: 20px;
        display: flex; flex-direction: column;
        width: min(378px, calc((100vw - 40px) * .9), calc((100dvh - 112px - env(safe-area-inset-bottom)) * 9 / 16 * .9));
        aspect-ratio: 9 / 16; min-height: 0; overflow: hidden;
        background: var(--panel-bg); border: 1px solid #80808026; border-radius: 20px;
        box-shadow: 0 16px 56px #0003, 0 2px 8px #0001;
        animation: panel-in .2s ease-out; transform-origin: bottom ${left ? "left" : "right"};
      }
      .panel[data-expanded="true"] {
        width: min(491.4px, calc(100vw - 40px), calc((100dvh - 112px - env(safe-area-inset-bottom)) * 9 / 16));
      }
      .panel[hidden] { display: none; }
      .panel[data-loading="true"] { --panel-bg: #f1f2f3; --header-bg: #e9ebed; --control-color: #71717a; --control-hover: #3f3f46; }
      .chat-loading { position: absolute; inset: var(--controls-height, 40px) 0 0; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; background: #f1f2f3; color: #52525b; text-align: center; }
      .chat-loading[hidden], .chat-loading-retry[hidden] { display: none; }
      .chat-loading-spinner { width: 26px; height: 26px; border: 2px solid #d4d4d8; border-top-color: #71717a; border-radius: 50%; animation: loading-spin .8s linear infinite; }
      .chat-loading-spinner[hidden] { display: none; }
      .chat-loading-text { margin: 0; font-size: 13px; line-height: 1.5; font-weight: 500; }
      .chat-loading-retry { padding: 8px 14px; border: 1px solid #d4d4d8; border-radius: 10px; background: #fff; color: #3f3f46; font-size: 13px; }
      @keyframes loading-spin { to { transform: rotate(360deg); } }
      .panel[data-loading="true"] iframe { opacity: 0; pointer-events: none; }
      .panel-controls {
        display: grid; grid-template-columns: 64px minmax(0, 1fr) 64px; align-items: center; flex-shrink: 0;
        height: 40px; padding: 4px 8px; background: var(--header-bg, var(--panel-bg));
      }
      .panel-actions { display: flex; align-items: center; justify-content: flex-end; }
      .expand .collapse-icon { display: none; }
      .expand[aria-pressed="true"] .expand-icon { display: none; }
      .expand[aria-pressed="true"] .collapse-icon { display: block; }
      .panel-control {
        display: grid; place-items: center; width: 32px; height: 32px; padding: 0;
        border: 0; border-radius: 10px; background: transparent; color: var(--control-color);
        transition: color .15s ease, background .15s ease; text-decoration: none;
      }
      .panel-control:hover { color: var(--control-hover); background: #80808014; }
      .panel-control svg { width: 17px; height: 17px; }
      .panel-title { flex: 1; min-width: 0; margin: 0 8px; overflow: hidden; color: var(--control-hover); font-size: 13px; font-weight: 600; line-height: 1.4; letter-spacing: -.15px; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
      .unread-dot { position: absolute; top: 1px; right: 1px; width: 17px; height: 17px; border: 3px solid white; border-radius: 50%; background: #ef4444; }
      .unread-dot[hidden], .message-preview[hidden] { display: none; }
      .message-preview { position: absolute; bottom: 92px; ${left ? "left" : "right"}: 20px; width: min(260px, calc(100vw - 40px)); padding: 16px 36px 16px 16px; border: 1px solid #80808026; border-radius: 16px; background: var(--panel-bg); color: var(--control-hover); box-shadow: 0 8px 32px #0003; }
      .message-preview-open { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font-size: 14px; font-weight: 500; line-height: 1.55; letter-spacing: -.1px; text-align: left; }
      .message-preview-close { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border: 0; border-radius: 6px; background: transparent; color: inherit; }
      iframe { display: block; border: 0; width: 100%; flex: 1; min-height: 0; background: var(--panel-bg); transition: opacity .2s ease; }

      @media (max-width: 420px) {
        .panel, .panel[data-expanded="true"] {
          position: fixed; top: var(--mobile-top, 0px); left: var(--mobile-left, 0px); right: auto; bottom: auto;
          width: var(--mobile-width, 100vw); height: var(--mobile-height, 100dvh);
          aspect-ratio: auto; border: 0; border-radius: 0; box-shadow: none; animation: none;
          --controls-height: calc(48px + env(safe-area-inset-top));
        }
        .panel-controls {
          height: var(--controls-height); grid-template-columns: 44px minmax(0, 1fr) 44px;
          padding: env(safe-area-inset-top) max(8px, env(safe-area-inset-right)) 0 max(8px, env(safe-area-inset-left));
        }
        .panel-control { width: 44px; height: 44px; }
        .expand, .launcher[aria-expanded="true"] { display: none; }
      }
      @keyframes panel-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) {
        .launcher, .launcher svg, .panel-control, iframe { transition: none; }
        .panel, .chat-loading-spinner { animation: none; }
      }
    `;
    root.appendChild(style);
    var panel = document.createElement("section");
    panel.id = "chat-panel";
    panel.className = "panel";
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", title);

    var external = document.createElement("a");
    external.href = new URL(currentPath, url.origin).href;
    external.target = "_blank";
    external.rel = "noopener noreferrer";
    external.className = "panel-control external";
    external.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M21 3l-9 9"/><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg>';
    external.setAttribute("aria-label", "Abrir conversa em nova aba");
    external.title = "Abrir conversa em nova aba";
    var close = document.createElement("button");
    close.type = "button";
    close.className = "panel-control close";
    close.title = "Fechar chat";
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    close.setAttribute("aria-label", "Fechar chat");
    var controls = document.createElement("div");
    controls.className = "panel-controls";
    var panelTitle = document.createElement("span");
    panelTitle.className = "panel-title";
    panelTitle.textContent = title;
    var expand = document.createElement("button");
    expand.type = "button";
    expand.className = "panel-control expand";
    expand.title = "Expandir chat";
    expand.setAttribute("aria-label", "Expandir chat");
    expand.setAttribute("aria-pressed", "false");
    expand.setAttribute("aria-controls", panel.id);
    expand.innerHTML = '<svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg><svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/></svg>';
    expand.addEventListener("click", function () {
      var expanded = panel.dataset.expanded !== "true";
      panel.dataset.expanded = String(expanded);
      expand.setAttribute("aria-pressed", String(expanded));
      expand.title = expanded ? "Restaurar tamanho do chat" : "Expandir chat";
      expand.setAttribute("aria-label", expand.title);
    });
    var actions = document.createElement("div");
    actions.className = "panel-actions";
    actions.append(expand, close);
    controls.append(external, panelTitle, actions);
    panel.appendChild(controls);
    var loading = document.createElement("div");
    loading.className = "chat-loading";
    loading.hidden = true;
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    var spinner = document.createElement("span");
    spinner.className = "chat-loading-spinner";
    spinner.setAttribute("aria-hidden", "true");
    var loadingText = document.createElement("p");
    loadingText.className = "chat-loading-text";
    var retry = document.createElement("button");
    retry.className = "chat-loading-retry";
    retry.type = "button";
    retry.hidden = true;
    retry.textContent = "Tentar novamente";
    loading.append(spinner, loadingText, retry);
    panel.appendChild(loading);

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "launcher";
    launcher.setAttribute("aria-label", title);
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", panel.id);
    launcher.innerHTML = '<svg class="launcher-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg><svg class="launcher-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    var unreadDot = document.createElement("span");
    unreadDot.className = "unread-dot";
    unreadDot.hidden = true;
    unreadDot.setAttribute("aria-hidden", "true");
    launcher.appendChild(unreadDot);
    var preview = document.createElement("div");
    preview.className = "message-preview";
    preview.hidden = true;
    var previewOpen = document.createElement("button");
    previewOpen.type = "button";
    previewOpen.className = "message-preview-open";
    previewOpen.textContent = "Você recebeu uma nova mensagem. Abrir conversa";
    var previewClose = document.createElement("button");
    previewClose.type = "button";
    previewClose.className = "message-preview-close";
    previewClose.textContent = "×";
    previewClose.setAttribute("aria-label", "Dispensar aviso de nova mensagem");
    var live = document.createElement("span");
    live.setAttribute("role", "status");
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)";
    preview.append(previewOpen, previewClose);
    var frame;
    var loadingTimer;
    function startLoading() {
      clearTimeout(loadingTimer);
      panel.dataset.loading = "true";
      panel.setAttribute("aria-busy", "true");
      loading.hidden = false;
      spinner.hidden = false;
      retry.hidden = true;
      loadingText.textContent = "Carregando chat…";
      loadingTimer = setTimeout(function () {
        if (!host.isConnected) return;
        panel.setAttribute("aria-busy", "false");
        spinner.hidden = true;
        loadingText.textContent = "O chat está demorando a responder.";
        retry.hidden = false;
      }, 20000);
    }
    function finishLoading() {
      clearTimeout(loadingTimer);
      panel.dataset.loading = "false";
      panel.setAttribute("aria-busy", "false");
      loading.hidden = true;
    }
    var savedMessageIds = savedState && Array.isArray(savedState.receivedMessageIds)
  ? savedState.receivedMessageIds.filter(function (id) { return typeof id === "string" && id.length > 0 && id.length <= 256; }).slice(-500) : [];
var receivedMessages = new Set(savedMessageIds);
var unreadCount = savedState && Number.isSafeInteger(savedState.unreadCount) && savedState.unreadCount >= 0 ? savedState.unreadCount : 0;
    var originalTitle = document.title;
    var notificationTitle = null;
    function updateNotificationTitle() {
      if (notificationTitle !== null && document.title !== notificationTitle) originalTitle = document.title;
      if (!unreadCount) {
        if (notificationTitle !== null && document.title === notificationTitle) document.title = originalTitle;
        notificationTitle = null;
        return;
      }
      if (notificationTitle === null) originalTitle = document.title;
      notificationTitle = "(" + unreadCount + (unreadCount === 1 ? " nova mensagem)" : " novas mensagens)") + (originalTitle ? " " + originalTitle : "");
      if (document.title !== notificationTitle) document.title = notificationTitle;
    }
    // Preserva títulos atualizados pelo site hospedeiro enquanto há mensagens pendentes.
    var titleObserver = new MutationObserver(function () {
      if (!host.isConnected) { titleObserver.disconnect(); return; }
      if (unreadCount && document.title !== notificationTitle) updateNotificationTitle();
    });
    if (document.head) titleObserver.observe(document.head, { subtree: true, childList: true, characterData: true });

    var audioContext = null;
    var lastNotificationSound = 0;
    var notificationSoundEnabled = script.dataset.notificationSound !== "false";
    function unlockNotificationSound(event) {
      if (!event.isTrusted || !notificationSoundEnabled || !host.isConnected) return;
      try {
        var Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return;
        if (!audioContext) audioContext = new Context();
        if (audioContext.state === "suspended") audioContext.resume().catch(function () {});
      } catch (_) { /* Bloqueio de áudio não deve impedir o alerta visual. */ }
    }
    document.addEventListener("pointerdown", unlockNotificationSound, true);
    document.addEventListener("keydown", unlockNotificationSound, true);
    function playNotificationSound() {
      if (!audioContext || audioContext.state !== "running" || Date.now() - lastNotificationSound < 1500) return;
      try {
        var start = audioContext.currentTime;
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, start);
        oscillator.frequency.setValueAtTime(880, start + 0.12);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(start);
        oscillator.stop(start + 0.32);
        lastNotificationSound = Date.now();
      } catch (_) { /* Navegadores podem suspender o áudio de abas em segundo plano. */ }
    }
    function persistState() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          version: 1, path: currentPath, open: !panel.hidden,
          unreadCount: unreadCount, receivedMessageIds: Array.from(receivedMessages),
        }));
      } catch (_) { /* Mantém a conversa em memória quando o storage não está disponível. */ }
    }
    function updateVisibility() {
      var visible = !panel.hidden && document.visibilityState === "visible";
      if (visible) {
        unreadDot.hidden = true;
        preview.hidden = true;
        if (unreadCount) {
          unreadCount = 0;
          persistState();
        }
        updateNotificationTitle();
        live.textContent = "";
        launcher.setAttribute("aria-label", "Fechar chat");
      }
      if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: "atendai:widget:visibility", visible: visible }, url.origin);
    }
    function initializeFrame() {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: "atendai:widget:init" }, url.origin);
        updateVisibility();
      }
    }
    // O iframe pode navegar entre origens: não confiar só no conteúdo da mensagem.
    window.addEventListener("message", function (event) {
      if (!host.isConnected || !frame || event.source !== frame.contentWindow || event.origin !== url.origin) return;
      var data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "atendai:widget:ready") {
        initializeFrame();
        return;
      }
      if (data.type === "atendai:widget:incoming") {
        if (typeof data.messageId !== "string" || !data.messageId || data.messageId.length > 256 || receivedMessages.has(data.messageId)) return;
        receivedMessages.add(data.messageId);
        if (receivedMessages.size > 500) receivedMessages.delete(receivedMessages.values().next().value);
        if (panel.hidden || document.visibilityState !== "visible") {
          unreadDot.hidden = false;
          preview.hidden = !panel.hidden;
          unreadCount = Math.min(unreadCount + 1, Number.MAX_SAFE_INTEGER);
          updateNotificationTitle();
          playNotificationSound();
          live.textContent = "Você recebeu uma nova mensagem no chat.";
          launcher.setAttribute("aria-label", title + " — nova mensagem");
        }
        persistState();
        return;
      }
      if (data.type !== "atendai:widget:state" || typeof data.url !== "string") return;
      try {
        var current = new URL(data.url);
        if (current.origin !== url.origin || current.username || current.password || current.pathname.split("/")[1] !== encodeURIComponent(slug)) return;
        current.searchParams.delete("embed");
        external.href = current.href;
        var nextPath = getPersistablePath(current.pathname);
        if (nextPath) {
          currentPath = nextPath;
          persistState();
        }
        if (typeof data.title === "string" && data.title.trim()) {
          panelTitle.textContent = data.title.trim().slice(0, 120);
          panelTitle.title = panelTitle.textContent;
        }
        if (data.theme === "dark" || data.theme === "light") host.dataset.theme = data.theme;
        if (data.loading === true) {
          if (panel.dataset.loading !== "true") startLoading();
        } else {
          finishLoading();
        }
        // A cor do tenant pertence ao iframe; moldura e controles externos permanecem neutros.
      } catch (_) { /* Ignora URLs inválidas enviadas ao host. */ }
    });
    var mobileLayout = window.matchMedia("(max-width: 420px)");
    var scrollStyles = null;
    function updateMobileLayout() {
      if (!host.isConnected) return;
      var viewport = window.visualViewport;
      host.style.setProperty("--mobile-top", (viewport ? viewport.offsetTop : 0) + "px");
      host.style.setProperty("--mobile-left", (viewport ? viewport.offsetLeft : 0) + "px");
      host.style.setProperty("--mobile-width", (viewport ? viewport.width : window.innerWidth) + "px");
      host.style.setProperty("--mobile-height", (viewport ? viewport.height : window.innerHeight) + "px");
      var lockScroll = mobileLayout.matches && !panel.hidden;
      if (lockScroll && !scrollStyles) {
        scrollStyles = [document.documentElement, document.body].map(function (element) {
          var previous = { element: element, value: element.style.getPropertyValue("overflow"), priority: element.style.getPropertyPriority("overflow") };
          element.style.setProperty("overflow", "hidden", "important");
          return previous;
        });
      } else if (!lockScroll && scrollStyles) {
        scrollStyles.forEach(function (previous) {
          if (previous.value) previous.element.style.setProperty("overflow", previous.value, previous.priority);
          else previous.element.style.removeProperty("overflow");
        });
        scrollStyles = null;
      }
    }
    window.addEventListener("resize", updateMobileLayout);
    mobileLayout.addEventListener("change", updateMobileLayout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateMobileLayout);
      window.visualViewport.addEventListener("scroll", updateMobileLayout);
    }
    function toggle(open, focus) {
      var resumeConversation = savedState && /\/chat$/.test(currentPath);
      if ((open || resumeConversation) && !frame) {
        startLoading();
        frame = document.createElement("iframe");
        frame.title = title;
        frame.allow = "camera; microphone; fullscreen";
        frame.addEventListener("load", initializeFrame);
        frame.src = embeddedUrl.href;
        panel.appendChild(frame);
      }
      panel.hidden = !open;
      updateMobileLayout();
      persistState();
      launcher.setAttribute("aria-expanded", String(open));
      launcher.setAttribute("aria-label", open ? "Fechar chat" : unreadDot.hidden ? title : title + " — nova mensagem");
      updateVisibility();
      if (focus !== false) {
        if (open) close.focus();
        else launcher.focus();
      }
    }
    retry.addEventListener("click", function () {
      if (!frame) return;
      startLoading();
      var retryUrl = new URL(currentPath, url.origin);
      retryUrl.searchParams.set("embed", "widget");
      frame.src = retryUrl.href;
    });
    previewOpen.addEventListener("click", function () { toggle(true); });
    previewClose.addEventListener("click", function () { preview.hidden = true; });
    document.addEventListener("visibilitychange", function () {
      if (!host.isConnected) return;
      if (panel.hidden && !unreadDot.hidden) preview.hidden = false;
      updateVisibility();
    });
    launcher.addEventListener("click", function () { toggle(panel.hidden); });
    close.addEventListener("click", function () { toggle(false); });
    root.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) toggle(false);
    });
    root.append(panel, launcher, preview, live);
    document.body.appendChild(host);
    if (unreadCount) {
      unreadDot.hidden = false;
      preview.hidden = Boolean(savedState && savedState.open);
      launcher.setAttribute("aria-label", title + " — nova mensagem");
      updateNotificationTitle();
    }
    if (savedState) toggle(savedState.open, false);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
})();
