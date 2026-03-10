import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Компонент для плавного появления картинок
function FadeImage({ src, alt = '', className = '', style = {} }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)} // показываем даже если ошибка загрузки
    />
  );
}

// ===== PRELOAD СИСТЕМА =====
const allImages = [
  './images/frame.png',
  './images/story-start.png',
  './images/first-meeting.png',
  './images/laughter.png',
  './images/together.png',
  './images/proposal.png',
  './images/invitation.png',
  './images/venue.png',
  './images/dance.png',
];

const screenImages = {
  0: ['./images/frame.png'],
  1: ['./images/story-start.png'],
  2: ['./images/first-meeting.png'],
  3: ['./images/dance.png'],
  4: ['./images/laughter.png'],
  5: ['./images/together.png'],
  6: ['./images/proposal.png'],
  7: ['./images/invitation.png'],
  8: ['./images/venue.png'],
  9: [],
  10: [],
  11: [],
  12: [],
};

const loadedImages = new Set();

const preloadImage = (src) => {
  if (loadedImages.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedImages.add(src);
      resolve();
    };
    img.onerror = resolve;
    img.src = src;
  });
};

const preloadScreen = (screenIndex) => {
  const images = screenImages[screenIndex] || [];
  return Promise.all(images.map(preloadImage));
};
// ===== КОНЕЦ PRELOAD =====

// Google Sheets API
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyl9CVwxbi5icXAyAZLlomkE4ezPtV35hJcVzbYOwIQNv2DwtGDJoE1tcLufn9za4RD6Q/exec';

const formatName = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getGuestsFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const guestParam = params.get('guest') || '';
  const guests = guestParam.split(',').map(formatName).filter(Boolean);
  return {
    guest1: guests[0] || '',
    guest2: guests[1] || '',
    hasCouple: guests.length > 1,
  };
};

const STORAGE_KEY = 'wedding_story_viewed';
const hasViewedStory = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};
const markStoryViewed = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {}
};

const screens = [
  'intro', 'story-start', 'first-meeting', 'dance', 'laughter',
  'together', 'proposal', 'invitation', 'venue', 'schedule',
  'preparation', 'cheatsheet', 'rsvp'
];

