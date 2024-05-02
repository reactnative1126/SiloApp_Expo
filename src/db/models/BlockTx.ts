import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { BlockTxRepository } from "../repositories/blocktx.repository";
import { TX_STATUS } from "../db.types";

@Entity({ tableName: "blocktx", customRepository: () => BlockTxRepository })
export class BlockTx {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, index: true })
  txid: string;

  @Property({ nullable: false, index: true })
  timestamp: Date;

  @Property({ index: true, nullable: false })
  slot: number;

  @Property({ index: true, nullable: true })
  signer: string;

  // @OneToMany(() => Ix, (ix) => ix.tx, { orphanRemoval: true, cascade: [Cascade.ALL] })
  // ixes = new Collection<Ix>(this);

  @Property({ index: true, nullable: false, default: TX_STATUS.SYNCED })
  status: string;

  @Property({ nullable: true, type: "text" })
  error: string;

  constructor(txId: string, timestamp: Date, slot: number) {
    this.txid = txId;
    this.timestamp = timestamp;
    this.slot = slot;
  }

}
