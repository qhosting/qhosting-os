
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Activity, Cpu, HardDrive, Zap, TrendingUp, DollarSign, Users, 
  Shield, Terminal, Server, Globe, Wifi, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { UserRole } from '../types';

// --- MATH UTILS FOR 3D GLOBE ---
const GLOBE_RADIUS = 2;

// Convert Lat/Lon to 3D Vector
const calcPosFromLatLonRad = (lat: number, lon: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
  const z = (GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta));
  const y = (GLOBE_RADIUS * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

// --- DATA: NODES & CONNECTIONS ---
const NODES = [
  { id: 'MIA', name: 'Miami (Titan Hub)', lat: 25.7617, lon: -80.1918, color: '#FFD700', type: 'master' },
  { id: 'NYC', name: 'New York', lat: 40.7128, lon: -74.0060, color: '#00AEEF', type: 'satellite' },
  { id: 'FRA', name: 'Frankfurt', lat: 50.1109, lon: 8.6821, color: '#00AEEF', type: 'satellite' },
  { id: 'LON', name: 'London', lat: 51.5074, lon: -0.1278, color: '#00AEEF', type: 'satellite' },
  { id: 'SIN', name: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#00AEEF', type: 'satellite' }
];

// --- 3D COMPONENTS ---

const GlobeMesh = () => {
  return (
    <group>
      {/* Core Planet */}
      <Sphere args={[GLOBE_RADIUS, 64, 64]}>
        <meshStandardMaterial 
          color="#020617" 
          roughness={0.7} 
          metalness={0.5} 
          emissive="#0f172a"
          emissiveIntensity={0.5}
        />
      </Sphere>
      {/* Wireframe Atmosphere */}
      <Sphere args={[GLOBE_RADIUS + 0.02, 32, 32]}>
        <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.15} />
      </Sphere>
    </group>
  );
};

const ConnectionLine = ({ start, end, color }: { start: THREE.Vector3, end: THREE.Vector3, color: string }) => {
  const points = useMemo(() => {
    // Create a curve that goes slightly outside the sphere
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + 0.5);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(20);
  }, [start, end]);

  return (
    <Line 
      points={points} 
      color={color} 
      lineWidth={1} 
      transparent 
      opacity={0.6} 
    />
  );
};

const NodeMarker = ({ position, color, name }: { position: THREE.Vector3, color: string, name: string }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html distanceFactor={10}>
         <div className={`transition-all duration-300 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} pointer-events-none`}>
            <div className="bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap shadow-xl backdrop-blur-md">
               {name}
            </div>
         </div>
      </Html>
      {/* Pulse Effect */}
      <mesh scale={[1,1,1]}>
         <sphereGeometry args={[0.06, 16, 16]} />
         <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const TitanGlobeScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001; // Slow auto-rotation
    }
  });

  const masterNode = NODES.find(n => n.type === 'master');
  const masterPos = masterNode ? calcPosFromLatLonRad(masterNode.lat, masterNode.lon) : new THREE.Vector3(0,0,0);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00AEEF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />
      
      <group ref={groupRef}>
        <GlobeMesh />
        
        {NODES.map((node) => {
          const pos = calcPosFromLatLonRad(node.lat, node.lon);
          return (
             <group key={node.id}>
                <NodeMarker position={pos} color={node.color} name={node.name} />
                {node.id !== 'MIA' && (
                  <ConnectionLine start={masterPos} end={pos} color="#00AEEF" />
                )}
             </group>
          );
        })}
      </group>
      
      <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

