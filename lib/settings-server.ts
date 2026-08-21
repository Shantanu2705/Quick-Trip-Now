import { adminDb } from './firebase-admin';

export async function getGlobalSettings() {
  if (!adminDb) return null;
  try {
    const doc = await adminDb.collection('settings').doc('platform').get();
    
    const defaultSettings = {
      siteName: 'Quick Trip Now',
      contactEmail: 'support@quicktripnow.com',
      contactPhone: '+91 98765 43210',
      taxRate: 18,
      agentRegistrationEnabled: true,
      maintenanceMode: false,
      globalMaxChildAge: 12,
      heroTitle: 'Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Majestic</span> Sikkim',
      heroSubtitle: 'Experience the world\'s most breathtaking landscapes with curated luxury travel packages and premium services.',
      heroImage: '/images/hero_bg.png'
    };

    return doc.exists ? { ...defaultSettings, ...doc.data() } : defaultSettings;
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return null;
  }
}
