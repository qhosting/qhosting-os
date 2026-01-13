
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Server, Zap, Shield, Globe, ChevronRight, CheckCircle2, Cpu, User, MessageSquare, Plus, Minus, HardDrive, ArrowRight, ArrowLeft, ExternalLink, ShieldAlert, Database, Search, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
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

// --- 3D Components: Titan Earth ---
const TitanEarth = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, mouse }) => {
    if (meshRef.current) {
      // Rotación constante de la tierra
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      // Inclinación sutil basada en el mouse
      meshRef.current.rotation.x = (mouse.y * 0.1);
      meshRef.current.rotation.z = (mouse.x * 0.1);
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.04; // Atmósfera rota a distinta velocidad
    }
  });

  return (
    <group position={[2.5, 0, -1]} scale={2.8}>
       {/* Núcleo del Planeta (Oscuro / Tecnológico) */}
       <Sphere args={[1, 64, 64]} ref={meshRef}>
         <meshStandardMaterial 
           color="#0f172a" 
           roughness={0.7} 
           metalness={0.6}
           emissive="#000000"
         />
       </Sphere>
       
       {/* Capa de Atmósfera (Wireframe Sutil) */}
       <Sphere args={[1.005, 64, 64]} ref={atmosphereRef}>
         <meshStandardMaterial 
           color="#00AEEF"
           transparent
           opacity={0.1}
           wireframe
         />
       </Sphere>

       {/* Resplandor del Horizonte */}
       <Sphere args={[1.2, 32, 32]}>
          <meshBasicMaterial color="#00AEEF" transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
       </Sphere>
    </group>
  );
};

const SpaceScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.05} />
      {/* EL SOL: Luz direccional fuerte desde la derecha */}
      <directionalLight position={[10, 5, 5]} intensity={3} color="#ffffff" />
      {/* Luz de relleno tenue azulada desde abajo (reflexión de la atmósfera) */}
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00AEEF" />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <TitanEarth />
      </Float>
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </Canvas>
  );
};

