import api from "./api";
import type { User } from "@/types/auth.types";

export interface UpdateUserDto {
  name?: string;
  city?: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  async getProfile(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  }

  async updateProfile(data: UpdateUserDto): Promise<User> {
    await api.put("/users/me", data);
    const response = await api.get<User>("/users/me");
    return response.data;
  }

  async updatePassword(data: UpdatePasswordDto): Promise<void> {
    await api.put("/users/me/password", data);
  }

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users");
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

export default new UserService();
