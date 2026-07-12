import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onCancel: () => void
}

const SCANNER_ELEMENT_ID = 'barcode-scanner'

export function BarcodeScanner({ onDetected, onCancel }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          void scanner.stop().then(() => onDetected(decodedText))
        },
        () => {
          // Scan-Fehlversuch pro Frame — kein eigener Fehler-State nötig
        },
      )
      .catch(() => {
        onCancel()
      })

    return () => {
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop()
      }
    }
  }, [onDetected, onCancel])

  return (
    <div>
      <div id={SCANNER_ELEMENT_ID} />
      <button onClick={onCancel}>Abbrechen</button>
    </div>
  )
}
