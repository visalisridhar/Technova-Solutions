(function () {
  // ── Styles ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #tn-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #7B5BFF 0%, #6C4DFF 45%, #5B3DF5 100%);
      box-shadow: 0 8px 24px rgba(108,77,255,.45);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
      animation: tn-pulse 2.8s ease-in-out infinite;
    }
    #tn-chat-bubble:hover { transform: scale(1.08); box-shadow: 0 12px 32px rgba(108,77,255,.55); }
    #tn-chat-bubble svg { width: 26px; height: 26px; fill: #fff; }
    @keyframes tn-pulse {
      0%,100% { box-shadow: 0 8px 24px rgba(108,77,255,.45); }
      50%      { box-shadow: 0 8px 32px rgba(108,77,255,.75); }
    }

    #tn-chat-panel {
      position: fixed; bottom: 92px; right: 24px; z-index: 9998;
      width: 340px; height: 460px; border-radius: 20px;
      background: #fff; box-shadow: 0 40px 80px -28px rgba(58,33,140,.40);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(.92) translateY(12px); opacity: 0;
      transition: transform .22s cubic-bezier(.34,1.56,.64,1), opacity .18s ease;
      pointer-events: none;
    }
    #tn-chat-panel.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }

    #tn-chat-head {
      background: linear-gradient(135deg, #7B5BFF 0%, #6C4DFF 45%, #5B3DF5 100%);
      padding: 16px 18px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    #tn-chat-head .tn-avatar {
      width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.2);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #tn-chat-head .tn-avatar svg { width: 20px; height: 20px; fill: #fff; }
    #tn-chat-head .tn-title { flex: 1; color: #fff; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 15px; }
    #tn-chat-head .tn-subtitle { color: rgba(255,255,255,.72); font-size: 12px; margin-top: 1px; }
    #tn-close-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      color: rgba(255,255,255,.8); font-size: 20px; line-height: 1;
      transition: color .15s;
    }
    #tn-close-btn:hover { color: #fff; }

    #tn-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px; display: flex;
      flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: #E9E3FF transparent;
    }
    .tn-msg { max-width: 82%; font-size: 14px; line-height: 1.55; padding: 10px 14px; border-radius: 16px; }
    .tn-msg.bot { align-self: flex-start; background: #F3F0FF; color: #3B3556; border-bottom-left-radius: 4px; }
    .tn-msg.user { align-self: flex-end; background: linear-gradient(135deg,#7B5BFF,#5B3DF5); color: #fff; border-bottom-right-radius: 4px; }

    #tn-chat-input-row {
      display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid #ECE8FA; flex-shrink: 0;
    }
    #tn-chat-input {
      flex: 1; border: 1px solid #ECE8FA; border-radius: 12px;
      padding: 10px 14px; font-size: 14px; font-family: inherit;
      background: #FAF8FF; color: #16112E; outline: none;
      transition: border-color .15s;
    }
    #tn-chat-input:focus { border-color: #6C4DFF; }
    #tn-chat-input::placeholder { color: #938DAE; }
    #tn-send-btn {
      width: 40px; height: 40px; border-radius: 12px; border: none;
      background: linear-gradient(135deg,#7B5BFF,#5B3DF5); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform .15s, box-shadow .15s; flex-shrink: 0;
    }
    #tn-send-btn:hover { transform: scale(1.06); box-shadow: 0 4px 14px rgba(108,77,255,.4); }
    #tn-send-btn svg { width: 18px; height: 18px; fill: #fff; }

    @media (max-width: 400px) {
      #tn-chat-panel { width: calc(100vw - 20px); right: 10px; bottom: 82px; }
    }
  `;
  document.head.appendChild(style);

  // ── FAQ data ──────────────────────────────────────────────────────────────
  const FAQ = [
    {
      keywords: ['service', 'offer', 'what do you do', 'provide', 'help', 'capabilities'],
      answer: 'TechNova offers four core services:\n1. 🤖 <b>AI & Automation</b> — smart workflows that save your team hours\n2. 💻 <b>Web Development</b> — fast, modern, scalable web apps\n3. 📊 <b>Data Analytics</b> — dashboards and insights from your data\n4. ☁️ <b>Cloud Solutions</b> — infrastructure design, migration & DevOps\nVisit our <a href="/services" style="color:#6C4DFF;font-weight:600">Services page</a> for full details.'
    },
    {
      keywords: ['price', 'cost', 'pricing', 'how much', 'rate', 'fee', 'charge', 'plan'],
      answer: 'Our pricing is project-based and scales with your needs:\n• 🌱 <b>Starter</b> — from $2,500 (small sites & automations)\n• 🚀 <b>Growth</b> — from $8,000 (full web apps & dashboards)\n• 🏢 <b>Enterprise</b> — custom quote for ongoing retainers\nBook a free discovery call and we\'ll scope it together!'
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'talk', 'call', 'message', 'get in touch'],
      answer: 'You can reach us here:\n📧 hello@technova.com\n📞 +1 (555) 012-3456\n🕘 Mon–Fri, 9 AM – 6 PM EST\nOr use our <a href="/contact" style="color:#6C4DFF;font-weight:600">Contact form</a> and we\'ll reply within 24 hours.'
    },
    {
      keywords: ['project', 'portfolio', 'work', 'built', 'client', 'case study', 'example'],
      answer: 'We\'ve delivered 250+ projects across industries. Recent highlights:\n• 📦 E-commerce AI recommendations (3× revenue lift)\n• 🏥 Healthcare analytics dashboard (real-time patient data)\n• 🏗️ Construction SaaS platform (used by 40+ firms)\nSee more on our <a href="/projects" style="color:#6C4DFF;font-weight:600">Projects page</a>.'
    },
    {
      keywords: ['about', 'who are you', 'company', 'technova', 'team', 'founded', 'history'],
      answer: 'TechNova Solutions is a digital studio founded in 2015. We help businesses grow smarter with AI, automation, and modern web technology. Our team of 30+ engineers, designers, and strategists has served 100+ happy clients across 12 countries. 🌍'
    },
    {
      keywords: ['location', 'where', 'office', 'based', 'city', 'country', 'address', 'headquarters'],
      answer: 'Our main studio is in Austin, Texas 🤠, with remote team members across the US, Europe, and Asia. We work with clients globally — timezone differences are never a blocker for us!'
    },
    {
      keywords: ['start', 'begin', 'get started', 'sign up', 'onboard', 'how to', 'next step', 'demo'],
      answer: 'Getting started is easy — three steps:\n1. 📅 Book a free 30-min discovery call\n2. 📋 We send a scoped proposal within 48 hours\n3. 🚀 Kick off in as little as one week\nHit the <a href="/contact" style="color:#6C4DFF;font-weight:600">Get Started</a> button and let\'s go!'
    },
    {
      keywords: ['gallery', 'photo', 'image', 'design', 'visual'],
      answer: 'Check out our <a href="/gallery" style="color:#6C4DFF;font-weight:600">Gallery page</a> to see snapshots of our office, team events, and project deliverables. 📸'
    },
  ];

  const FALLBACK = "Hmm, I'm not sure about that one! 😅 Try asking about our <b>services</b>, <b>pricing</b>, or <b>how to get started</b> — or visit our <a href='/contact' style='color:#6C4DFF;font-weight:600'>Contact page</a> to speak with a human.";

  function match(input) {
    const lower = input.toLowerCase();
    for (const item of FAQ) {
      if (item.keywords.some(k => lower.includes(k))) return item.answer;
    }
    return FALLBACK;
  }

  // ── Widget HTML ───────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = 'tn-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'TechNova chat assistant');
  panel.innerHTML = `
    <div id="tn-chat-head">
      <div class="tn-avatar">
        <svg viewBox="0 0 24 24"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13zm-3 3c-1.48 0-2.75-.81-3.45-2h6.9c-.7 1.19-1.97 2-3.45 2z"/></svg>
      </div>
      <div>
        <div class="tn-title">TechNova Assistant</div>
        <div class="tn-subtitle">Usually replies instantly ⚡</div>
      </div>
      <button id="tn-close-btn" aria-label="Close chat">✕</button>
    </div>
    <div id="tn-chat-messages" role="log" aria-live="polite"></div>
    <div id="tn-chat-input-row">
      <input id="tn-chat-input" type="text" placeholder="Ask me anything…" autocomplete="off" aria-label="Chat message" />
      <button id="tn-send-btn" aria-label="Send message">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  const bubble = document.createElement('button');
  bubble.id = 'tn-chat-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.setAttribute('aria-expanded', 'false');
  bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

  document.body.appendChild(panel);
  document.body.appendChild(bubble);

  // ── State & helpers ───────────────────────────────────────────────────────
  const msgs = panel.querySelector('#tn-chat-messages');
  const input = panel.querySelector('#tn-chat-input');
  const closeBtn = panel.querySelector('#tn-close-btn');
  const sendBtn = panel.querySelector('#tn-send-btn');
  let opened = false;

  function addMessage(text, role) {
    const el = document.createElement('div');
    el.className = `tn-msg ${role}`;
    el.innerHTML = text.replace(/\n/g, '<br>');
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(() => addMessage(match(text), 'bot'), 420);
  }

  const CHAT_ICON = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;
  const CLOSE_ICON = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

  function openPanel() {
    panel.classList.add('open');
    bubble.innerHTML = CLOSE_ICON;
    bubble.setAttribute('aria-expanded', 'true');
    bubble.setAttribute('aria-label', 'Close chat');
    if (!opened) {
      setTimeout(() => addMessage("Hi! I'm TechNova's virtual assistant. Ask me about our <b>services</b>, <b>pricing</b>, <b>projects</b>, or <b>how to get started</b>! 👋", 'bot'), 300);
      opened = true;
    }
    setTimeout(() => input.focus(), 250);
  }

  function closePanel() {
    panel.classList.remove('open');
    bubble.innerHTML = CHAT_ICON;
    bubble.setAttribute('aria-expanded', 'false');
    bubble.setAttribute('aria-label', 'Open chat');
  }

  // ── Events ────────────────────────────────────────────────────────────────
  bubble.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
})();
