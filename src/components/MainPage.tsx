import { ConnectButton } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount, useConnect, useContractRead, useSigner  } from 'wagmi'
import { useState, useEffect } from 'react';
const {abi} = require('../abi.json')



export default function MainPage(): JSX.Element {

  const [AllBets, setAllBet] = useState(0)
  const [availableBets, setavailableBet] = useState(0)
  const { data: signer, isError, isLoading } = useSigner()
  const ContractAddress = "0x16C957EDF52601165373c97d0316c2ca5A71b121"


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
		setAllBet(AllOfBets.toNumber())
	}, []);

  useEffect(() => {
    console.log(AvailableBets.toNumber())
		setavailableBet(AvailableBets.toNumber())
	}, []);


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
                {availableBets}
              </h1>
            </a>
  
  
            <a className={styles.card}>
              <h2>All Of Bets &rarr;</h2>
              <h1>
                {AllBets}
              </h1>
            </a>

          </div>
        </main>
  
        <footer className={styles.footer}>
          <a href="https://rainbow.me" target="_blank" rel="noopener noreferrer">
            Made with ❤️ by devs at Aryan Institue 
          </a>
        </footer>

      </div>

    );

};