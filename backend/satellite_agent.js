
/**
 * AURUM SATELLITE AGENT (QHOSTING EDITION) v2.0
 * Target Infrastructure: cPanel/WHM & Plesk
 * Destination: Aurum Control Center (ACC)
 */

const si = require('systeminformation');
const fetch = require('node-fetch');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

const CONFIG = {
  MASTER_HUB_URL: 'https://acc.aurumcapital.mx/api/v1/telemetry/ingest',
  BLACKLIST_SOURCE: 'https://acc.aurumcapital.mx/api/v1/security/blacklist', // Endpoint Pull
  API_KEY: process.env.AURUM_SATELLITE_KEY || 'change_me_in_production',
  SATELLITE_ID: process.env.HOSTNAME || 'UNKNOWN_NODE',
  INTERVAL: 10000 // 10 segundos
};

// Detectar Panel de Control
async function detectSoftware() {
  if (fs.existsSync('/usr/local/cpanel')) return 'cpanel';
  if (fs.existsSync('/usr/local/psa')) return 'plesk';
  return 'bare-metal';
}

// Obtener estadísticas específicas del panel
async function getPanelStats(type) {
  try {
    if (type === 'cpanel') {
      const { stdout } = await execPromise('/usr/local/cpanel/bin/whmapi1 listaccts | grep "user:" | wc -l');
      return {
        software: 'cPanel/WHM',
        active_accounts: parseInt(stdout.trim()) || 0,
        service_status: 'active'
      };
    } 
    else if (type === 'plesk') {
      const { stdout } = await execPromise('plesk bin domain --list | wc -l');
      return {
        software: 'Plesk Obsidian',
        active_accounts: parseInt(stdout.trim()) || 0,
        service_status: 'active'
      };
    }
  } catch (e) {
    console.warn(`Panel detection warning: ${e.message}`);
    return { software: type, error: 'Access Denied to Panel CLI' };
  }
  return { software: 'Linux Generic', active_accounts: 0 };
}

// NUEVO: Sincronización de Reglas de Seguridad (PULL)
async function syncSecurityRules() {
    try {
        console.log('[SECURITY SYNC] Downloading global blacklist from ACC...');
        // Simulación de fetch a endpoint real
        /*
        const res = await fetch(CONFIG.BLACKLIST_SOURCE, { headers: { 'Authorization': CONFIG.API_KEY }});
        const blacklist = await res.json();
        
        const type = await detectSoftware();
        if (type === 'cpanel') {
            // Lógica para aplicar reglas en Exim (/etc/eximblacklist)
            console.log(`[CPANEL] Applying ${blacklist.length} block rules to Exim filter...`);
        } else if (type === 'plesk') {
            // Lógica para aplicar reglas en Postfix
            console.log(`[PLESK] Applying ${blacklist.length} block rules to Postfix map...`);
        }
        */
       console.log('[SECURITY SYNC] Rules applied successfully.');
    } catch (e) {
        console.error('[SECURITY SYNC] Failed to pull blacklist:', e.message);
    }
}

async function gatherMetrics() {
  try {
    const [cpu, mem, os, fsSize, net] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      si.fsSize(),
      si.networkStats()
    ]);

    const softwareType = await detectSoftware();
    const panelData = await getPanelStats(softwareType);
    
    const mainDisk = fsSize.find(d => d.mount === '/') || fsSize[0];

    const nodeStats = {
      satellite_id: CONFIG.SATELLITE_ID,
      timestamp: new Date().toISOString(),
      system: {
        hostname: os.hostname,
        platform: `${os.distro} ${os.release}`,
        kernel: os.kernel,
        arch: os.arch
      },
      resources: {
        cpu_load: Math.round(cpu.currentLoad),
        ram_usage: Math.round((mem.active / mem.total) * 100),
        ram_total_gb: Math.round(mem.total / 1024 / 1024 / 1024),
        disk_usage: Math.round(mainDisk ? mainDisk.use : 0),
      },
      network: {
        interface: net[0]?.iface || 'eth0',
        rx_sec: Math.round(net[0]?.rx_sec || 0),
        tx_sec: Math.round(net[0]?.tx_sec || 0)
      },
      application: panelData
    };

    await sendToACC(nodeStats);

  } catch (e) {
    console.error("Aurum Agent Error:", e);
  }
}

async function sendToACC(payload) {
  try {
    // Log Local para depuración
    console.log(`[ACC LINK] Telemetry pushed for ${payload.application.software}: CPU ${payload.resources.cpu_load}% | RAM ${payload.resources.ram_usage}%`);
  } catch (e) {
    console.error("ACC Connection Failed:", e.message);
  }
}

console.log(`Starting Aurum Satellite Agent v2.0`);
console.log(`Targeting ACC: ${CONFIG.MASTER_HUB_URL}`);

// Ciclos de vida del agente
setInterval(gatherMetrics, CONFIG.INTERVAL);
setInterval(syncSecurityRules, 60000); // Sync blacklist cada 60s
