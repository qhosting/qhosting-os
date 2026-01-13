
import React from 'react';
import { Server, Globe, Shield, Activity, BarChart3, Database, Zap, Users, Settings, Layout, MessageSquare } from 'lucide-react';
import { UserRole } from './types';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Activity size={20} />, roles: [UserRole.CEO, UserRole.ADMIN, UserRole.CLIENT] },
  { id: 'landing_view', label: 'Página Pública', icon: <Globe size={20} />, roles: [UserRole.CEO, UserRole.ADMIN, UserRole.CLIENT] },
  { id: 'services', label: 'Hosting', icon: <Server size={20} />, roles: [UserRole.CEO, UserRole.ADMIN, UserRole.CLIENT] },
  { id: 'domains', label: 'Dominios', icon: <Globe size={20} />, roles: [UserRole.CEO, UserRole.ADMIN, UserRole.CLIENT] },
  { id: 'support', label: 'Soporte', icon: <MessageSquare size={20} />, roles: [UserRole.CEO, UserRole.ADMIN, UserRole.CLIENT] },
  { id: 'users', label: 'Clientes', icon: <Users size={20} />, roles: [UserRole.CEO, UserRole.ADMIN] },
  { id: 'infrastructure', label: 'Nodos', icon: <Zap size={20} />, roles: [UserRole.CEO, UserRole.ADMIN] },
  { id: 'billing', label: 'Facturación', icon: <Database size={20} />, roles: [UserRole.CEO, UserRole.CLIENT] },
  { id: 'security', label: 'Seguridad', icon: <Shield size={20} />, roles: [UserRole.CEO, UserRole.ADMIN, UserRole.CLIENT] },
  { id: 'settings', label: 'Configuración', icon: <Settings size={20} />, roles: [UserRole.CEO] },
];

export const PLANS = [
  { 
    id: 'titan_startup', 
    name: 'Startup', 
    disk: '10GB NVMe', 
    transfer: '100GB', 
    price: '9.99',
    features: ['1 Sitio Web', 'Certificado SSL Gratis', 'Titan Speed Node']
  },
  { 
    id: 'titan_pro', 
    name: 'Pro', 
    disk: '50GB NVMe', 
    transfer: '500GB', 
    price: '24.99',
    features: ['10 Sitios Web', 'Inmunify360 Premium', 'Dedicated IP Option']
  },
  { 
    id: 'titan_enterprise', 
    name: 'Enterprise', 
    disk: 'Unlimited NVMe', 
    transfer: 'Unmetered', 
    price: '49.99',
    features: ['Sitios Ilimitados', 'Soporte Prioritario 24/7', 'Daily Off-site Backups']
  },
];
