import User from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const u = await User.create(req.body);
    res.status(201).json({ success: true, data: u });
  } catch (e) {
    if (e.message?.includes('unique') || e.message?.includes('UNIQUE'))
      return res.status(409).json({ success: false, message: 'Email ya registrado' });
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getUsers = async (req, res) => {
  const list = User.getAll({ role: req.query.role, activeOnly: req.query.activeOnly === 'true' });
  res.json({ success: true, data: list });
};

export const getUserById = async (req, res) => {
  const u = User.getById(req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'No encontrado' });
  res.json({ success: true, data: u });
};

export const updateUser = async (req, res) => {
  try {
    const u = await User.update(req.params.id, req.body);
    res.json({ success: true, data: u });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const deactivateUser = async (req, res) => {
  if (parseInt(req.params.id) === req.user.userId)
    return res.status(400).json({ success: false, message: 'No puedes desactivarte a ti mismo' });
  const u = User.deactivate(req.params.id);
  res.json({ success: true, data: u });
};

export const activateUser = async (req, res) => {
  const u = User.activate(req.params.id);
  res.json({ success: true, data: u });
};

export default { createUser, getUsers, getUserById, updateUser, deactivateUser, activateUser };
