import User from '../models/User.js';
import { connected } from '../config/db.js';
import { createUser as createUserRecord, findUserById, findUserByEmail, updateUser as updateUserRecord, deleteUser as deleteUserRecord } from '../data/store.js';

export async function createUser(req, res) {
  try {
    if (!connected) {
      const user = createUserRecord(req.body);
      return res.status(201).json({ message: 'User created', user });
    }
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const user = findUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
}

export async function getUserByEmail(req, res) {
  try {
    const { email } = req.query;
    if (!connected) {
      const user = findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const user = updateUserRecord(id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ message: 'User updated', user });
    }
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!connected) {
      const user = deleteUserRecord(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ message: 'User deleted' });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
}
