//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ICO is Ownable {
    /*
        ICO has three periods.
        In the first period user can buy 42 TTT token for 1 ETH.
        In the second one - 21 TTT token for 1 ETH.
        And the last one -  8 TTT token for 1 ETH.
    */
    uint constant FIRST_PERIOD = 3 days;
    uint constant SECOND_PERIOD = FIRST_PERIOD + 30 days;
    uint constant THIRD_PERIOD = SECOND_PERIOD + 2 weeks;

    uint public immutable icoStartTime;
    uint public immutable icoEndTime;
    IERC20 public immutable tokenAddress;
    bool public icoComplited;

    constructor(address _tokenAddress) {
        icoStartTime = block.timestamp;
        icoEndTime = block.timestamp + THIRD_PERIOD;
        tokenAddress = IERC20(_tokenAddress);
    }

    function buy() public payable {
        // logic of buying tokens
    }

    function recieve() external payable {
        buy();
    }
}
