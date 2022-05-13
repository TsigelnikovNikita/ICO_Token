const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
require("chai").use(require('chai-as-promised'));

const tokenJSON = require("../artifacts/contracts/ICO_token.sol/ICO_Token.json");
const testUtils = require("./test-utils");

describe("ICO", function () {
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
    })

    it("ICO should be created correctly", async function () {
        const lastBlockTImestamp = (await ethers.provider.getBlock("latest")).timestamp;

        expect(await ICO.ICO_START_TIME()).to.be.equal(lastBlockTImestamp);
        expect(await ICO.ICO_END_TIME()).to.be.eq(lastBlockTImestamp + testUtils.THIRD_PERIOD);
        expect(await ICO.TOKEN()).to.be.properAddress;
        expect(await ICO.owner()).to.be.eq(owner.address);

        expect(await token.owner()).to.be.eq(owner.address);
        expect(await token.name()).to.be.eq("TTT_Token");
        expect(await token.symbol()).to.be.eq("TTT");
    });
// to add 42 if call in the first period
    it("buy method should correctly transfer value from investor to " +
        "the contract and emit an event", async function () {
        const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
        const buyTx = await ICO.connect(investor).buy({value: value});

        await expect(() => buyTx)
            .to.changeEtherBalances([ICO, investor], [value, BigNumber.from(0).sub(value)]);
        await expect(buyTx)
            .to.emit(ICO, "bought")
            .withArgs(investor.address, value.mul(42));
    });

    it("buy method should transfer correct TTT token amount in the first period", async function () {
        const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
        await ICO.connect(investor).buy({value: value});

        expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(42));
    });

    it("buy method should transfer correct TTT token amount in the second period", async function () {
        const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
        await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.FIRST_PERIOD]);

        const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
        await ICO.connect(investor).buy({value: value});

        expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(21));

    });

    it("buy method should transfer correct TTT token amount in the third period", async function () {
        const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
        await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.SECOND_PERIOD]);

        const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
        await ICO.connect(investor).buy({value: value});

        expect(await token.balanceOf(investor.address)).to.be.eq(value.mul(8));
    });

    it("buy method should throw an exception after end of ICO", async function () {
        const lastBlockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
        await network.provider.send("evm_setNextBlockTimestamp", [lastBlockTimestamp + testUtils.THIRD_PERIOD]);

        const value = ethers.utils.parseEther(testUtils.getRandomEthers(1, 10));
        await expect(ICO.connect(investor).buy({value: value}))
            .to.be.rejectedWith(Error)
            .then((error) => {
                expect(error.message).to.be.contain("ICO is done");
            });
    });

});
