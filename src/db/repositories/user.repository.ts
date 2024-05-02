import { EntityRepository } from "@mikro-orm/postgresql";
import { User } from "../models/User";
import { USER_ROLE } from "../db.types";

export class UserRepository extends EntityRepository<User> {
  async findById(userId: number) {
    return await this.findOne({ id: userId }, { populate: ["accounts.token", "currency"] });
  }

  async findByRebeltag(rebeltag: string) {
    rebeltag = rebeltag.trim().toLowerCase();
    rebeltag = rebeltag.startsWith("@") ? rebeltag.substring(1) : rebeltag;
    // remove the '@' if it's there
    return await this.findOne({ username: rebeltag }, { populate: ["accounts.token", "currency"] });
  }

  async getById(userId: number) {
    return await this.findOneOrFail({ id: userId }, { populate: ["accounts.token", "contacts", "currency"] });
  }

  async getByIdLite(userId: number) {
    return await this.findOneOrFail({ id: userId });
  }

  async findByWallet(walletAddress: string) {
    return await this.findOne({ walletAddress });
  }

  async getSystemUser(failOnMissing: boolean = true): Promise<User> {
    if (failOnMissing) {
      return await this.findOneOrFail({ role: USER_ROLE.SYSTEM }, { populate: ["accounts.token", "currency"] });
    } else {
      return await this.findOne({ role: USER_ROLE.SYSTEM }, { populate: ["accounts.token", "currency"] });
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email }, { populate: ["accounts.token"] });
  }

  async searchByUsername(username: string): Promise<User[]> {
    username = username.toLowerCase().trim();
    return await this.find(
      {
        username: { $ilike: `%${username}%` },
        role: { $ne: USER_ROLE.SYSTEM }
      }
    );
  }

  async searchByName(name: string): Promise<User[]> {
    return await this.find(
      {
        nameNormal: { $ilike: `%${name}%` },
        role: { $ne: USER_ROLE.SYSTEM }
      }
    );
  }

  async findByAuthToken(authToken: string) {
    return await this.findOne({ authToken }, { populate: ["accounts.token"] });
  }

  async findByEmailConfirmation(userId: number, emailConfirmationCode: string) {
    return await this.findOne({ id: userId, emailConfirmationCode }, { populate: ["accounts.token", "currency"] });
  }

  async findByPinForUser(userId: number, pin: string) {
    return await this.findOne({ id: userId, pin }, { populate: ["accounts.token", "currency"] });
  }
}
