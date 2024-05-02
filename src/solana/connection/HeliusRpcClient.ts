import { PublicKey, Transaction } from "@solana/web3.js";
import { HeliusConnectionWrapper } from "./HeliusConnectionWrapper";
import { ReadApiAsset, ReadApiAssetList, WalletAdapter } from "@metaplex-foundation/js";
import { createTransferAssetTx } from "./compression-utils";
import { StandardRpcClient } from "./StandardRpcClient";
import { Logger } from "@nestjs/common";

export class HeliusRpcClient extends StandardRpcClient {
  private readonly logger = new Logger(HeliusRpcClient.name);
  private apiKey: string;
  private heliusConnection: HeliusConnectionWrapper;

  constructor(connection: HeliusConnectionWrapper) {
    super(connection);
    this.heliusConnection = connection;
    this.apiKey = connection.rpcEndpoint.substring(connection.rpcEndpoint.indexOf("?"));
  }

  isVerified(mintInfo) {
    if (mintInfo.onChainMetadata.metadata?.collection) {
      return mintInfo.onChainMetadata.metadata.collection.verified;
    } else {
      return false;
    }
  }

  getCollectionId(asset: ReadApiAsset) {
    if (asset.grouping.length > 0) {
      for (let i = 0; i < asset.grouping.length; i++) {
        if (asset.grouping[i].group_key === "collection") {
          return asset.grouping[i].group_value;
        }
      }
    }
    return null;
  }

  async transferCompressed(
    walletAdapter: WalletAdapter,
    assetId: PublicKey,
    fromAddress: PublicKey,
    toAddress: PublicKey
  ): Promise<Transaction> {
    console.log("transferring compressed nft. assetId: ", assetId);

    /* metaplex's way doesn't work for some reason (see the compressed-nfts project, it's the same fuckin code)
    const metaplex = Metaplex.make(this.connection).use(walletAdapterIdentity(walletAdapter));
    const asset = await this.heliusConnection.getAsset(assetId);
    const nft = toMetadataFromReadApiAsset(asset);
    console.log("metaplex asset: ", nft);
    const txBuilder = metaplex.nfts().builders().transfer({
      nftOrSft: nft,
      fromOwner: walletAdapter.publicKey,
      toOwner: toAddress,
    });
     */

    return createTransferAssetTx(this.heliusConnection, fromAddress, toAddress, assetId.toBase58());
  }

}
