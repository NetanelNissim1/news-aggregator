'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalLogger() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to send logs to our API
    const sendLog = async (data: { type: string; message: string; level: string; stack?: string; path: string }) => {
      try {
        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          // keepalive ensures the request finishes even if the page unloads
          keepalive: true 
        });
      } catch (e) {
        console.error('Failed to send log to server:', e);
      }
    };

    // 1. Click Listener (Info)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find closest button or anchor
      const clickableElement = target.closest('button, a');
      
      if (clickableElement) {
        const tagName = clickableElement.tagName.toLowerCase();
        let label = clickableElement.textContent?.trim() || clickableElement.getAttribute('aria-label') || 'No label';
        
        // Truncate label if it's too long (e.g. clicking on a whole article card)
        if (label.length > 100) {
          label = label.substring(0, 100) + '...';
        }

        const href = clickableElement.getAttribute('href') ? ` (href: ${clickableElement.getAttribute('href')})` : '';

        sendLog({
          type: 'CLICK',
          level: 'info',
          message: `User clicked on ${tagName} element: "${label}"${href}`,
          path: window.location.pathname
        });
      }
    };

    // 2. Unhandled Exception Listener (Error)
    const handleError = (e: ErrorEvent) => {
      sendLog({
        type: 'EXCEPTION',
        level: 'error',
        message: e.message || 'Unknown Error',
        stack: e.error?.stack || '',
        path: window.location.pathname
      });
    };

    // 3. Unhandled Promise Rejection (Warning or Error)
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      sendLog({
        type: 'PROMISE_REJECTION',
        level: 'warning',
        message: typeof reason === 'string' ? reason : (reason?.message || 'Unhandled Promise Rejection'),
        stack: reason?.stack || '',
        path: window.location.pathname
      });
    };

    // Attach listeners
    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [pathname]);

  // This component doesn't render any UI
  return null;
}
