import { useState, useRef } from 'react';
import Modal from '../ui/Modal.jsx';
import { IcoUpload, IcoX, IcoImage } from '../ui/Icons.jsx';

export default function PaymentUploadModal({ isOpen, onClose, onUpload, orderId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [method, setMethod] = useState('yape');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Debes seleccionar una foto');
      return;
    }

    setUploading(true);
    try {
      await onUpload({ orderId, method, notes, yapePhoto: selectedFile });
      handleClose();
    } catch (error) {
      console.error('Error al subir pago:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setMethod('yape');
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Subir comprobante">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Método de pago */}
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Forma de pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['yape', 'efectivo', 'tarjeta'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  method === m
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Subir foto */}
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Foto
          </label>

          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-8 text-center cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all"
            >
              <IcoUpload size={32} className="mx-auto mb-2 text-surface-400" />
              <p className="text-sm text-surface-600 dark:text-surface-400 font-medium mb-1">
                Toca para subir foto
              </p>
              <p className="text-xs text-surface-400">JPG, PNG o HEIC</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <IcoX size={16} />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Notas opcionales */}
        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Pagó con billete de S/100..."
            rows={2}
            className="input resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="btn-primary flex-1"
          >
            {uploading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Subiendo...</span>
              </>
            ) : (
              <>
                <IcoUpload size={16} />
                <span>Subir foto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
