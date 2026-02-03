import { useEffect, useRef, useState } from 'react'
import QRCodeLib from 'qrcode'

function QRCode({ url, size = 150 }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      // Generate data URL for download
      QRCodeLib.toDataURL(url, {
        width: size * 2,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(setDataUrl)
    }
  }, [url, size])

  const downloadQR = () => {
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
      <button
        onClick={downloadQR}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
    </div>
  )
}

export default QRCode
