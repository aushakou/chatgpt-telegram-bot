import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user = await UserService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user' });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  }
}
