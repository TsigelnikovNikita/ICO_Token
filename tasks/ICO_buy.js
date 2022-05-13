require("dotenv").config();

task("buyToken", "Allows buy token while ICO. You may pass amount of TTT tokens what you want to buy or " + 
                    "amount of ETH tokens what you want to spend")
    .addOptionalParam("eth", "amount of ETH tokens what you want to spend for buying TTT token")
    .addOptionalParam("ttt", "amount of TTT tokens what you want to buy")
    .setAction(async (taskArgs) => {
        if (taskArgs.eth == undefined && taskArgs.ttt == undefined) {
            throw ("You need to pass at least ETH or TTT amount");
        } else if (taskArgs.eth != undefined && taskArgs.ttt != undefined) {
            throw ("You need to pass only ETH or only TTT amount");
        }
        const ICOFactory = await ethers.getContractFactory("ICO");
        const ICO = await ICOFactory.attach(process.env.ICO_CONTRACT_ADDRESS);

        if (taskArgs.eth != undefined) {
            const lastBlockTImestamp = (await ethers.provider.getBlock("latest")).timestamp;

            const value = ethers.utils.parseEther(taskArgs.eth);
            await ICO['buy()']({value: value})
                .then((tx) => {
                    console.log("Your thransaction was successfully accepted!\n" +
                        "Transaction hash: " + tx.hash + "\n" +
                        "Block hash: " + tx.blockHash);
                }, (error) => {
                    console.log(error.message)
                });
        }
        else if (taskArgs.ttt != undefined) {
            let currentExchangeRate;
            const lastBlockTImestamp = (await ethers.provider.getBlock("latest")).timestamp;
            const ICO_startTime = await ICO.ICO_START_TIME();

            if (lastBlockTImestamp < ICO_startTime + await ICO.FIRST_PERIOD()) {
                currentExchangeRate = await ICO.TOKENS_PER_ONE_ETH_FIRST_PERIOD();
            } else if (lastBlockTImestamp < ICO_startTime + await ICO.SECOND_PERIOD()) {
                currentExchangeRate = await ICO.TOKENS_PER_ONE_ETH_SECOND_PERIOD();
            } else {
                currentExchangeRate = await ICO.TOKENS_PER_ONE_ETH_THIRD_PERIOD();
            }

            const amount = ethers.utils.parseEther(taskArgs.ttt);
            const value = amount.div(currentExchangeRate);

            await ICO['buy(uint256)'](amount, {value: value})
                .then((tx) => {
                    console.log("Your thransaction was successfully accepted!\n" +
                        "Transaction hash: " + tx.hash + "\n" +
                        "Block hash: " + tx.blockHash);
                }, (error) => {
                    console.log(error.message)
                });
        }
    });
