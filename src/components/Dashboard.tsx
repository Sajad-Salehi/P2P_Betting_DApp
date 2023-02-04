import { ConnectButton } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount, useConnect, useContractRead, useSigner  } from 'wagmi'
import { useState, useEffect } from 'react';
const {abi} = require('../abi.json')


export default function BetList() {

  const [bets, setBets] = useState([]);
  const ContractAddress = "0xAB206d594ae3fE15674e2Fa4Bb4dfe9316Fce822"


  const contractConfig = {
    address: ContractAddress,
    abi: abi,
  }

  const { data: AvailableBets } = useContractRead({
    ...contractConfig,
    functionName: 'getAvailableBets',
    watch: true,
    chainId: 80001,
  });

  useEffect(() => {
    
    setBets(AvailableBets)
  }, []);


  function AcceptBetForm() {
    const [betId, setBetId] = useState('')
  
    const handleAcceptBet = () => {
      // TODO: Call the acceptBet method on the betting smart contract with the betId
    }
  }


  return (

    <div className={styles.tablePage} >
      <h2>Bet List</h2>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Bet ID</th>
            <th className={styles.th}>Game Id</th>
            <th className={styles.th}>Price</th>
            <th className={styles.th}>Condition</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {bets.map((bet) => (
            <tr key={bet.id}>

              <td className={styles.th}>{bet.id.toNumber()}</td>
              <td className={styles.th}>{bet.gameId.toNumber()}</td>
              <td className={styles.th}>{bet.price.toNumber()}</td>
              <td className={styles.th}>{bet.conditions.toNumber()}</td>

            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h3>Enter the Bet Id to accept</h3>
        <input
        type="text"
        value=''
        onChange={e => setBetId(e.target.value)}
        placeholder="Enter bet ID"
      />
      <button onClick={AcceptBetForm}>Accept bet</button>
      </div>
    </div>

  );
};

