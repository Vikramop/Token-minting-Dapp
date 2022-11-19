const { ethers } = require('hardhat');
require('dotenv').config({ path: '.env' });

async function main() {
  const cryptoDevsTokenContract = await ethers.getContractFactory(
    'CryptoDevToken'
  );

  const deploycryptoDevsTokenContract = await cryptoDevsTokenContract.deploy(
    '0x9608d0245253d7d9b2b49609D8e4AAa0eF533cbC'
  );

  console.log(
    'CryptoDev Token COntract Address:',
    deploycryptoDevsTokenContract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
