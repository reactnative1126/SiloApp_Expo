import { ReadApiAsset } from "@metaplex-foundation/js";

export interface AgentTaskRequest {
  requestAssetId: string;
  orderId: number;
  taskId: number;
  type: string;
  params: any;
  responseHandler: string;
}

export interface AgentTaskResponse {
  assetId: string;
  requestAssetId: string;
  orderId: number;
  type: string;
  json: object;
  compressedAsset: ReadApiAsset;
}
