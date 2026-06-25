import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import './QRScanner.css';

// html5-qrcode injects its own DOM — we mount it in a div with a stable id
const SCANNER_ELEMENT_ID = 'qr-reader';

export default function QRScanner({ onSuccess, onCancel }) {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | scanning | validating | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      SCANNER_ELEMENT_ID,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        // Show only the camera view, not the file upload option
        supportedScanTypes: [0], // 0 = SCAN_TYPE_CAMERA
      },
      false // verbose
    );

    scanner.render(
      async (decodedText) => {
        // Pause scanning while we validate
        scanner.pause(true);
        setStatus('validating');
        setErrorMsg('');

        try {
          const result = await api.validateQR(decodedText);
          if (result.valid) {
            onSuccess(result); // { valid, unlocksStop, stopType }
          } else {
            setErrorMsg('Este QR no es de la caza. Busca el código correcto.');
            setStatus('error');
            scanner.resume();
          }
        } catch {
          setErrorMsg('Error de conexión. Comprueba tu internet.');
          setStatus('error');
          scanner.resume();
        }
      },
      () => {
        // onError fires constantly while no QR is in frame — ignore
      }
    );

    scannerRef.current = scanner;
    setStatus('scanning');

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onSuccess]);

  return (
    <div className="qr-scanner-wrapper">
      <div className="qr-scanner-header">
        <button className="qr-cancel-btn" onClick={onCancel}>← Volver</button>
        <h2 className="qr-title">Escanea el código QR</h2>
      </div>

      {/* html5-qrcode mounts its UI here */}
      <div id={SCANNER_ELEMENT_ID} className="qr-reader" />

      {status === 'validating' && (
        <p className="qr-status qr-status--validating">Comprobando código...</p>
      )}
      {status === 'error' && (
        <p className="qr-status qr-status--error">{errorMsg}</p>
      )}

      <p className="qr-hint">Apunta la cámara al código QR que encontraste en el lugar</p>
    </div>
  );
}
