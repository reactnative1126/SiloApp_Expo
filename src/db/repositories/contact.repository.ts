import { EntityRepository } from "@mikro-orm/postgresql";
import { Contact } from "../models/Contact";

export class ContactRepository extends EntityRepository<Contact> {

  async findByWalletForUser(userId: number, walletAddress: string): Promise<Contact> {
    return await this.findOne({ user: { id: userId }, solanaAddress: { address: walletAddress }}, { populate: ['rebelfiContact', 'solanaAddress'] });
  }

  async findByEmailForUser(userId: number, email: string): Promise<Contact> {
    return await this.findOne({ user: { id: userId }, email}, { populate: ['rebelfiContact', 'solanaAddress'] });
  }

  async findByNameForUser(userId: number, name: string): Promise<Contact[]> {
    return await this.find({ user: { id: userId }, nameNormal: { $ilike: `%${name}%` }}, { populate: ['rebelfiContact', 'solanaAddress'] });
  }

  async findByContactIdForUser(userId: number, contactId: number): Promise<Contact> {
    return this.findOne({ user: { id: userId }, id: contactId }, { populate: ['solanaAddress', 'rebelfiContact'] });
  }

  async findByUserIdForUser(userId: number, rebelfiId: number): Promise<Contact> {
    return this.findOne({ user: { id: userId }, rebelfiContact: { id: rebelfiId }}, { populate: ['solanaAddress', 'rebelfiContact'] });
  }
}
