const networkConfig = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x8a753747a1fa494ec906ce90e9f37563a8af630e",
  },
};

const devChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIALANSWER = 200000000000;

/*This syntax allows for other classes to export or require 
This networkConfig package easier. Otherwise other classes would 
need to do something like:
const helperConfig = require("../helper-hardhat-config")
const netowrkConfig = helperConfig.networkConfig
As apposed to what we do which is:
const { networkConfig } = require("../helper-hardhat-config")
*/
module.exports = {
  networkConfig,
  devChains,
  DECIMALS,
  INITIALANSWER,
};
