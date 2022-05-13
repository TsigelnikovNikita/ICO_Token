//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TTT is ERC20, Ownable {
    /*
        Only user fron white list can call transfer before ICO ending
    */

    mapping (address => uint8) whiteList;
    uint immutable ICO_END_TIME;

    constructor(uint ICO_endTIme) ERC20("TTT", "TTT") {
        ICO_END_TIME = ICO_endTIme;
    }
}
