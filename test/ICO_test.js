const { expect } = require("chai");
const { ethers } = require("hardhat");

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
        const lastBlockTImeStamp = (await ethers.provider.getBlock("latest")).timestamp;

        expect(await ICO.ICO_START_TIME()).to.be.equal(lastBlockTImeStamp);
        expect(await ICO.ICO_END_TIME()).to.be.eq(lastBlockTImeStamp + testUtils.THIRD_PERIOD);
        expect(await ICO.TOKEN()).to.be.properAddress;
        expect(await ICO.owner()).to.be.eq(owner.address);

        expect(await token.owner()).to.be.eq(owner.address);
        expect(await token.name()).to.be.eq("TTT_Token");
        expect(await token.symbol()).to.be.eq("TTT");
    });
});
