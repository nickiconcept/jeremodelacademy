import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function PwaUpdatePrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showUpdate = () => setIsVisible(true);
    window.addEventListener('jma-pwa-update-ready', showUpdate);
    return () => window.removeEventListener('jma-pwa-update-ready', showUpdate);
  }, []);

  if (!isVisible) return null;

  return (
    <aside className="pwa-update-prompt" role="status" aria-live="polite">
      <span>A new portal version is ready.</span>
      <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
        <RefreshCw size={15} /> Update now
      </button>
      <button type="button" className="pwa-update-prompt__dismiss" onClick={() => setIsVisible(false)} aria-label="Dismiss update prompt">
        <X size={17} />
      </button>
    </aside>
  );
}