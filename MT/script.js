/* =========================================================
   MT Ar-Condicionado — Interações JavaScript
   Cada bloco abaixo controla uma funcionalidade do site.
   Comentários em português para facilitar a manutenção.
   ========================================================= */
(() => {
  'use strict';

  // Atalhos: $ seleciona um elemento; $$ seleciona vários (retorna array)
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Loader (tela de carregamento inicial) ----------
     Some após a página carregar completamente. */
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader')?.classList.add('is-hidden'), 900);
  });

  /* ---------- Ano dinâmico no rodapé ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Bibliotecas de animação ----------
     AOS: animações ao rolar a página
     VanillaTilt: efeito 3D nos cards com classe .tilt
     Swiper: carrossel de avaliações */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AOS) AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
    if (window.VanillaTilt) VanillaTilt.init($$('.tilt'), { max: 8, speed: 500, glare: true, 'max-glare': .15 });
    if (window.Swiper) {
      new Swiper('.reviews', {
        loop: true, autoplay: { delay: 4500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        spaceBetween: 20,
        breakpoints: { 0: { slidesPerView: 1 }, 700: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }
      });
    }
  });

  /* ---------- Barra de progresso e menu ao rolar ----------
     - Aplica sombra no menu quando o usuário rola
     - Mostra botão "voltar ao topo" após 600px
     - Preenche a barra de progresso azul no topo */
  const nav = $('#nav');
  const scrollProgress = $('#scrollProgress');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > 600);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (y / h * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile (hambúrguer) ----------
     Abre/fecha o menu em telas pequenas. */
  const burger = $('#navBurger');
  const mobile = $('#navMobile');
  burger.addEventListener('click', () => {
    const open = mobile.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    mobile.setAttribute('aria-hidden', !open);
  });
  // Ao clicar em um link, fecha o menu automaticamente
  $$('#navMobile a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Alternador de tema claro/escuro ----------
     Salva a preferência do usuário no localStorage. */
  const themeBtn = $('#themeToggle');
  const setTheme = t => {
    document.body.classList.toggle('light', t === 'light');
    themeBtn.innerHTML = t === 'light' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('mt-theme', t);
  };
  setTheme(localStorage.getItem('mt-theme') || 'dark');
  themeBtn.addEventListener('click', () => setTheme(document.body.classList.contains('light') ? 'dark' : 'light'));

  /* ---------- Botão "voltar ao topo" ---------- */
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Partículas de neve no fundo (canvas) ----------
     Efeito decorativo de flocos caindo suavemente. */
  const canvas = $('#snowCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, flakes = [];
  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(120, Math.floor(W / 14));
    // Cria os flocos com posição, tamanho, velocidade e transparência aleatórios
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + .5,
      s: Math.random() * .6 + .2,
      d: Math.random() * .8 - .4,
      o: Math.random() * .6 + .2
    }));
  };
  resize();
  window.addEventListener('resize', resize);
  // Loop de animação — desenha e move os flocos a cada frame
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,235,255,${f.o})`;
      ctx.shadowColor = 'rgba(87,217,255,.6)';
      ctx.shadowBlur = 6;
      ctx.fill();
      f.y += f.s; f.x += f.d;
      // Reposiciona quando sai da tela
      if (f.y > H) { f.y = -5; f.x = Math.random() * W; }
      if (f.x > W) f.x = 0; if (f.x < 0) f.x = W;
    });
    requestAnimationFrame(tick);
  };
  tick();

  /* ---------- Contadores animados ----------
     Anima os números na seção HERO (clientes, projetos, etc.)
     quando entram na tela. */
  const counters = $$('.counter');
  const runCounter = el => {
    const target = +el.dataset.target;
    const dur = 1800, t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); io.unobserve(e.target); }
    });
  }, { threshold: .4 });
  counters.forEach(c => io.observe(c));

  /* ---------- Comparador "Antes x Depois" ----------
     O usuário arrasta o divisor para revelar a imagem "depois". */
  const compare = $('#compare'), after = $('#compareAfter'), handle = $('#compareHandle');
  let dragging = false;
  const setPos = (x) => {
    const rect = compare.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width, x - rect.left));
    const pct = (px / rect.width) * 100;
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
  };
  handle.addEventListener('pointerdown', e => { dragging = true; handle.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', () => dragging = false);
  window.addEventListener('pointermove', e => { if (dragging) setPos(e.clientX); });

  /* ---------- Filtro da galeria ----------
     Filtra as fotos por categoria (Todos / Antes / Depois).
     ============================================================
     >>> PARA TROCAR AS FOTOS DA GALERIA <<<
     Abra o arquivo public/mt-ar/style.css e procure pelas classes
     .ph--1, .ph--2, .ph--3, .ph--4, .ph--5, .ph--6.
     Cada uma representa uma foto da galeria. Basta substituir
     o `background: linear-gradient(...)` por
     `background-image: url('caminho/da/sua/foto.jpg');`
     Exemplo:
       .ph--1 { background-image: url('images/sala-antes.jpg'); }
     ============================================================ */
  $$('.gallery-filter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.gallery-filter .chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const f = chip.dataset.filter;
      $$('.gallery__item').forEach(it => {
        it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f);
      });
    });
  });

  /* ---------- Calculadora de BTUs ----------
     Fórmula: área*600 + pessoas extras*600 + eletrônicos*600
     Arredonda para a faixa comercial mais próxima. */
  const btuArea = $('#btuArea'), btuP = $('#btuPessoas'), btuE = $('#btuEletronicos'), btuR = $('#btuResult');
  const calcBtu = () => {
    const area = +btuArea.value || 0;
    const pessoas = Math.max(0, (+btuP.value || 1) - 1);
    const eletronicos = +btuE.value || 0;
    let btu = area * 600 + pessoas * 600 + eletronicos * 600;
    const faixas = [9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000];
    const rec = faixas.find(v => v >= btu) || 60000;
    btuR.textContent = rec.toLocaleString('pt-BR') + ' BTUs';
  };
  [btuArea, btuP, btuE].forEach(el => el.addEventListener('input', calcBtu));
  calcBtu();

  /* ---------- Calculadora de Orçamento estimado ----------
     Multiplica valor base do serviço por tipo de equipamento
     e fator de BTUs. É apenas uma estimativa. */
  const oT = $('#orcTipo'), oB = $('#orcBtu'), oS = $('#orcServico'), oR = $('#orcResult');
  const tipoMult = { split: 1, inverter: 1.25, multi: 1.6, piso: 1.4 };
  const servBase = { instalacao: 900, manutencao: 220, higienizacao: 260, recarga: 320 };
  const calcOrc = () => {
    const btu = +oB.value;
    const base = servBase[oS.value];
    const fatorBtu = 1 + (btu - 9000) / 30000;
    const total = base * (tipoMult[oT.value] || 1) * Math.max(1, fatorBtu);
    oR.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  [oT, oB, oS].forEach(el => el.addEventListener('change', calcOrc));
  calcOrc();

  /* ---------- Formulário de contato ----------
     Simula envio. Para integrar com EmailJS, descomente a linha
     abaixo e configure SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY. */
  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Enviando…';
    status.className = 'form__status';
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      // await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', data, 'PUBLIC_KEY');
      await new Promise(r => setTimeout(r, 700));
      status.textContent = '✅ Solicitação enviada! Em breve entramos em contato.';
      status.classList.add('is-ok');
      form.reset();
    } catch (err) {
      status.textContent = '❌ Não foi possível enviar. Tente novamente ou fale no WhatsApp.';
      status.classList.add('is-err');
    }
  });

  /* ---------- Brilho do mouse nos cards de serviço ----------
     Efeito de luz que segue o cursor dentro do card. */
  $$('.service').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
  });
})();
