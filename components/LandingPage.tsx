
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Server, Zap, Shield, Globe, ChevronRight, CheckCircle2, Cpu, User, MessageSquare, Plus, Minus, HardDrive, ArrowRight, ArrowLeft, ExternalLink, ShieldAlert, Database, Search, Activity, BarChart3, RefreshCw, Star, Hexagon } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

const GRABOVOI_ABUNDANCE = "520 741 8";

// --- Subcomponent: Mouse Glow (2D Overlay) ---
const MouseGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  return <div ref={glowRef} className="mouse-glow" />;
};

// --- Subcomponent: Text Decoder Animation ---
const DecodingText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = "5207418ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("")
        .map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

// --- Subcomponent: FAQ Accordion ---
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="titan-glass rounded-[2rem] border border-slate-800/50 overflow-hidden transition-all duration-300 hover:border-cyan-400/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 text-left flex justify-between items-center group"
      >
        <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-lg italic">{question}</span>
        <div className={`w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${isOpen ? 'bg-cyan-400 border-cyan-400 text-slate-950 rotate-45' : 'text-slate-500'}`}>
          <Plus size={18} />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 pb-8">
          <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-cyan-400/30 pl-4">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// --- 3D Components: Titan Earth & Satellites ---

const Satellite = ({ radius, speed, color, offset, size = 0.05 }: { radius: number, speed: number, color: string, offset: number, size?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
        const t = clock.getElapsedTime() * speed + offset;
        ref.current.position.x = Math.cos(t) * radius;
        ref.current.position.z = Math.sin(t) * radius;
        ref.current.position.y = Math.sin(t * 0.7) * (radius * 0.4); 
    }
  });
  return (
    <mesh ref={ref}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
};

const TitanEarth = ({ scrollY }: { scrollY: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, mouse }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.07;
      atmosphereRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
    if (groupRef.current) {
        // Parallax logic based on scroll
        const targetX = 2.5 + (scrollY * 0.0015); // Moves right as user scrolls down
        const targetY = 0 - (scrollY * 0.001); // Moves down slightly
        
        // Interactive Tilt from mouse
        const tiltX = mouse.y * 0.1;
        const tiltY = mouse.x * 0.1;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltX, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, tiltY, 0.1);
        
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[2.5, 0, -1]} scale={2.8}>
       {/* Núcleo del Planeta (Oscuro / Tecnológico) */}
       <Sphere args={[1, 64, 64]} ref={meshRef}>
         <meshStandardMaterial 
           color="#0f172a" 
           roughness={0.4} 
           metalness={0.8}
           emissive="#020617"
           emissiveIntensity={0.2}
         />
       </Sphere>
       
       {/* Capa de Atmósfera (Wireframe Sutil) */}
       <Sphere args={[1.015, 48, 48]} ref={atmosphereRef}>
         <meshStandardMaterial 
           color="#00AEEF"
           transparent
           opacity={0.12}
           wireframe
         />
       </Sphere>

       {/* Resplandor del Horizonte */}
       <Sphere args={[1.15, 32, 32]}>
          <meshBasicMaterial color="#00AEEF" transparent opacity={0.06} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
       </Sphere>

       {/* Aurum Satellites */}
       <Satellite radius={1.4} speed={0.4} color="#FFD700" offset={0} size={0.04} /> {/* Gold */}
       <Satellite radius={1.6} speed={0.25} color="#00AEEF" offset={2} size={0.03} /> {/* Cyan */}
       <Satellite radius={1.3} speed={0.6} color="#ffffff" offset={4} size={0.02} /> {/* White Data Packet */}
    </group>
  );
};

const SunFlare = () => {
    return (
        <group position={[8, 3, -5]}>
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
            </mesh>
            <pointLight intensity={1.5} color="#FFD700" distance={20} />
        </group>
    )
}

const SpaceScene = ({ scrollY }: { scrollY: number }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 5, 5]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00AEEF" />
      
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <TitanEarth scrollY={scrollY} />
      </Float>
      
      <SunFlare />
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
    </Canvas>
  );
};

