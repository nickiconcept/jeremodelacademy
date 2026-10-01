import React, { useEffect } from 'react';
import { Printer, ArrowLeft, Key, ShieldCheck } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function PrintPinCards({ pins, settings, onClose }) {
  useEffect(() => {
    // Inject print styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        #pin-print-area {
          width: 100%;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .pin-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 80mm) !important;
          gap: 15px !important;
          justify-content: center !important;
        }
        .pin-card {
          width: 80mm;
          height: 50mm;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 4mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          page-break-inside: avoid;
          background: #fff;
          box-sizing: border-box;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
      }
      /* Screen preview styles for the cards */
      .pin-card-preview {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        width: 80mm;
        height: 50mm;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 4mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fff;
        box-sizing: border-box;
        color: #0f172a;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '900px', padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
        {/* Non-Printable Header */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: '10px 20px' }}>
              <Printer size={20} /> Print {pins.length} PIN Cards
            </button>
          </div>
        </div>

        <div className="no-print" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px', color: '#334155' }}>
          <strong>Printing Instructions:</strong> For best results, use A4 paper size, select "Portrait" layout, and turn off "Headers and Footers" in your printer settings. The cards are sized at 80mm x 50mm (compact ID Card size) and will fit up to 10 per page.
        </div>

        {/* Printable Area */}
        <div id="pin-print-area">
          <div className="pin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 80mm)', gap: '15px', justifyContent: 'center' }}>
            {pins.map((pin, index) => (
              <div key={index} className="pin-card pin-card-preview">
                
                {/* Card Header (School Name) */}
                <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {settings?.landing_school_name || 'Jere Model Academy'}
                  </h4>
                  <div style={{ fontSize: '0.5rem', color: '#64748b', marginTop: '3px', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {settings?.landing_address || 'Opposite Jabal-Annur Mosque, New Abuja Road, Jere Kagarko LGA, Kaduna State.'}
                  </div>
                </div>

                {/* Card Body (PIN Info & QR) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                  {/* QR Code Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ padding: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <QRCode value={`https://jeremodelacademy.com.ng/?pin=${pin.pin}`} size={36} />
                    </div>
                    <span style={{ fontSize: '0.45rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>SCAN TO VERIFY</span>
                  </div>

                  {/* PIN Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Key size={12} /> Result Checking PIN
                    </div>
                    
                    {/* The PIN Code (No border, exposed) */}
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '1px', fontFamily: 'monospace', color: '#0f172a', margin: '4px 0' }}>
                      {pin.pin}
                    </div>
                  </div>
                </div>

                {/* Card Footer (Instructions) */}
                <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '8px', fontSize: '0.5rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontWeight: '700', color: '#334155', marginBottom: '3px' }}>
                    <ShieldCheck size={10} /> Valid for {settings?.pin_max_checks || 5} checks. Do not share.
                  </div>
                  <div>
                    Visit <strong style={{ color: '#0f172a' }}>https://jeremodelacademy.com.ng</strong> to check your result.
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

