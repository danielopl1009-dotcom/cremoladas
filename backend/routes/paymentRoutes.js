import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { confirmPayment, getPaymentByOrder, getDailyPayments } from '../controllers/paymentController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Directorio para guardar fotos de Yape
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'yape');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `yape_order${req.params.orderId}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

const router = express.Router();
router.use(authenticateToken);

// Confirmar pago (caja, administrador, servidor con permiso)
router.post(
  '/orders/:orderId/pay',
  authorizeRoles('caja', 'administrador', 'servidor'),
  upload.single('yapePhoto'),
  confirmPayment
);

// Ver pago de un pedido (todos)
router.get('/orders/:orderId/payment', getPaymentByOrder);

// Ver pagos del día (caja y admin)
router.get('/payments/daily', authorizeRoles('caja', 'administrador'), getDailyPayments);

export default router;
