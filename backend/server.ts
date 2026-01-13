
import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// @ts-ignore
import fastifyStatic from '@fastify/static';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

// Definir __dirname para entorno ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

// --- CONFIGURACIÓN DE PRODUCCIÓN EASYPANEL ---
// Las variables de entorno tienen prioridad, fallbacks a las cadenas proporcionadas
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:7545f09686c0c0a165c0@qhosting_qhosting-db:5432/qhosting-db?sslmode=disable';
const REDIS_URL = process.env.REDIS_URL || 'redis://default:5faf81de3571e8b7146c@qhosting_redis:6379';
const AURUM_SECRET = process.env.AURUM_SHARED_SECRET || 'aurum_satellite_master_key';

// Hostname Centralizado (Permite cambios rápidos en Easypanel)
const TITAN_HOST = process.env.TITAN_HOST || 'titan.qhosting.net';

// Conexión Redis
const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null
});

// Queue de Aprovisionamiento
const provisionQueue = new Queue('provisioning', { connection: redisConnection });

redisConnection.on('error', (err) => console.error('[REDIS ERROR]', err));
redisConnection.on('connect', () => console.log('[REDIS] Conectado a Easypanel Redis Cluster'));

// --- INTEGRATION CONFIG ---
const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3001'; 
const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';

// Chatwoot Config
let CHATWOOT_CONFIG = {
  url: 'https://app.chatwoot.com',
  api_access_token: '',
  inbox_id: '',
  enabled: false
};

// --- STATIC FILE SERVING (REACT) ---
// En producción, servimos los archivos construidos por Vite
const publicPath = path.join(__dirname, '../public');

// Registrar plugin de estáticos solo si existe la carpeta (modo producción)
if (fs.existsSync(publicPath)) {
  fastify.register(fastifyStatic, {
    root: publicPath,
    prefix: '/', // Servir en la raíz
  });

  // Catch-all para React Router: Cualquier ruta que no sea API devuelve index.html
  fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.url && req.raw.url.startsWith('/api')) {
      reply.status(404).send({ error: 'Endpoint API no encontrado', url: req.raw.url });
    } else {
      reply.sendFile('index.html');
    }
  });
} else {
  console.warn('[DEV WARNING] No se encontró carpeta dist/public. Asegúrate de ejecutar "npm run build" para producción.');
}

// --- LANDING PAGE CONFIGURATION (CMS) ---
let landingConfig = {
  heroTitle: "INFRAESTRUCTURA TITAN",
  heroSubtitle: "Hosting NVMe de Próxima Generación",
  heroDesc: "Migra hoy al sistema singular de QHOSTING.net. Rendimiento del 99.9% garantizado por hardware de grado industrial respaldado por Aurum Capital.",
  primaryColor: "#00AEEF",
  showPricing: true,
  showFeatures: true
};

// --- TITAN SERVICE CATALOG (New Module) ---
let catalogPlans = [
  {
    id: 'titan_startup',
    name: 'Startup',
    price: 9.99,
    nodeId: 'TITAN-CPANEL-01',
    whmPackage: 'titan_start_v1',
    disk: '10GB NVMe',
    transfer: '100GB',
    features: ['1 Sitio Web', 'Certificado SSL Gratis', 'Titan Speed Node']
  },
  {
    id: 'titan_pro',
    name: 'Pro',
    price: 24.99,
    nodeId: 'TITAN-CPANEL-01',
    whmPackage: 'titan_pro_v2',
    disk: '50GB NVMe',
    transfer: '500GB',
    features: ['10 Sitios Web', 'Inmunify360 Premium', 'Dedicated IP Option']
  },
  {
    id: 'titan_enterprise',
    name: 'Enterprise',
    price: 49.99,
    nodeId: 'TITAN-BARE-03',
    whmPackage: 'titan_ent_rc',
    disk: 'Unlimited NVMe',
    transfer: 'Unmetered',
    features: ['Sitios Ilimitados', 'Soporte Prioritario 24/7', 'Daily Off-site Backups']
  }
];

