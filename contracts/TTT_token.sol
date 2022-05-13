//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TTT is ERC20, Ownable {
    /*
        Only user fron white list can call transfer before ICO ending
    */
    mapping (address => bool) whiteList;
    address ICOAddress;
    uint immutable ICO_END_TIME;


    /*
        modofiers
    */
    modifier isICO() {
        require(msg.sender == ICOAddress,
            "This method can call only ICO contract");
        _;
    }

    modifier ICOInProccessing() {
        require(block.timestamp > ICO_END_TIME,
            "ICO is done");
        _;
    }

    modifier isWhiteListParticipant(address participant) {
        require(whiteList[participant] == true,
            "You are not in white list");
        _;
    }

    modifier allowTransfer() {
        require(ICOisEnd() || whiteList[msg.sender] == true, "ICO in processing");
        _;
    }


    /*
        events
    */
    event removedFromWhiteList(address indexed participant);
    event addedToWhiteList(address indexed participant);
 

    constructor(uint ICO_endTIme) ERC20("TTT", "TTT") {
        ICO_END_TIME = ICO_endTIme;
    }

    function ICOisEnd() private view returns(bool) {
        return block.timestamp > ICO_END_TIME;
    }

    /*
        Use this function ONLY while ICO.  
    */
    function buyTokens(address reciever, uint amount)
        external
        isICO
        ICOInProccessing
    {
        _mint(reciever, amount);
    }


    /*
        Addresses from white list have additional privilegies.
        (For example call trasnfer before the ICO end)
    */
    function addToWhiteList(address participant)
        external
        onlyOwner
    {
        require(participant != address(0), "Participant address is zero");
        whiteList[participant] = true;
        emit addedToWhiteList(participant);
    }

    function removeFromWhiteList(address participant)
        external
        onlyOwner
    {
        require(participant != address(0), "Participant address is zero");
        whiteList[participant] = false;
        emit removedFromWhiteList(participant);
    }


    /*
        Overriding ERC20 functions. We can call their only if:
            1. ICO is end;
            2. msg.sender is participant of white list;
    */
    function transfer(address to, uint256 amount)
        public
        override
        allowTransfer
        returns(bool)
    {
        return super.transfer(to, amount);
    }

    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        return super.approve(spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount)
        public
        virtual
        override
        allowTransfer
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        override
        allowTransfer
        returns (bool)
    {
        return super.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        override
        allowTransfer
        returns (bool)
    {
        return super.decreaseAllowance(spender, subtractedValue);
    }


    /*
        Only owner can add or remove tokens
    */
    function mint(address account, uint256 amount)
        external
        payable
        onlyOwner
    {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount)
        external
        onlyOwner
    {
        _burn(account, amount);
    }
}
