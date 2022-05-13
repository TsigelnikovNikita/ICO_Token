const { FixedNumber } = require("ethers");

require("dotenv").config();

task("balanceOf", "Allows get current amount of TTT tokens on the balance of the address")
    .addParam("address", "Should be an address in the valid format (send this as string in the quote)")
    .setAction(async (taskArgs) => {
        const TokenFactory = await ethers.getContractFactory("ICO_Token");
        const Token = await TokenFactory.attach(process.env.TOKEN_CONTRACT_ADDRESS);

        await Token.balanceOf(taskArgs.address)
            .then(async function(data) {
                balance = FixedNumber.fromValue(data, await Token.decimals());
                console.log("Your balance: " + balance + " TTT");
            }, (error) => {
                console.log(error.message)
            });
    });
