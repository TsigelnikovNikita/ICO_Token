//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/*
    Smart contract based on ERC20. Additionnaly this smart contract provides
    functionnality for ICO. You need to pass end time of your ICO and ICO address in the constructor.

    Also you may create smart contract directly in the ICO smart contract and
    just send your address as owner and ICO address as ICO_address.

    Smart contrcat also provides "what list psrticipants" logic. An owner can add to/remove
    from this list. Participant from whiteList can have additional privileges (for example
    trasfer tokents before ICO ending).
*/
contract ICO_Token is ERC20, Ownable {
    /*
        Only users fron white list can call transfer before ICO ending
    */
    mapping (address => bool) private whiteList;
    address public immutable ICO_ADDRESS;
    uint immutable ICO_END_TIME;


    constructor(string memory name,
                string memory symbol,
                address realOwner,
                address ICO_address,
                uint ICO_endTime
                ) ERC20(name, symbol)
    {
        ICO_END_TIME = ICO_endTime;
        ICO_ADDRESS = ICO_address;
        transferOwnership(realOwner);
    }


    /*
        modofiers
    */
    modifier isICO() {
        require(msg.sender == ICO_ADDRESS,
            "This method can call only ICO contract");
        _;
    }

    modifier ICOIsActive() {
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
 

    function ICOisEnd() private view returns(bool) {
        return block.timestamp > ICO_END_TIME;
    }

    /*
        Use this function ONLY while ICO.
        You can override this for your implementation.  
    */
    function buyTokens(address reciever, uint amount)
        external
        virtual
        isICO
        ICOIsActive
    {
        _mint(reciever, amount);
    }

    /*
        Pass zero as amount if you want to withdraw all available ethers.
    */
    function withdraw(uint amount)
        external
        onlyOwner
    {
        amount = amount == 0 ? address(this).balance : amount;
        payable(msg.sender).transfer(amount);
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

    function isInWhiteList(address participant)
        external
        view
        returns(bool)
    {
        return whiteList[participant];
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