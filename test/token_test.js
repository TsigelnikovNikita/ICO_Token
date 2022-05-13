const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { TASK_COMPILE_REMOVE_OBSOLETE_ARTIFACTS } = require("hardhat/builtin-tasks/task-names");

const tokenJSON = require("../artifacts/contracts/ICO_token.sol/ICO_Token.json");
const testUtils = require("./test-utils");

require("chai").use(require('chai-as-promised'));

describe("Token testing", function () {
    let token
    let ICO
    let owner
    let investor

    beforeEach(async function() {
        [owner, investor, ICO] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("ICO_Token", owner);
        token = await TokenFactory.deploy(
            "TTT_Token",
            "TTT",
            owner.address,
            ICO.address,
            (await ethers.provider.getBlock("latest")).timestamp + testUtils.THIRD_PERIOD
        );
        await token.deployed();
    });

    describe("Token.buyTokens testing", function() {
        it("Token.buy should throw an expection if was called not by ICO", async function() {
            await expect(token.connect(investor).buyTokens(investor.address, 123))
            .to.be.rejectedWith(Error)
            .then((error) => {
                expect(error.message).to.be.contain("Token: caller is not ICO");
            });
        });

        it("Token.buy should throw an expection if was called after end of ICO", async function() {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

            await expect(token.connect(ICO).buyTokens(investor.address, 123))
            .to.be.rejectedWith(Error)
            .then((error) => {
                expect(error.message).to.be.contain("Token: ICO is done");
            });
        });
    });

    describe("Token.whiteList testing", function() {
        it("Token.addToWhiteList should work correctly", async function() {
            await token.addToWhiteList(investor.address);

            expect(await token.whiteList(investor.address)).to.be.eq(true);
        });

        it("Token.removeFromWhiteList should work correctly", async function() {
            await token.addToWhiteList(investor.address);
            expect(await token.whiteList(investor.address)).to.be.eq(true);
        
            await token.removeFromWhiteList(investor.address);
            expect(await token.whiteList(investor.address)).to.be.eq(false);
        
        })

        it("Token.removeFromWhiteList/Token.addToWhiteList should throw an exception when not owner called", async function() {
            await expect(token.connect(investor).addToWhiteList(investor.address))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner'");
                });
        
            await expect(token.connect(investor).removeFromWhiteList(investor.address))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner'");
                });
        });

        it("Token.transfer should work correctly before end of ICO and if investor in the whiteList", async function() {
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10)).mul(42);

            await token.connect(ICO).buyTokens(investor.address, value);
            await token.addToWhiteList(investor.address);

            await token.connect(investor).transfer(owner.address, value);

            expect (await token.balanceOf(investor.address)).to.be.eq(0);
            expect (await token.balanceOf(owner.address)).to.be.eq(value);
        });

    });
});
