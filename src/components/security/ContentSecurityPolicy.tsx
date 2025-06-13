
import { useEffect } from 'react';

const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Add security headers via meta tags for additional protection
    const addSecurityMeta = () => {
      // Content Security Policy
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://tjgyskkfhmcabtscsbvh.supabase.co",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://tjgyskkfhmcabtscsbvh.supabase.co wss://tjgyskkfhmcabtscsbvh.supabase.co https://drive.google.com https://docs.google.com",
        "frame-src 'self' https://drive.google.com https://docs.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ');
      
      // Remove existing CSP meta tag if any
      const existingCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCsp) {
        existingCsp.remove();
      }
      
      document.head.appendChild(cspMeta);

      // X-Frame-Options
      const frameMeta = document.createElement('meta');
      frameMeta.httpEquiv = 'X-Frame-Options';
      frameMeta.content = 'SAMEORIGIN';
      document.head.appendChild(frameMeta);

      // X-Content-Type-Options
      const noSniffMeta = document.createElement('meta');
      noSniffMeta.httpEquiv = 'X-Content-Type-Options';
      noSniffMeta.content = 'nosniff';
      document.head.appendChild(noSniffMeta);

      // Referrer Policy
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrerMeta);
    };

    addSecurityMeta();
  }, []);

  return null;
};

export default ContentSecurityPolicy;
