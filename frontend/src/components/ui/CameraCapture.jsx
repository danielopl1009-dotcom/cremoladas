import { useRef, useState } from 'react';
import clsx from 'clsx';
import { IcoCheckCircle, IcoAlertCircle } from './Icons.jsx';

/**
 * Componente reutilizable para captura de foto desde cámara
 * Props:
 *   onCapture  — callback (file) al capturar foto
 *   onRemove   — callback () al eliminar foto
 *   preview    — URL de preview actual (si existe)
 *   label      — texto del título
 *   color      — color del botón (violet, blue, emerald, etc)
 *   required   — boolean, mostrar asterisco rojo
 */
export default function CameraCapture({ onCapture, onRemove, preview, label = 'Foto', color = 'violet', required = false }) {
  const fileRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isRecording, setIsRecording] = useState(false);

  const colorClasses = {
    violet: 'border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20',
    blue: 'border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    emerald: 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      setIsRecording(true);
    } catch (err) {
      console.error('Error accediendo a cámara:', err);
      alert('No se puede acceder a la cámara');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `payment-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  return (
    <div className="space-y-2">
      <label className="section-title block">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Captura"
            className="w-full max-h-48 object-contain rounded-xl border border-surface-200 dark:border-surface-700"
          />
          <button
            type="button"
            onClick={() => {
              onRemove();
              if (fileRef.current) fileRef.current.value = '';
            }}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center
              justify-center text-xs font-bold hover:bg-red-700 transition-colors"
          >
            ×
          </button>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <IcoCheckCircle size={12} /> Foto capturada
          </p>
        </div>
      ) : isRecording ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-black"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
            >
              📸 Capturar
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-900 dark:text-white font-semibold py-2 px-4 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startCamera}
              className={clsx(
                'flex-1 border-2 border-dashed rounded-xl py-4 flex flex-col items-center gap-1 text-sm font-semibold transition-colors',
                colorClasses[color]
              )}
            >
              <span className="text-xl">📷</span>
              Tomar foto
            </button>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className={clsx(
                'flex-1 border-2 border-dashed rounded-xl py-4 flex flex-col items-center gap-1 text-sm font-semibold transition-colors',
                colorClasses[color]
              )}
            >
              <span className="text-xl">📁</span>
              Subir imagen
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
