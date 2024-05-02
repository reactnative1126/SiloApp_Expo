import { AnchorProvider, Idl, Program, Provider, Wallet, web3 } from "@project-serum/anchor";

import { Connection } from "@solana/web3.js";

export const createProvider = (connection: Connection, wallet: Wallet): AnchorProvider => {
  return new AnchorProvider(connection, wallet, {
    commitment: "processed",
    preflightCommitment: "processed"
  });
};
