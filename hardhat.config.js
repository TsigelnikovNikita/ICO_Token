require("@nomiclabs/hardhat-waffle");
require('hardhat-dependency-compiler');
require('solidity-coverage');
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

require('./tasks/ICO_buy');
require('./tasks/Token_balanceOf');

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  },
  networks: {
    rinkeby: {
      url: `${process.env.RINKEBY_NETWORK_URI}`,
      accounts: [`${process.env.SIGNER_PRIVATE_KEY}`]
    }
  },
  dependencyCompiler: {
    paths: [
      "@openzeppelin/contracts/token/ERC20/ERC20.sol",
      "@openzeppelin/contracts/access/Ownable.sol",
    ],
  },
};
