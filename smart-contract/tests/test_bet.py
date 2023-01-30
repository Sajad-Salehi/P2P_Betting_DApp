from brownie import network, exceptions, BetContract
from scripts.help_scripts import *


def test_publishBet():

    account = get_account(1)
    contract = BetContract[-1]
    last_betNumber = contract.getNumberOfBets()

    contract.publishBet("MyBet", 1, 1, {"from": account, "value": 1})
    assert contract.getNumberOfBets() == last_betNumber + 1


def test_acceptBet():

    account = get_account(2)
    contract = BetContract[-1]
    available_bets = contract.getAvailableBets()

    id = available_bets[-1]
    contract.acceptBet(1, {"from": account, "value": 1})
    
    available_bets.pop()
    assert contract.getAvailableBets() == available_bets