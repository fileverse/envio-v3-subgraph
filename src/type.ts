export type OnChainFile = {
  appFileId: string;
  fileType: number;
  metadataIPFSHash: string;
  contentIPFSHash: string;
  gateIPFSHash: string;
  version: bigint;
  owner: string;
};

export type OnChainAppInfo = {
  app: string;
  index: bigint;
  tokenId: bigint;
  owner: string;
};
