// SPDX-License-Identifier: MIT
//pragma
pragma solidity ^0.8.8;

//imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//error codes
error FundMe__NotOwner();

//Interfaces, Libraries, Contract


/**
* @title A contract for crowd funding
* @author Fahad Mustafa
* @notice This contract is to demo a sampe fundMe contract
* @dev This implements pricfeeds as our library 
 */
contract FundMe {
    //remember we are using PriceConverter as a library for the uint256 type
    //Type declerations
    using PriceConverter for uint256;

    // State Variables
    // going to make these private too with a getter function
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    // going to make this private as it uses less gas, going to make a getter function below.
    address private /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 5 * 10 ** 18;
    AggregatorV3Interface private s_priceFeed;
    
    // Modifiers
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Constructor
    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }
    
    // We should write test for these too, but were not.
    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    /**
    * @notice This contract is to demo a sampe fundMe contract
    * @dev This implements pricfeeds as our library
    * 
    */
    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    
    // Only the ownder can withdraw
    function withdraw() payable onlyOwner public {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() payable onlyOwner public {
        // here we are making a copy in memory so dont have to load
        // the variables from storage which takes a lot of gas. 
        address[] memory funders = s_funders;
        //  
        for(uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
           address funder = funders[funderIndex];
           s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function getOwner() public view returns(address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }








    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

   

}

