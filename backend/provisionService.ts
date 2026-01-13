
import { Worker, Job } from 'bullmq';
import axios from 'axios';
import IORedis from 'ioredis';
import https from 'https';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null 
});

const worker = new Worker('provisioning', async (job: Job) => {
  // Los datos ahora incluyen targetIp y whmPackage dinámicos desde el Catálogo
  const { domain, username, targetIp, whmPackage, contactEmail } = job.data;

  console.log(`[TITAN WORKER] Provisioning account for ${domain} on node ${targetIp} using package ${whmPackage}...`);

  try {
    // WHM API 1: createacct
    // Usamos la IP específica del nodo seleccionado en el Catálogo
    const response = await axios.get(`https://${targetIp}:2087/json-api/createacct`, {
      params: {
        username,
        domain,
        plan: whmPackage, // Usamos el nombre real del paquete WHM
        contactemail: contactEmail || 'admin@qhosting.net'
      },
      headers: {
        // En producción real, cada nodo debería tener su propio token almacenado en DB segura
        'Authorization': `whm root:${process.env.WHM_API_TOKEN}`
      },
      // Ignorar SSL self-signed en dev/test
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    if (response.data.metadata && response.data.metadata.result === 1) {
      console.log(`[SUCCESS] Account created for ${domain}`);
      // Aquí se podría actualizar el estado en DB a 'active' si tuviéramos acceso directo a SQL
    } else {
      const reason = response.data.metadata ? response.data.metadata.reason : 'Unknown Error';
      throw new Error(reason);
    }
  } catch (error: any) {
    console.error(`[FAILURE] Provisioning failed: ${error.message}`);
    // En un sistema real, marcaríamos el servicio como 'failed' en DB
    throw error;
  }
}, { connection: redisConnection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} (Provisioning) has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed with ${err.message}`);
});
