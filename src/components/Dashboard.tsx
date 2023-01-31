import { ConnectButton } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount, useConnect, useContractRead, useSigner  } from 'wagmi'
import { useState, useEffect } from 'react';
const {abi} = require('../abi.json')


export default function Dashboard(): JSX.Element {

    const [isClicked, setClicked] = useState(false)


    function hi() {
        setClicked(true)
    }

    return(
        
        
        <div className={styles.dashboard}>

            <h1 className={styles.dsh1}>Aryan Bet Dashboard</h1>
            <div><ConnectButton /></div>

            <main className={styles.main}>
            
    
              <a onClick={hi} className={styles.card}>
                <h2>See Available Bets Info &rarr;</h2>
                <h4>
                  See open bets and accept one to start.
                </h4>
              </a>
    
    
              <a className={styles.card}>
                <h2>Publish Your Bet &rarr;</h2>
                <h4>
                  Publish and Open Your Specific Bet.
                </h4>
              </a>


              <a className={styles.card}>
                <h2>See Your Current Bet &rarr;</h2>
                <h4>
                  See your Current bets info.
                </h4>
              </a>
  
          
          </main>
        </div>

      
    );
}