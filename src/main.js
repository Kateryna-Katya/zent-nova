/* =========================================
   1. INITIALIZATION (LIBRARIES)
   ========================================= */

// Инициализация иконок Lucide
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// Инициализация плавного скролла (Lenis)
let lenis;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true
  });

  // Animation Loop для Lenis
  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* =========================================
 2. DOM LOGIC & ANIMATIONS
 ========================================= */

document.addEventListener("DOMContentLoaded", () => {

  // --- A. MOBILE MENU ---
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__link');

  if (burger && nav) {
      burger.addEventListener('click', () => {
          nav.classList.toggle('is-open');
          burger.classList.toggle('is-active');
      });

      navLinks.forEach(link => {
          link.addEventListener('click', () => {
              nav.classList.remove('is-open');
              if (burger.classList.contains('is-active')) {
                  burger.classList.remove('is-active');
              }
          });
      });
  }

  // --- B. GSAP ANIMATIONS ---
  if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // 1. HERO SECTION ANIMATION
      // Проверяем наличие элемента перед анимацией
      if (document.querySelector('#hero-title')) {
          const heroTextPlain = new SplitType('#hero-text-plain', { types: 'chars' });

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          tl
          // Бейдж
          .to('.hero__badge', { y: 0, opacity: 1, duration: 0.8 })

          // "Воплотите мечты" (по буквам)
          .from(heroTextPlain.chars, {
              y: 100, opacity: 0, stagger: 0.03, duration: 1, ease: "back.out(1.7)"
          }, "-=0.4")

          // "в реальность" (Градиент - Безопасный метод)
          // Анимируем ИЗ невидимого состояния, так как в CSS он теперь видим
          .from('#hero-text-gradient', {
              y: 20, opacity: 0, duration: 1
          }, "-=0.8")

          // Остальные элементы Hero
          .to('.hero__text', { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
          .to('.hero__actions', { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
          .to('.hero__stats', { opacity: 1, duration: 0.8 }, "-=0.6")
          .to('.hero__visual', { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.75)" }, "-=1");
      }

      // 2. SCROLL ANIMATIONS (SECTIONS)
      // Анимируем все элементы с атрибутом data-animate
      const animateElements = document.querySelectorAll('[data-animate]');

      animateElements.forEach(el => {
          gsap.fromTo(el,
              { y: 50, opacity: 0 }, // Начальное состояние
              {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  ease: "power2.out",
                  scrollTrigger: {
                      trigger: el,
                      start: "top 85%", // Старт анимации, когда верх элемента на 85% экрана
                      toggleActions: "play none none reverse" // Играть при скролле вниз, реверс при скролле вверх
                  }
              }
          );
      });
  }

  // --- C. FAQ ACCORDION ---
  const faqItems = document.querySelectorAll('.faq__question');
  faqItems.forEach(btn => {
      btn.addEventListener('click', () => {
          const item = btn.parentElement;
          const answer = item.querySelector('.faq__answer');
          const isActive = btn.classList.contains('is-active');

          // Закрываем все остальные
          document.querySelectorAll('.faq__question').forEach(b => {
              b.classList.remove('is-active');
              b.parentElement.querySelector('.faq__answer').style.maxHeight = null;
          });

          // Открываем текущий, если он был закрыт
          if (!isActive) {
              btn.classList.add('is-active');
              answer.style.maxHeight = answer.scrollHeight + "px";
          }
      });
  });

  // --- D. CONTACT FORM & CAPTCHA ---
  const form = document.getElementById('contactForm');
  if (form) {
      const phoneInput = document.getElementById('phone');
      const captchaLabel = document.getElementById('captchaLabel');
      const captchaInput = document.getElementById('captchaInput');
      const statusDiv = document.getElementById('formStatus');

      // Только цифры в телефоне
      phoneInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '');
      });

      // Генерация капчи (Математика)
      let num1 = Math.floor(Math.random() * 10);
      let num2 = Math.floor(Math.random() * 10);
      let captchaResult = num1 + num2;

      // Функция обновления капчи
      const refreshCaptcha = () => {
          num1 = Math.floor(Math.random() * 10);
          num2 = Math.floor(Math.random() * 10);
          captchaResult = num1 + num2;
          captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;
          captchaInput.value = '';
      };

      // Инициализация капчи
      refreshCaptcha();

      form.addEventListener('submit', (e) => {
          e.preventDefault();
          let isValid = true;
          statusDiv.textContent = '';
          statusDiv.className = 'form-status';

          // Проверка обязательных полей
          const inputs = form.querySelectorAll('input[required]');
          inputs.forEach(input => {
              const group = input.closest('.form-group');
              if (!input.value) {
                  group?.classList.add('error');
                  isValid = false;
              } else {
                  group?.classList.remove('error');
              }
          });

          // Проверка длины телефона
          if (phoneInput.value.length < 10) {
               phoneInput.closest('.form-group').classList.add('error');
               isValid = false;
          }

          // Проверка капчи
          if (parseInt(captchaInput.value) !== captchaResult) {
              captchaInput.closest('.form-group').classList.add('error');
              isValid = false;
          } else {
              captchaInput.closest('.form-group').classList.remove('error');
          }

          if (isValid) {
              // Имитация отправки
              const btn = form.querySelector('button[type="submit"]');
              const originalText = btn.innerHTML;
              btn.innerHTML = 'Отправка...';
              btn.disabled = true;

              setTimeout(() => {
                  statusDiv.textContent = 'Заявка успешно отправлена! Мы свяжемся с вами.';
                  statusDiv.classList.add('success');
                  form.reset();
                  btn.innerHTML = originalText;
                  btn.disabled = false;
                  refreshCaptcha(); // Обновляем капчу после успеха
              }, 1500);
          } else {
              statusDiv.textContent = 'Пожалуйста, проверьте правильность заполнения полей.';
              statusDiv.classList.add('error-msg-text'); // Можно добавить стиль для текста ошибки
          }
      });
  }

  // --- E. COOKIE POPUP ---
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptCookie = document.getElementById('acceptCookie');

  if (cookiePopup && !localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => {
          cookiePopup.classList.add('is-visible');
      }, 2000);
  }

  if (acceptCookie) {
      acceptCookie.addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          cookiePopup.classList.remove('is-visible');
      });
  }

  // Обновляем иконки Lucide для новых элементов DOM
  lucide.createIcons();
});