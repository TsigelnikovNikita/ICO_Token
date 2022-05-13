const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const tokenJSON = require("../artifacts/contracts/ICO_token.sol/ICO_Token.json");
const testUtils = require("./test-utils");

require("chai").use(require('chai-as-promised'));

describe("ICO testing", function () {
    let ICO
    let token
    let owner
    let investor

    beforeEach(async function() {
        [owner, investor] = await ethers.getSigners();

        const ICOFactory = await ethers.getContractFactory("ICO", owner);
        ICO = await ICOFactory.deploy();
        await ICO.deployed();

        token = new ethers.Contract(await ICO.TOKEN(), tokenJSON.abi, owner);
    });

    it("ICO should be created correctly", async function () {
        const lastBlockTImestamp = (await ethers.provider.getBlock("latest")).timestamp;

        await ICO.FIRST_PERIOD();
        expect(await ICO.ICO_START_TIME()).to.be.equal(lastBlockTImestamp);
        expect(await ICO.ICO_END_TIME()).to.be.eq(lastBlockTImestamp + testUtils.THIRD_PERIOD);
        expect(await ICO.TOKEN()).to.be.properAddress;
        expect(await ICO.owner()).to.be.eq(owner.address);

        expect(await token.owner()).to.be.eq(owner.address);
        expect(await token.name()).to.be.eq("TTT_Token");
        expect(await token.symbol()).to.be.eq("TTT");
    });

    describe("ICO.buy() function testing", function () {
        it("buy() method should correctly transfer value from investor to " +
            "the contract and emit an event", async function () {
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            const buyTx = await ICO.connect(investor)['buy()']({value: value});

            await expect(() => buyTx)
                .to.changeEtherBalances([ICO, investor], [value, BigNumber.from(0).sub(value)]);
            await expect(buyTx)
                .to.emit(ICO, "bought")
                .withArgs(investor.address, value.mul(42));
        });

        it("buy() method should transfer correct TTT token amount in the first period", async function () {
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await ICO.connect(investor)['buy()']({value: value});

            expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(42));
        });

        it("buy() method should transfer correct TTT token amount in the second period", async function () {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.FIRST_PERIOD]);

            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await ICO.connect(investor)['buy()']({value: value});

            expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(21));

        });

        it("buy() method should transfer correct TTT token amount in the third period", async function () {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.SECOND_PERIOD]);

            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await ICO.connect(investor)['buy()']({value: value});

            expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(8));
        });

        it("buy() method should throw an exception after end of ICO", async function () {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await expect(ICO.connect(investor)['buy()']({value: value}))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("ICO: ICO is done");
                });
        });

        it("sendTranscation to the contract should call buy function", async function () {
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            const sendTransactionTx = await investor.sendTransaction({value: value, to: ICO.address});

            expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(42));
            expect(sendTransactionTx)
                .to.changeEtherBalances([investor, ICO], [BigNumber.from(0).sub(value), value]);
        });
    });

    describe("ICO.buy(uint256) function testing", function () {
        let value

        beforeEach(async function () {
            value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
        });

        it("buy(uint256) method should correctly transfer value from investor to " +
            "the contract and emit an event", async function () {
            const amount = value.mul(42);
            const buyTx = await ICO.connect(investor)['buy(uint256)'](amount, {value: value});

            await expect(() => buyTx)
                .to.changeEtherBalances([ICO, investor], [value, BigNumber.from(0).sub(value)]);
            await expect(buyTx)
                .to.emit(ICO, "bought")
                .withArgs(investor.address, value.mul(42));
        });

        it("buy(uint256) method should transfer correct TTT token amount in the first period", async function () {
            const amount = value.mul(42);

            await ICO.connect(investor)['buy(uint256)'](amount, {value: value});
            expect(await token.balanceOf(investor.address)).to.be.eq(amount);
        });

        it("buy(uint256) method should transfer correct TTT token amount in the second period", async function () {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.FIRST_PERIOD]);

            const amount = value.mul(21);

            await ICO.connect(investor)['buy(uint256)'](amount, {value: value});
            expect(await token.balanceOf(investor.address)).to.be.eq(amount);
        });

        it("buy(uint) method should transfer correct TTT token amount in the third period", async function () {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.SECOND_PERIOD]);

            const amount = value.mul(8);

            await ICO.connect(investor)['buy(uint256)'](amount, {value: value});

            expect(await token.balanceOf(investor.address)).to.be.eq(amount);
        });

        it("buy(uint256) method should throw an exception after end of ICO", async function () {
            const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
            await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

            await expect(ICO.connect(investor)['buy(uint256)'](1, {value: value}))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("ICO: ICO is done");
                });
        });
        
        it("buy(uint256) method should throw an exception if not enough ethers", async function () {
            const amount = value.mul(100);
            await expect(ICO.connect(investor)['buy(uint256)'](amount, {value: value}))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("ICO: not enought ethers");
                });
        });
        
        it("buy(uint256) method should payback extra ethers", async function () {
            const amount = value;

            const buyTx = ICO.connect(investor)['buy(uint256)'](amount, {value: value});
            const payback = value.sub(value.div(42));
            const difference = value.sub(payback);
            await expect(() => buyTx)
                .to.changeEtherBalances([investor, ICO], [BigNumber.from(0).sub(difference), difference]);
        });
    });

    describe("ICO.withdraw function testing", function() {
        it("withdraw function should throw an exception if not owner called", async function () {
            await expect(ICO.connect(investor).withdraw(0))
                .to.be.rejectedWith(Error)
                .then((error) => {
                    expect(error.message).to.be.contain("Ownable: caller is not the owner'");
                });
        });

        it("withdraw function should transfer all available ethers if 0 was passed", async function () {            
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await ICO.connect(investor)['buy()']({value: value});

            const withdrawTx = await ICO.withdraw(0);
            await expect(() => withdrawTx)
                .to.changeEtherBalances([ICO, owner], [BigNumber.from(0).sub(value), value]);
        });

        it("withdraw function should transfer passing ether amount", async function () {            
            const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
            await ICO.connect(investor)['buy()']({value: value});

            const withdrawAmount = value.div(2);
            const withdrawTx = await ICO.withdraw(withdrawAmount);
            await expect(() => withdrawTx)
                .to.changeEtherBalances([ICO, owner], [BigNumber.from(0).sub(withdrawAmount), withdrawAmount]);
        });
    });
});