// Mock Databases
let manualDomains = [
  { 
    id: 101, 
    domain: 'titan-pro.net', 
    registrar: 'Aurum Registry', 
    status: 'active', 
    expiry: '2025-12-20', 
    autoRenew: true, 
    privacy: true, 
    expiry_notification_sent: false,
    dnsConfig: {
      cloudflare: ['amir.ns.cloudflare.com', 'becky.ns.cloudflare.com'],
      institutional: ['ns1.qhosting.net', 'ns2.qhosting.net']
    }
  },
  { 
    id: 102, 
    domain: 'venture-capital.io', 
    registrar: 'Aurum Registry', 
    status: 'active', 
    expiry: '2024-11-15', 
    autoRenew: false, 
    privacy: true, 
    expiry_notification_sent: false,
    dnsConfig: {
      cloudflare: ['duke.ns.cloudflare.com', 'lola.ns.cloudflare.com'],
      institutional: ['ns1.qhosting.net', 'ns2.qhosting.net']
    }
  }
];

let hostingServices = [
  { 
    id: 'SRV-TITAN-01', 
    domain: 'empresa-demo.com', 
    plan: 'Titan Pro NVMe', 
    ip: TITAN_HOST, 
    status: 'active', 
    diskUsage: 45, 
    bandwidthUsage: 12, 
    cpanelUrl: `https://${TITAN_HOST}:2083`,
    location: 'Miami (MIA-2)',
    ssl: true,
    backupStatus: 'success',
    phpVersion: '8.2',
    client_name: 'Corp Industrias',
    client_id: 101
  }
];

let plannedExpenses = [
  { id: 'PLAN-001', title: 'Licencias cPanel Extra', amount: 45.00, month: 10, type: 'manual' },
  { id: 'PLAN-002', title: 'Auditoría de Seguridad Anual', amount: 500.00, month: 11, type: 'manual' }
];

let securityEvents = [
  { id: 1, type: 'DDoS Mitigation', severity: 'high', description: 'Intento de inundación UDP mitigado en Edge Node 02.', ip: '45.12.88.x', timestamp: 'Hace 5 min' },
  { id: 2, type: 'SSL Renewal', severity: 'low', description: 'Certificado TLS 1.3 renovado para quantum-node.io.', ip: 'System', timestamp: 'Hace 1h' },
];

let firewallRules = [
  { id: 1, name: 'Block Russian Segments', type: 'deny', scope: 'global', status: 'active' },
  { id: 2, name: 'Allow Aurum Office VPN', type: 'allow', scope: 'node-01', status: 'active' },
];

let globalBlacklist = [
  { id: 101, target: 'spammer@malicious.xyz', type: 'email', reason: 'Spam Trap Hit', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'synced' },
];

let invoices = [
  { id: 'INV-AUR-901', concept: 'Renovación Titan Pro', amount: 24.99, status: 'paid', date: '2024-05-01', dueDate: '2024-06-01', method: 'Aurum Credit' },
];

let quotes = [
  { id: 'QT-TITAN-552', concept: 'Expansión Nodo NVMe - Cluster B', amount: 150.00, status: 'pending', date: '2024-05-15', expiration: '2024-05-25' },
];

let aurumBalance = 42.50;
let walletTransactions = [
  { id: 'TX-7721', type: 'topup', amount: 100.00, method: 'Crypto (USDT)', date: '2024-04-20', status: 'confirmed' },
];

let clients = [
  { id: 101, name: 'Corp Industrias', email: 'ceo@corp.com', aurumId: 'AUR-CL-882', role: 'client', status: 'active', joined: '2023-11-10', assets: 3 },
  { id: 102, name: 'Studio Design', email: 'admin@studio.io', aurumId: 'AUR-CL-991', role: 'client', status: 'active', joined: '2024-01-15', assets: 1 },
];

let internalStaff = [
  { id: 1, name: 'Alexander Q.', email: 'ceo@qhosting.net', role: 'ceo', status: 'active', mfa: true, lastLogin: 'Justo ahora' },
  { id: 2, name: 'Sarah Connor', email: 'sysadmin@qhosting.net', role: 'admin', status: 'active', mfa: true, lastLogin: 'Hace 2h' },
];

