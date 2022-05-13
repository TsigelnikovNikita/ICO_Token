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
            const addToWhiteListTx = await token.addToWhiteList(investor.address);

            await expect(addToWhiteListTx)
                .to.emit(token, 'addedToWhiteList')
                .withArgs(investor.address);

            expect(await token.whiteList(investor.address)).to.be.eq(true);
        });

        it("Token.removeFromWhiteList should work correctly", async function() {
            await token.addToWhiteList(investor.address);
            expect(await token.whiteList(investor.address)).to.be.eq(true);
        
            const removeFromWhiteListTx = await token.removeFromWhiteList(investor.address);

            await expect(removeFromWhiteListTx)
                .to.emit(token, 'removedFromWhiteList')
                .withArgs(investor.address);

            expect(await token.whiteList(investor.address)).to.be.eq(false);        
        });

        it("Token.removeFromWhiteList/Token.addToWhiteList should throw an exception when not owner called", async function() {
            await expect(token.connect(investor).addToWhiteList(investor.address))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner");
                });
        
            await expect(token.connect(investor).removeFromWhiteList(investor.address))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner");
                });
        });

        it("Token.removeFromWhiteList/Token.addToWhiteList should throw an exception if participant address is zero", async function() {
            await expect(token.addToWhiteList(ethers.constants.AddressZero))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Token: Participant address is the zero address");
                });

            await expect(token.removeFromWhiteList(ethers.constants.AddressZero))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Token: Participant address is the zero address");
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

    describe("Token.ERC20 functions testing", function() {
        let value

        beforeEach(async function() {
            value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10)).mul(42);

            await token.connect(ICO).buyTokens(investor.address, value);
        });

        it("Token.transfer should work only after end of ICO or if investor is in the whiteList", async function() {
            /*
                We cannot call transfer before end of ICO and if we aren't in the whiteList
            */
            await expect(token.connect(investor).transfer(owner.address, value))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Token: ICO in processing");
                });

            await token.addToWhiteList(investor.address);

            /*
                We can call transfer before end of ICO if we are in the whiteList
            */
            await token.connect(investor).transfer(owner.address, value.div(2));
            expect(await token.balanceOf(investor.address)).to.be.eq(value.div(2));
            expect(await token.balanceOf(owner.address)).to.be.eq(value.div(2));

            await token.removeFromWhiteList(investor.address);

            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

            /*
                We can call transfer after end of ICO even if we aren't in the whiteList
            */
            await token.connect(investor).transfer(owner.address, value.div(2));
            expect(await token.balanceOf(investor.address)).to.be.eq(0);
            expect(await token.balanceOf(owner.address)).to.be.eq(value);

        });

        it("Token.approve should work only after end of ICO or if investor is in the whiteList", async function() {
            /*
                We cannot call approve before end of ICO and if we aren't in the whiteList
            */
            await expect(token.connect(investor).approve(owner.address, value))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Token: ICO in processing");
                });

            await token.addToWhiteList(investor.address);
            /*
                We can call approve before end of ICO if we are in the whiteList
            */
            await token.connect(investor).approve(owner.address, value);
            expect(await token.allowance(investor.address, owner.address)).to.be.eq(value);

            await token.connect(investor).decreaseAllowance(owner.address, value);
            await token.removeFromWhiteList(investor.address);

            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

            /*
                We can call approve after end of ICO even if we aren't in the whiteList
            */
            await token.connect(investor).approve(owner.address, value);
            expect(await token.allowance(investor.address, owner.address)).to.be.eq(value);
        });

        it("Token.transferFrom should work only after end of ICO or if investor is in the whiteList", async function() {
            /*
                We cannot call transferFrom before end of ICO and if we aren't in the whiteList
            */
            await expect(token.transferFrom(investor.address, owner.address, value))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Token: ICO in processing");
                });

            await token.addToWhiteList(owner.address);
            await token.addToWhiteList(investor.address);
            await token.connect(investor).approve(owner.address, value);
            /*
                We can call transferFrom before end of ICO if we are in the whiteList
            */
            await token.transferFrom(investor.address, owner.address, value);

            expect(await token.balanceOf(investor.address)).to.be.eq(0);
            expect(await token.balanceOf(owner.address)).to.be.eq(value);
            
            await token.removeFromWhiteList(owner.address);
            await token.removeFromWhiteList(investor.address);

            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

            await token.approve(investor.address, value);
            /*
                We can call transferFrom after end of ICO even if we aren't in the whiteList
            */
            await token.connect(investor).transferFrom(owner.address, investor.address, value);

            expect(await token.balanceOf(investor.address)).to.be.eq(value);
            expect(await token.balanceOf(owner.address)).to.be.eq(0);
        });
    });

    describe("Token.mint and Token.burn testing", function() {
        let value

        beforeEach(async function() {
            value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10)).mul(42);
        });

        it("Token.mint and Token.burn should throw an exception if was called by not owner", async function () {
            await expect(token.connect(investor).mint(investor.address, value))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner");
                });

            await expect(token.connect(investor).burn(investor.address, value))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner");
                });
        });

        it("Token.mint and Token.burn should work correctly", async function () {
            await token.mint(owner.address, value);
            expect(await token.balanceOf(owner.address)).to.be.eq(value);

            await token.burn(owner.address, value);
            expect(await token.balanceOf(owner.address)).to.be.eq(0);
        });
    });

    describe("Token.withdraw testing", function () {
        it("Token.withdraw should throw an exception if was called by not owner", async function () {
            await expect(token.connect(investor).withdraw(0))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner");
                });
        });

        it("Token.withdraw should work correctly if amount is equal to zero", async function () {
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await investor.sendTransaction({value: value, to: ICO.address});

            const withdrawTx = token.withdraw(0);
            expect(withdrawTx)
                .to.changeEtherBalances([token, owner], [BigNumber.from(0).sub(value), value]);
        });

        it("Token.withdraw should work correctly if amount is not equal to zero", async function () {
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await investor.sendTransaction({value: value, to: ICO.address});

            const amount = value.div(2);
            const withdrawTx = token.withdraw(amount);
            expect(withdrawTx)
                .to.changeEtherBalances([token, owner], [BigNumber.from(0).sub(amount), amount]);
        });
    });
});
