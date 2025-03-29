'use client';
import { useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  // Efecto para crear partículas flotantes
  useEffect(() => {
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      // Posiciones aleatorias
      const posX = Math.floor(Math.random() * 100);
      const posY = Math.floor(Math.random() * 100);
      const size = Math.random() * 5 + 2;
      const animationDelay = Math.random() * 10;

      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDelay = `${animationDelay}s`;

      particlesContainer.appendChild(particle);
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: #06b6d4;
          --accent-color: #7e22ce;
          --dark-color: #0f172a;
          --light-color: #f8fafc;
          --glow-color: rgba(6, 182, 212, 0.6);
        }

        body {
          background-color: var(--dark-color);
          color: var(--light-color);
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        .digital-lines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          opacity: 0.2;
          background:
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .floating-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .particle {
          position: absolute;
          width: 5px;
          height: 5px;
          background-color: var(--primary-color);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--glow-color);
          animation: float 15s infinite ease-in-out;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0.7;
          }
        }

        .registered {
          position: absolute;
          top: -10px;
          right: -15px;
          font-size: 0.7rem;
        }

        .gradient-text {
          background: linear-gradient(to right, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .btn {
          display: inline-block;
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 15px var(--glow-color);
        }

        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 30px var(--glow-color);
        }

        .service-card {
          background-color: rgba(30, 41, 59, 0.8);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        }

        .service-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Efectos de fondo */}
      <div className="digital-lines"></div>
      <div className="floating-particles"></div>

      {/* Barra de navegación */}
      <div className="fixed w-full top-0 z-50 backdrop-blur-md bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex justify-between items-center h-20">
            <a href="#" className="flex items-center gap-2 font-bold text-2xl no-underline text-white">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className="relative">
                UrbanSoft<span className="registered">®</span>
              </div>
            </a>
            <div className="hidden md:flex gap-8">
              <a href="#inicio" className="text-white no-underline uppercase text-sm tracking-wider relative py-2 hover:text-cyan-400 transition-colors">Inicio</a>
              <a href="#servicios" className="text-white no-underline uppercase text-sm tracking-wider relative py-2 hover:text-cyan-400 transition-colors">Servicios</a>
              <a href="#nosotros" className="text-white no-underline uppercase text-sm tracking-wider relative py-2 hover:text-cyan-400 transition-colors">Nosotros</a>
              <a href="#tecnologias" className="text-white no-underline uppercase text-sm tracking-wider relative py-2 hover:text-cyan-400 transition-colors">Tecnologías</a>
              <a href="#contacto" className="text-white no-underline uppercase text-sm tracking-wider relative py-2 hover:text-cyan-400 transition-colors">Contacto</a>
            </div>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section id="inicio" className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <div className="text-center z-10 max-w-3xl px-8 py-12 backdrop-blur-md bg-slate-900/60 rounded-3xl border border-white/10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">Soluciones Tecnológicas del Futuro</h1>
          <p className="text-xl mb-8 leading-relaxed">En UrbanSoft® transformamos la realidad digital con soluciones de software impulsadas por IA de vanguardia. Donde la innovación se encuentra con la eficiencia para crear el futuro tecnológico.</p>
          <a href="#contacto" className="btn">Descubre Más</a>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-8">
        {/* Sección de Servicios */}
        <section id="servicios" className="py-24">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="service-card">
              <div className="text-5xl mb-6 gradient-text">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Desarrollo de Software a Medida</h3>
              <p className="text-slate-400 leading-relaxed">Creamos soluciones personalizadas que se adaptan perfectamente a las necesidades específicas de tu negocio, optimizando procesos y maximizando resultados.</p>
            </div>

            <div className="service-card">
              <div className="text-5xl mb-6 gradient-text">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Inteligencia Artificial Aplicada</h3>
              <p className="text-slate-400 leading-relaxed">Implementamos sistemas inteligentes que aprenden y se adaptan, proporcionando insights valiosos y automatizando tareas complejas para potenciar tu ventaja competitiva.</p>
            </div>

            <div className="service-card">
              <div className="text-5xl mb-6 gradient-text">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Desarrollo Web y Móvil Avanzado</h3>
              <p className="text-slate-400 leading-relaxed">Diseñamos experiencias digitales inmersivas y responsivas que cautivan a los usuarios, con interfaces intuitivas y rendimiento optimizado en todas las plataformas.</p>
            </div>
          </div>
        </section>

        {/* Sección Nosotros */}
        <section id="nosotros" className="py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 gradient-text">Innovación Tecnológica para un Mundo Conectado</h2>
              <p className="text-slate-200 mb-6 leading-relaxed">En UrbanSoft® somos pioneros en el desarrollo de soluciones tecnológicas de vanguardia. Nuestro equipo de expertos combina creatividad, conocimiento técnico y visión estratégica para transformar ideas complejas en software elegante y funcional.</p>
              <p className="text-slate-200 mb-8 leading-relaxed">Nos distinguimos por nuestro enfoque centrado en resultados y nuestra capacidad para integrar las tecnologías más avanzadas, incluyendo inteligencia artificial, machine learning y análisis predictivo, en soluciones que impulsan el crecimiento y la eficiencia de nuestros clientes.</p>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-white/10">
                  <div className="text-4xl font-bold mb-2 gradient-text">98%</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">Satisfacción de clientes</div>
                </div>
                <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-white/10">
                  <div className="text-4xl font-bold mb-2 gradient-text">200+</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">Proyectos completados</div>
                </div>
                <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-white/10">
                  <div className="text-4xl font-bold mb-2 gradient-text">15+</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">Años de experiencia</div>
                </div>
                <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-white/10">
                  <div className="text-4xl font-bold mb-2 gradient-text">24/7</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider">Soporte técnico</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/30 relative">
              <div className="aspect-video relative">
                <Image
                  src="/api/placeholder/600/400"
                  alt="UrbanSoft equipo de desarrollo"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contacto" className="text-center bg-slate-800/80 rounded-3xl p-16 my-16 border border-white/10 relative overflow-hidden">
          <h2 className="text-4xl font-bold mb-6 gradient-text">¿Listo para Transformar tu Negocio?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-slate-200 leading-relaxed">Descubre cómo nuestras soluciones tecnológicas pueden potenciar tu empresa. Contáctanos hoy mismo para una consulta personalizada.</p>
          <a href="#" className="btn">Solicitar Información</a>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div className="relative text-2xl font-bold">
                  UrbanSoft<span className="registered">®</span>
                </div>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">Innovación tecnológica al servicio de tu negocio. Creamos el software del mañana con las herramientas de hoy.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-br from-cyan-500 to-purple-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-br from-cyan-500 to-purple-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-br from-cyan-500 to-purple-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 uppercase tracking-wider">Enlaces rápidos</h3>
              <ul className="space-y-4">
                <li><a href="#inicio" className="text-slate-400 hover:text-cyan-400 transition-colors">Inicio</a></li>
                <li><a href="#servicios" className="text-slate-400 hover:text-cyan-400 transition-colors">Servicios</a></li>
                <li><a href="#nosotros" className="text-slate-400 hover:text-cyan-400 transition-colors">Nosotros</a></li>
                <li><a href="#tecnologias" className="text-slate-400 hover:text-cyan-400 transition-colors">Tecnologías</a></li>
                <li><a href="#contacto" className="text-slate-400 hover:text-cyan-400 transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 uppercase tracking-wider">Servicios</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Desarrollo de Software</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Inteligencia Artificial</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Desarrollo Web y Móvil</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Consultoría Tecnológica</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Soporte Técnico</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 uppercase tracking-wider">Contacto</h3>
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Avenida Tecnológica 123, Ciudad Futura
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  info@urbansoft.com
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  +123 456 7890
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 text-center text-slate-500 text-sm">
            <p>&copy; 2025 UrbanSoft®. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

