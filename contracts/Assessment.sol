// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        // Ensure the sender is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // Perform transaction
        balance += _amount;

        // Emit the deposit event
        emit Deposit(_amount);
    }

    // Custom error for insufficient balance
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");

        // Check if sufficient balance exists
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // Perform withdrawal
        balance -= _withdrawAmount;

        // Emit the withdraw event
        emit Withdraw(_withdrawAmount);
    }
}
