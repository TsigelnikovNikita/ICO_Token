//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/*
    Smart contract based on ERC20. Additionally this smart contract provides
    functionality for ICO. You need to pass end time of your ICO and ICO address
    in the constructor.

    Also you may create smart contract directly in the ICO smart contract and
    just send your address as an owner and ICO address as ICO_address.

    Smart contrcat also provides "white list" logic. An owner can add
    to/remove from this list. Participant from whiteList may have additional
    privileges (for example transfer tokens before ICO ending).

    You can find full project here: https://github.com/TsigelnikovNikita/ICO_Token
*/
contract ICO_Token is ERC20, Ownable {
    /*
        Only users fron white list can call transfer before ICO ending.
    */
    mapping (address => bool) public whiteList;
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
        require(msg.sender == ICO_ADDRESS, "Token: caller is not ICO");
        _;
    }

    modifier ICOIsActive() {
        require(block.timestamp < ICO_END_TIME, "Token: ICO is done");
        _;
    }

    modifier allowTransfer() {
        require(ICOisEnd() || whiteList[msg.sender] == true, "Token: ICO in processing");
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

    /*
        If somebody just want to send money to us:)
    */
    receive() external payable {}

    /*
        Addresses from white list have additional privilegies.
        (For example call transfer before the ICO end)
    */
    function addToWhiteList(address participant)
        external
        onlyOwner
    {
        require(participant != address(0), "Token: Participant address is the zero address");
        whiteList[participant] = true;
        emit addedToWhiteList(participant);
    }

    function removeFromWhiteList(address participant)
        external
        onlyOwner
    {
        require(participant != address(0), "Token: Participant address is the zero address");
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
        allowTransfer
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
        Only owner can add and remove tokens
    */
    function mint(address account, uint256 amount)
        external
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
