import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSyncedData } from "./useSyncedData";

/**
 * "Misión Diversión" — Single-file React app
 * - Scroll storytelling with questions
 * - Final screen reveals a PHRASE (password)
 * - Typing that phrase unlocks the secret plan (2 meses + bonus)
 * - Checklist with checkboxes + ability to add new bonus plans
 * - State persisted to localStorage
 * - TailwindCSS styling with smooth scroll animations
 *
 * 👉 Personaliza fácilmente:
 *  - TITLE
 *  - PASSWORD_PHRASE (se muestra al final y se exige para desbloquear)
 *  - GOOGLE_DOC_URL (opcional, si quieres enlazar tu doc)
 */

const TITLE = "Operación: Planazos Épicos 🚀";
const PASSWORD_HINT = "Toc toc, ¿quién es?"; // <- Pista que se muestra
const PASSWORD_PHRASE = "ding dong"; // <- Contraseña real para desbloquear
const GOOGLE_DOC_URL = "https://docs.google.com/document/d/15kjoUrcE2n28rG1LSsyCquiviLovyC1uopzlBoPYj34/edit?usp=sharing"; // Pega aquí tu enlace de Google Docs si lo tienes

// ---------- Datos del plan (2 meses + extras) ----------
const PLAN_DATA: {
  month: string;
  weeks: { title: string; items: string[] }[];
}[] = [
  {
    month: "📅 Mes 1",
    weeks: [
      {
        title: "Semana 1 — Relajados y cercanos",
        items: [
          "Atardecer en Las Canteras con helado",
          "Paseo en guagua y bajarse en un sitio random",
        ],
      },
      {
        title: "Semana 2 — Risas y juego",
        items: [
          "Karaoke casero con YouTube y picoteo",
          "Mercadillo de Teror con reto de 'lo más raro'",
        ],
      },
      {
        title: "Semana 3 — Aventura ligera",
        items: [
          "Excursión corta a un charco natural en: Agaete / Barranco de los Cernícalos / Azuaje",
          "Ruta de graffitis urbanos y fotos improvisadas",
        ],
      },
      {
        title: "Semana 4 — Momentos confi",
        items: [
          "Cine en casa con maratón de pelis y snacks caseros — Peli? Star Wars, sé que te gusta mucho",
          "Subida nocturna al Pico de Bandama con mantita para ver 'las luces mágicas'",
        ],
      },
    ],
  },
  {
    month: "📅 Mes 2",
    weeks: [
      {
        title: "Semana 5 — Aventura compartida",
        items: [
          "Sendero al Roque Nublo al amanecer",
          "Paddle surf o kayak en Mogán",
        ],
      },
      {
        title: "Semana 6 — Originales y creativos",
        items: [
          "Cocinar juntos algo canario (papas arrugadas, gofio, etc.)",
          "Reto de turistas: gorra, mapa y fotos ridículas en Vegueta",
        ],
      },
      {
        title: "Semana 7 — Conexión estelar",
        items: [
          "Noche de estrellas en Artenara con café/termo",
          "Sesión de fotos 'profesional'. Influencer time.",
        ],
      },
      {
        title: "Semana 8 — El broche final",
        items: [
          "Tour de playas secretas en coche un día entero",
          "Crear una playlist juntos y dar una vuelta en coche escuchándola",
        ],
      },
    ],
  },
];

const BONUS_DEFAULT = [
  "Viaje juntos a otra isla o ciudad ✈️",
  "Ir a un festival de música 🎶",
  "Visitar un museo o exposición 🖼️",
  "Escapada de fin de semana en apartamentos rurales o cerca de la playa 🏡",
  "Ir a ver un partido de la UD Las Palmas",
];

// ---------- Helpers ----------
const KEY_CHECKS = "md_checklist_checks_v1";
const KEY_BONUS = "md_checklist_bonus_v1";
const KEY_TODAY_PLAN = "md_today_plan_v1";

