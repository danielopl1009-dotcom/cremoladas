// Middleware global de manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error de base de datos
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'Error de integridad de datos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Error por defecto
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware para rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export default { errorHandler, notFound };
