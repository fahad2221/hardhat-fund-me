const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");

// conditional operator (terminary), a nice one liner. skips describe other does it.
devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let FundMe;
      let deployer;
      const sendVal = ethers.utils.parseEther("0.01");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
        // Should probably add a wait statement to make this more robust
      });

      it("Allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendVal });
        await fundMe.withdraw();
        const endingBalance = fundme.provider.getBalance(fundMe.address);
        assert(endingBalance.toString(), "0");
      });
    });
