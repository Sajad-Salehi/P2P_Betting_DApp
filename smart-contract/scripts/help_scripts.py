from brownie import accounts, BetContract



def get_account(number: int):

    if number == 1:
        account = accounts.load('dev1')

    elif number == 2:
        account = accounts.load('dev2')
    
    return account



def get_contract():

    return BetContract[-1]