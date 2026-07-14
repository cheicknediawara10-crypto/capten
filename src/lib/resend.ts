import { Resend } from 'resend';

// Initialise l'instance Resend avec la clé API configurée
export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