// --- SUPPORT TICKETS DB ---
let tickets = [
  { 
    id: 'TKT-9921', 
    subject: 'Latencia intermitente en Cluster MIA-2', 
    status: 'open', 
    priority: 'high', 
    department: 'Infraestructura', 
    date: '2024-05-15 10:30', 
    description: 'Hemos detectado picos de latencia >200ms en la ruta de entrada. Logs adjuntos en ACC.' 
  },
  { 
    id: 'TKT-8810', 
    subject: 'Solicitud de IP Dedicada Adicional', 
    status: 'pending', 
    priority: 'medium', 
    department: 'Redes', 
    date: '2024-05-14 16:45', 
    description: 'Requerimos una IPv4 limpia para servidor de correo transaccional.' 
  },
  { 
    id: 'TKT-7721', 
    subject: 'Facturación duplicada Mayo', 
    status: 'resolved', 
    priority: 'low', 
    department: 'Facturación', 
    date: '2024-05-01 09:00', 
    description: 'El sistema generó dos invoices para el mismo servicio. Solicito nota de crédito.' 
  }
];

let systemSettings = {
  nodeLocation: 'Miami - TIER IV',
  masterHubEndpoint: 'https://acc.aurumcapital.mx/api/v1',
  aurumApiKey: 'AUR-SEC-99120-X82',
  syncInterval: 300,
  whiteLabel: { 
    brandName: 'Q-SYSTEM', 
    primaryColor: '#00AEEF', 
    logoUrl: '/logo.png' 
  },
  automation: {
    autoSuspendDays: 7,
    enableAutoSuspend: true,
    backupRetentionDays: 30,
    provisioningQueueActive: true
  },
  securityPolicy: {
    enforceMfaAdmin: true,
    sessionTimeoutMins: 60,
    allowedIps: ['192.168.1.1', '10.0.0.5']
  },
  webhookSecret: 'whsec_titan_primary_992x',
  notificationEvents: {
    newOrder: true,
    ticketCreated: true,
    serverAlert: true,
    invoicePaid: false
  },
  maintenanceMode: false,
};

let satelliteNodes = [
  {
    id: 'TITAN-CPANEL-01',
    location: 'Miami (MIA-2)',
    ip: TITAN_HOST, // Production Endpoint
    status: 'online',
    load: 45,
    ram: 64,
    storage: 42,
    software: 'cPanel/WHM (AlmaLinux 8)',
    accounts: 142
  },
  {
    id: 'TITAN-PLESK-EU',
    location: 'Frankfurt (FRA-1)',
    ip: '10.50.22.88',
    status: 'maintenance',
    load: 12,
    ram: 32,
    storage: 88,
    software: 'Plesk Obsidian (Ubuntu 22)',
    accounts: 56
  },
  {
    id: 'TITAN-BARE-03',
    location: 'New York (NYC-3)',
    ip: '45.22.11.90',
    status: 'online',
    load: 78,
    ram: 128,
    storage: 20,
    software: 'cPanel/WHM (CloudLinux 9)',
    accounts: 310
  }
];

// --- HELPER: AURUM PAY SYNC (Translated from PHP) ---
async function syncInvoiceWithAurum(invoice: any, clientEmail: string = 'admin@qhosting.net') {
  try {
    console.log(`[AURUM PAY] Sincronizando factura local ${invoice.id} con Master Hub...`);
    
    // 1. Preparar Payload
    const payload = {
      externalInvoiceId: invoice.id,
      clientEmail: clientEmail,
      total: invoice.amount,
      dueDate: invoice.dueDate,
      items: [{
        concept: invoice.concept,
        quantity: 1,
        price: invoice.amount
      }]
    };

    // 2. Ejecutar Petición (Simulada para Demo)
    // const endpoint = `${systemSettings.masterHubEndpoint}/billing/sync-invoice`;
    // const response = await axios.post(endpoint, payload, {
    //    headers: {
    //      'Content-Type': 'application/json',
    //      'x-api-key': systemSettings.aurumApiKey,
    //      'x-satellite-id': 'QHOSTING-NODE-01'
    //    }
    // });
    
    // 3. Simular Respuesta Exitosa de Aurum
    const mockPaymentUrl = `https://pay.aurumcapital.mx/checkout/${invoice.id}?token=${Math.random().toString(36).substring(7)}`;
    
    console.log(`[AURUM PAY] Enlace generado: ${mockPaymentUrl}`);
    return mockPaymentUrl;

  } catch (error) {
    console.error("[AURUM PAY ERROR]", error);
    return null;
  }
}

