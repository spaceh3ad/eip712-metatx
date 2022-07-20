// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


import {EIP712MetaTransaction} from "./EIP712MetaTransaction.sol";
contract Marketplace is EIP712MetaTransaction {
    constructor() EIP712MetaTransaction("test", "1") {}
    
    uint256 public testString = 0;
    function setString(uint256 newString) public {
        testString = newString;
    }
}