// Компонент Fireflies для экрана 1
function Fireflies() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let fireflies = [];

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    const createFirefly = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 1.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.25,
      pulseSpeed: Math.random() * 0.012 + 0.006,
      pulseOffset: Math.random() * Math.PI * 2,
    });

    const initFireflies = () => {
      fireflies = Array.from({ length: 30 }, createFirefly);
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fireflies.forEach((f) => {
        f.x += f.speedX;
        f.y += f.speedY;
        if (f.x < 0 || f.x > canvas.width) f.speedX *= -1;
        if (f.y < 0 || f.y > canvas.height) f.speedY *= -1;

        const pulse = Math.sin(time * f.pulseSpeed + f.pulseOffset) * 0.3 + 0.7;
        const currentOpacity = f.opacity * pulse;

        const gradient = ctx.createRadialGradient(
          f.x,
          f.y,
          0,
          f.x,
          f.y,
          f.size * 5
        );
        gradient.addColorStop(0, `rgba(201, 162, 39, ${currentOpacity})`);
        gradient.addColorStop(0.4, `rgba(201, 162, 39, ${currentOpacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(201, 162, 39, 0)');

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };

    resize();
    initFireflies();
    animate(0);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
}

// Компонент Snowfall для экрана 7
function Snowfall() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let snowflakes = [];

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    const createSnowflake = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 1 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.4,
    });

    const initSnowflakes = () => {
      snowflakes = Array.from({ length: 80 }, createSnowflake);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      snowflakes.forEach((f) => {
        f.y += f.speedY;
        f.x += f.speedX;
        if (f.y > canvas.height) {
          f.y = -10;
          f.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };

    resize();
    initSnowflakes();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
}

// Компонент Hearts для финального экрана
function FloatingHearts() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            y: '110%',
            x: `${5 + i * 8}%`,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: '-10%',
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.5, 1, 1, 0.8],
          }}
          transition={{
            duration: 5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
          className="absolute text-marsala/30"
          style={{ fontSize: `${18 + (i % 4) * 8}px` }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [guests] = useState(getGuestsFromURL);
  const [storyViewed, setStoryViewed] = useState(hasViewedStory);

  // Интерактив экран 2
  const [storyAnswer, setStoryAnswer] = useState(null);
  const [showStoryResult, setShowStoryResult] = useState(false);

  // Счётчик дней экран 6
  const [displayDays, setDisplayDays] = useState(0);

  // RSVP форма
  const [showForm, setShowForm] = useState(false);
  const [responseType, setResponseType] = useState(null);
  const [formData, setFormData] = useState({
    name: guests.guest1,
    alcohol: [],
    allergies: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touchStart, setTouchStart] = useState(0);

  // Отмечаем просмотр истории когда доходим до экрана приглашения (7)
  useEffect(() => {
    if (currentScreen >= 7 && !storyViewed) {
      markStoryViewed();
      setStoryViewed(true);
    }
  }, [currentScreen, storyViewed]);

  // ===== PRELOAD ИЗОБРАЖЕНИЙ с обработкой ошибок =====
  useEffect(() => {
    Promise.all([preloadScreen(0), preloadScreen(1), preloadScreen(2)]).catch(err =>
      console.warn('Preload failed', err)
    );
  }, []);

  useEffect(() => {
    preloadScreen(currentScreen + 1).catch(() => {});
    preloadScreen(currentScreen + 2).catch(() => {});
  }, [currentScreen]);
  // ===== КОНЕЦ PRELOAD =====

  // Анимация счётчика дней
  useEffect(() => {
    if (currentScreen === 5) {
      let current = 0;
      const target = 2034;
      const increment = target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayDays(target);
          clearInterval(timer);
        } else {
          setDisplayDays(Math.floor(current));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [currentScreen]);

  // Свайп навигация
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentScreen < screens.length - 1) {
        setCurrentScreen((prev) => prev + 1);
      } else if (diff < 0 && currentScreen > 0) {
        setCurrentScreen((prev) => prev - 1);
      }
    }
  };

  // Scroll навигация (исправлено: очистка таймера)
  useEffect(() => {
    let timeoutId;
    const handleWheel = (e) => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        if (e.deltaY > 30 && currentScreen < screens.length - 1) {
          setCurrentScreen((prev) => prev + 1);
        } else if (e.deltaY < -30 && currentScreen > 0) {
          setCurrentScreen((prev) => prev - 1);
        }
        timeoutId = null;
      }, 600);
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentScreen]);

  // Keyboard навигация
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && currentScreen < screens.length - 1) {
        setCurrentScreen((prev) => prev + 1);
      } else if (e.key === 'ArrowUp' && currentScreen > 0) {
        setCurrentScreen((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);

  const handleStoryAnswer = (answer) => {
    setStoryAnswer(answer);
    setTimeout(() => setShowStoryResult(true), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Error submitting:', error);
    }
    setIsSubmitting(false);
    setFormSubmitted(true);
  };

  const getDaysUntilWedding = () => {
    const wedding = new Date('2026-06-29');
    const today = new Date();
    const diff = Math.ceil((wedding - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Fallback для иконок
  const handleIconError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="min-h-screen w-full bg-neutral-800 flex items-center justify-center p-0 md:p-8">
      <div
        className="h-screen md:h-[85vh] md:max-h-[800px] w-full md:w-[390px] md:rounded-[3rem] md:shadow-2xl md:border-[12px] md:border-neutral-900 overflow-hidden bg-cream touch-pan-y relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Навигация точками с aria-label */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentScreen(i)}
              aria-label={`Перейти к экрану ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentScreen === i
                  ? 'bg-marsala scale-125'
                  : 'bg-chocolate/20 hover:bg-chocolate/40'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ========== ЭКРАН 1: INTRO ========== */}
          {currentScreen === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative flex flex-col justify-center"
            >
              <motion.div
                animate={{
                  opacity: [0.85, 1, 0.85],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 z-0"
              >
                <FadeImage
                  src="./images/frame.png"
                  alt="Фоторамка с датой свадьбы"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </motion.div>

              <Fireflies />

              <div className="relative z-20 px-6">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-serif text-[1.5rem] text-chocolate mb-6 text-center"
                >
                  Тут кое-что намечается
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-serif text-[4rem] font-semibold text-chocolate leading-none tracking-tight text-center"
                >
                  29.06.2026
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-6 z-20 flex flex-col items-start gap-3"
              >
                <motion.p
                  animate={{ y: [0, 5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="font-hand text-chocolate text-lg drop-shadow-[0_2px_4px_rgba(245,240,230,0.9)]"
                >
                  листай ↓
                </motion.p>

                {storyViewed && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setCurrentScreen(1)}
                    className="font-serif text-sm text-chocolate/60 hover:text-marsala underline underline-offset-2 transition-colors"
                  >
                    сразу к форме →
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 2: STORY START ========== */}
          {currentScreen === 1 && (
            <motion.div
              key="story-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <FadeImage
                src="./images/story-start.png"
                alt="Зимний пейзаж, начало истории"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                style={{ objectPosition: 'left 100%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/70 to-transparent z-0" />

              {/* Добавлен класс для адаптации */}
              <div className="relative z-10 h-full flex flex-col justify-center px-6 story-start-content max-w-[70%] md:max-w-[55%]">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-hand text-marsala text-[1.5rem] mb-4"
                >
                  зима 2018
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <p className="font-serif text-[2rem] font-medium text-chocolate leading-tight">
                    Это история любви
                  </p>
                  <p className="font-serif text-[2rem] font-medium text-chocolate leading-tight">
                    с первого взгляда
                  </p>
                  <p className="font-hand text-[1.5rem] text-olive mt-3 italic">Почти.</p>
                </motion.div>

                {!showStoryResult ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="font-serif text-[1.1rem] text-chocolate/80 mb-5">
                      Она впервые увидела его и подумала:
                    </p>
                    <div className="flex flex-col gap-3">
                      {['Интересно...', 'Может быть', 'Точно нет'].map((answer, i) => (
                        <motion.button
                          key={answer}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          onClick={() => handleStoryAnswer(answer)}
                          disabled={storyAnswer !== null}
                          className={`text-left font-serif text-[1.1rem] py-4 px-5 border-2 rounded-lg transition-all ${
                            storyAnswer === answer
                              ? 'bg-marsala text-cream border-marsala'
                              : 'border-chocolate text-chocolate hover:border-marsala bg-cream/80'
                          } ${storyAnswer && storyAnswer !== answer ? 'opacity-40' : ''}`}
                        >
                          {answer}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-serif text-[1.1rem] text-chocolate/80 mb-4">
                      Она впервые увидела его и подумала:
                    </p>
                    <p className="font-serif text-[2.0rem] font-semibold text-marsala italic">
                      «Точно нет, ведь он слишком молод»
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 3: FIRST MEETING ========== */}
          {currentScreen === 2 && (
            <motion.div
              key="first-meeting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <FadeImage
                src="./images/first-meeting.png"
                alt="Прогулка по лесу осенью"
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'top 0%',
                  transform: 'scale(1)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/70 to-transparent z-0" />

              <div className="relative z-10 pt-5 px-5">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-hand text-marsala text-[1.5rem] mb-2"
                >
                  Осень 2019
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="font-serif text-[1.5rem] font-medium text-chocolate mb-2">
                    Они пошли гулять по лесу
                  </p>
                  <p className="font-serif text-[2rem] font-semibold text-chocolate leading-tight ">
                    Ещё до утра
                  </p>
                  <p className="font-serif text-[2rem] font-semibold text-marsala leading-tight ">
                    они всё поняли
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 4: DANCE ========== */}
          {currentScreen === 3 && (
            <motion.div
              key="dance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <FadeImage
                src="./images/dance.png"
                alt="Танец пары"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/70 to-transparent z-0" />

              {/* Добавлен класс для адаптации текста */}
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dance-text-top absolute top-8 left-10 font-hand text-marsala text-[2.0rem] z-20"
              >
                Месяц спустя...
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="dance-text-bottom absolute top-20 right-12 font-hand text-marsala text-[1.75rem] font-medium text-center z-20"
              >
                Их первый медленный танец
              </motion.p>
            </motion.div>
          )}

          {/* ========== ЭКРАН 5: LAUGHTER ========== */}
          {currentScreen === 4 && (
            <motion.div
              key="laughter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <FadeImage
                src="./images/laughter.png"
                alt="Смеющаяся пара"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                style={{ objectPosition: 'center 70%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/50 to-transparent z-0" />

              <div className="relative z-10 pt-16 px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="font-serif text-[2rem] font-medium text-chocolate mb-1">
                    В этот момент
                  </p>
                  <p className="font-serif text-[2rem] font-medium text-chocolate">
                    они засмеялись
                  </p>
                  <div className="w-16 h-0.5 bg-gold my-6" />
                  <p className="font-serif text-[1.5rem] text-marsala italic">
                    и с этого всё началось
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 6: TOGETHER ========== */}
          {currentScreen === 5 && (
            <motion.div
              key="together"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <FadeImage
                src="./images/together.png"
                alt="Счастливая пара вместе"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                style={{ objectPosition: 'center 75%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/40 to-cream/80 z-0" />

              <div className="absolute top-12 left-0 right-0 z-10 px-6 text-center">
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-serif text-[5rem] font-semibold text-chocolate leading-none tracking-tight"
                >
                  {displayDays}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-hand text-olive text-[1.5rem] mt-1"
                >
                  дней вместе
                </motion.p>
              </div>

              <div className="absolute bottom-8 left-0 right-0 z-10 px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="font-serif text-[1.25rem] font-medium text-chocolate mb-1">
                    С того дня прошло 5,5 лет
                  </p>
                  <p className="font-serif text-[1.1rem] text-chocolate/80 mb-4">
                    И каждый день с мыслями друг о друге
                  </p>
                  <p className="font-hand text-[1.75rem] text-marsala italic">И что дальше?</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 7: PROPOSAL ========== */}
          {currentScreen === 6 && (
            <motion.div
              key="proposal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative flex flex-col justify-end"
            >
              <motion.img
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                src="./images/proposal.png"
                alt="Предложение на горе в Китае"
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />

              <Snowfall />

              <div className="relative z-20 p-6 pb-12">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-hand text-gold text-[1.5rem] mb-6"
                >
                  май 2025
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-serif text-[1.25rem] text-white/85 mb-6"
                >
                  Китай. Гора. Закат.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="font-serif text-[2.5rem] font-semibold text-white leading-tight drop-shadow-lg">
                    Она сказала
                  </p>
                  <p className="font-serif text-[4rem] font-bold text-gold leading-none italic drop-shadow-xl">
                    «да»
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 8: INVITATION ========== */}
          {currentScreen === 7 && (
            <motion.div
              key="invitation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative flex items-end pb-28"
            >
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                src="./images/invitation.png"
                alt="Приглашение"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
              />

              <div className="relative z-10 px-8 max-w-xl">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-hand text-marsala text-[1.5rem] mb-4"
                >
                  Это была история про нас
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="font-hand text-[2.5rem] text-olive italic mb-4"
                >
                  Павел и Екатерина
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="font-serif text-[3.5rem] font-semibold text-chocolate leading-none tracking-tight mb-6"
                >
                  29.06.2026
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                >
                  <p className="font-serif text-[1.25rem] text-chocolate mb-1">
                    Для нас наступает новый этап
                  </p>
                  <p className="font-serif text-[1.25rem] text-marsala">
                    Хотим вступить в него с вами
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 9: VENUE ========== */}
          {currentScreen === 8 && (
            <motion.div
              key="venue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <motion.img
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2 }}
                src="./images/venue.png"
                alt="Пасторское озеро"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolate/95 via-chocolate/40 to-transparent" />

              {/* Добавлен класс для адаптации текста */}
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="venue-text absolute top-10 left-6 right-6 z-20 font-hand font-semibold text-gold text-[2.5rem] [text-shadow:1px_1px_0_#8B5A2B,_-1px_-1px_0_#8B5A2B,_1px_-1px_0_#8B5A2B,_-1px_1px_0_#8B5A2B]"
              >
                И мы уже знаем, где это случится
              </motion.p>

              <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-[3rem] font-semibold text-white leading-none mb-4 drop-shadow-lg"
                >
                  Пасторское озеро
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="font-serif text-[1.25rem] text-white/90 max-w-lg mb-4 leading-relaxed"
                >
                  Место, где природа встречается с уютом.
                  <br />
                  Где можно выдохнуть и просто быть рядом.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col gap-1"
                >
                  <p className="font-serif text-[1.5rem] text-white font-semibold">18+</p>
                  <p className="font-serif text-[1rem] text-white/70">
                    Санкт-Петербург, Выборгское ш., 39 км
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 10: SCHEDULE ========== */}
          {currentScreen === 9 && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative overflow-y-auto px-4 py-2.5"
            >
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-hand text-marsala text-[2.5rem] mb-4 text-center"
              >
                Расписание дня
              </motion.h2>

              <div className="relative">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: '100%', opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-0 w-0.5 bg-chocolate/30 -translate-x-1/2"
                  style={{ transformOrigin: 'top' }}
                />

                <div className="grid grid-cols-[1fr_auto_1fr] gap-y-6 relative z-10">
                  {[
                    { id: 1, time: '13:30', desc: 'Трансфер', icon: 'bus' },
                    { id: 2, time: '15:00', desc: 'Сбор гостей', icon: 'guests' },
                    { id: 3, time: '15:30', desc: 'Начало церемонии', icon: 'ceremony' },
                    { id: 4, time: '16:00', desc: 'Банкет', icon: 'banquet' },
                    { id: 5, time: '20:00', desc: 'Торт', icon: 'cake' },
                    { id: 6, time: '21:00', desc: 'Дискотека', icon: 'disco' },
                    { id: 7, time: '22:00', desc: 'Окончание', icon: 'end' },
                  ].map((event) => {
                    const isLeft = event.id % 2 !== 0; // чередование на основе id

                    return (
                      <React.Fragment key={event.id}>
                        <div className="flex items-center h-12">
                          {isLeft ? (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + event.id * 0.1 }}
                              className="flex items-center justify-end w-full gap-2"
                            >
                              <div className="schedule-card bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-chocolate/10 max-w-[140px]">
                                <p className="font-serif font-semibold text-olive text-sm">
                                  {event.time}
                                </p>
                                <p className="font-serif text-chocolate text-xs leading-tight">
                                  {event.desc}
                                </p>
                              </div>
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.3 + event.id * 0.1, duration: 0.4 }}
                                style={{ transformOrigin: 'right' }}
                                className="h-0.5 bg-chocolate/30 flex-1"
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + event.id * 0.1 }}
                              className="flex justify-end w-full"
                            >
                              <img
                                src={`./icons/${event.icon}.svg`}
                                alt=""
                                onError={handleIconError}
                                className="w-16 h-12 object-contain"
                              />
                            </motion.div>
                          )}
                        </div>

                        <div className="flex items-center justify-center h-12">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + event.id * 0.1, type: 'spring' }}
                            className="w-4 h-4 rounded-full bg-marsala border-2 border-cream shadow-md z-20"
                          />
                        </div>

                        <div className="flex items-center h-12">
                          {!isLeft ? (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + event.id * 0.1 }}
                              className="flex items-center justify-start w-full gap-2"
                            >
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.3 + event.id * 0.1, duration: 0.4 }}
                                style={{ transformOrigin: 'left' }}
                                className="h-0.5 bg-chocolate/30 flex-1"
                              />
                              <div className="schedule-card bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-chocolate/10 max-w-[140px]">
                                <p className="font-serif font-semibold text-olive text-sm">
                                  {event.time}
                                </p>
                                <p className="font-serif text-chocolate text-xs leading-tight">
                                  {event.desc}
                                </p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + event.id * 0.1 }}
                              className="flex justify-start w-full"
                            >
                              <img
                                src={`./icons/${event.icon}.svg`}
                                alt=""
                                onError={handleIconError}
                                className="w-16 h-12 object-contain"
                              />
                            </motion.div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="font-hand text-olive text-[1.25rem] mt-8 text-center italic"
              >
                Время примерное, но мы постараемся не задерживать
              </motion.p>
            </motion.div>
          )}

          {/* ========== ЭКРАН 11: PREPARATION ========== */}
          {currentScreen === 10 && (
            <motion.div
              key="preparation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col justify-start px-6 py-8"
            >
              <div className="mb-8">
                <p className="font-serif text-olive text-lg uppercase tracking-widest mb-1">
                  До встречи осталось
                </p>
                <p className="font-serif text-[4rem] font-semibold text-chocolate leading-none">
                  {getDaysUntilWedding()}
                </p>
                <p className="font-hand text-olive text-[1.75rem]">дней</p>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="font-serif text-chocolate font-semibold text-[1.75rem] mb-2">
                    Что надеть
                  </p>
                  <p className="font-serif text-chocolate/80 text-[1.4rem] mb-3">
                    Приходите в этих оттенках:
                  </p>
                  <div className="flex gap-4">
                    <span className="w-12 h-12 rounded-full bg-[#2d9c5d] border-2 border-chocolate/30" />
                    <span className="w-12 h-12 rounded-full bg-[#8B5A2B] border-2 border-chocolate/30" />
                    <span className="w-12 h-12 rounded-full bg-[#7AA5B9] border-2 border-chocolate/30" />
                    <span className="w-12 h-12 rounded-full bg-[#f0ed67] border-2 border-chocolate/30" />
                  </div>
                  <p className="font-hand text-olive text-[1.25rem] mt-2">
                    Строгой проверки не будет
                  </p>
                </div>

                <div>
                  <p className="font-serif text-chocolate font-semibold text-[1.75rem] mb-2">
                    Подарки
                  </p>
                  <p className="font-serif text-chocolate/80 text-[1.4rem]">
                    Мы мечтаем о большом путешествии. Благодарны любому вкладу, который приблизит
                    нас к этому.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 12: CHEATSHEET ========== */}
          {currentScreen === 11 && (
            <motion.div
              key="cheatsheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col justify-center px-6"
            >
              <h2 className="font-hand text-marsala text-[2.5rem] mb-5">Шпаргалка</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-serif text-olive text-sm uppercase tracking-wide mb-2">Когда</p>
                  <p className="font-serif text-chocolate text-[1.25rem] font-semibold leading-tight">
                    29 июня
                  </p>
                  <p className="font-serif text-chocolate text-[1rem]">понедельник</p>
                  <p className="font-serif text-chocolate/70 text-[0.9rem] mt-2">15:00 — 22:00</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-serif text-olive text-sm uppercase tracking-wide mb-2">Где</p>
                  <p className="font-serif text-chocolate text-[1.25rem] font-semibold">
                    Пасторское озеро
                  </p>
                  <a
                    href="https://yandex.ru/maps/org/pastorskoye_ozero/12506144592/?ll=30.133905%2C60.193748&utm_campaign=v1&utm_medium=rating&utm_source=badge&z=11"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-serif text-marsala text-[0.9rem] mt-2 underline"
                  >
                    Маршрут →
                  </a>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-serif text-olive text-sm uppercase tracking-wide mb-3">
                    Что надеть
                  </p>
                  <div className="flex gap-2">
                    <span className="w-12 h-12 rounded-full bg-[#2d9c5d] border-2 border-chocolate/30" />
                    <span className="w-12 h-12 rounded-full bg-[#8B5A2B] border-2 border-chocolate/30" />
                    <span className="w-12 h-12 rounded-full bg-[#7AA5B9] border-2 border-chocolate/30" />
                    <span className="w-12 h-12 rounded-full bg-[#f0ed67] border-2 border-chocolate/30" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-serif text-olive text-sm uppercase tracking-wide mb-2">
                    Что взять
                  </p>
                  <p className="font-serif text-chocolate/80 text-[0.9rem]">Хорошее настроение</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-serif text-olive text-sm uppercase tracking-wide mb-3">
                    Вопросы?
                  </p>
                  <a
                    href="https://t.me/ushakova_wed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-serif text-cream bg-olive py-2 px-4 rounded-lg text-[0.9rem]"
                  >
                    Обращайтесь к организатору - Кристине
                  </a>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="font-serif text-olive text-sm uppercase tracking-wide mb-2">
                    Контакт
                  </p>
                  <a
                    href="tel:+79111203141"
                    className="font-serif text-chocolate text-[1rem] font-medium"
                  >
                    +7 911 120-31-41
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== ЭКРАН 13: RSVP ========== */}
          {currentScreen === 12 && (
            <motion.div
              key="rsvp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col justify-center px-6 relative"
            >
              {!formSubmitted ? (
                <>
                  {!showForm ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <h2 className="font-serif text-[2.5rem] font-semibold text-chocolate mb-2">
                        Придёте?
                      </h2>
                      <p className="font-hand text-marsala text-[1.25rem] mb-8 border-b-2 border-marsala/30 pb-2 inline-block">
                        Ждём ответа до 1 мая
                      </p>
                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => {
                            setShowForm(true);
                            setResponseType('accept');
                          }}
                          className="w-full py-4 bg-marsala text-cream font-serif text-lg rounded-lg hover:bg-opacity-90 transition-all"
                        >
                          Конечно
                        </button>
                        <button
                          onClick={() => {
                            setResponseType('decline');
                            setFormSubmitted(true);
                          }}
                          className="w-full py-4 border-2 border-marsala text-marsala font-serif text-lg rounded-lg hover:bg-marsala/10 transition-all"
                        >
                          К сожалению не получится
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full"
                    >
                      <h2 className="font-serif text-[2rem] font-semibold text-chocolate mb-4 text-center">
                        Отлично! Заполните анкету
                      </h2>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ваше имя"
                          className="w-full p-3 border-2 border-chocolate rounded-lg font-serif bg-transparent"
                          required
                        />

                        <div>
                          <p className="font-serif text-chocolate mb-2">
                            Алкоголь (можно выбрать несколько)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {['Водка', 'Вино белое', 'Вино красное', 'Коньяк', 'Виски', 'Безалкогольное'].map(
                              (option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    const alcohol = formData.alcohol.includes(option)
                                      ? formData.alcohol.filter((a) => a !== option)
                                      : [...formData.alcohol, option];
                                    setFormData({ ...formData, alcohol });
                                  }}
                                  className={`px-4 py-2 border-2 border-chocolate rounded-lg font-serif transition-all ${
                                    formData.alcohol.includes(option)
                                      ? 'bg-marsala text-cream border-marsala'
                                      : ''
                                  }`}
                                >
                                  {option}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="font-serif text-chocolate mb-2">Аллергии и особые пожелания</p>
                          <textarea
                            value={formData.allergies}
                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            placeholder="Если есть аллергии или особые пожелания, напишите здесь"
                            className="w-full p-3 border-2 border-chocolate rounded-lg font-serif bg-transparent min-h-[80px]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!formData.name || isSubmitting}
                          className="w-full py-4 bg-marsala text-cream font-serif text-lg rounded-lg disabled:opacity-50"
                        >
                          {isSubmitting ? 'Отправляем...' : 'Отправить'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <FloatingHearts />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center"
                  >
                    {responseType === 'accept' ? (
                      <>
                        <motion.p
                          initial={{ y: 20 }}
                          animate={{ y: 0 }}
                          className="font-serif text-[3rem] font-semibold text-chocolate mb-4"
                        >
                          Ждём вас!
                        </motion.p>
                        <p className="font-hand text-olive text-[1.5rem] mb-6">
                          Будем рады разделить этот день с вами!
                        </p>
                      </>
                    ) : (
                      <>
                        <motion.p
                          initial={{ y: 20 }}
                          animate={{ y: 0 }}
                          className="font-serif text-[3rem] font-semibold text-chocolate mb-4"
                        >
                          Спасибо за ответ!
                        </motion.p>
                        <p className="font-hand text-olive text-[1.5rem] mb-6">
                          Очень жаль, что не получится. Будем рады видеть вас в другой раз.
                        </p>
                      </>
                    )}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="font-hand text-marsala text-[1.25rem]"
                    >
                      Павел и Екатерина
                    </motion.p>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}