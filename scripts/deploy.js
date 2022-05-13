const hre = require("hardhat");

async function main() {
    const ICOContract = await hre.ethers.getContractFactory("ICO");
    const ICO = await ICOContract.deploy();

    await ICO.deployed();

    console.log("ICO deployed to:       ", ICO.address);
    console.log("ICO_Token deployed to: ", await ICO.TOKEN());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
