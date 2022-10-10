const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const AllowanceWallet = await hre.ethers.getContractFactory("AllowanceTokenWallet");
  const allowanceWallet = await AllowanceWallet.deploy();

  const ForkToken = await hre.ethers.getContractFactory("ForkToken1");
  const forktoken = await ForkToken.deploy();
  await allowanceWallet.deployed();
  await forktoken.deployed();

  await forktoken.mint(allowanceWallet.address, ethers.utils.parseUnits("10000"));
  await allowanceWallet.addAllowance("0xe01F981D984e2Fb7B29b9826a5B64F07f60a9F94",ethers.utils.parseUnits("100"),2);

  console.log(`Deployed to ${allowanceWallet.address} Forktoken: ${forktoken.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});