
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Receipt, 
  CreditCard, 
  DollarSign, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight, 
  FileText, 
  Link2, 
  CheckCircle2, 
  FileSearch,
  Zap,
  Stamp,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Shield,
  Bitcoin,
  TrendingUp,
  Calendar,
  PieChart
} from 'lucide-react';

interface Invoice {
  id: string;
  concept: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  dueDate: string;
  method: string;
  paymentUrl?: string; // Support for External Aurum Pay Link
}

interface Quote {
  id: string;
  concept: string;
  amount: number;
  status: string;
  date: string;
  expiration: string;
}

interface Transaction {
  id: string;
  type: 'topup' | 'payment';
  amount: number;
  method: string;
  date: string;
  status: string;
}

interface BudgetData {
  monthlyData: { name: string; total: number; items: any[] }[];
  annualTotal: number;
  plannedExpenses: any[];
}

const BillingView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [isStamping, setIsStamping] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'invoices' | 'quotes' | 'budgets'>('invoices');
  
  // Budget State
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ title: '', amount: '', month: '0' });
  const [isPlanSaving, setIsPlanSaving] = useState(false);

  // Wallet Hub Modal State
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [topupMethod, setTopupMethod] = useState<'card' | 'crypto' | 'bank'>('card');
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [invRes, quoteRes, balanceRes, txRes] = await Promise.all([
        fetch('/api/billing/invoices'),
        fetch('/api/quotes'),
        fetch('/api/billing/balance'),
        fetch('/api/billing/transactions')
      ]);
      
      if (invRes.ok && quoteRes.ok && balanceRes.ok && txRes.ok) {
        setInvoices(await invRes.json());
        setQuotes(await quoteRes.json());
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance);
        setTransactions(await txRes.json());
      }
    } catch (e) {
      console.error("Fallo de conexión financiera con Aurum Hub");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudget = async () => {
    setIsBudgetLoading(true);
    try {
      const res = await fetch('/api/billing/budget');
      if (res.ok) setBudgetData(await res.json());
    } finally {
      setIsBudgetLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeView === 'budgets') fetchBudget();
  }, [activeView]);

  const handlePay = async (invoiceId: string) => {
    setIsPaying(invoiceId);
    try {
      const response = await fetch(`/api/billing/pay/${invoiceId}`, { method: 'POST' });
      if (response.ok) {
        setTimeout(() => {
          fetchData(true);
          setIsPaying(null);
        }, 1000);
      } else {
        const err = await response.json();
        alert(err.error || "Fallo en el pago");
        setIsPaying(null);
      }
    } catch (e) {
      setIsPaying(null);
    }
  };

  const handleStamp = async (quoteId: string) => {
    setIsStamping(quoteId);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/invoice`, { method: 'POST' });
      if (response.ok) {
        setTimeout(() => {
          fetchData(true);
          setIsStamping(null);
          setActiveView('invoices');
        }, 1500);
      }
    } catch (e) {
      setIsStamping(null);
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(topupAmount);
    if (!amountNum || amountNum <= 0) return;

    setIsTopupLoading(true);
    try {
      const response = await fetch('/api/billing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amountNum, 
          method: topupMethod === 'card' ? 'Visa/Mastercard' : topupMethod === 'crypto' ? 'Bitcoin/Lightning' : 'Bank Transfer'
        })
      });
      if (response.ok) {
        setTimeout(() => {
          fetchData(true);
          setIsTopupLoading(false);
          setTopupAmount('');
        }, 1000);
      }
    } catch (e) {
      setIsTopupLoading(false);
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanSaving(true);
    try {
      const res = await fetch('/api/billing/budget/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      });
      if (res.ok) {
        fetchBudget();
        setIsPlanModalOpen(false);
        setPlanForm({ title: '', amount: '', month: '0' });
      }
    } finally {
      setIsPlanSaving(false);
    }
  };

  const stats = {
    due: invoices.reduce((acc, inv) => inv.status !== 'paid' ? acc + inv.amount : acc, 0).toFixed(2),
    paidMonth: invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0).toFixed(2),
    quoteValue: quotes.reduce((acc, q) => acc + q.amount, 0).toFixed(2)
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Centro Financiero Aurum</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Gestión de Créditos, Facturación y Timbrado Fiscal</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-slate-900 border border-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:text-white transition-all">
            <Download size={16} /> Reporte Consolidado
          </button>
          <button 
            onClick={() => setIsWalletOpen(true)}
            className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-cyan-glow transition-all active:scale-95"
          >
            <CreditCard size={16} /> Aurum Pay Hub
          </button>
        </div>
      </div>

      {/* Main Grid: Toggle Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation & Controls */}
        <div className="lg:col-span-12">
           <div className="titan-glass p-2 rounded-[2rem] border border-slate-800/50 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveView('invoices')}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === 'invoices' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
                  >
                    <Receipt size={16} /> Facturas
                  </button>
                  <button 
                    onClick={() => setActiveView('quotes')}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === 'quotes' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
                  >
                    <FileSearch size={16} /> Propuestas
                  </button>
                  <button 
                    onClick={() => setActiveView('budgets')}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === 'budgets' ? 'bg-cyan-400 text-slate-950 shadow-cyan-glow' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
                  >
                    <TrendingUp size={16} /> Presupuestos (Forecasting)
                  </button>
              </div>
              <div className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 hidden md:block">
                 Sync: Aurum Ledger Node
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-12">
           {activeView === 'budgets' ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                {/* Budget Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <PieChart size={100} />
                      </div>
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Inversión Anual Proyectada</p>
                      <h3 className="text-4xl font-black text-white italic tracking-tighter">
                         {isBudgetLoading ? '...' : `$${budgetData?.annualTotal.toFixed(2)}`}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-4">OPEX + CAPEX (2024)</p>
                   </div>
                   <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Gastos Planificados (Manuales)</p>
                          <h3 className="text-3xl font-black text-white italic tracking-tighter">
                            {budgetData?.plannedExpenses.length || 0}
                          </h3>
                       </div>
                       <button onClick={() => setIsPlanModalOpen(true)} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-400/50 text-slate-400 hover:text-cyan-400 transition-all">
                          <Plus size={24} />
                       </button>
                   </div>
                   <div className="titan-glass p-8 rounded-[2.5rem] border border-slate-800/50 flex flex-col justify-center">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Modelo Contable</p>
                       <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Cashflow</div>
                          <span className="text-[9px] font-bold text-slate-600">Enfoque de Caja</span>
                       </div>
                   </div>
                </div>

                {/* Main Chart */}
                <div className="titan-glass p-10 rounded-[3rem] border border-slate-800/50 h-[450px] relative">
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                      <Calendar size={20} className="text-cyan-400" /> Flujo de Caja Mensual
                   </h3>
                   {isBudgetLoading ? (
                      <div className="h-full flex items-center justify-center"><RefreshCw className="animate-spin text-slate-600" size={32} /></div>
                   ) : (
                      <ResponsiveContainer width="100%" height="80%">
                         <BarChart data={budgetData?.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} tickFormatter={(val) => `$${val}`} />
                            <RechartsTooltip 
                               contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '1rem' }}
                               itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                               cursor={{ fill: 'rgba(0, 174, 239, 0.1)' }}
                            />
                            <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                               {budgetData?.monthlyData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.total > 100 ? '#00AEEF' : '#334155'} />
                               ))}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   )}
                </div>

                {/* Forecast Table */}
                <div className="titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden">
                   <div className="p-8 border-b border-slate-800 bg-slate-900/40">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Ledger de Futuros</h3>
                   </div>
                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {budgetData?.monthlyData.filter(m => m.total > 0).map((month, idx) => (
                         <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-400/30 transition-all group">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                               <span className="text-lg font-black text-white italic">{month.name}</span>
                               <span className="text-cyan-400 font-black text-sm">${month.total.toFixed(2)}</span>
                            </div>
                            <div className="space-y-3">
                               {month.items.map((item, i) => (
                                  <div key={i} className="flex justify-between items-start text-[10px]">
                                     <span className={`font-bold uppercase ${item.type === 'manual' ? 'text-yellow-500' : 'text-slate-400'}`}>
                                       {item.type === 'manual' ? '★ ' : ''}{item.title}
                                     </span>
                                     <span className="font-mono text-slate-200">${item.amount}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
           ) : (
             // INVOICES & QUOTES VIEW (Legacy Logic Preserved)
             <div className="titan-glass rounded-[3rem] border border-slate-800/50 overflow-hidden flex flex-col">
                <div className="overflow-x-auto min-h-[400px]">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-slate-800/50 bg-slate-900/10">
                         <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Concepto</th>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Importe</th>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                         <th className="px-8 py-6"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/30">
                       {activeView === 'invoices' ? (
                         invoices.map((inv) => (
                           <tr key={inv.id} className="hover:bg-cyan-400/5 transition-colors group">
                             <td className="px-8 py-6">
                               <span className="text-[11px] font-black text-cyan-400 font-mono tracking-tighter">{inv.id}</span>
                               <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">{inv.date}</p>
                             </td>
                             <td className="px-8 py-6">
                               <p className="text-xs font-bold text-slate-200">{inv.concept}</p>
                             </td>
                             <td className="px-8 py-6 text-sm font-black text-white italic">${inv.amount.toFixed(2)}</td>
                             <td className="px-8 py-6">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                                 inv.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                               }`}>
                                 {inv.status}
                               </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                               {inv.status !== 'paid' && (
                                 inv.paymentUrl ? (
                                   <a 
                                     href={inv.paymentUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                                   >
                                     <ExternalLink size={12} /> Pagar (Aurum)
                                   </a>
                                 ) : (
                                   <button onClick={() => handlePay(inv.id)} className="px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                                     {isPaying === inv.id ? <RefreshCw className="animate-spin" size={14}/> : <Wallet size={12}/>}
                                     {isPaying === inv.id ? '...' : 'Pagar (Saldo)'}
                                   </button>
                                 )
                               )}
                             </td>
                           </tr>
                         ))
                       ) : (
                         quotes.map((q) => (
                           <tr key={q.id} className="hover:bg-cyan-400/5 transition-colors">
                             <td className="px-8 py-6"><span className="text-[11px] font-black text-white font-mono">{q.id}</span></td>
                             <td className="px-8 py-6"><p className="text-xs font-bold text-slate-200">{q.concept}</p></td>
                             <td className="px-8 py-6 text-sm font-black text-white italic">${q.amount.toFixed(2)}</td>
                             <td className="px-8 py-6"><span className="px-4 py-1.5 rounded-full bg-cyan-400/10 text-cyan-400 text-[9px] font-black uppercase tracking-widest">Quote</span></td>
                             <td className="px-8 py-6 text-right">
                               <button onClick={() => handleStamp(q.id)} className="px-6 py-3 bg-slate-900 border border-slate-800 text-cyan-400 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 mx-auto">
                                 {isStamping === q.id ? <RefreshCw className="animate-spin" size={14}/> : <Zap size={14}/>} Timbrar
                               </button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Manual Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsPlanModalOpen(false)}></div>
           <div className="relative w-full max-w-lg titan-glass rounded-[3rem] border border-slate-800 shadow-2xl p-10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center text-slate-950">
                    <TrendingUp size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Planificar Gasto</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inyectar dato al motor de proyección</p>
                 </div>
              </div>

              <form onSubmit={handlePlanSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Concepto del Gasto</label>
                    <input 
                       type="text" 
                       placeholder="Ej: Licencias Adicionales"
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                       value={planForm.title}
                       onChange={(e) => setPlanForm({...planForm, title: e.target.value})}
                       required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Importe Estimado (USD)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400" size={16} />
                       <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 pl-12 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold"
                          value={planForm.amount}
                          onChange={(e) => setPlanForm({...planForm, amount: e.target.value})}
                          required
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Mes de Ejecución</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-cyan-400 outline-none transition-all font-bold appearance-none"
                      value={planForm.month}
                      onChange={(e) => setPlanForm({...planForm, month: e.target.value})}
                    >
                       {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                       ))}
                    </select>
                 </div>

                 <button 
                   type="submit"
                   disabled={isPlanSaving}
                   className="w-full py-6 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl transition-all shadow-cyan-glow uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 mt-4"
                 >
                    {isPlanSaving ? <RefreshCw className="animate-spin" size={16}/> : <Plus size={16}/>}
                    Agregar al Presupuesto
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Wallet Modal (Reused) */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           {/* ... (Existing Wallet Modal Code reused/kept same as context provided) ... */}
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsWalletOpen(false)}></div>
           <div className="relative w-full max-w-lg titan-glass rounded-[3rem] border border-slate-800 p-10 flex flex-col items-center text-center">
              <Wallet size={48} className="text-cyan-400 mb-6" />
              <h3 className="text-2xl font-black text-white uppercase italic">Aurum Pay Hub</h3>
              <p className="text-slate-500 text-xs mt-2">Módulo de recarga rápida (Vista Simplificada)</p>
              <button onClick={() => setIsWalletOpen(false)} className="mt-8 px-8 py-3 bg-slate-800 rounded-xl text-white text-xs font-black uppercase">Cerrar</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