// --- API ENDPOINTS ---

// API: CATALOG & PLANS
fastify.get('/api/plans', async () => catalogPlans);
fastify.post('/api/plans', async (req) => {
    const plan = req.body as any;
    if (!plan.id) plan.id = `titan_plan_${Date.now()}`;
    catalogPlans.push(plan);
    return { success: true, plan };
});
fastify.delete('/api/plans/:id', async (req) => {
    const { id } = req.params as any;
    catalogPlans = catalogPlans.filter(p => p.id !== id);
    return { success: true };
});

// API: LANDING CONFIG (CMS)
fastify.get('/api/landing', async () => landingConfig);
fastify.post('/api/landing', async (req) => {
  const newConfig = req.body as any;
  landingConfig = { ...landingConfig, ...newConfig };
  return { success: true, config: landingConfig };
});

// API: HOSTING SERVICES
fastify.get('/api/services', async () => hostingServices);
fastify.post('/api/services/provision', async (request, reply) => {
    const { domain, plan: planId, type, clientId } = request.body as any;
    
    // 1. Buscar Plan
    const catalogPlan = catalogPlans.find(p => p.id === planId);
    if (!catalogPlan) return reply.status(400).send({ error: 'Plan inválido' });

    // 2. Buscar Nodo
    const targetNode = satelliteNodes.find(n => n.id === catalogPlan.nodeId);
    if (!targetNode) return reply.status(500).send({ error: `Nodo de destino no disponible` });

    // 3. Client Assignment
    let assignedClientName = 'Unassigned';
    let assignedClientId = null;
    if (clientId) {
      const client = clients.find(c => c.id === parseInt(clientId));
      if (client) {
        assignedClientName = client.name;
        assignedClientId = client.id;
        client.assets += 1;
      }
    }

    // 4. Create Service
    const newService = {
        id: `SRV-TITAN-${Math.floor(Math.random() * 1000)}`,
        domain,
        plan: catalogPlan.name,
        ip: targetNode.ip,
        status: 'pending_provision',
        diskUsage: 0,
        bandwidthUsage: 0,
        cpanelUrl: `https://${domain}/cpanel`,
        location: targetNode.location,
        ssl: false,
        backupStatus: 'warning',
        phpVersion: '8.2',
        client_name: assignedClientName,
        client_id: assignedClientId
    };
    hostingServices.push(newService);

    // 5. Trigger Queue
    await provisionQueue.add('create_account', {
        domain,
        username: domain.substring(0, 8).replace(/[^a-z0-9]/gi, ''),
        targetIp: targetNode.ip,
        whmPackage: catalogPlan.whmPackage,
        contactEmail: 'admin@qhosting.net'
    });

    // 6. Domain Registration (Hybrid DNS Logic)
    if (type === 'ecosystem') {
        const existingDomain = manualDomains.find(d => d.domain === domain);
        if (!existingDomain) {
             const cfNames = ['arya.ns.cloudflare.com', 'chin.ns.cloudflare.com']; // Allocated CF NS
             const institutionalNames = ['ns1.qhosting.net', 'ns2.qhosting.net']; // Institutional NS
             
             manualDomains.push({ 
                id: Date.now(), 
                domain, 
                registrar: 'Aurum Registry', 
                status: 'pending_manual_purchase', 
                expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
                autoRenew: true,
                privacy: false,
                expiry_notification_sent: false,
                dnsConfig: {
                  cloudflare: cfNames,
                  institutional: institutionalNames
                }
            });
            console.log(`[AURUM HUB] Domain Order: ${domain} with Hybrid DNS Config.`);
        }
    }
    
    setTimeout(() => { newService.status = 'active'; newService.ssl = true; }, 5000);
    return { success: true, service: newService };
});

