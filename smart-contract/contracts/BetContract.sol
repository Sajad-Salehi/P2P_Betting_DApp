// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";


contract BetContract is ChainlinkClient {

    
    uint256 number1;
    uint256 number2;
    uint256 currentGameId;        
    uint256 betCounter = 0;

    bytes32 private externalJobId;
    uint256 private oraclePayment;
    using Chainlink for Chainlink.Request;

    mapping (uint => Bet) public bets;
    mapping (address => Bet) public AddressToBet;


    event RequestFulfilled(
        bytes32 indexed requestId, 
        uint256 number1, 
        uint256 number2
    );


    struct Bet {

        uint id;
        uint gameId;
        uint conditions;
        uint price;
        address challenger;
        address accepter;
        address winner;
        bool isAlive;
        bool isAccepted;
    }


    event LogPublishBet(

        uint indexed _id,
        address indexed _challenger,
        uint256 indexed _price
    ); 

    event LogAcceptBet(

        uint indexed _id,
        address indexed _challenger,
        address indexed _accepter,
        uint256  _price
    );

    event LogResolveBet(

        uint indexed _id,
        address indexed _challenger,
        address indexed _accepter,
        uint256 _payout
    );

    event logNumber (
        uint number1,
        uint number2
    );


    constructor() {
        
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x7ca7215c6B8013f249A195cc107F97c4e623e5F5);
        externalJobId = "28d535568b7848adb2369e1850aa4e1c";
        oraclePayment = (1 * LINK_DIVISIBILITY) / 10;

    } 

    function requestMultiVariable() internal {

        Chainlink.Request memory req = buildChainlinkRequest(externalJobId, address(this), this.fulfillBytesAndUint.selector);
        req.add("get", "https://api.sportsdata.io/v3/nba/scores/json/TeamGameStatsBySeason/2023/11/1?key=76c2b56ace2845c59e84f30b8a88ad36");
        req.add("path1", "0,Name");
        req.add("path2", "0,Wins");
        req.add("path3", "0,Losses");
        req.add("path4", "0,GameID");
        sendOperatorRequest(req, oraclePayment);
    }


    function fulfillBytesAndUint(bytes32 requestId, uint256 _number1, uint256 _number2)
        public recordChainlinkFulfillment(requestId){
    
        emit RequestFulfilled(requestId, _number1, _number2);
        number1 = _number1;
        number2 = _number2;
    }
 
    
    // find winners and then close bets
    function upkeep_setWinner() public {

        requestMultiVariable();
        require(number1 == 1 || number2 == 1);

        for(uint i = 1; i <= betCounter; i++){
        
            if (bets[i].gameId == currentGameId) {

                if ((bets[i].conditions == 0 && number2 == 0) || (bets[i].conditions == 1 && number2 == 1)){
                    close_bet(i, bets[i].challenger);
                }

                if ((bets[i].conditions == 0 && number2 == 1) || (bets[i].conditions == 1 && number2 == 0)){
                    close_bet(i, bets[i].accepter);
                }
            }
        } 
    }


    // send reward for winner and close bet
    function close_bet(uint id, address _to) internal  {

        if (bets[id].isAlive == false || bets[id].isAccepted == false) {
            return;
        }
        
        bets[id].winner = _to;
        bets[id].isAlive = false;
        
        uint256 amount = bets[id].price * 2;
        address payable to = payable(_to);

        bool isSuccess = to.send(amount);
        require(isSuccess, "Transaction Failed");


    }
    

    // Publish a new bet
    function publishBet( uint  _conditions, uint256 _price, uint256 _gameId) public payable {

        require(_price >= 1, "Minimum price is 1 Matic");
        require(msg.value >= _price);
        
        betCounter++;
        bets[betCounter] = Bet(

            betCounter,
            _gameId,
            _conditions,
            _price, 
            msg.sender,
            payable(0x0),
            payable(0x0),        
            true,
            false
        );

        emit LogPublishBet(betCounter, msg.sender, _price);
    }


    function acceptBet(uint _id ) public payable {

        Bet storage bet = bets[_id];

        require(bet.isAlive == true, "The bet was canceled");
        require(betCounter > 0, "Bet is not published");
        require(_id > 0 && _id <= betCounter, "Bet is not published");
        require(msg.sender != bet.challenger);
        require(msg.value >= bet.price);
        
        bet.accepter = msg.sender;
        bet.isAccepted = true;
        emit LogAcceptBet(_id, bet.challenger, bet.accepter, bet.price);

    } 

    // cancel bet from challenger before accept bet
    function cancelBet(uint _id) public payable {

        Bet storage bet = bets[_id];

        require(bet.isAlive == true, "The bet was canceled");
        require(betCounter >= _id && _id > 0, "Bet is not published");
        require(msg.sender == bet.challenger);

        bet.isAlive = false;
        uint256 amount = bet.price;
        address payable to = payable(bet.challenger);

        bool isSuccess = to.send(amount);
        require(isSuccess, "Transaction Failed");
        
    }


    function getNumberOfBets() public view returns (uint) {
        return betCounter;
    }


    function getNumberOfAvailableBets() public view returns(uint) {
        
        uint numberOfAvailableBets = 0;

        for(uint i = 1; i <=  betCounter ; i++){

            if(bets[i].isAccepted == false && bets[i].isAlive == true) {

                numberOfAvailableBets++;
            }
        }

        return numberOfAvailableBets;
    }


    function getAvailableBets() public view returns (Bet[] memory) {

        uint[] memory betIds = new uint[](betCounter);
        uint numberOfAvailableBets = 0;

        for(uint i = 1; i <=  betCounter ; i++){

            // Keep the ID if the bet is still available
            if(bets[i].isAccepted == false && bets[i].isAlive == true) {

                betIds[numberOfAvailableBets] = bets[i].id;
                numberOfAvailableBets++;
            }
        }
        
        Bet[] memory availableBets = new Bet[](numberOfAvailableBets);

        // Copy the betIds array into a smaller availableBets array to get rid of empty indexes
        for(uint j = 0; j < numberOfAvailableBets; j++) {
            availableBets[j] = bets[betIds[j]];
        }
        
        return availableBets; 
    
    }   


}
