# ICO_Token

### Description of smart contract
This smart contract is designed for conducting ICO of token. This project has two smart contract:

#### ICO
Smart contract allows to conducting ICO of token. It has three ICO phases:
- first phase, lasting three days: user can buy 42 TTT (symbol of token) per 1 ETH; 
- second phase, lasting one month: user can buy 21 TTT (symbol of token) per 1 ETH; 
- third phase, lasting two weeks: user can buy 8 TTT (symbol of token) per 1 ETH;

Smart contract has two different ```buy``` function for buying of token:
- ```buy()``` you can send needed amount of ETH by what you want to buy token
- ```buy(uint256 amount)``` you can pass needed amount of token what you want to buy
ICO smart contract creates ICO_Token contract itself. You cannot use buy function after end of ICO

#### ICO_Token
Smart contract based on ERC20. Additionally this smart contract provides functionality for ICO. You may create smart contract directly in the ICO smart contract and just send your address as an owner and ICO address as ICO_address. Smart contrcat also provides "white list" logic. An owner can add to/remove from this list. Participant from whiteList may have additional privileges (for example transfer tokens before ICO ending).

### Stack
The smart contract is written using Solidity for the Ethereum blockchain. 
I used to [hardhat](https://hardhat.org/) as a development environment framework.
Also you can find this project in the ropsten testnetwork:<br>
ICO: https://ropsten.etherscan.io/address/0x814a464649038b392db3f8b83da0dd50e156afe3 <br>
ICO_Toekn: https://ropsten.etherscan.io/address/0x4c227d5ed7b839cdc55f656fbac593afe17d7409
These contracts are verified.

### How to install
- First you need to clone this repo to your machine:<br>
  ```git clone https://github.com/TsigelnikovNikita/ICO_Token.git```
- Then you need to install all requirements from package.json:<br>
   ```npm install```
- After that you need to check that you have an installed hardhat framework:<br>
  ```npx hardhat```
- The last one is just compiling the contract!:<br>
  ```npx hardhat compile ```

### Unit-tests
This contract has a lot of unit-test almost 100% coverage. You can run these using:<br>
```npx hardhat test```

By default [gasReporter](https://github.com/cgewecke/hardhat-gas-reporter) is enabled. You can disable it in the ```hardhat.config.js``` config file.

Also, you may want to check coverage. You can do it using:<br>
```npx hardhat coverage```

This command will print the result in the standard output. You also may check it using coverage/index.html file.

### How to deploy it
If you don't want to use a built-in hardhat network you need to add another one environment variable to the .env
file:<br>
```<YOUR_NETWORK>_NETWORK_URI=<URI_OF_YOUR_NETWORK>```<br>
```SIGNER_PRIVATE_KEY=<YOUR_PRIVATE_KEY>```<br>
where YOUR_NETWORK is a network name (i.e. ganache or rinkeby).

hardhat.config.js have configuration for two networks: __ropsten__ and __rinkeby__. If you want to add some another one
please feel free.

So after that you may deploy contract use scripts/deploy.js script. Run this command:<br>
```npx hardhat run scripts/deploy.js --network <NETWORK_NAME>```<br>
Again: you may don't add --network parameter if you want to use built-in hardhat network.

Last thing that you need to do is to add ICO_CONTRACT_ADDRESS and TOKEN_CONTRACT_ADDRESS form the previous output to the .env file:<br>
```ICO_CONTRACT_ADDRESS=<ICO_CONTRACT_ADDRESS>```<br>
```TOKEN_CONTRACT_ADDRESS=<TOKEN_CONTRACT_ADDRESS>```

### How to use it
__While in proccessing....__

If you execute such command:<br>
```npx hardhat```<br>
You can find two additional tasks in the list:
- balanceOf
- buy

You can find additional information about all of this tasks using:<br>
```npx hardhat <TASK_ANAME> help```

### Proposal and remarks
It's just a study work. If you have any proposals or remarks please feel free and let me know about it.
