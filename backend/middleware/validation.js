// Validación de creación de pedido
export const validateCreateOrder = (req, res, next) => {
  const { locationType, locationDetails, items, total } = req.body;

  // Validar tipo de ubicación
  const validLocationTypes = ['vehiculo', 'frente_local', 'restaurante', 'botica', 'otro'];
  if (!locationType || !validLocationTypes.includes(locationType)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de ubicación inválido'
    });
  }

  // Validar detalles de ubicación según el tipo
  if (!locationDetails || typeof locationDetails !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Detalles de ubicación requeridos'
    });
  }

  // Validaciones específicas por tipo de ubicación
  if (locationType === 'vehiculo') {
    if (!locationDetails.placa || locationDetails.placa.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Placa del vehículo requerida'
      });
    }
    if (!locationDetails.color || locationDetails.color.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Color del vehículo requerido'
      });
    }
  }

  if (locationType === 'restaurante' && (!locationDetails.nombre || locationDetails.nombre.trim() === '')) {
    return res.status(400).json({
      success: false,
      message: 'Nombre del restaurante requerido'
    });
  }

  if (locationType === 'botica' && (!locationDetails.nombre || locationDetails.nombre.trim() === '')) {
    return res.status(400).json({
      success: false,
      message: 'Nombre de la botica requerido'
    });
  }

  // Validar items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debe incluir al menos un producto'
    });
  }

  // Validar cada item
  for (const item of items) {
    if (!item.productId || !item.size || !item.quantity || !item.unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos en los productos'
      });
    }

    if (item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    if (item.unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }
  }

  // Validar total
  if (!total || total <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Total inválido'
    });
  }

  next();
};

// Validación de actualización de estado
export const validateUpdateOrderStatus = (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Estado inválido'
    });
  }

  next();
};

// Validación de creación de producto
export const validateCreateProduct = (req, res, next) => {
  const { name, sizes } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Nombre del producto requerido'
    });
  }

  if (!sizes || typeof sizes !== 'object' || Object.keys(sizes).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debe incluir al menos un tamaño con precio'
    });
  }

  // Validar que todos los precios sean números positivos
  for (const [size, price] of Object.entries(sizes)) {
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: `Precio inválido para tamaño ${size}`
      });
    }
  }

  next();
};

// Validación de registro de usuario
export const validateRegisterUser = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Nombre requerido'
    });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido'
    });
  }

  // Validar contraseña
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  // Validar rol
  const validRoles = ['administrador', 'jalador', 'servidor', 'caja'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Rol inválido'
    });
  }

  next();
};

export default {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCreateProduct,
  validateRegisterUser
};
