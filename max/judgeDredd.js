// judgeDredd.js
(function () {
  function injectStyles() {
    if (document.getElementById('judge-robot-style')) return;
    var css = ''
      + '#judge-robot-wrapper{'
      + 'position:fixed;right:32px;bottom:32px;'
      + 'width:260px;height:260px;'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'cursor:pointer;z-index:9999;'
      + '}\n'
      + '#judge-robot-wrapper canvas{'
      + 'width:240px;height:260px;max-width:100%;max-height:100%;display:block;'
      + '}\n'
      + '#judge-robot-chat{'
      + 'position:fixed;top:50%;left:50%;'
      + 'width:50vw;height:50vh;max-width:640px;max-height:560px;'
      + 'background:rgba(248,250,255,0.98);'
      + 'border-radius:18px;'
      + 'box-shadow:0 14px 45px rgba(15,23,42,0.25);'
      + 'display:flex;flex-direction:column;'
      + 'overflow:hidden;'
      + 'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;'
      + 'opacity:0;pointer-events:none;'
      + 'transform:translate(-50%,-50%) scale(0.96);'
      + 'transition:opacity .25s ease,transform .25s ease;'
      + 'z-index:9999;'
      + '}\n'
      + '#judge-robot-chat.jr-open{'
      + 'opacity:1;pointer-events:auto;'
      + 'transform:translate(-50%,-50%) scale(1);'
      + '}\n'
      + '.jr-chat-header{'
      + 'padding:10px 14px;'
      + 'background:#f8faff;'
      + 'color:#111827;font-size:13px;font-weight:600;'
      + 'display:flex;align-items:center;gap:8px;'
      + 'border-bottom:1px solid rgba(148,163,184,0.4);'
      + '}\n'
      + '.jr-chat-messages{'
      + 'padding:10px 12px 8px;flex:1;overflow-y:auto;'
      + 'background:linear-gradient(180deg,#f9fafb,#eef2ff);'
      + '}\n'
      + '.jr-msg{'
      + 'max-width:80%;margin-bottom:6px;padding:7px 10px;'
      + 'border-radius:12px;font-size:12px;line-height:1.4;'
      + '}\n'
      + '.jr-msg-bot{'
      + 'background:#e0ebff;color:#111827;border-bottom-left-radius:4px;'
      + '}\n'
      + '.jr-msg-user{'
      + 'background:linear-gradient(135deg,rgba(0,11,43,0.64),rgba(13,71,161,0.78));'
      + 'color:#f9fafb;border-bottom-right-radius:4px;'
      + 'margin-left:auto;'
      + '}\n'
      + '.jr-chat-footer{'
      + 'padding:8px 10px;display:flex;gap:6px;'
      + 'border-top:1px solid rgba(148,163,184,0.4);'
      + 'background:#f9fafb;'
      + '}\n'
      + '.jr-chat-input{'
      + 'flex:1;border-radius:999px;border:1px solid rgba(148,163,184,0.7);'
      + 'padding:6px 10px;font-size:12px;outline:none;'
      + '}\n'
      + '.jr-chat-input:focus{'
      + 'border-color:#4f46e5;box-shadow:0 0 0 1px rgba(79,70,229,0.3);'
      + '}\n'
      + '.jr-chat-send{'
      + 'border:none;border-radius:999px;'
      + 'padding:6px 10px;font-size:12px;'
      + 'background:linear-gradient(135deg,#4f46e5,#0ea5e9);'
      + 'color:white;font-weight:600;cursor:pointer;'
      + '}\n'
      + '.jr-chat-send:active{transform:translateY(1px);}\n';
    var style = document.createElement('style');
    style.id = 'judge-robot-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function initRobotJudge() {
    if (document.getElementById('judge-robot-wrapper')) return;

    injectStyles();

    // --- робот-виджет ---
    var wrapper = document.createElement('div');
    wrapper.id = 'judge-robot-wrapper';
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('aria-label', 'Робот-судья');

    var canvas = document.createElement('canvas');
    canvas.id = 'judge-robot-canvas';
    canvas.width = 240;
    canvas.height = 260; // запас по высоте

    wrapper.appendChild(canvas);
    document.body.appendChild(wrapper);

    // --- окно чата ---
    var chat = document.createElement('div');
    chat.id = 'judge-robot-chat';
    chat.innerHTML =
      '<div class="jr-chat-header">'
      + '<span>ИИ Судья</span>'
      + '</div>'
      + '<div class="jr-chat-messages"></div>'
      + '<div class="jr-chat-footer">'
      + '<input class="jr-chat-input" type="text" placeholder="Опишите, пожалуйста, свою ситуацию…">'
      + '<button class="jr-chat-send" type="button">Отпр.</button>'
      + '</div>';

    document.body.appendChild(chat);

    var messagesEl = chat.querySelector('.jr-chat-messages');
    var inputEl = chat.querySelector('.jr-chat-input');
    var sendBtn = chat.querySelector('.jr-chat-send');

    // --- диалог по шагам ---
    var conversationStage = 0; // 0 — ждём описания ситуации; 1 — предложили шаблоны; 2+ — просим контакты / подтверждаем

    var defaultDialog = [
      { from: 'bot', text: 'Здравствуйте. Я ИИ Судья.' },
      {
        from: 'bot',
        text: 'Кратко опишите, пожалуйста, вашу ситуацию или юридический вопрос. Что произошло и в какой роли вы выступаете?'
      }
    ];

    function addMessage(from, text) {
      if (!text) return;
      var bubble = document.createElement('div');
      bubble.className = 'jr-msg ' + (from === 'user' ? 'jr-msg-user' : 'jr-msg-bot');

      if (from === 'bot') {
        bubble.innerHTML = text;      // боту разрешаем HTML (ссылки и т.п.)
      } else {
        bubble.textContent = text;    // пользователю только текст
      }

      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    defaultDialog.forEach(function (m) { addMessage(m.from, m.text); });

    function handleSend() {
      var v = (inputEl.value || '').trim();
      if (!v) return;
      addMessage('user', v);
      inputEl.value = '';

      if (conversationStage === 0) {
        // 1-й ответ: даём ссылку на шаблоны
        setTimeout(function () {
          addMessage(
            'bot',
            'Спасибо, я зафиксировал вашу ситуацию. Для начала посмотрите, пожалуйста, '
            + '<a href="https://v01na.github.io/templates/" style="text-decoration:none;color:#111827;" target="blank">Шаблоны</a>'
            + ' документов и заявлений — это поможет понять, какие данные обычно указывают в подобных делах.'
          );
          addMessage(
            'bot',
            'Если после просмотра шаблонов останутся вопросы или понадобится помощь с формулировками, напишите сюда ещё раз.'
          );
        }, 300);
        conversationStage = 1;
      } else if (conversationStage === 1) {
        // 2-й ответ: предлагаем оставить контакты
        setTimeout(function () {
          addMessage(
            'bot',
            'Если вопросы сохраняются или вам нужна более предметная консультация, оставьте, пожалуйста, свои контакты (телефон, email или мессенджер).'
          );
          addMessage(
            'bot',
            'С вами свяжется ИИ, как только обдумает ваш запрос и “проконсультируется” с коллегами, чтобы дать более взвешенную рекомендацию.'
          );
        }, 400);
        conversationStage = 2;
      } else {
        // дальше: подтверждаем, что всё учли
        setTimeout(function () {
          addMessage(
            'bot',
            'Спасибо, я зафиксировал дополнительные данные. Контакты и описание ситуации будут использованы для подготовки более точного ответа.'
          );
        }, 400);
      }
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    // открытие/закрытие чата по клику
    wrapper.addEventListener('click', function () {
      var open = chat.classList.toggle('jr-open');
      if (open) {
        startTime = performance.now(); // чуть "оживляем" робота при открытии
      }
    });

    // --- Canvas / анимация робота-судьи ---
    var ctx = canvas.getContext('2d');
    var W = 240;
    var H = 260;

    function setupCanvas() {
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    function roundedRectPath(x, y, w, h, r) {
      var rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.closePath();
    }

    var startTime = performance.now();
    var eyeOpen = 1;
    var blinking = false;
    var blinkStart = 0;
    var nextBlinkTime = 0;
    var BLINK_DURATION = 0.25;

    function scheduleNextBlink(t) {
      nextBlinkTime = t + 1 + Math.random() * 3;
    }
    scheduleNextBlink(0);

    function updateBlink(t) {
      if (!blinking && t >= nextBlinkTime) {
        blinking = true;
        blinkStart = t;
      }
      if (blinking) {
        var progress = (t - blinkStart) / BLINK_DURATION;
        if (progress >= 1) {
          blinking = false;
          eyeOpen = 1;
          scheduleNextBlink(t);
        } else {
          var phase = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
          eyeOpen = 1 - phase;
        }
      }
    }

    function drawRobot(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.save();

      // опускаем чуть ниже центра, чтобы при подъёме голова не обрезалась
      ctx.translate(W / 2, H / 2 + 14);

      var floatAmplitude = 6;
      var floatY = Math.sin(t * 2) * floatAmplitude;
      ctx.translate(0, floatY);

      // тень
      var shadowY = 70;
      var shadowRadiusX = 44;
      var shadowRadiusY = 11;
      var shadowGradient = ctx.createRadialGradient(
        0, shadowY, 4,
        0, shadowY, shadowRadiusX
      );
      shadowGradient.addColorStop(0, 'rgba(0,0,0,0.28)');
      shadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.ellipse(0, shadowY, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // корпус
      var bodyWidth = 80;
      var bodyHeight = 90;
      var bodyX = -bodyWidth / 2;
      var bodyY = -82;

      var bodyGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyHeight);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.4, '#f0f4ff');
      bodyGrad.addColorStop(1, '#d6e2ff');

      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#c3d0f5';
      ctx.lineWidth = 2;
      roundedRectPath(bodyX, bodyY, bodyWidth, bodyHeight, 20);
      ctx.fill();
      ctx.stroke();

      // мантия
      var robeWidth = 96;
      var robeHeight = 64;
      var robeX = -robeWidth / 2;
      var robeY = bodyY + 20;
      var robeGrad = ctx.createLinearGradient(robeX, robeY, robeX, robeY + robeHeight);
      robeGrad.addColorStop(0, '#1c2437');
      robeGrad.addColorStop(1, '#131826');
      ctx.fillStyle = robeGrad;
      roundedRectPath(robeX, robeY, robeWidth, robeHeight, 26);
      ctx.fill();

      // воротник
      ctx.fillStyle = '#f9fbff';
      roundedRectPath(-18, robeY + 6, 36, 26, 10);
      ctx.fill();

      // эмблема
      ctx.save();
      ctx.translate(0, robeY + 30);
      ctx.strokeStyle = '#f5c55f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-16, 6);
      ctx.moveTo(10, 0);
      ctx.lineTo(16, 6);
      ctx.stroke();
      ctx.restore();

      // голова
      var headWidth = 86;
      var headHeight = 60;
      var headX = -headWidth / 2;
      var headY = bodyY - 40;

      var headGrad = ctx.createLinearGradient(0, headY, 0, headY + headHeight);
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.3, '#f7fbff');
      headGrad.addColorStop(1, '#dde7ff');

      ctx.fillStyle = headGrad;
      ctx.strokeStyle = '#c3d0f5';
      ctx.lineWidth = 2;
      roundedRectPath(headX, headY, headWidth, headHeight, 22);
      ctx.fill();
      ctx.stroke();

      // лицевая панель
      var faceX = headX + 10;
      var faceY = headY + 14;
      var faceWidth = headWidth - 20;
      var faceHeight = 26;
      var faceGrad = ctx.createLinearGradient(faceX, faceY, faceX, faceY + faceHeight);
      faceGrad.addColorStop(0, '#1c2335');
      faceGrad.addColorStop(1, '#0f1524');
      ctx.fillStyle = faceGrad;
      roundedRectPath(faceX, faceY, faceWidth, faceHeight, 14);
      ctx.fill();

      // глаза
      var eyeRadius = 5;
      var eyeY = faceY + faceHeight / 2;
      var eyeOffsetX = 14;
      ctx.fillStyle = '#73d7ff';

      function drawEye(cx) {
        ctx.save();
        ctx.translate(cx, eyeY);
        ctx.beginPath();
        ctx.scale(1, Math.max(0.2, eyeOpen));
        ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      drawEye(-eyeOffsetX);
      drawEye(eyeOffsetX);

      // улыбка
      ctx.strokeStyle = '#4ec0ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, eyeY + 8, 10, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      // парик
      ctx.save();
      ctx.strokeStyle = '#e5ecff';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      var wigY = headY + 12;
      ctx.beginPath();
      ctx.moveTo(headX + 12, wigY);
      ctx.lineTo(headX + 12, wigY + 26);
      ctx.moveTo(headX + headWidth - 12, wigY);
      ctx.lineTo(headX + headWidth - 12, wigY + 26);
      ctx.stroke();
      ctx.restore();

      // руки
      var armY = robeY + 18;
      var armLength = 32;

      // левая рука + весы
      ctx.save();
      ctx.strokeStyle = '#c3d0f5';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.translate(-bodyWidth / 2, armY);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-armLength, 6);
      ctx.stroke();

      ctx.translate(-armLength, 6);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f5c55f';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-10, 10);
      ctx.moveTo(10, 0);
      ctx.lineTo(10, 10);
      ctx.stroke();

      ctx.fillStyle = 'rgba(245,197,95,0.85)';
      ctx.beginPath();
      ctx.arc(-10, 12, 4, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(10, 12, 4, Math.PI, 0);
      ctx.fill();
      ctx.restore();

      // правая рука + молоток
      ctx.save();
      var hammerSwing = Math.sin(t * 3) * 0.3;
      ctx.translate(bodyWidth / 2, armY);
      ctx.rotate(0.2 + hammerSwing);

      ctx.strokeStyle = '#c3d0f5';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armLength, 0);
      ctx.stroke();

      ctx.translate(armLength, 0);
      ctx.strokeStyle = '#8b5a2b';
      ctx.fillStyle = '#b47b3c';

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();

      roundedRectPath(10, -6, 12, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      ctx.restore();

      // искры вокруг головы
      ctx.save();
      var sparkCount = 5;
      ctx.fillStyle = 'rgba(115,215,255,0.6)';
      for (var i = 0; i < sparkCount; i++) {
        var angle = (t * 0.6 + i * 1.3) % (Math.PI * 2);
        var radius = 70 + 4 * Math.sin(t * 2 + i);
        var x = W / 2 + Math.cos(angle) * radius;
        var y = H / 2 - 48 + Math.sin(angle) * radius * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function loop(now) {
      var t = (now - startTime) / 1000;
      updateBlink(t);
      drawRobot(t);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // опционально: открыть чат по Ctrl+Shift+J
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') {
        chat.classList.toggle('jr-open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRobotJudge);
  } else {
    initRobotJudge();
  }
})();
