//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./ICO_token.sol";


contract ICO is Ownable {
    /*
        ICO has three periods.
        In the first period user can buy 42 TTT token for 1 ETH.
        In the second one - 21 TTT token for 1 ETH.
        And the last one -  8 TTT token for 1 ETH.
    */
    uint32 public constant FIRST_PERIOD = 3 days;
    uint32 public constant SECOND_PERIOD = FIRST_PERIOD + 30 days;
    uint32 public constant THIRD_PERIOD = SECOND_PERIOD + 2 weeks;

    uint8 public constant TOKENS_PER_ONE_ETH_FIRST_PERIOD = 42;
    uint8 public constant TOKENS_PER_ONE_ETH_SECOND_PERIOD = 21;
    uint8 public constant TOKENS_PER_ONE_ETH_THIRD_PERIOD = 8;

    uint public immutable ICO_START_TIME;
    uint public immutable ICO_END_TIME;
    ICO_Token public immutable TOKEN;


    constructor() {
        ICO_START_TIME = block.timestamp;
        ICO_END_TIME = block.timestamp + THIRD_PERIOD;
        TOKEN = new ICO_Token("TTT_Token", "TTT",
                                msg.sender, address(this),
                                block.timestamp + THIRD_PERIOD);
    }


    /*
        events
    */
    event bought(address indexed buyer, uint value);


    /*
        modifiers
    */
    modifier ICOisActive() {
        require(block.timestamp < ICO_END_TIME,
            "ICO: ICO is done");
        _;
    }

    function getCurrentExchangeRate() internal view returns(uint) {
        if (block.timestamp < ICO_START_TIME + FIRST_PERIOD) {
            return TOKENS_PER_ONE_ETH_FIRST_PERIOD;
        } else if (block.timestamp < ICO_START_TIME + SECOND_PERIOD) {
            return TOKENS_PER_ONE_ETH_SECOND_PERIOD;
        } else {
            return TOKENS_PER_ONE_ETH_THIRD_PERIOD;
        }
    }

    function buy()
        public
        payable
        ICOisActive
    {
        uint256 amount = msg.value * getCurrentExchangeRate();
        buy(amount);
    }

    function buy(uint amount)
        public
        payable
        ICOisActive
    {
        uint currentExchangeRate = getCurrentExchangeRate();

        require(amount <= msg.value * currentExchangeRate, "ICO: not enought ethers");
        if (amount < msg.value * currentExchangeRate) {
            uint payback = msg.value - msg.value / currentExchangeRate;
            payable(msg.sender).transfer(payback);
        }
        TOKEN.buyTokens(msg.sender, amount);
        emit bought(msg.sender, amount);
    }

    receive() external payable {
        buy();
    }

    /*
        You can pass amount as zero if you want to withdraw all available ethers,
        or to pass concrete value. 
    */
    function withdraw(uint amount)
        external
        onlyOwner
    {
        amount = amount == 0 ? address(this).balance : amount;
        payable(msg.sender).transfer(amount);
    }
}
