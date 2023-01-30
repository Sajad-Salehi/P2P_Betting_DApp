from brownie import exceptions, network, accounts, BetContract, interface
from web3 import Web3


def main():

    account = accounts.load('dev1')
    contract = BetContract.deploy({"from": account})
    print(f"Your Bet Smart Contract deployed at address {contract}")

    
    LINK_TOKEN = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
    print("Send Link ...")
    interface.IERC20(LINK_TOKEN).transfer(contract, 3 * 1e18, {"from": account})
    print(f"3 Link Token sent to the contract at address {contract}.")    