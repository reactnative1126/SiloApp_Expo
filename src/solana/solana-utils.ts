import {ParsedMessageAccount, ParsedTransactionWithMeta, PublicKey} from '@solana/web3.js';

export function findSigner(tx: ParsedTransactionWithMeta): PublicKey | null {
  const accountKeys = tx.transaction.message.accountKeys;
  const signer = accountKeys.find((accountKey: ParsedMessageAccount) => accountKey.signer);
  // i mean... should always be able to find the signer no?
  return signer ? signer.pubkey : null;
}