fastify.post('/api/services/:id/sso', async (request, reply) => {
    const { id } = request.params as any;
    const service = hostingServices.find(s => s.id === id);
    if (!service) return reply.status(404).send({error: 'Service not found'});
    return { success: true, redirectUrl: `${service.cpanelUrl}/login/?user=aurum_user&token=temp_xyz_991` };
});

// API: DOMAINS (UPDATED FOR PRODUCTION LOGIC)
fastify.get('/api/domains/manual', async () => manualDomains);

// SEARCH: Strictly Manual / No Random Simulation
fastify.post('/api/domains/search', async (req) => {
  const { keyword } = req.body as any;
  const isValid = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(keyword);
  return {
    results: isValid ? [{
      tld: `.${keyword.split('.').pop()}`,
      domain: keyword,
      price: 15.00,
      available: true,
      featured: false
    }] : []
  };
});

// PURCHASE: Enforce Hybrid DNS
fastify.post('/api/domains/purchase', async (req) => {
  const { domain } = req.body as any;
  
  console.log(`[AURUM HUB] SOLICITUD DE COMPRA MANUAL: ${domain}`);
  console.log(`[CLOUDFLARE] Asignando Nameservers Híbridos para: ${domain}`);

  const cfNames = ['dave.ns.cloudflare.com', 'lisa.ns.cloudflare.com'];
  const institutionalNames = ['ns1.qhosting.net', 'ns2.qhosting.net'];

  const newDomain = { 
    id: Date.now(), 
    domain, 
    registrar: 'Aurum Registry', 
    status: 'pending_manual_purchase',
    expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    autoRenew: true,
    privacy: true,
    expiry_notification_sent: false,
    dnsConfig: {
      cloudflare: cfNames,
      institutional: institutionalNames
    }
  };
  manualDomains.push(newDomain);
  aurumBalance -= 15.00; 
  return { success: true, domain: newDomain };
});

fastify.post('/api/domains/transfer', async (req) => {
  const { domain, authCode } = req.body as any;
  if(!authCode) return { success: false, error: 'Auth Code Required'};
  
  console.log(`[AURUM HUB] Solicitud de transferencia manual enviada: ${domain} (Auth: ${authCode})`);

  const newDomain = { 
    id: Date.now(), 
    domain, 
    registrar: 'Aurum Registry (Transferred)', 
    status: 'pending_transfer', 
    expiry: '2025-01-01',
    autoRenew: true,
    privacy: true,
    expiry_notification_sent: false,
    dnsConfig: {
      cloudflare: ['pending.ns.cloudflare.com'],
      institutional: ['ns1.qhosting.net', 'ns2.qhosting.net']
    }
  };
  manualDomains.push(newDomain);
  return { success: true, domain: newDomain };
});
fastify.delete('/api/domains/manual/:id', async (req) => {
  const { id } = req.params as any;
  manualDomains = manualDomains.filter(d => d.id != id);
  return { success: true };
});

// API: SETTINGS
fastify.get('/api/settings', async () => systemSettings);
fastify.post('/api/settings', async (request, reply) => {
  const newSettings = request.body as any;
  systemSettings = { ...systemSettings, ...newSettings };
  return { success: true, settings: systemSettings };
});
fastify.post('/api/settings/test-hub', async (request, reply) => {
  return { 
    success: true, 
    latency: '14ms', 
    nodeId: 'TITAN-HUB-MIA-01', 
    status: 'Operational',
    timestamp: new Date().toISOString()
  };
});

