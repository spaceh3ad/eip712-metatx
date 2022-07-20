import { ethers, network } from "hardhat";
import { Marketplace, Marketplace__factory } from "../typechain-types";
import { signEIP712MetaTx } from "./utils";

async function main() {
  const signers = await ethers.getSigners();

  const marketplaceFactory: Marketplace__factory = new Marketplace__factory(
    signers[0]
  );
  const marketplace: Marketplace = await marketplaceFactory.deploy();

  const functionSignature = marketplace.interface.encodeFunctionData(
    "setString",
    [12345]
  );

  const metaTx = {
    from: signers[0].address,
    functionSignature: functionSignature,
    nonce: +(await marketplace.getNonce(signers[0].address)),
  };

  const domain = {
    name: "Test",
    version: "1",
    chainId: 31337,
    verifyingContract: marketplace.address,
  };

  console.log(
    `metaTx: ${metaTx.from}, ${metaTx.nonce} ${metaTx.functionSignature}`
  );
  const signedResponse = await signEIP712MetaTx(signers[0], domain, metaTx);

  // const tx = await marketplace
  //   .connect(signers[4])
  //   .executeMetaTransaction(
  //     signers[0].address,
  //     functionSignature,
  //     signedResponse.r,
  //     signedResponse.s,
  //     signedResponse.v,
  //     {
  //       gasLimit: 1000000,
  //     }
  //   );

  // await tx.wait();
  // await marketplace.testString();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
