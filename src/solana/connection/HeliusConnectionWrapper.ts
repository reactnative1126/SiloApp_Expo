import { Commitment, Connection, ConnectionConfig, Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";

import type { Metadata, Mint, NftOriginalEdition, SplTokenCurrency } from "@metaplex-foundation/js";
// import from the `@metaplex-foundation/js`
import {
  amount,
  GetAssetProofRpcInput,
  GetAssetProofRpcResponse,
  GetAssetRpcInput,
  GetAssetsByGroupRpcInput,
  GetAssetsByOwnerRpcInput,
  MetaplexError,
  Pda,
  ReadApiAsset,
  ReadApiAssetList,
  toBigNumber
} from "@metaplex-foundation/js";

import axios from "axios";
import { createTransferAssetTx } from "./compression-utils";

type JsonRpcParams<ReadApiMethodParams> = {
  method: string;
  id?: string;
  params: ReadApiMethodParams;
};

type JsonRpcOutput<ReadApiJsonOutput> = {
  result: ReadApiJsonOutput;
};

/** @group Errors */
export class ReadApiError extends MetaplexError {
  readonly name: string = "ReadApiError";

  constructor(message: string, cause?: Error) {
    super(message, "rpc", undefined, cause);
  }
}

/**
 * Convert a ReadApi asset (e.g. compressed NFT) into an NftEdition
 */
export const toNftEditionFromReadApiAsset = (input: ReadApiAsset): NftOriginalEdition => {
  return {
    model: "nftEdition",
    isOriginal: true,
    address: new PublicKey(input.id),
    supply: toBigNumber(input.supply.print_current_supply),
    maxSupply: toBigNumber(input.supply.print_max_supply)
  };
};

/**
 * Convert a ReadApi asset (e.g. compressed NFT) into an NFT mint
 */
export const toMintFromReadApiAsset = (input: ReadApiAsset): Mint => {
  const currency: SplTokenCurrency = {
    symbol: "Token",
    decimals: 0,
    namespace: "spl-token"
  };

  return {
    model: "mint",
    address: new PublicKey(input.id),
    mintAuthorityAddress: new PublicKey(input.id),
    freezeAuthorityAddress: new PublicKey(input.id),
    decimals: 0,
    supply: amount(1, currency),
    isWrappedSol: false,
    currency
  };
};

const HEADERS = {
  headers: {
    "Content-Type": "application/json"
  }
};

/**
 * Convert a ReadApi asset's data into standard Metaplex `Metadata`
 */
export const toMetadataFromReadApiAsset = (input: ReadApiAsset): Metadata => {
  const updateAuthority = input.authorities?.find((authority) => authority.scopes.includes("full"));

  const collection = input.grouping.find(({ group_key }) => group_key === "collection");

  return {
    model: "metadata",
    /**
     * We technically don't have a metadata address anymore.
     * So we are using the asset's id as the address
     */
    address: Pda.find(BUBBLEGUM_PROGRAM_ID, [
      Buffer.from("asset", "utf-8"),
      new PublicKey(input.compression.tree).toBuffer(),
      Uint8Array.from(new BN(input.compression.leaf_id).toArray("le", 8))
    ]),
    mintAddress: new PublicKey(input.id),
    updateAuthorityAddress: new PublicKey(updateAuthority!.address),

    name: input.content.metadata?.name ?? "",
    symbol: input.content.metadata?.symbol ?? "",

    json: input.content.metadata,
    jsonLoaded: true,
    uri: input.content.json_uri,
    isMutable: input.mutable,

    primarySaleHappened: input.royalty.primary_sale_happened,
    sellerFeeBasisPoints: input.royalty.basis_points,
    creators: input.creators,

    editionNonce: input.supply.edition_nonce,
    tokenStandard: TokenStandard.NonFungible,

    collection: collection ? { address: new PublicKey(collection.group_value), verified: false } : null,

    // Current regular `Metadata` does not currently have a `compression` value
    // @ts-ignore
    compression: input.compression,

    // Read API doesn't return this info, yet
    collectionDetails: null,
    // Read API doesn't return this info, yet
    uses: null,
    // Read API doesn't return this info, yet
    programmableConfig: null
  };
};

/**
 * Wrapper class to add additional methods on top the standard Connection from `@solana/web3.js`
 * Specifically, adding the RPC methods used by the Digital Asset Standards (DAS) ReadApi
 * for state compression and compressed NFTs
 */
export class HeliusConnectionWrapper extends Connection {
  constructor(endpoint: string, commitmentOrConfig?: Commitment | ConnectionConfig) {
    super(endpoint, commitmentOrConfig);
  }

  async transferCompressed(sender: Keypair, assetId: PublicKey, fromAddress: PublicKey, toAddress: PublicKey): Promise<string> {
    const tx = await createTransferAssetTx(this, fromAddress, toAddress, assetId.toBase58());
    const txid = await this.sendTransaction(tx, [sender]);
    console.log(`transferred assetId: ${assetId.toBase58()} to ${toAddress.toBase58()}, txid: ${txid}`);
    return txid;
  }

  // It is a PDA with the following seeds: ["asset", tree, leafIndex]
  async getAsset(assetId: string): Promise<ReadApiAsset> {
    const { result: asset } = await this.callReadApi<GetAssetRpcInput, ReadApiAsset>({
      method: "getAsset",
      params: {
        id: assetId
      }
    });

    // if (!asset) throw new ReadApiError('No asset returned');
    return asset;
  }

  // Asset id can be calculated via Bubblegum#getLeafAssetId

  // It is a PDA with the following seeds: ["asset", tree, leafIndex]
  async getAssetProof(assetId: string): Promise<GetAssetProofRpcResponse> {
    const { result: proof } = await this.callReadApi<GetAssetProofRpcInput, GetAssetProofRpcResponse>({
      method: "getAssetProof",
      params: {
        id: assetId
      }
    });

    if (!proof) throw new ReadApiError("No asset proof returned");

    return proof;
  }

  // Asset id can be calculated via Bubblegum#getLeafAssetId

  //
  async getAssetsByGroup({
                           groupKey,
                           groupValue,
                           page,
                           limit,
                           sortBy,
                           before,
                           after
                         }: GetAssetsByGroupRpcInput): Promise<ReadApiAssetList> {
    // `page` cannot be supplied with `before` or `after`
    if (typeof page == "number" && (before || after))
      throw new ReadApiError("Pagination Error. Only one pagination parameter supported per query.");

    // a pagination method MUST be selected, but we are defaulting to using `page=0`

    const { result } = await this.callReadApi<GetAssetsByGroupRpcInput, ReadApiAssetList>({
      method: "getAssetsByGroup",
      params: {
        groupKey,
        groupValue,
        after: after ?? null,
        before: before ?? null,
        limit: limit ?? null,
        page: page ?? 1,
        sortBy: sortBy ?? null
      }
    });

    if (!result) throw new ReadApiError("No results returned");

    return result;
  }

  //
  async getAssetsByOwner({
                           ownerAddress,
                           page,
                           limit,
                           sortBy,
                           before,
                           after
                         }: GetAssetsByOwnerRpcInput): Promise<ReadApiAssetList> {
    // `page` cannot be supplied with `before` or `after`
    if (typeof page == "number" && (before || after))
      throw new ReadApiError("Pagination Error. Only one pagination parameter supported per query.");

    // a pagination method MUST be selected, but we are defaulting to using `page=0`

    const { result } = await this.callReadApi<GetAssetsByOwnerRpcInput, ReadApiAssetList>({
      method: "getAssetsByOwner",
      params: {
        ownerAddress,
        after: after ?? null,
        before: before ?? null,
        limit: limit ?? null,
        page: page ?? 1,
        sortBy: sortBy ?? null
      }
    });

    if (!result) throw new ReadApiError("No results returned");
    return result;
  }

  private callReadApi = async <ReadApiMethodParams, ReadApiJsonOutput>(
    jsonRpcParams: JsonRpcParams<ReadApiMethodParams>
  ): Promise<JsonRpcOutput<ReadApiJsonOutput>> => {
    let resp = await axios.post(
      this.rpcEndpoint,
      {
        jsonrpc: "2.0",
        method: jsonRpcParams.method,
        id: jsonRpcParams.id ?? "rpd-op-123",
        params: jsonRpcParams.params
      },
      HEADERS
    );

    if (resp.status == 200) {
      // will return an object w/result field which is a "page" object with total, limit, page, items
      return await resp.data;
    } else {
      console.log("problem fetching assets. status: " + resp.status + ": " + resp);
      throw new Error("problem fetching assets. status: " + resp.status);
    }
  };
}
