/* =========================================================
   MT Ar-Condicionado — Interações JavaScript
   Cada bloco abaixo controla uma funcionalidade do site.
   Comentários em português para facilitar a manutenção.

   NOVIDADES:
   - Inicialização dos 3 carrosséis da galeria (Swiper).
   - Lógica do Lightbox: ao clicar em qualquer foto da galeria,
     ela é ampliada em tela cheia.
   - Fechamento do lightbox ao clicar no botão X ou fora da imagem.
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader')?.classList.add('is-hidden'), 900);
  });

  /* ---------- Ano dinâmico no rodapé ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Bibliotecas de animação ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AOS) AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
    if (window.VanillaTilt) VanillaTilt.init($$('.tilt'), { max: 8, speed: 500, glare: true, 'max-glare': .15 });

    // Swiper de avaliações
    if (window.Swiper) {
      new Swiper('.reviews', {
        loop: true, autoplay: { delay: 4500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        spaceBetween: 20,
        breakpoints: { 0: { slidesPerView: 1 }, 700: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }
      });

      // ========================================================
      // INICIALIZAÇÃO DOS CARROSSÉIS DA GALERIA
      // Cada carrossel é um Swiper independente.
      // Todos compartilham a mesma configuração visual.
      // ========================================================
      const swiperConfig = {
        loop: true,                    // Loop infinito
        spaceBetween: 16,            // Espaço entre slides
        slidesPerView: 1,            // Padrão para mobile
        centeredSlides: true,
        grabCursor: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          640:  { slidesPerView: 1.5 },
          900:  { slidesPerView: 2.2 },
          1200: { slidesPerView: 3 }
        }
      };

      // Inicializa cada carrossel da galeria pelo ID
      new Swiper('#swiperInstalacao', swiperConfig);
      new Swiper('#swiperPreventiva', swiperConfig);
      new Swiper('#swiperCorretiva', swiperConfig);
    }
  });

  /* ---------- Barra de progresso e menu ao rolar ---------- */
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

  /* ---------- Menu mobile ---------- */
  const burger = $('#navBurger');
  const mobile = $('#navMobile');
  burger.addEventListener('click', () => {
    const open = mobile.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    mobile.setAttribute('aria-hidden', !open);
  });
  $$('#navMobile a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Alternador de tema claro/escuro ---------- */
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

  /* ---------- Partículas de neve ---------- */
  const canvas = $('#snowCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, flakes = [];
  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(120, Math.floor(W / 14));
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
      if (f.y > H) { f.y = -5; f.x = Math.random() * W; }
      if (f.x > W) f.x = 0; if (f.x < 0) f.x = W;
    });
    requestAnimationFrame(tick);
  };
  tick();

  /* ---------- Contadores animados ---------- */
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

  /* ---------- Brilho do mouse nos cards de serviço ---------- */
  $$('.service').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
  });

  // ============================================================
  // LÓGICA DO LIGHTBOX
  // Permite que o usuário clique em qualquer foto da galeria
  // e a veja ampliada em tela cheia.
  // ============================================================
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');

  // Seleciona TODAS as imagens que estão dentro da seção da galeria
  const galleryImages = $$('#galeria .gallery-img');

  // Abre o lightbox ao clicar em uma foto
  galleryImages.forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Trava o scroll da página
    });
  });

  // Fecha o lightbox ao clicar no botão X
  lightboxClose.addEventListener('click', closeLightbox);

  // Fecha o lightbox ao clicar fora da imagem (no fundo escuro)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Fecha o lightbox ao pressionar a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = ''; // Restaura o scroll
  }

  // ============================================================
  // GUIA RÁPIDO DE EDIÇÃO:
  //
  // 1. FOTOS DA GALERIA:
  //    - Procure a seção #galeria no HTML.
  //    - Dentro de cada carrossel (ex: #swiperInstalacao), encontre as <img>.
  //    - Altere o 'src' de cada <img> para o caminho da sua foto.
  //    - Exemplo: <img src="img/minha-foto.jpg" alt="Descrição">
  //    - Você pode adicionar ou remover slides copiando/colando as <div class="swiper-slide">.
  //
  // 2. DIPLOMA EM PDF:
  //    - Procure o link na seção #qualificacoes: href="img/diploma.pdf".
  //    - Substitua pelo caminho real do seu arquivo.
  //
  // 3. LINK DO INSTAGRAM:
  //    - Já está configurado para https://www.instagram.com/ar.com_2023/.
  //    - Para alterar, procure por "instagram.com/ar.com_2023" no HTML e troque.
  //
  // 4. LOGOS DAS EMPRESAS PARCEIRAS:
  //    - Procure a seção #parceiros no HTML.
  //    - Altere o 'src' das <img> e os telefones nos links <a>.
  //
  // 5. LOGO PRINCIPAL:
  //    - Substitua o arquivo "img/logo.png" pela sua logo.
  //    - Para alterar o tamanho, edite o CSS em .nav__logo-img e .hero__logo-img.
  // ============================================================

})();