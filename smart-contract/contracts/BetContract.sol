// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract BetContract is ChainlinkClient, ReentrancyGuard {

    
    uint256 private winning;                        // latest match wining result
    uint256 private losing;                         // latest match losing result
    uint256 private currentTeamId;                  // latest match team id
    uint256 public currentGameId;                   // latest match gameId   
    uint256 public betCounter;                      // number of all bets
    bytes32 private externalJobId;
    uint256 private oraclePayment;
    using Chainlink for Chainlink.Request;


    mapping (uint => Bet) public bets;              // bet id to bet struct
    mapping (address => uint[]) AddressToBetId;     // mapping from each user address to list of user bets id
    mapping (uint256 => uint[]) GameIdToBets;          


    struct Bet {

        uint id;
        uint gameId;
        uint teamId;
        string teamName;
        string HomeTeam;
        string AwayTeam;
        string DateTime;
        uint price;
        address challenger;
        address accepter;
        address winner;
        bool isActive;
        bool isAccepted;
        string status;
    }


    event RequestFulfilled(

        bytes32 indexed requestId,
        uint256 number1,
        uint256 number2,
        uint256 gameId,
        uint256 teamId
    );

    event BetPublished(

        uint indexed _id,
        address indexed _challenger,
        uint256 indexed _price
    ); 

    event BetAccepted(

        uint indexed _id,
        address indexed _challenger,
        address indexed _accepter,
        uint256  _price
    );

    event BetClosed(

        uint indexed _id,
        uint indexed amount,
        address indexed _winner
        
    );

 

    constructor() {
        
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x7ca7215c6B8013f249A195cc107F97c4e623e5F5);
        externalJobId = "00594814638f41c6a9cd1ae3dfa982d6";
        oraclePayment = (1 * LINK_DIVISIBILITY) / 10;

    } 


    // request to oracle and get the latest match result from the api
    function requestMultiVariable() internal {

        Chainlink.Request memory req = buildChainlinkRequest(externalJobId, address(this), this.fulfillBytesAndUint.selector);
        req.add("get", "https://api.sportsdata.io/v3/nba/scores/json/TeamGameStatsBySeason/2023/11/1?key=76c2b56ace2845c59e84f30b8a88ad36");
        req.add("path1", "0,Name");
        req.add("path2", "0,Wins");
        req.add("path3", "0,Losses");
        req.add("path4" , "0,GameID");
        req.add("path5", "0,TeamID");
        sendOperatorRequest(req, oraclePayment);
    }


    function fulfillBytesAndUint(bytes32 requestId, uint256 _number1, uint256 _number2, uint256 _gameId, uint256 _TeamId)
        public recordChainlinkFulfillment(requestId){
    
        emit RequestFulfilled(requestId, _number1, _number2, _gameId, _TeamId);
        winning = _number1;
        losing = _number2;
        currentGameId = _gameId;
        currentTeamId = _TeamId;
    }
 
    
    // find winners and then close bets. this function uses chainlink upkeep
    function upkeep_setWinner() public payable nonReentrant {


        uint256[] memory _betsID = GameIdToBets[currentGameId];
        uint256 length = _betsID.length;


        for(uint i = 0; i < length; i++){
            
            uint256 id = _betsID[i];
            if (bets[id].isActive == true) {

                if (currentTeamId == bets[id].teamId){
                    
                    address _to = bets[id].challenger;
                    bets[id].winner = _to;
                    bets[id].status = "Closed";
                    bets[id].isActive = false;
                    
                    uint256 amount = bets[id].price * 2;
                    address payable to = payable(_to);

                    to.transfer(amount);
                    emit BetClosed(id, amount, to);



                }

                else if(currentTeamId != bets[id].teamId){
                    
                    address _to = bets[id].accepter;
                    bets[id].winner = _to;
                    bets[id].status = "Closed";
                    bets[id].isActive = false;
                    
                    uint256 amount = bets[id].price * 2;
                    address payable to = payable(_to);

                    to.transfer(amount);
                    emit BetClosed(id, amount, to);


                }
            }
        } 

        requestMultiVariable();
    }


    // Publish a new bet 
    function publishBet( 
        uint256 _price, uint256 _gameId, string memory _homeTeam, string memory _awayTeam, string memory _dataTime, uint _teamId, string memory _teamName) public payable {

        // publisher should send bet price as msg.value and price should be at least 0.01 Matic
        require(_price >= 0.001 * 1e18, "Minimum price is 1 Matic");
        require(msg.value >= _price, "You should provide price as msg.value");
        
        betCounter++;
        bets[betCounter] = Bet(

            betCounter,
            _gameId,
            _teamId,
            _teamName,
            _homeTeam,
            _awayTeam,
            _dataTime,
            _price, 
            msg.sender,
            payable(0x0),
            payable(0x0),        
            true,
            false,
            "Published"
        );

        AddressToBetId[msg.sender].push(betCounter);
        emit BetPublished(betCounter, msg.sender, _price);
    }



    // accept the specific Bet 
    function acceptBet(uint _id ) public payable nonReentrant {

        Bet storage bet = bets[_id];
        
        // the bet sould alive and not closed or accepted before
        // accepter should send the bet price as msg.value
        require(bet.isActive == true, "The bet is not activa");
        require(betCounter > 0, "Bet is not published");
        require(_id > 0 && _id <= betCounter, "Bet is not published");
        require(msg.sender != bet.challenger, "Challenger can not accept the bet");
        require(msg.value >= bet.price, "You should provide price as msg.value");
        
        bet.accepter = msg.sender;
        bet.isAccepted = true;
        bet.status = "Accepted";
        AddressToBetId[msg.sender].push(_id);
        GameIdToBets[bet.gameId].push(_id);

        emit BetAccepted(_id, bet.challenger, bet.accepter, bet.price);

    } 



    // cancel bet from challenger before accept bet
    function cancelBet(uint _id) public payable {

        Bet storage bet = bets[_id];

        // msg.sender should be challenger
        require(bet.isActive == true, "The bet was canceled");
        require(betCounter >= _id && _id > 0, "Bet is not published");
        require(msg.sender == bet.challenger, "Bet challenger can cancel");

        bet.isActive = false;
        bet.status = "Canceled";
        uint256 amount = bet.price;
        address payable to = payable(bet.challenger);

        // send back bet price to challanger
        bool isSuccess = to.send(amount);
        require(isSuccess, "Transaction Failed");
        
    }



    // return number of all of bets in the contract
    function getNumberOfBets() public view returns (uint) {
        return betCounter;
    }



    // return number of available Bets
    function getNumberOfAvailableBets() public view returns(uint) {
        
        uint numberOfAvailableBets = 0;

        for(uint i = 1; i <=  betCounter ; i++){

            if(bets[i].isAccepted == false && bets[i].isActive == true) {
                numberOfAvailableBets++;
            }
        }

        return numberOfAvailableBets;
    }



    // create the list of available Bets and return it
    function getAvailableBets() public view returns (Bet[] memory) {

        uint[] memory betIds = new uint[](betCounter);
        uint numberOfAvailableBets = 0;

        for(uint i = 1; i <=  betCounter ; i++){

            // Keep the ID if the bet is still available
            if(bets[i].isAccepted == false && bets[i].isActive == true) {

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



    // returns the list of msg.seder bets
    function getUserBets() public view returns(Bet[] memory) {

        uint size = AddressToBetId[msg.sender].length;
        Bet[] memory userBets = new Bet[](size);

        for(uint i = 0; i < size; i++) {

            uint index = AddressToBetId[msg.sender][i];
            userBets[i] = bets[index]; 
        }

        return userBets;
    }



    // set and return the winner condition team for accepter
    function getAcceptWinnerTeamName(uint id) public view returns(string memory) {

        Bet memory betPosition = bets[id];
        string memory team = betPosition.teamName;

        if (keccak256(bytes(team)) == keccak256(bytes(betPosition.HomeTeam))){

            return betPosition.AwayTeam;
        }

        else {

            return betPosition.HomeTeam;
        }

    }



}