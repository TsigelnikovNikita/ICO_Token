const { ethers } = require("hardhat");

async function main() {
    const ICOContract = await ethers.getContractFactory("ICO");
    const ICO = await ICOContract.deploy();
    await ICO.deployed();

    let chainName
    const network = await ethers.provider.getNetwork();
    switch (network.chainId) {
        case 3:
        case 4:
            chainName = network.name;
    }

    let ICO_address = ICO.address;
    let Token_address = await ICO.TOKEN();
    if (chainName != undefined) {
        ICO_address = `https://${chainName}.etherscan.io/address/${ICO_address}`;
        Token_address = `https://${chainName}.etherscan.io/address/${Token_address}`;
    }

    console.log(`ICO deployed to: ${ICO_address}`);
    console.log(`ICO_Token deployed to: ${Token_address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
