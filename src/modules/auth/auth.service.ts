import { sql } from "../../db";
import type { IUser, TUser } from "../../types";
import bcrypt from "bcrypt";

class AuthService {
  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async createUser(user: TUser & { password: string }) {
    // Here you would typically hash the password and save the user to the database
    const { name, email, role, password } = user;

    const passwordHash = await this.hashPassword(password);

    const newUser = await sql`
            INSERT INTO users (name, email, role, password_hash)
            VALUES (${name}, ${email}, COALESCE(${role}, 'contributor') , ${passwordHash})
            RETURNING id, name, email, role, created_at, updated_at 
        `;
    return newUser[0];
  }

  async validateUser(email: string, password: string): Promise<Omit<IUser, 'password_hash'> | null> {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (!users || users.length === 0) return null;

    const user = users[0] as IUser;

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return null;

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

async getUserById(userId: number): Promise<Omit<IUser, 'password_hash'> | null> {
  
  // 2. Query only the safe columns from the database
  const result = await sql`
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    WHERE id = ${userId}
  `;

  // 3. Handle a missing user early
  if (!result || result.length === 0) {
    return null;
  }

  // 4. Return the clean row (it already matches Omit<IUser, 'password_hash'> perfectly)
  return result[0] as Omit<IUser, 'password_hash'>;
}
}
export default new AuthService();