// Tipos para el plan de hoy
interface TodayPlanItem {
  id: string;
  text: string;
  completed: boolean;
  source: string; // "plan" | "bonus" | "custom"
  addedAt: string;
}

// Hook para scroll suave automático
function useSmoothScroll(unlocked: boolean) {
  useEffect(() => {
    // Si ya está desbloqueado, no interfierr con el scroll normal
    if (unlocked) return;
    
    let isScrolling = false;

    // Detectar si estamos en macOS para mejor manejo
    const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const handleWheel = (e: WheelEvent) => {
      // Detectar si estamos en la sección de contraseña o después
      const passwordSection = document.getElementById('password');
      if (!passwordSection) return;
      
      const passwordTop = passwordSection.offsetTop;
      const currentScrollY = window.scrollY;
      
      // Umbral más preciso para detectar que ya pasamos la contraseña
      const threshold = isMacOS ? 100 : 50; // Mayor umbral para macOS
      
      // Si ya pasamos la sección de contraseña con suficiente margen, permitir scroll normal
      if (currentScrollY >= (passwordTop - threshold)) {
        return; // No interferir con el scroll natural
      }
      
      // Prevenir el scroll nativo solo antes de la contraseña
      e.preventDefault();
      
      // Si ya estamos haciendo scroll, ignorar
      if (isScrolling) return;
      
      // Marcar que estamos scrolleando
      isScrolling = true;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calcular la sección actual
      const currentSection = Math.round(currentScrollY / windowHeight);
      const totalSections = Math.ceil(documentHeight / windowHeight);
      
      // Sensibilidad adaptada para macOS (trackpad más sensible)
      const scrollThreshold = isMacOS ? 5 : 10;
      
      // Determinar dirección
      let targetSection: number;
      if (e.deltaY > scrollThreshold) { // Scroll hacia abajo
        targetSection = Math.min(currentSection + 1, totalSections - 1);
        
        // Si la próxima sección sería la de contraseña o después, ir directamente ahí
        const targetY = targetSection * windowHeight;
        if (targetY >= (passwordTop - threshold)) {
          window.scrollTo({
            top: passwordTop,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        }
      } else if (e.deltaY < -scrollThreshold) { // Scroll hacia arriba
        targetSection = Math.max(currentSection - 1, 0);
        const targetY = targetSection * windowHeight;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      } else {
        isScrolling = false;
        return;
      }
      
      // Resetear el flag después de que termine la animación
      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Solo para dispositivos táctiles, no trackpads de macOS
      if (isMacOS) return;
      
      // Detectar si estamos en la sección de contraseña o después
      const passwordSection = document.getElementById('password');
      if (!passwordSection) return;
      
      const passwordTop = passwordSection.offsetTop;
      const currentScrollY = window.scrollY;
      
      // Si ya pasamos la sección de contraseña, permitir scroll normal
      if (currentScrollY >= (passwordTop - 50)) {
        return;
      }
      
      const touch = e.touches[0];
      const startY = touch.clientY;
      
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaY = startY - touch.clientY;
        
        // Si el movimiento es suficiente, navegar
        if (Math.abs(deltaY) > 50 && !isScrolling) {
          isScrolling = true;
          
          const currentScrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const currentSection = Math.round(currentScrollY / windowHeight);
          const totalSections = Math.ceil(documentHeight / windowHeight);
          
          let targetSection: number;
          if (deltaY > 0) { // Swipe hacia arriba (scroll hacia abajo)
            targetSection = Math.min(currentSection + 1, totalSections - 1);
            
            // Si la próxima sección sería la de contraseña o después, ir directamente ahí
            const targetY = targetSection * windowHeight;
            if (targetY >= (passwordTop - 50)) {
              window.scrollTo({
                top: passwordTop,
                behavior: 'smooth'
              });
            } else {
              window.scrollTo({
                top: targetY,
                behavior: 'smooth'
              });
            }
          } else { // Swipe hacia abajo (scroll hacia arriba)
            targetSection = Math.max(currentSection - 1, 0);
            const targetY = targetSection * windowHeight;
            window.scrollTo({
              top: targetY,
              behavior: 'smooth'
            });
          }
          
          setTimeout(() => {
            isScrolling = false;
          }, 800);
          
          // Remover listeners
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        }
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };

    // Añadir listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    if (!isMacOS) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
    }
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (!isMacOS) {
        document.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [unlocked]); // Dependencia del estado unlocked
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- Componentes ----------

// Indicador de sincronización
const SyncIndicator: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('connected');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Simular estado de conexión después de un momento
    const timer = setTimeout(() => {
      if (isOnline) {
        setConnectionStatus('connected');
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  const getStatusInfo = () => {
    if (isLoading) return { icon: '🔄', text: 'Cargando...', color: 'text-blue-600' };
    if (connectionStatus === 'offline') return { icon: '📴', text: 'Sin conexión', color: 'text-amber-600' };
    if (connectionStatus === 'error') return { icon: '❌', text: 'Error Firebase', color: 'text-red-600' };
    if (connectionStatus === 'connected') return { icon: '✅', text: 'Sincronizado', color: 'text-green-600' };
    return { icon: '🔄', text: 'Conectando...', color: 'text-blue-600' };
  };

  const status = getStatusInfo();

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg border text-xs">
      <span className="text-base">{status.icon}</span>
      <span className={status.color}>{status.text}</span>
    </div>
  );
};

const ScrollIndicator: React.FC<{ nextSection?: string }> = ({ nextSection }) => {
  const handleClick = () => {
    if (nextSection) {
      document.querySelector(nextSection)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Si no hay nextSection específico, ir a la siguiente sección
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentSection = Math.round(currentScrollY / windowHeight);
      const targetY = (currentSection + 1) * windowHeight;
      
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider text-center px-4">
        Toca o desliza para continuar
      </span>
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 rounded-lg p-3 touch-manipulation"
        aria-label="Ir a la siguiente sección"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-8 h-8 sm:w-6 sm:h-6 border-2 border-current rounded-full flex items-center justify-center group-hover:border-indigo-500 transition-colors"
        >
          <div className="w-1.5 h-1.5 sm:w-1 sm:h-1 bg-current rounded-full group-hover:bg-indigo-500 transition-colors"></div>
        </motion.div>
        <motion.svg
          animate={{ y: [0, 3, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
          className="w-5 h-5 sm:w-4 sm:h-4 group-hover:text-indigo-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </button>
    </motion.div>
  );
};

const QuestionSection: React.FC<{
  title: string;
  subtitle?: string;
  bullets?: string[];
  index: number;
  totalQuestions: number;
}> = ({ title, subtitle, bullets = [], index, totalQuestions }) => {
  const isLast = index === totalQuestions - 1;
  
  // Determinar la siguiente sección basada en el índice
  const getNextSection = () => {
    if (isLast) {
      return "#gate"; // Ir a la sección gate antes de password
    } else {
      return `#question-${index + 1}`;
    }
  };

  return (
    <section 
      id={`question-${index}`}
      className="min-h-screen snap-start flex items-center justify-center px-4 xs:px-6 sm:px-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 opacity-40 bg-gradient-to-b from-indigo-100 via-white to-amber-100" />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-3xl text-center w-full"
      >
        <p className="uppercase tracking-widest text-xs text-gray-500 mb-3">Pregunta {index + 1}</p>
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight px-4">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-gray-600 text-sm xs:text-base sm:text-lg md:text-xl px-4">{subtitle}</p>
        )}
        {bullets.length > 0 && (
          <div className="mt-8 grid gap-3 sm:gap-4 max-w-md mx-auto">
            {bullets.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-white/50 hover:bg-white/90 transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 group-hover:bg-indigo-600 transition-colors"></div>
                <span className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">{b}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      <ScrollIndicator nextSection={getNextSection()} />
    </section>
  );
};

const ProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <motion.div
      style={{ width }}
      className="fixed top-0 left-0 h-1 bg-indigo-500 z-50"
    />
  );
};

const PasswordGate: React.FC<{
  onUnlock: () => void;
  unlocked: boolean;
}> = ({ onUnlock, unlocked }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function tryUnlock() {
    const ok = input.trim().toLowerCase() === PASSWORD_PHRASE.trim().toLowerCase();
    if (ok) {
      setError("");
      onUnlock();
    } else {
      setError("¿Quién llama a la puerta? Piensa en el sonido... 🔔");
      inputRef.current?.focus();
    }
  }

  return (
    <section id="password" className="min-h-[80vh] py-12 sm:py-20 px-4 sm:px-6 bg-white/70 backdrop-blur">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">El acertijo final</h3>
        <p className="mt-3 text-gray-600 text-sm sm:text-base px-2">
          Has llegado hasta el final. Resuelve la pista para desbloquear el plan secreto.
        </p>
        <p className="mt-2 text-gray-500 text-xs sm:text-sm px-2">
          💡 El plan se oculta automáticamente al recargar la página para evitar spoilers 👀
        </p>

        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-indigo-50 border">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">Pista</p>
          <p className="mt-2 text-lg sm:text-2xl md:text-3xl font-extrabold select-all leading-tight">
            "{PASSWORD_HINT}"
          </p>
          <p className="mt-2 text-gray-500 text-xs sm:text-sm">(Piensa en la respuesta a esta pregunta 🤔)</p>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col gap-3 justify-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            placeholder="Escribe la respuesta a la pista..."
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-indigo-200 text-sm sm:text-base touch-manipulation"
          />
          <button
            onClick={tryUnlock}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 active:scale-[.99] text-sm sm:text-base touch-manipulation"
          >
            Desbloquear
          </button>
        </div>
        {error && <p className="mt-3 text-rose-500 text-sm px-2">{error}</p>}

        {unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 sm:mt-10 text-green-700 font-medium text-sm sm:text-base"
          >
            ¡Listo! Plan desbloqueado ✅ Desliza un poco más para verlo.
          </motion.div>
        )}
      </div>
    </section>
  );
};

const SecretPlan: React.FC<{
  checks: Record<string, boolean>;
  setChecks: (v: Record<string, boolean>) => void;
  bonus: string[];
  setBonus: (v: string[]) => void;
}> = ({ checks, setChecks, bonus, setBonus }) => {
  const [newBonus, setNewBonus] = useState("");

  function toggle(item: string) {
    const id = slugify(item);
    setChecks({ ...checks, [id]: !checks[id] });
  }

  function addBonus() {
    const v = newBonus.trim();
    if (!v) return;
    setBonus([...bonus, v]);
    setNewBonus("");
  }

  function clearAll() {
    if (confirm("¿Seguro que quieres desmarcar todo?")) {
      const cleared: Record<string, boolean> = {};
      setChecks(cleared);
    }
  }

  return (
    <section id="plan" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">{TITLE}</h3>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              2 meses de planes pensados para disfrutar, reír y crear recuerdos. Marca lo que vayan cumpliendo ✨
            </p>
            <p className="mt-1 text-indigo-600 text-xs sm:text-sm">
              💫 Los datos se sincronizan automáticamente entre dispositivos cuando estás conectado
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {GOOGLE_DOC_URL && (
              <a
                href={GOOGLE_DOC_URL}
                target="_blank"
                className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-xs sm:text-sm text-center touch-manipulation"
              >
                Abrir en Google Docs
              </a>
            )}
            <button 
              onClick={() => window.print()} 
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm touch-manipulation"
            >
              Imprimir
            </button>
            <button 
              onClick={clearAll} 
              className="px-4 py-2 rounded-xl border text-xs sm:text-sm touch-manipulation"
            >
              Desmarcar todo
            </button>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8">
          {PLAN_DATA.map((month, mi) => (
            <div key={mi} className="rounded-2xl border shadow-sm p-4 sm:p-6">
              <h4 className="text-xl sm:text-2xl font-bold">{month.month}</h4>
              <div className="mt-4 grid gap-4 sm:gap-6 lg:grid-cols-2">
                {month.weeks.map((w, wi) => (
                  <div key={wi} className="rounded-xl bg-gradient-to-br from-amber-50 to-indigo-50 p-4 sm:p-5 border">
                    <h5 className="font-semibold text-base sm:text-lg mb-4">{w.title}</h5>
                    <ul className="space-y-3">
                      {w.items.map((it, ii) => {
                        const id = slugify(`${month.month}-${w.title}-${it}`);
                        const checked = !!checks[id];
                        return (
                          <li key={ii} className="flex items-start gap-3">
                            <button
                              onClick={() => toggle(`${month.month}-${w.title}-${it}`)}
                              className={`mt-0.5 w-6 h-6 sm:w-5 sm:h-5 rounded border flex items-center justify-center touch-manipulation ${
                                checked ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                              }`}
                              aria-label={checked ? "Desmarcar" : "Marcar"}
                            >
                              {checked ? "✔" : ""}
                            </button>
                            <span className={`text-sm sm:text-base leading-relaxed ${checked ? "line-through text-gray-500" : ""}`}>
                              {it}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bonus section */}
          <div className="rounded-2xl border shadow-sm p-4 sm:p-6">
            <h4 className="text-xl sm:text-2xl font-bold">📅 Planes Extra / Bonus</h4>
            <ul className="mt-4 space-y-3">
              {bonus.map((it, i) => {
                const id = slugify(`bonus-${it}`);
                const checked = !!checks[id];
                return (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => toggle(`bonus-${it}`)}
                      className={`mt-0.5 w-6 h-6 sm:w-5 sm:h-5 rounded border flex items-center justify-center touch-manipulation ${
                        checked ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                      }`}
                    >
                      {checked ? "✔" : ""}
                    </button>
                    <span className={`text-sm sm:text-base leading-relaxed ${checked ? "line-through text-gray-500" : ""}`}>
                      {it}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Add new bonus */}
            <div className="mt-6 flex flex-col gap-3">
              <input
                value={newBonus}
                onChange={(e) => setNewBonus(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBonus()}
                placeholder="Añadir nuevo plan extra (p.ej. 'Escapada a Lanzarote')"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-indigo-200 text-sm sm:text-base touch-manipulation"
              />
              <button 
                onClick={addBonus} 
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm sm:text-base touch-manipulation"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TodayPlan: React.FC<{
  todayPlan: TodayPlanItem[];
  setTodayPlan: (v: TodayPlanItem[]) => void;
  allPlanItems: { text: string; fullId: string }[];
  bonusItems: string[];
  checks: Record<string, boolean>;
  setChecks: (v: Record<string, boolean>) => void;
}> = ({ todayPlan, setTodayPlan, allPlanItems, bonusItems, checks, setChecks }) => {
  const [draggedItem, setDraggedItem] = useState<{ text: string; source: 'plan' | 'bonus' } | null>(null);
  const [newCustomItem, setNewCustomItem] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);

  // Filtrar los items según la opción seleccionada
  const availableItems = useMemo(() => {
    const allItems = [...allPlanItems.map(item => ({ ...item, source: 'plan' as const })), ...bonusItems.map(item => ({ text: item, fullId: item, source: 'bonus' as const }))];
    
    if (showAllPlans) {
      return allItems; // Mostrar todos
    }
    
    // Obtener IDs de items que ya están en el plan de hoy
    const todayPlanIds = todayPlan.map(item => item.id);
    
    return allItems.filter(item => {
      const itemId = slugify(item.fullId);
      return !checks[itemId] && !todayPlanIds.includes(itemId); // Solo mostrar si NO está marcado Y NO está en plan de hoy
    });
  }, [allPlanItems, bonusItems, checks, showAllPlans, todayPlan]);

  const handleDragStart = (e: React.DragEvent, text: string, source: 'plan' | 'bonus', fullId?: string) => {
    setDraggedItem({ text, source });
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData('text/plain', JSON.stringify({ text, source, fullId }));
  };

  const handleItemClick = (text: string, source: 'plan' | 'bonus', fullId?: string) => {
    addItemToToday(text, source, fullId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Usar dataTransfer para obtener los datos
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const itemData = JSON.parse(dataStr);
        if (itemData && itemData.text && itemData.source) {
          addItemToToday(itemData.text, itemData.source, itemData.fullId);
          setDraggedItem(null);
          return;
        }
      }
    } catch (err) {
      console.error('Error with dataTransfer:', err);
    }
    
    // Método de respaldo: usar estado
    if (draggedItem && draggedItem.text && draggedItem.source) {
      addItemToToday(draggedItem.text, draggedItem.source);
    }
    
    setDraggedItem(null);
  };

  const addItemToToday = (text: string, source: "plan" | "bonus" | "custom", fullId?: string) => {
    // Crear un ID consistente con el usado en el filtro
    let itemId: string;
    
    if (source === 'plan' && fullId) {
      // Para planes mensuales, usar el fullId slugificado
      itemId = slugify(fullId);
    } else if (source === 'bonus') {
      // Para bonus items, usar el formato bonus-{texto}
      itemId = slugify(`bonus-${text}`);
    } else {
      // Para custom items y fallback, usar solo el texto
      itemId = slugify(text);
    }
    
    // Verificar si ya está en el plan de hoy
    const existingItem = todayPlan.find(item => item.id === itemId);
    if (existingItem) {
      return;
    }

    const newItem: TodayPlanItem = {
      id: itemId,
      text,
      completed: false,
      source,
      addedAt: new Date().toISOString()
    };

    setTodayPlan([...todayPlan, newItem]);
  };

  const toggleTodayItem = (id: string) => {
    // Encontrar el item y actualizar su estado
    const item = todayPlan.find(item => item.id === id);
    if (!item) return;
    
    // Calcular el nuevo estado de completado
    const newCompletedState = !item.completed;
    
    // Actualizar el plan de hoy
    setTodayPlan(todayPlan.map(item => 
      item.id === id ? { ...item, completed: newCompletedState } : item
    ));
    
    // Si no es un item personalizado, también actualizar el plan principal
    if (item.source !== 'custom') {
      let planId: string;
      if (item.source === 'plan') {
        // Buscar el item completo en allPlanItems para obtener el fullId
        const planItem = allPlanItems.find(planItem => planItem.text === item.text);
        planId = planItem ? slugify(planItem.fullId) : slugify(item.text);
      } else if (item.source === 'bonus') {
        // Para bonus items, usar el mismo formato que en la sección principal
        planId = slugify(`bonus-${item.text}`);
      } else {
        // Fallback para otros casos
        planId = slugify(item.text);
      }
      setChecks({ ...checks, [planId]: newCompletedState });
    }
  };

  const removeFromToday = (id: string) => {
    setTodayPlan(todayPlan.filter(item => item.id !== id));
  };

  const addCustomItem = () => {
    const text = newCustomItem.trim();
    if (!text) return;
    addItemToToday(text, "custom");
    setNewCustomItem("");
  };

  const clearTodayPlan = () => {
    if (confirm("¿Seguro que quieres limpiar el plan de hoy?")) {
      setTodayPlan([]);
    }
  };

  return (
    <section id="today-plan" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900">
            🗓️ Plan para Hoy
          </h3>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Arrastra los planes pendientes aquí para organizarte el día de hoy (o haz click para agregar)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel izquierdo: Planes disponibles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">📋 Planes Disponibles</h4>
              <button
                onClick={() => setShowAllPlans(!showAllPlans)}
                className="text-xs px-3 py-1 rounded-full border bg-white hover:bg-gray-50 transition-colors touch-manipulation"
              >
                {showAllPlans ? "Solo pendientes" : "Ver todos"}
              </button>
            </div>
            
            {availableItems.length === 0 && !showAllPlans ? (
              <div className="p-6 bg-white rounded-xl border text-center">
                <p className="text-gray-500 mb-3">🎉 ¡Has completado todos los planes!</p>
                <button
                  onClick={() => setShowAllPlans(true)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 touch-manipulation"
                >
                  Ver todos los planes
                </button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-white rounded-xl border">
                {availableItems.map((item, index) => {
                  const isCompleted = checks[slugify(item.fullId)];
                  return (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.text, item.source, item.fullId)}
                      onDragEnd={() => {
                        // Limpiar después de un breve delay para permitir que drop se procese
                        setTimeout(() => setDraggedItem(null), 100);
                      }}
                      onClick={() => handleItemClick(item.text, item.source, item.fullId)}
                      className={`p-3 rounded-lg border cursor-move hover:bg-gray-100 transition-colors touch-manipulation ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                      }`}
                      title="Arrastra o haz click para agregar al plan de hoy"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">⋮⋮</span>
                        <span className={`text-sm ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {item.text}
                        </span>
                        {isCompleted && <span className="text-green-500 text-xs">✓</span>}
                        <span className="text-blue-500 text-xs ml-auto">+</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Agregar plan personalizado */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">✨ Crear plan personalizado</h5>
              <div className="flex gap-2">
                <input
                  value={newCustomItem}
                  onChange={(e) => setNewCustomItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                  placeholder="Ej: Desayuno especial en..."
                  className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm touch-manipulation"
                />
                <button
                  onClick={addCustomItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 touch-manipulation"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Panel derecho: Plan de hoy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">🎯 Tu Plan de Hoy</h4>
              {todayPlan.length > 0 && (
                <button
                  onClick={clearTodayPlan}
                  className="text-sm text-red-500 hover:text-red-700 touch-manipulation"
                >
                  Limpiar todo
                </button>
              )}
            </div>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnter={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              className={`min-h-96 p-6 bg-white rounded-xl border-2 border-dashed transition-colors ${
                draggedItem ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {todayPlan.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-lg">📥</p>
                  <p className="mt-2">Arrastra planes aquí o crea uno personalizado</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {todayPlan.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => toggleTodayItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors touch-manipulation ${
                          item.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {item.completed ? "✓" : ""}
                      </button>
                      <div className="flex-1">
                        <span className={`text-sm ${item.completed ? "line-through text-gray-500" : ""}`}>
                          {item.text}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.source === 'plan' ? 'bg-blue-100 text-blue-700' :
                            item.source === 'bonus' ? 'bg-amber-100 text-amber-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {item.source === 'plan' ? '📅 Plan' : 
                             item.source === 'bonus' ? '⭐ Extra' : '✨ Personalizado'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromToday(item.id)}
                        className="text-red-400 hover:text-red-600 p-1 touch-manipulation"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Estadísticas del día */}
            {todayPlan.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Progreso del día:</span> {todayPlan.filter(item => item.completed).length} de {todayPlan.length} completados
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${todayPlan.length > 0 ? (todayPlan.filter(item => item.completed).length / todayPlan.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const q = useMemo(
    () => [
      {
        title: "¿Team atardecer en Las Canteras o amanecer en el Nublo?",
        subtitle: "Pregunta seria antes de seguir 👀",
      },
      {
        title: "Hoy, ¿mar o montaña?",
        bullets: ["Charco en Agaete", "Paseo por Vegueta", "Pico de Bandama", "Las Canteras y helado"],
      },
      {
        title: "¿Plan tranquilo o pequeña aventura?",
        bullets: ["Karaoke casero", "Ruta de graffitis + fotos", "Paddle en Mogán", "Cine y mantita"],
      },
      {
        title: "¿Dulce o salado?",
        subtitle: "(Esto puede decidir el snack de la misión)",
        bullets: ["Churros con chocolate", "Bocata de pata asada", "Gofio + plátano", "Queso de flor"],
      },
      {
        title: "¿Listos para desbloquear el plan secreto?",
        subtitle: "Sigue bajando… la frase te espera al final.",
      },
    ],
    []
  );

  const [checks, setChecks, checksLoading] = useSyncedData<Record<string, boolean>>(KEY_CHECKS, {}, true); // Firebase habilitado
  // Inicializar siempre como false para evitar spoilers al recargar
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [bonus, setBonus, bonusLoading] = useSyncedData<string[]>(KEY_BONUS, BONUS_DEFAULT, true); // Firebase habilitado
  const [todayPlan, setTodayPlan, todayPlanLoading] = useSyncedData<TodayPlanItem[]>(KEY_TODAY_PLAN, [], true); // Firebase habilitado

  // Hook para scroll suave automático (pasa el estado unlocked)
  useSmoothScroll(unlocked);

  const isDataLoading = checksLoading || bonusLoading || todayPlanLoading;

  useEffect(() => {
    // Asegurar que siempre empecemos desde el principio al cargar la página
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Guardar checks/bonus ya lo gestiona useLocalStorage
    // unlocked no se guarda intencionalmente para evitar spoilers
  }, [checks, bonus]);

  // Extraer todos los items del plan para el componente TodayPlan
  const allPlanItems = useMemo(() => {
    const items: { text: string; fullId: string }[] = [];
    PLAN_DATA.forEach(month => {
      month.weeks.forEach(week => {
        week.items.forEach(item => {
          items.push({
            text: item,
            fullId: `${month.month}-${week.title}-${item}`
          });
        });
      });
    });
    return items;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-indigo-50 text-gray-900">
      <ProgressBar />
      
      {/* Indicador de sincronización */}
      <SyncIndicator isLoading={isDataLoading} />

      {/* Secciones con scroll snap automático */}
      <div className="snap-y snap-mandatory overflow-y-scroll">
        {/* Hero */}
        <section id="hero" className="min-h-screen snap-start flex flex-col items-center justify-center px-4 sm:px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-amber-100" />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight px-2"
          >
            {TITLE}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-4 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl leading-relaxed px-4"
          >
            Responde con el scroll. Si llegas al final, encontrarás la frase secreta para desbloquear nuestro plan.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 px-4"
          >
            <a 
              href="#question-0" 
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-all hover:scale-105 text-sm sm:text-base touch-manipulation font-semibold"
            >
              🚀 Comenzar la misión
            </a>
            <a 
              href="#password" 
              className="w-full sm:w-auto px-5 py-3 rounded-xl border bg-white/80 hover:bg-white shadow text-sm sm:text-base touch-manipulation"
            >
              Ir a la contraseña
            </a>
          </motion.div>
          <ScrollIndicator nextSection="#question-0" />
        </section>

        {/* Preguntas */}
        {q.map((qq, i) => (
          <QuestionSection 
            key={i} 
            index={i} 
            totalQuestions={q.length}
            title={qq.title} 
            subtitle={qq.subtitle} 
            bullets={qq.bullets} 
          />
        ))}

        {/* Gate */}
        <section id="gate" className="min-h-[70vh] snap-start flex items-center justify-center px-4 sm:px-6 relative">
          <div className="max-w-3xl text-center">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">Has llegado muy lejos 💫</h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg px-2">
              Aquí está la frase que lo desbloquea todo. Léela con atención.
            </p>
          </div>
          <ScrollIndicator nextSection="#password" />
        </section>
      </div>

      {/* Secciones con scroll normal */}
      <PasswordGate onUnlock={() => setUnlocked(true)} unlocked={unlocked} />

      {/* Plan secreto (solo visible si unlocked) */}
      {unlocked && (
        <>
          <SecretPlan
            checks={checks}
            setChecks={setChecks}
            bonus={bonus}
            setBonus={setBonus}
          />
          <TodayPlan
            todayPlan={todayPlan}
            setTodayPlan={setTodayPlan}
            allPlanItems={allPlanItems}
            bonusItems={bonus}
            checks={checks}
            setChecks={setChecks}
          />
        </>
      )}

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-500">
        <p>
          Hecho con cariño 💖. Si esto te gustó, prometo asai en Las Canteras. 🍨
        </p>
      </footer>
    </div>
  );
}
