pragma solidity 0.8.17;
//SPDX-License-Identifier: None

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AllowanceTokenWallet is Ownable, Pausable {

    IERC20 public immutable allowanceToken;
    constructor () {
        allowanceToken = IERC20(0x01Dbe473fC7BBACf42a3f2232BFCb12b75FF5D1c); 
    //IERC20(0xc7198437980c041c805A1EDcbA50c1Ce5db95118); //AvaxC USDT Token Tracker
    }
    struct Allowance {
        uint allowanceAmount;
        uint allowancePeriodInDays;
        uint whenLastAllowance;
        uint paid;
    }
    
    
    mapping(address => Allowance) allowances;

    event AllowanceCreated(address indexed addr, Allowance newAllowance);
    event AllowanceDeleted(address indexed addr);
    event AllowanceChanged(address indexed addr, Allowance newAllowance);
    event MoneyReceived(address indexed addr, uint amount);
    event MoneySent(address indexed addr, uint amount);

    function addAllowance(
        address addr,
        uint allowanceAmount,
        uint allowancePeriodInDays
    ) public onlyOwner {
        require(!isAllowanceExist(addr), "Allowance already exists");

        // Initialize new allowance
        Allowance memory allowance;
        allowance.allowanceAmount = allowanceAmount;
        allowance.allowancePeriodInDays = allowancePeriodInDays * 1 days;
        allowance.whenLastAllowance = block.timestamp;
        allowance.paid = 0;
        allowances[addr] = allowance;
        emit AllowanceCreated(addr, allowance);
    }

    function isAllowanceExist(address _addr) public view returns (bool) {
        return allowances[_addr].allowanceAmount > 0;
    }
    function getAllowance(address _addr) public view returns(Allowance memory _allowance){
        return allowances[_addr];
    }
    function removeAllowance(address addr) public onlyOwner {
        require(isAllowanceExist(addr), "Allowance already doesn't exist");

        delete allowances[addr];

        emit AllowanceDeleted(addr);
    }

    function getAddrPaidableAmount(address _addr) external view returns (uint)
    {
        if (!isAllowanceExist(_addr)) return 0;
        (uint _paidableAmount, ) = getAmountToSend(_addr);

        return _paidableAmount;
    }

    function getAmountToSend(address _addr) private view returns (uint amountToSend, uint numAllowances)
    {
        numAllowances = (block.timestamp - allowances[_addr].whenLastAllowance) / allowances[_addr].allowancePeriodInDays;
        amountToSend = numAllowances * allowances[_addr].allowanceAmount;
    }

    function getPaidAllowance() public whenNotPaused {
        address _addr = _msgSender();

        require(isAllowanceExist(_addr),"You're not a recipient of an allowance");
        // Calculate and update unspent allowance
        (uint amountToSend, uint numAllowances) = getAmountToSend(_addr);
        require(allowanceToken.balanceOf(address(this)) >= amountToSend, "Wallet balance too low to pay allowance");
        require(amountToSend > 0,"Not this time bro :(");

        allowances[_addr].whenLastAllowance += (numAllowances * allowances[_addr].allowancePeriodInDays);
        allowances[_addr].paid += amountToSend;
        // Pay allowance
        allowanceToken.transfer(_addr, amountToSend);

        emit MoneySent(_addr, amountToSend);
        emit AllowanceChanged(_addr, allowances[_addr]);
    }

    function withdrawFromWalletBalance(
        IERC20 _token,
        uint amount
    ) public onlyOwner {
        require(
            _token.balanceOf(address(this)) >= amount,
            "Wallet balance too low to fund withdraw"
        );
        _token.transfer(owner(), amount);
        emit MoneySent(owner(), amount);
    }

    function withdrawAllFromWalletBalance(IERC20 _token)
        public
        onlyOwner
    {
        withdrawFromWalletBalance(
            _token,
            _token.balanceOf(address(this))
        );
    }

    function renounceOwnership() public view override onlyOwner {
        revert("Can't renounce ownership");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
