const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Coinflip contract", () => {
    let coinflip, contractAddress, deployer, user;

    beforeEach(async () => {
        coinflip = await ethers.deployContract("Coinflip");

        const [signer, second] = await ethers.getSigners();
        deployer = signer;
        user = second;
        contractAddress = coinflip.getAddress();

        const tx = await signer.sendTransaction({
            to: contractAddress,
            value: ethers.parseEther("2.1234"),
        });
        await tx.wait();
    });

    it("Sets the owner of contract correctly", async () => {
        const owner = await coinflip.i_owner();
        assert.equal(deployer.address, owner);
    });

    describe("withdraw", async () => {
        it("Reverts if admin is not the one withdrawing", async () => {
            await expect(coinflip.connect(user).withdraw()).to.be.reverted;
        });
        it("Transfers the contract balance to the owner", async () => {
            let startingOwnerBalance = Number(await ethers.provider.getBalance(deployer.address));
            let startingContractBalance = Number(await ethers.provider.getBalance(contractAddress));

            const tx = await coinflip.withdraw();
            const tr = await tx.wait(1);
            let { gasUsed, gasPrice } = tr;
            let gasCost = Number(gasUsed) * Number(gasPrice);

            let endingOwnerBalance = Number(await ethers.provider.getBalance(deployer.address));
            let endingContractBalance = Number(await ethers.provider.getBalance(contractAddress));

            assert.equal(endingContractBalance, 0);

            assert.equal(
                parseInt((startingContractBalance + startingOwnerBalance) / 10000000),
                parseInt((endingOwnerBalance + gasCost) / 10000000)
            );
        });
    });

    describe("play", async () => {
        it("reverts if you fund with a higher value", async () => {
            expect(coinflip.play(1, { value: ethers.parseEther("2.5") })).to.be.reverted;
        });
        it("Transfers amount if the user wins", async () => {
            const startingPlayerBalance = await ethers.provider.getBalance(deployer.address);

            //console.log(startingPlayerBalance);
            const fundVal = ethers.parseEther("0.1");
            //console.log(fundVal);
            const tx = await coinflip.play(1, { value: fundVal });
            const tr = await tx.wait();
            //console.log(tr);
            const { gasUsed, gasPrice } = tr;
            const gasCost = gasPrice * gasUsed;
            //console.log(gasCost);

            const res = await coinflip.getResult();

            const endingPlayerBalance = await ethers.provider.getBalance(deployer.address);
            const finalBal = parseInt(Number(endingPlayerBalance + gasCost) / 1000000000000000);

            //console.log(res);
            //console.log(finalBal);
            if (res === true) {
                const sum = parseInt(
                    Number(startingPlayerBalance + fundVal + gasCost) / 1000000000000000
                );
                //console.log(sum);
                assert.equal(sum, finalBal);
            } else {
                const sum = parseInt(
                    Number(startingPlayerBalance - gasCost - fundVal) / 1000000000000000
                );
                //console.log(sum);
                assert.equal(sum, finalBal);
            }
        });
    });
});