// --- SVG GAUGE COMPONENT ---
const TitanGauge: React.FC<{ value: number; label: string; icon: React.ReactNode; color: string }> = ({ value, label, icon, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // Determine color based on threshold if standard color provided isn't specific
  let activeColor = color;
  if (color === 'dynamic') {
    if (value < 60) activeColor = '#22c55e'; // Green
    else if (value < 85) activeColor = '#eab308'; // Yellow
    else activeColor = '#ef4444'; // Red
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#1e293b"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={activeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
           {icon}
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="text-2xl font-black text-white italic tracking-tighter">{value}%</span>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};

// --- LIVE TERMINAL COMPONENT ---
const SystemTerminal = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateLog = () => {
     const modules = ['KERNEL', 'FIREWALL', 'WHM-SYNC', 'DNS-CLUSTER', 'AURUM-LEDGER'];
     const actions = ['Packet filtered', 'Handshake verified', 'Latency optimization', 'Blocklist updated', 'Session token refreshed'];
     const ips = ['192.168.101.44', '10.0.52.1', '45.22.19.8', 'Unknown'];
     
     const module = modules[Math.floor(Math.random() * modules.length)];
     const action = actions[Math.floor(Math.random() * actions.length)];
     const ip = ips[Math.floor(Math.random() * ips.length)];
     const time = new Date().toISOString().split('T')[1].split('.')[0];
     
     return `[${time}] [${module}] ${action} from <${ip}>`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateLog();
        const updated = [...prev, newLog];
        if (updated.length > 20) updated.shift(); // Buffer limit
        return updated;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[10px] h-full flex flex-col shadow-inner">
       <div className="flex items-center gap-2 mb-2 border-b border-slate-900 pb-2">
          <Terminal size={12} className="text-cyan-400" />
          <span className="font-bold text-slate-500 uppercase tracking-widest">Live Operations Log</span>
          <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
       </div>
       <div ref={scrollRef} className="overflow-y-auto custom-scrollbar flex-1 space-y-1">
          {logs.map((log, i) => (
             <div key={i} className="text-slate-400 border-l-2 border-transparent hover:border-cyan-500 pl-2 hover:bg-slate-900/50 transition-colors cursor-default">
                <span className="text-cyan-600">{log.split(']')[0]}]</span>
                <span className="text-yellow-600">{log.split(']')[1]}]</span>
                <span className="text-slate-300">{log.split(']').slice(2).join(']')}</span>
             </div>
          ))}
       </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; trend?: string }> = ({ title, value, icon, color, trend }) => (
  <div className="titan-glass p-6 rounded-[2rem] flex flex-col justify-between border border-slate-800/50 hover:border-cyan-400/30 transition-all group relative overflow-hidden h-32">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('text-', 'text-')}`}>
       {React.cloneElement(icon as React.ReactElement, { size: 48 })}
    </div>
    <div className="relative z-10 flex justify-between items-start">
      <div>
         <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{title}</p>
         <h3 className="text-3xl font-black text-slate-100 group-hover:text-cyan-400 transition-colors tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2 rounded-xl bg-slate-900/50 border border-slate-800 ${color}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="relative z-10 mt-auto flex items-center gap-1 text-[9px] font-bold text-green-500">
         <TrendingUp size={10} /> {trend} vs last month
      </div>
    )}
  </div>
);

const Dashboard: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [aurumSync, setAurumSync] = useState<'connected' | 'syncing' | 'error'>('connected');
  // Local state for active hostname to display in UI
  const [activeHost, setActiveHost] = useState<string>('titan.qhosting.net');
  
  // Simulated Live Metrics
  const [metrics, setMetrics] = useState({ cpu: 42, ram: 65, nvme: 28 });
  
  useEffect(() => {
    // Fetch one node to get the real IP/Hostname from backend
    fetch('/api/nodes').then(res => res.json()).then(data => {
        if (data.length > 0) setActiveHost(data[0].ip);
    }).catch(e => console.log("Dashboard sync error"));

    const interval = setInterval(() => {
       setMetrics({
          cpu: Math.floor(Math.random() * (60 - 30) + 30),
          ram: Math.floor(Math.random() * (75 - 60) + 60),
          nvme: Math.floor(Math.random() * (40 - 20) + 20)
       });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* Aurum Connectivity Bar */}
      <div className="flex items-center justify-between px-8 py-4 titan-glass rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${aurumSync === 'connected' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            Aurum Master Hub: {aurumSync === 'connected' ? 'Singularidad Sincronizada' : 'Error de Enlace'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            <Wifi size={12} className="text-cyan-400" /> {activeHost} (TIER-IV)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
         {/* LEFT COLUMN: TELEMETRY & STATS */}
         <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
               {userRole === UserRole.CEO ? (
                 <>
                   <StatCard title="MRR (USD)" value="$12.4K" icon={<DollarSign size={20}/>} color="text-green-500" trend="+12%" />
                   <StatCard title="Active Nodes" value="842" icon={<Server size={20}/>} color="text-cyan-400" />
                 </>
               ) : (
                 <>
                   <StatCard title="Mis Servicios" value="03" icon={<Server size={20}/>} color="text-cyan-400" />
                   <StatCard title="Balance" value="$42.50" icon={<DollarSign size={20}/>} color="text-yellow-500" />
                 </>
               )}
            </div>

            {/* Titan Gauges */}
            <div className="flex-1 titan-glass rounded-[2.5rem] border border-slate-800/50 p-6 flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Telemetría de Hardware</h3>
                  <div className="px-2 py-1 bg-slate-900 rounded text-[8px] font-bold text-slate-500">REALTIME</div>
               </div>
               
               <div className="flex-1 grid grid-cols-2 gap-4 items-center">
                  <TitanGauge value={metrics.cpu} label="CPU Core Load" icon={<Cpu size={18} className="text-cyan-400"/>} color="dynamic" />
                  <TitanGauge value={metrics.ram} label="RAM Allocation" icon={<Activity size={18} className="text-purple-400"/>} color="dynamic" />
                  <TitanGauge value={metrics.nvme} label="NVMe I/O" icon={<HardDrive size={18} className="text-yellow-400"/>} color="dynamic" />
                  <TitanGauge value={99} label="Network Uptime" icon={<Zap size={18} className="text-green-400"/>} color="#22c55e" />
               </div>
            </div>
         </div>

         {/* CENTER/RIGHT COLUMN: 3D GLOBE & TERMINAL */}
         <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            {/* 3D Holo Globe */}
            <div className="flex-1 titan-glass rounded-[3rem] border border-slate-800/50 relative overflow-hidden bg-slate-950/50">
               <div className="absolute top-6 left-8 z-10 pointer-events-none">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Tráfico Global Titan</h3>
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Visualización de Nodos Activos</p>
               </div>
               
               <div className="absolute inset-0 z-0">
                  <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                     <TitanGlobeScene />
                  </Canvas>
               </div>
               
               {/* Overlay Info */}
               <div className="absolute bottom-6 left-8 z-10 pointer-events-none space-y-2">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                     <span className="text-[9px] font-bold text-slate-300 uppercase">Master Hub (Miami)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                     <span className="text-[9px] font-bold text-slate-300 uppercase">Satellite: {activeHost}</span>
                  </div>
               </div>
            </div>

            {/* Live Operations Console */}
            <div className="h-48 shrink-0">
               <SystemTerminal />
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
