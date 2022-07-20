import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { recoverTypedSignature_v4 } from "eth-sig-util";

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface MetaTx {
  nonce: number;
  from: string;
  functionSignature: string;
}

export interface SignedResponse {
  signature: string;
  r: string;
  s: string;
  v: number;
}

const EIP712DomainTypes = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const MetaTxTypes = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

export async function signEIP712MetaTx(
  signer: SignerWithAddress,
  domain: EIP712Domain,
  metaTx: MetaTx
): Promise<SignedResponse> {
  const dataToSign = {
    types: {
      MetaTransaction: MetaTxTypes,
    },
    domain,
    primaryType: "MetaTransaction",
    message: metaTx,
  };

  //   const tx_signature = await network.provider.send("eth_signTypedData_v4", [
  //     signer.address,
  //     dataToSign,
  //   ]);

  const sign = await signer._signTypedData(domain, dataToSign.types, metaTx);
  const signature = sign.substring(2);

  //   const recovered = recoverTypedSignature_v4({
  //     data: JSON.parse(JSON.stringify(dataToSign)),
  //     sig: signature,
  //   });

  //   console.log(`Recovered: ${recovered}`);

  return {
    signature,
    r: "0x" + signature.substring(0, 64),
    s: "0x" + signature.substring(64, 128),
    v: parseInt(signature.substring(128, 130), 16),
  };
}
