import { Resend } from 'resend';

// Initialise l'instance Resend avec la clé API configurée
const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;
