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

    /*
        events
    */
    event removedFromWhiteList(address indexed participant);
    event addedToWhiteList(address indexed participant);
 
    constructor(uint ICO_endTIme) ERC20("TTT", "TTT") {
        ICO_END_TIME = ICO_endTIme;
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
        Addresses from whilte list have additional privilegies.
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
}
