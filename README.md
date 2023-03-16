# P2P Betting DApp

This is a peer-to-peer (P2P) betting decentralized application (DApp) built using Next.js, Brownie, and Solidity. The DApp allows users to publish and accept bets on various sports events.<br/><br/>


## Features
- Peer-to-peer betting system
- Chainlink oracle integration for fetching latest match results
- User-friendly interface built with Next.js
- Smart contract development using Brownie and Solidity<br/><br/>


## Usage
To use Bet DApp, follow these steps:

1. Clone the repository
2. Install the dependencies using `npm install`
3. Start the Next.js server using `npm run dev`
4. Connect your Ethereum wallet to the DApp
5. Place or accept a bet on a sports event
6. Wait for the results to be fetched from the smart contract
7. If you win, you should recieve your reward in your wallet!<br/><br/>


## Smart Contract Architecture
This Bet DApp utilizes a Solidity smart contract that handles the logic for the betting system. The contract uses the Chainlink oracle to fetch the latest match results from the API and determine the winner. Users can place a bet by providing relevant information such as the bet price, game ID, home team name, away team name, date time, team ID, and team name. Once a bet is accepted, the contract locks the funds and transfers them to the smart contract. If the user who placed the bet wins, the contract sends the reward to the winner and closes the bet. Similarly, if the user who accepted the bet wins, the contract sends the reward to the accepter and closes the bet.<br/><br/>


## Deployment
To deploy Bet contract, you can use Brownie's deployment tools. Simply run the following command in the terminal:

```bash
brownie run scripts/deploy.py --network ethereum_network
```

Replace ethereum_network with the name of the Ethereum network you wish to deploy to.<br/><br/>


## Contribution
Contributions to this project are always welcome! If you find any bugs or want to add a new feature, feel free to create an issue or pull request.


## License
This project is licensed under the [MIT license](LICENSE).
