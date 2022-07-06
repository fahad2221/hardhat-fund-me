const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");

// This describe is for the entire contract except constructor
!devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let mockV3Aggregator;
      let deployer;
      // Can also use parseUnits which in my oppinion is way better
      const sendVal = ethers.utils.parseEther("1"); // 1 Ether
      // This is just to test constructor
      beforeEach(async function () {
        //deploy FundMe using hardhat deploy
        //fixture allows you to run deploy folder with as many tags needed
        // We put the "all" tag in all deploy files, so we can deploy everything
        // in the deploy folder with just one line.
        await deployments.fixture(["all"]);
        // we want just the deployer from getN  amedAccounts
        // not 100% sure why we wrap this round in deployer but i know we need it to
        // work with the let.
        deployer = (await getNamedAccounts()).deployer;
        // Another way to get any account/private key depending on the network is:
        // const accounts = await ethers.getSigners(), this returns whatever is in the
        // accounts part of the network you are under in the hardhat config. Then call it w
        // accountsZero = accounts[0]
        // This gets the most recently deployed fund me contract
        fundMe = await ethers.getContract("FundMe", deployer);
        // get the mockV3Aggregator
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      // This is just for the constructor
      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", async function () {
        it("Fails if you dont send enough eth", async function () {
          // we are now using the waffle testing framework. For a test that we expect to
          // fail, we want to use the key word expect and then .to.be.reverted. As so:
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          ); // used With
        });
        it("Updates mapping data structure when we fund the contract", async function () {
          await fundMe.fund({ value: sendVal });
          // We need to check how much the address of the deployer sent in the mapping
          // The deployer keyword is an address.
          const response = await fundMe.getAddressToAmountFunded(deployer);
          //the reponse will be the bigNumber version of how much has been funded. So we need toString.
          assert.equal(response.toString(), sendVal.toString());
        });
        it("Adds funder to array of s_funders", async function () {
          await fundMe.fund({ value: sendVal });
          // Strange that we use () brackets, probs because its a method.
          const response = await fundMe.getFunders(0);
          assert.equal(deployer, response);
        });
      });
      describe("withdraw", async function () {
        // To test the withdraw functionality we probably want money in it before using it.
        // So we can create it's own before each for this functionality.
        beforeEach(async function () {
          await fundMe.fund({ value: sendVal });
        });
        it("Can withdraw eth from single funder", async function () {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // rememember, these are both big numbers so we need .multiply
          const gasCost = effectiveGasPrice.mul(gasUsed);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert

          assert.equal(endingFundMeBalance, 0);
          // since starting fundMe balance is calling from the blockchain, it will be of type bigNumber
          // So we will need to use the .add method for bigNumber objects.
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("Allows us to withdraw from multiple s_funders", async function () {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendVal });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // Big Number Object uses .mul to multiply
          const gasCost = effectiveGasPrice.mul(gasUsed);
          // Assert
          // Make sure that the getFunders are reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("Only allows owner to withdraw", async function () {
          //Arrange
          const accounts = await ethers.getSigners();
          const attackerConnectedContract = await fundMe.connect(accounts[1]);
          //Act + Assert
          // This is how you connect the attacker to the contract to use functions like withdraw
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });
        it("Cheaper withdraw", async function () {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendVal });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // Big Number Object uses .mul to multiply
          const gasCost = effectiveGasPrice.mul(gasUsed);
          // Assert
          // Make sure that the s_funders are reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