// API: INTEGRATIONS
fastify.get('/api/integrations', async () => ({
  n8n: { url: N8N_URL, status: 'operational' },
  waha: { url: WAHA_URL, status: 'scanning_required' },
  chatwoot: CHATWOOT_CONFIG
}));
fastify.post('/api/integrations/chatwoot', async (req) => {
  const config = req.body as any;
  CHATWOOT_CONFIG = { ...CHATWOOT_CONFIG, ...config };
  return { success: true, config: CHATWOOT_CONFIG };
});
fastify.get('/api/integrations/waha/qr', async (request, reply) => {
  return { qr_code_url: 'https://via.placeholder.com/300x300.png?text=WAHA+QR+CODE' }; 
});
fastify.post('/api/integrations/waha/send', async (req) => {
  return { success: true, status: 'queued_in_waha' };
});

// WEBHOOK: AURUM MASTER HUB TICKET SYNC
fastify.post('/api/integrations/aurum/ticket', async (request, reply) => {
  const signature = request.headers['x-aurum-signature'];
  const { ticketId, title, description, priority } = request.body as any;

  // 1. Verificación de Seguridad
  if (signature !== AURUM_SECRET) {
    console.warn(`[SECURITY] Intento de acceso no autorizado desde Aurum Webhook.`);
    return reply.code(403).send({ error: 'Firma de seguridad inválida' });
  }

  console.log(`[AURUM EVENT] Nuevo Ticket Recibido del Master Hub: ${ticketId}`);

  // 2. Insertar ticket en la base de datos local
  const newTicket = {
    id: ticketId || `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
    subject: title,
    status: 'open',
    priority: priority || 'medium',
    department: 'Aurum Central', // Departamento específico para tickets pusheados
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    description: description || 'Incidencia sincronizada desde el Centro de Mando Aurum.'
  };
  tickets.unshift(newTicket);

  return { success: true, message: 'Ticket procesado en QSystem' };
});

// API: SECURITY
fastify.get('/api/security/events', async () => securityEvents);
fastify.get('/api/security/firewall', async () => firewallRules);
fastify.get('/api/security/blacklist', async () => globalBlacklist);
fastify.post('/api/security/blacklist', async (req) => {
    const { block_list_item, target_email, reason } = req.body as any;
    const target = block_list_item;
    const type = target.includes('@') ? 'email' : 'domain';
    const newEntry = {
        id: Date.now(),
        target,
        type,
        reason: reason || `Manual Block triggered by ${target_email || 'Admin'}`,
        timestamp: new Date().toISOString(),
        status: 'pending_sync'
    };
    globalBlacklist.unshift(newEntry);
    return { success: true, entry: newEntry };
});
fastify.delete('/api/security/blacklist/:id', async (req) => {
    const { id } = req.params as any;
    globalBlacklist = globalBlacklist.filter(e => e.id != id);
    return { success: true };
});

// API: BILLING
fastify.get('/api/billing/invoices', async () => invoices);
fastify.get('/api/billing/balance', async () => ({ balance: aurumBalance }));
fastify.get('/api/billing/transactions', async () => walletTransactions);
fastify.get('/api/billing/budget', async () => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlyData = months.map((name, index) => ({ name, total: 0, items: [] }));
  return { monthlyData, annualTotal: 0, plannedExpenses };
});
fastify.post('/api/billing/budget/plan', async (req) => {
  const { title, amount, month } = req.body as any;
  const newExpense = {
    id: `PLAN-${Date.now()}`,
    title,
    amount: parseFloat(amount),
    month: parseInt(month),
    type: 'manual'
  };
  plannedExpenses.push(newExpense);
  return { success: true };
});
fastify.post('/api/billing/topup', async (request, reply) => {
  const { amount, method } = request.body as { amount: number, method: string };
  if (!amount || amount <= 0) return reply.status(400).send({ error: 'Monto inválido' });
  aurumBalance += amount;
  const newTx = {
    id: 'TX-' + Math.floor(Math.random() * 9000 + 1000),
    type: 'topup',
    amount: amount,
    method: method || 'Institutional Transfer',
    date: new Date().toISOString().split('T')[0],
    status: 'confirmed'
  };
  walletTransactions.unshift(newTx);
  return { success: true, balance: aurumBalance, transaction: newTx };
});
fastify.post('/api/billing/pay/:id', async (request, reply) => {
  const { id } = request.params as any;
  const inv = invoices.find(i => i.id === id);
  if (inv && aurumBalance >= inv.amount) {
    aurumBalance -= inv.amount;
    inv.status = 'paid';
    return { success: true, balance: aurumBalance };
  }
  return reply.status(400).send({ error: 'Error' });
});

// API: USERS
fastify.get('/api/clients', async () => clients);
fastify.post('/api/clients', async (request, reply) => {
    const { name, email, role } = request.body as any;
    const newClient = {
        id: Date.now(),
        name,
        email,
        aurumId: `AUR-CL-${Math.floor(Math.random() * 90000) + 10000}`,
        role: role || 'client',
        status: 'active',
        joined: new Date().toISOString().split('T')[0],
        assets: 0
    };
    clients.push(newClient);
    return { success: true, client: newClient };
});
fastify.delete('/api/clients/:id', async (req) => {
  const { id } = req.params as any;
  clients = clients.filter(c => c.id != id);
  return { success: true };
});
fastify.post('/api/clients/sync', async () => {
  return { success: true };
});
fastify.get('/api/staff', async () => internalStaff);
fastify.post('/api/staff', async (req) => {
  const body = req.body as any;
  const newMember = {
    id: Date.now(),
    name: body.name,
    email: body.email,
    role: body.role,
    status: 'pending',
    mfa: false,
    lastLogin: 'Never'
  };
  internalStaff.push(newMember);
  return { success: true, member: newMember };
});
fastify.delete('/api/staff/:id', async (req) => {
  const { id } = req.params as any;
  internalStaff = internalStaff.filter(s => s.id != id);
  return { success: true };
});
fastify.patch('/api/staff/:id/role', async (req) => {
  const { id } = req.params as any;
  const { role } = req.body as any;
  const member = internalStaff.find(s => s.id == id);
  if(member) member.role = role;
  return { success: true };
});

// API: NODES
fastify.get('/api/nodes', async () => satelliteNodes);
fastify.post('/api/nodes/:id/reboot', async (request, reply) => {
  return { success: true, message: 'Request forwarded to ACC' };
});

// API: SUPPORT TICKETS (NUEVO NUCLEO LOGICO)
fastify.get('/api/tickets', async () => tickets);
fastify.post('/api/tickets', async (req) => {
  const body = req.body as any;
  const newTicket = {
    id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
    subject: body.subject,
    status: 'open',
    priority: body.priority,
    department: body.department,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    description: body.description
  };
  tickets.unshift(newTicket);
  
  // Si hay integración WAHA, podríamos notificar aquí también
  console.log(`[AURUM SUPPORT] Nuevo ticket creado: ${newTicket.id}`);
  
  return { success: true, ticket: newTicket };
});

// API: OTROS
fastify.get('/api/quotes', async () => quotes);
fastify.get('/api/health', async () => ({ status: 'Titan Online', masterHub: 'Connected' }));
fastify.post('/api/quotes/:id/invoice', async (request, reply) => {
   const { id } = request.params as { id: string };
   const quoteIndex = quotes.findIndex(q => q.id === id);
   if (quoteIndex === -1) return reply.status(404).send({ error: 'Propuesta no encontrada' });
   const quote = quotes[quoteIndex];
   
   const newInvoice = {
     id: id.replace('QT', 'INV'),
     concept: quote.concept,
     amount: quote.amount,
     status: 'pending' as const,
     date: new Date().toISOString().split('T')[0],
     dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
     method: 'Pending Gateway'
   };
   
   // --- AURUM PAY SYNC INTEGRATION ---
   const paymentLink = await syncInvoiceWithAurum(newInvoice);
   if (paymentLink) {
       (newInvoice as any).paymentUrl = paymentLink;
   }
   
   invoices.unshift(newInvoice);
   quotes.splice(quoteIndex, 1);
   return { success: true, invoice: newInvoice };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`[TITAN SYSTEM] Server active on port ${port} :: Mode: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    fastify.log.error(err);
    (process as any).exit(1);
  }
};
start();
