import { User } from '../models/User';

export class UserService {
  static async createUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  static async getUserById(id: string) {
    return await User.findById(id);
  }

  static async updateUser(id: string, userData: any) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  static async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  static async getAllUsers() {
    return await User.find({});
  }
}
