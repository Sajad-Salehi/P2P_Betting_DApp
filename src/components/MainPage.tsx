import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Home.module.css';
import { useAccount, useConnect, useContractRead, useSigner  } from 'wagmi'
import { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
const {abi} = require('../abi.json')



const MainPage: React.FC = () => {

  const [AllBets, setAllBet] = useState<BigNumber>()
  const [availableBets, setavailableBet] = useState<BigNumber>()
  const { data: signer, isError, isLoading } = useSigner()
  const ContractAddress = "0x436925b7ECaf17818CcE9ef9F715D54B9B917aC2"


  const contractConfig = {
    address: ContractAddress,
    abi: abi,
  }

  const { data: AvailableBets } = useContractRead({
    ...contractConfig,
    functionName: 'getNumberOfAvailableBets',
    watch: true,
    chainId: 80001,
  });

  const { data: AllOfBets } = useContractRead({
    ...contractConfig,
    functionName: 'getNumberOfBets',
    watch: true,
    chainId: 80001,

  });
  

  useEffect(() => {
    try{
		setAllBet(AllOfBets as BigNumber)

    } catch(err){
      console.log('Error:', err)
    } 
    
	}, [AllOfBets]);

  useEffect(() => {
    try{
		  setavailableBet(AvailableBets as BigNumber)
  
      } catch(err){
        console.log('Error:', err)
      } 
	}, [AvailableBets]);


    return(

      <div className={styles.container}>
        
  
        <main className={styles.main}>
          <ConnectButton />
          
          <h1 className={styles.title2}>
            Welcome to Aryan Bet DApp
          </h1>
  
          <p className={styles.description}>
            Please Connect Your Wallet To Get Started
          </p>
          
  
          <div className={styles.grid}>
            <a href="https://rainbowkit.com" className={styles.card}>
              <h2>Smart Contract &rarr;</h2>
              <p>See the Smart Contract on PolygonScan.</p>
            </a>
  
            <a href="https://wagmi.sh" className={styles.card}>
              <h2>Matching Guide &rarr;</h2>
              <p>Learn how to interact with the Bet Dapp.</p>
            </a>
  
  
            <a className={styles.card}>
              <h2>Available Bets &rarr;</h2>
              <h1>
                {availableBets?.toString()}
              </h1>
            </a>
  
  
            <a className={styles.card}>
              <h2>All Of Bets &rarr;</h2>
              <h1>
                {AllBets?.toString()}
              </h1>
            </a>

          </div>
        </main>
  
        <footer className={styles.footer}>
          <a target="_blank" rel="noopener noreferrer">
            Made with ❤️ by devs at Aryan Institute 
          </a>
        </footer>

      </div>

    );

};

export default MainPage;