const LandingPage: React.FC<{ onOrder: () => void, onLoginClick: () => void, builderData?: any }> = ({ onOrder, onLoginClick, builderData }) => {
  const [domainSearch, setDomainSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<null | boolean>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
     fetch('/api/plans')
       .then(res => res.json())
       .then(data => setPlans(data))
       .catch(err => console.error("Error fetching plans", err));
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
      <div className="absolute inset-0 z-0 h-[100vh] w-full">
         <SpaceScene />
         {/* Gradient Overlay para que el texto sea legible sobre el planeta */}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950 pointer-events-none"></div>
      </div>

      <MouseGlow />

      {/* Corporate Header */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl h-20 titan-glass rounded-[2rem] border border-slate-800/50 z-[100] px-10 flex items-center justify-between shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center text-slate-950 shadow-cyan-glow transition-all group-hover:rotate-12">
            <Server size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Q-SYSTEM</span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Aurum Capital Ecosystem</span>
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
          className="px-8 py-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all shadow-lg group"
        >
          <User size={16} /> Acceso Titan
        </button>
      </nav>

      {/* Hero Section with Functional Domain Search */}
      <section className="pt-48 pb-24 px-8 relative z-10 max-w-7xl mx-auto flex flex-col items-start text-left">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-cyan-400 backdrop-blur-sm">
          <Zap size={14} className="animate-pulse" /> {heroSubtitle} | {GRABOVOI_ABUNDANCE}
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase italic leading-none max-w-5xl drop-shadow-2xl">
          {heroTitle.split(' ')[0]} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-black">
            {heroTitle.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-16 leading-relaxed font-medium drop-shadow-md">
          {heroDesc}
        </p>

        {/* Domain Search Box */}
        <form onSubmit={handleDomainCheck} className="w-full max-w-2xl titan-glass p-3 rounded-[2.5rem] border border-slate-800/50 flex flex-col md:flex-row gap-3 shadow-2xl bg-slate-900/40 backdrop-blur-xl">
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
            {isSearching ? <RefreshCw className="animate-spin" /> : 'Verificar Disponibilidad'}
          </button>
        </form>

        {searchResult && (
          <div className="mt-6 flex items-center gap-4 text-green-400 animate-in fade-in slide-in-from-top-2 bg-slate-900/80 px-6 py-3 rounded-full border border-green-500/30">
            <CheckCircle2 size={20} />
            <span className="font-black uppercase text-xs tracking-widest">¡Tu dominio está disponible en el Nodo Titan!</span>
            <button onClick={onOrder} className="underline font-black text-white uppercase text-xs ml-4">Registrar Ahora</button>
          </div>
        )}
      </section>

      {/* Network Live Status Section */}
      <section id="status" className="py-24 px-8 relative z-10 max-w-7xl mx-auto">
        <div className="titan-glass rounded-[3rem] p-10 border border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic">Estatus de Red Titan</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Monitoreo en Tiempo Real</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
            <div className="text-center">
              <p className="text-2xl font-black text-white italic">99.99%</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Uptime Mensual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-cyan-400 italic">14ms</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Latencia Media</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white italic">0.02%</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Packet Loss</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white italic">842</p>
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
          {plans.map((plan) => (
            <div key={plan.id} className="titan-glass rounded-[4rem] p-12 border border-slate-800/50 hover:border-cyan-400/40 transition-all flex flex-col group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm">
              {plan.name.toLowerCase().includes('pro') && (
                <div className="absolute -right-14 top-10 rotate-45 bg-cyan-400 text-slate-950 text-[10px] font-black px-16 py-2 uppercase tracking-tighter shadow-xl">Recomendado</div>
              )}
              <div className="mb-12">
                <h3 className="text-4xl font-black text-white mb-4 italic uppercase">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-cyan-400">${plan.price}</span>
                  <span className="text-slate-500 font-black uppercase text-xs tracking-widest">/ Mes</span>
                </div>
              </div>
              <div className="flex-1 space-y-6 mb-12">
                {plan.features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-4 text-slate-300 font-medium text-sm">
                    <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <button 
                onClick={onOrder}
                className={`w-full py-6 rounded-2xl font-black transition-all text-xs uppercase tracking-[0.3em] transform active:scale-95 ${
                  plan.name.toLowerCase().includes('pro') 
                  ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-500 shadow-cyan-glow' 
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                CONFIGURAR NODO
              </button>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-24 titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden hidden lg:block bg-slate-900/40 backdrop-blur-sm">
           <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                 <tr>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Especificación Técnica</th>
                    <th className="px-10 py-8 text-[10px] font-black text-white uppercase tracking-widest">Startup</th>
                    <th className="px-10 py-8 text-[10px] font-black text-cyan-400 uppercase tracking-widest">Titan Pro</th>
                    <th className="px-10 py-8 text-[10px] font-black text-white uppercase tracking-widest">Enterprise</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                 {[
                   { label: 'CPU Cores', startup: '1 vCPU', pro: '2 vCPU', enterprise: '4 vCPU' },
                   { label: 'PHP Memory Limit', startup: '256 MB', pro: '512 MB', enterprise: '1024 MB' },
                   { label: 'I/O Speed', startup: '50 MB/s', pro: '100 MB/s', enterprise: '250 MB/s' },
                   { label: 'Entry Processes', startup: '20', pro: '40', enterprise: '80' },
                   { label: 'Cuentas FTP', startup: 'Ilimitado', pro: 'Ilimitado', enterprise: 'Ilimitado' },
                 ].map((row, idx) => (
                   <tr key={idx} className="hover:bg-cyan-400/5 transition-colors">
                      <td className="px-10 py-6 text-sm font-bold text-slate-300 italic">{row.label}</td>
                      <td className="px-10 py-6 text-xs text-slate-500 font-bold">{row.startup}</td>
                      <td className="px-10 py-6 text-xs text-white font-black italic">{row.pro}</td>
                      <td className="px-10 py-6 text-xs text-slate-500 font-bold">{row.enterprise}</td>
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
        </div>
      </section>

      {/* Footer Institution */}
      <footer className="py-32 px-8 border-t border-slate-900 bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-10 max-w-md">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
              <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-cyan-glow group-hover:scale-105 transition-transform">
                <Server size={32} />
              </div>
              <div>
                <span className="text-3xl font-black text-white tracking-tighter uppercase italic block leading-none">Q-SYSTEM</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Aurum Capital Ecosystem</span>
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
                <li><button onClick={() => scrollToSection('holding')} className="hover:text-cyan-400 transition-colors uppercase font-black text-left">Venture Capital</button></li>
                <li><button onClick={() => scrollToSection('nodos')} className="hover:text-cyan-400 transition-colors uppercase font-black text-left">Infraestructura</button></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.6em] text-slate-700 text-center md:text-left">
          <p>© 2024 QHOSTING.NET | UNA EMPRESA DE AURUM CAPITAL HOLDING</p>
          <div className="flex gap-10">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> TIER-IV DATACENTERS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