const LandingPage: React.FC<{ onOrder: () => void, onLoginClick: () => void, builderData?: any }> = ({ onOrder, onLoginClick, builderData }) => {
  const [domainSearch, setDomainSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<null | boolean>(null);
  const [scrollY, setScrollY] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
     fetch('/api/plans')
       .then(res => res.json())
       .then(data => setPlans(data))
       .catch(err => console.error("Error fetching plans", err));
     
     const handleScroll = () => setScrollY(window.scrollY);
     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDomainCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSearch) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchResult(true);
    }, 1500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Override content with builder data if present
  const heroTitle = builderData?.heroTitle || "INFRAESTRUCTURA TITAN";
  const heroSubtitle = builderData?.heroSubtitle || "Hosting NVMe de Próxima Generación";
  const heroDesc = builderData?.heroDesc || "Aprovisionamiento instantáneo de nodos de alto rendimiento. Singularidad digital para proyectos críticos.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-400/30 font-inter relative overflow-x-hidden">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 h-[100vh] w-full fixed">
         <SpaceScene scrollY={scrollY} />
         {/* Gradient Overlay for Text Readability */}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950 pointer-events-none"></div>
      </div>

      <MouseGlow />

      {/* Corporate Header */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl h-20 titan-glass rounded-[2rem] border border-slate-800/50 z-[100] px-10 flex items-center justify-between shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <img src="/logo.png" alt="QHOSTING" className="h-10 object-contain drop-shadow-[0_0_10px_rgba(0,174,239,0.3)] transition-transform group-hover:scale-105" />
          <div className="flex flex-col border-l border-slate-700 pl-4 ml-2">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 group-hover:text-yellow-500 transition-colors">Aurum Capital Ecosystem</span>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <button onClick={() => scrollToSection('nodos')} className="hover:text-cyan-400 transition-colors uppercase font-black">Infraestructura</button>
          <button onClick={() => scrollToSection('status')} className="hover:text-cyan-400 transition-colors uppercase font-black">Red en Vivo</button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-cyan-400 transition-colors uppercase font-black">Planes</button>
          <button onClick={() => scrollToSection('holding')} className="hover:text-yellow-500 transition-colors uppercase font-black">Aurum Venture</button>
        </div>

        <button 
          onClick={onLoginClick}
          className="px-8 py-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all shadow-lg group hover:border-cyan-400/30"
        >
          <User size={16} /> Acceso Titan
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-8 relative z-10 max-w-7xl mx-auto flex flex-col items-start text-left min-h-screen justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-cyan-400 backdrop-blur-sm shadow-[0_0_15px_rgba(0,174,239,0.1)]">
          <Zap size={14} className="animate-pulse text-yellow-400" /> 
          <span className="text-yellow-500">{GRABOVOI_ABUNDANCE}</span> 
          <span className="text-slate-600">|</span> 
          {heroSubtitle}
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase italic leading-none max-w-5xl drop-shadow-2xl">
          <DecodingText text={heroTitle.split(' ')[0]} /> <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 font-black animate-gradient">
            {heroTitle.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-16 leading-relaxed font-medium drop-shadow-md border-l-2 border-slate-800 pl-6">
          {heroDesc}
        </p>

        {/* Domain Search Box */}
        <form onSubmit={handleDomainCheck} className="w-full max-w-2xl titan-glass p-3 rounded-[2.5rem] border border-slate-800/50 flex flex-col md:flex-row gap-3 shadow-2xl bg-slate-900/40 backdrop-blur-xl group hover:border-cyan-400/30 transition-all">
          <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 focus-within:border-cyan-400/50 transition-all">
            <Search size={20} className="text-slate-600" />
            <input 
              type="text" 
              placeholder="Encuentra tu identidad: ejemplo.com"
              className="bg-transparent border-none outline-none text-white font-bold text-lg w-full placeholder:text-slate-700"
              value={domainSearch}
              onChange={(e) => setDomainSearch(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-10 py-5 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            {isSearching ? <RefreshCw className="animate-spin" /> : 'Verificar'}
          </button>
        </form>

        {searchResult && (
          <div className="mt-6 flex items-center gap-4 text-green-400 animate-in fade-in slide-in-from-top-2 bg-slate-900/80 px-6 py-3 rounded-full border border-green-500/30 backdrop-blur-md">
            <CheckCircle2 size={20} />
            <span className="font-black uppercase text-xs tracking-widest">¡Tu dominio está disponible en el Nodo Titan!</span>
            <button onClick={onOrder} className="underline font-black text-white uppercase text-xs ml-4 hover:text-cyan-400 transition-colors">Registrar Ahora</button>
          </div>
        )}
      </section>

      {/* Network Live Status Section */}
      <section id="status" className="py-24 px-8 relative z-10 max-w-7xl mx-auto">
        <div className="titan-glass rounded-[3rem] p-10 border border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-pulse">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic">Estatus de Red Titan</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span> Monitoreo en Tiempo Real
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 relative z-10">
            <div className="text-center">
              <p className="text-3xl font-black text-white italic tracking-tighter">99.99%</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Uptime Mensual</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-cyan-400 italic tracking-tighter">14ms</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Latencia Media</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white italic tracking-tighter">0.02%</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Packet Loss</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-yellow-500 italic tracking-tighter">842</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Nodos Activos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Dynamic Plans */}
      <section id="pricing" className="py-32 px-8 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Planes de Despliegue</h2>
          <p className="text-slate-500 mt-4 font-black uppercase tracking-[0.4em] text-xs">Hardware Certificado por Aurum Capital</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan) => {
            const isEnterprise = plan.name.toLowerCase().includes('enterprise') || plan.name.toLowerCase().includes('venture');
            const isPro = plan.name.toLowerCase().includes('pro');
            
            return (
              <div 
                key={plan.id} 
                className={`titan-glass rounded-[4rem] p-12 border transition-all flex flex-col group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm ${
                  isEnterprise 
                    ? 'border-yellow-500/30 hover:border-yellow-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)]' 
                    : isPro 
                      ? 'border-cyan-400/30 hover:border-cyan-400 hover:shadow-cyan-glow' 
                      : 'border-slate-800/50 hover:border-slate-700'
                }`}
              >
                {isPro && (
                  <div className="absolute -right-14 top-10 rotate-45 bg-cyan-400 text-slate-950 text-[10px] font-black px-16 py-2 uppercase tracking-tighter shadow-xl z-20">
                    Recomendado
                  </div>
                )}
                {isEnterprise && (
                  <div className="absolute -right-14 top-10 rotate-45 bg-yellow-500 text-slate-950 text-[10px] font-black px-16 py-2 uppercase tracking-tighter shadow-xl z-20">
                    Aurum Tier
                  </div>
                )}

                <div className="mb-12 relative z-10">
                  <h3 className={`text-4xl font-black mb-4 italic uppercase tracking-tight ${isEnterprise ? 'text-yellow-500' : 'text-white'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black ${isEnterprise ? 'text-white' : 'text-cyan-400'}`}>${plan.price}</span>
                    <span className="text-slate-500 font-black uppercase text-xs tracking-widest">/ Mes</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6 mb-12 relative z-10">
                  {plan.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-slate-300 font-medium text-sm">
                      <div className={`p-1 rounded-full ${isEnterprise ? 'bg-yellow-500/20 text-yellow-500' : 'bg-cyan-400/20 text-cyan-400'}`}>
                         <CheckCircle2 size={14} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={onOrder}
                  className={`w-full py-6 rounded-2xl font-black transition-all text-xs uppercase tracking-[0.3em] transform active:scale-95 relative z-10 ${
                    isEnterprise 
                    ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
                    : isPro 
                      ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-500 shadow-cyan-glow' 
                      : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  CONFIGURAR NODO
                </button>
                
                {/* Decorative background glow for enterprise */}
                {isEnterprise && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/5 rounded-full blur-[80px]"></div>}
              </div>
            );
          })}
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-24 titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden hidden lg:block bg-slate-900/40 backdrop-blur-sm animate-in slide-in-from-bottom-8 duration-700">
           <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                 <tr>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Especificación Técnica</th>
                    <th className="px-10 py-8 text-[10px] font-black text-white uppercase tracking-widest">Startup</th>
                    <th className="px-10 py-8 text-[10px] font-black text-cyan-400 uppercase tracking-widest">Titan Pro</th>
                    <th className="px-10 py-8 text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                       Enterprise <Star size={12} className="fill-yellow-500" />
                    </th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                 {[
                   { label: 'CPU Cores', startup: '1 vCPU', pro: '2 vCPU', enterprise: '4 vCPU' },
                   { label: 'PHP Memory Limit', startup: '256 MB', pro: '512 MB', enterprise: '1024 MB' },
                   { label: 'I/O Speed', startup: '50 MB/s', pro: '100 MB/s', enterprise: '250 MB/s' },
                   { label: 'Entry Processes', startup: '20', pro: '40', enterprise: '80' },
                   { label: 'Soporte Prioritario', startup: 'Ticket', pro: 'Chat', enterprise: 'Mesa Dedicada' },
                 ].map((row, idx) => (
                   <tr key={idx} className="hover:bg-cyan-400/5 transition-colors">
                      <td className="px-10 py-6 text-sm font-bold text-slate-300 italic">{row.label}</td>
                      <td className="px-10 py-6 text-xs text-slate-500 font-bold">{row.startup}</td>
                      <td className="px-10 py-6 text-xs text-white font-black italic">{row.pro}</td>
                      <td className="px-10 py-6 text-xs text-yellow-500 font-bold">{row.enterprise}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 px-8 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-3 text-white font-black italic text-xl">cPanel</div>
           <div className="flex items-center gap-3 text-white font-black italic text-xl">LiteSpeed</div>
           <div className="flex items-center gap-3 text-white font-black italic text-xl">CloudLinux</div>
           <div className="flex items-center gap-3 text-white font-black italic text-xl">Inmunify360</div>
           <div className="flex items-center gap-3 text-white font-black italic text-xl">Intel Xeon</div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-8 relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Preguntas Frecuentes</h2>
        </div>
        <div className="space-y-6">
          <FAQItem 
            question="¿Qué es el Sistema Singular?" 
            answer="Es nuestra arquitectura propietaria donde cada nodo está optimizado para recursos NVMe puros y latencia mínima, gestionado por la inteligencia de Q-SYSTEM." 
          />
          <FAQItem 
            question="¿Cómo funciona la inyección de Aurum Capital?" 
            answer="Aurum Capital Holding proporciona el respaldo financiero y la infraestructura TIER-IV necesaria para garantizar que tu proyecto nunca se detenga." 
          />
          <FAQItem 
            question="¿Qué significa la secuencia 520 741 8?" 
            answer="Es una secuencia de Grabovoi para la atracción de abundancia inesperada, integrada en el núcleo digital de nuestro ecosistema para potenciar el éxito de nuestros clientes." 
          />
        </div>
      </section>

      {/* Footer Institution */}
      <footer className="py-32 px-8 border-t border-slate-900 bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-10 max-w-md">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="QHOSTING" className="h-12 object-contain grayscale group-hover:grayscale-0 transition-all" />
              <div className="border-l border-slate-700 pl-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Aurum Capital Ecosystem</span>
              </div>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Arquitecturas críticas operadas bajo los estándares institucionales de **Aurum Capital Holding**. El futuro del hosting corporativo es ahora.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-24">
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase italic tracking-[0.3em]">Holding</h4>
              <ul className="space-y-4 text-slate-500 text-xs font-black uppercase tracking-widest">
                <li><button onClick={() => scrollToSection('holding')} className="hover:text-yellow-500 transition-colors uppercase font-black text-left">Venture Capital</button></li>
                <li><button onClick={() => scrollToSection('nodos')} className="hover:text-cyan-400 transition-colors uppercase font-black text-left">Infraestructura</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase italic tracking-[0.3em]">Legal</h4>
              <ul className="space-y-4 text-slate-500 text-xs font-black uppercase tracking-widest">
                <li><a href="#" className="hover:text-white transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad de Datos</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.6em] text-slate-700 text-center md:text-left">
          <p>© 2024 QHOSTING.NET | UNA EMPRESA DE AURUM CAPITAL HOLDING</p>
          <div className="flex gap-10">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> TIER-IV DATACENTERS</span>
            <span className="flex items-center gap-2"><Hexagon size={10} className="text-yellow-500" /> AURUM CERTIFIED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
