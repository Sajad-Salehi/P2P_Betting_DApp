import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount, useConnect, useDisconnect, useProvider, useSigner } from 'wagmi'
import MainPage from '../components/MainPage';
import Dashboard from '../components/Dashboard';



export default function IndexPage() {
  
  const { address, isConnected } = useAccount()
  const [hydrated, setHydrated] = useState(false);
	
  useEffect(() => {
		setHydrated(true);
	}, []);
	
  if (!hydrated) {
		return null;
	}
  
  return (
    
    <div>

      {isConnected? (

        <Dashboard /> ):(

        <MainPage />
      )}

    </div>
  );
};

