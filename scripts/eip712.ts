import { ethers, network } from "hardhat";
import { recoverTypedSignature_v4 } from "eth-sig-util";
import { Marketplace, Marketplace__factory } from "../typechain-types";

let domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

let domainData = {
  name: "My Dapp",
  version: "1",
  chainId: "31337",
};

let metaTransaction = {
  nonce: 0,
  from: "",
  functionSignature: "",
};

let eip712TypedData = {
  types: {
    EIP712Domain: domainType,
    metaTx: metaTransactionType,
  },
  domain: domainData,
  primaryType: "metaTx",
  message: metaTransaction,
};

async function main() {
  const signers = await ethers.getSigners();

  const marketplaceFactory: Marketplace__factory = new Marketplace__factory(
    signers[0]
  );
  const marketplace: Marketplace = await marketplaceFactory.deploy();

  const nonce = await marketplace.getNonce(signers[0].address);
  metaTransaction.nonce = +nonce;

  // let ABI = ["function setQuote(string)"];
  // let iface = new ethers.utils.Interface(ABI);
  const functionSignature = marketplace.interface.encodeFunctionData(
    "setString",
    [12345]
  );

  console.log(functionSignature);

  metaTransaction.functionSignature = functionSignature;
  metaTransaction.from = marketplace.address;

  let data = JSON.stringify(eip712TypedData);

  const signature = await network.provider.send("eth_signTypedData_v4", [
    signers[0].address,
    data,
  ]);

  const recovered = recoverTypedSignature_v4({
    data: JSON.parse(data),
    sig: signature,
  });
  console.log(`Recovered: ${recovered}`);

  const sig = signature.substring(2);
  const r = "0x" + sig.substring(0, 64);
  const s = "0x" + sig.substring(64, 128);
  const v = parseInt(sig.substring(128, 130), 16);

  console.log(signature);
  console.log(sig, r, s, v);

  const tx = await marketplace
    .connect(signers[4])
    .executeMetaTransaction(signers[0].address, functionSignature, r, s, v, {
      gasLimit: 1000000,
    });

  console.log(tx.data);
  // await tx.wait();
  // await marketplace.testString();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
