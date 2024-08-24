// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

//Author: @plycedes

contract Coinflip {
    address public immutable i_owner;
    bool result;

    constructor(){
        i_owner = msg.sender;
    }

    receive() payable external{}

    fallback() payable external{}

    function withdraw() public payable {
        require(msg.sender == i_owner, "Only admin can withdraw");
        (bool callSuccess,) = payable(i_owner).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function play(uint256 guess) public payable {
        require(msg.value < 2 * address(this).balance, "Please bet a lower value");
        uint randNo = 0;
        randNo = uint (keccak256(abi.encodePacked (msg.sender, block.timestamp, randNo)));
        randNo %= 10;
        randNo %= 2;
        if(guess == randNo){
            (bool success,) = payable(msg.sender).call{value: msg.value * 2}("");
            if(success){
                result = true;
            }
        } else {
            result = false;
        }
    }

    function getResult() public view returns(bool) {
        return result;
    }
}