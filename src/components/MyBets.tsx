import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount, useConnect, useContractRead, useSigner, useContractWrite } from 'wagmi';
import { ethers } from 'ethers';
const { abi } = require('../abi.json');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      minWidth: 650,
    },
    button: {
      margin: theme.spacing(1),
    },
  })
);

interface Bet {
  id: number;
  gameId: number;
  price: number;
  teamId: number;
  status: string;
  HomeTeam: string;
  teamName: string;
  AwayTeam: string;
}

const MyBets: React.FC = () => {
  const classes = useStyles();
  const { address } = useAccount();
  const [bets, setBets] = useState<Bet[]>([]);
  const [betId, setBetId] = useState('');
  const { data: signer, isError: signerError, isLoading: signerLoading } = useSigner();
  const ContractAddress = '0x436925b7ECaf17818CcE9ef9F715D54B9B917aC2';

  const handleClick = async (gameId: number) => {
    try {
      if (!signer) throw new Error('Signer not available');
      let contract = new ethers.Contract(ContractAddress, abi, signer);
      let tx = await contract.cancelBet(gameId);
    } catch (err) {
      console.error('Error in cancel bet:', err);
    }
  };

  const contractConfig = {
    address: ContractAddress,
    abi: abi,
  };

  const { data: UserBets, isError: userBetsError, isLoading: userBetsLoading } = useContractRead({
    ...contractConfig,
    functionName: 'getUserBets',
    watch: true,
    chainId: 80001,
    overrides: { from: address },
  });

  useEffect(() => {
    if (!userBetsError) {
      console.log(UserBets);
      setBets(UserBets as never);
    } else {
      console.error('Error in get user bets:', userBetsError);
    }
  }, [UserBets, userBetsError]);




    return (
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Bet ID</TableCell>
                <TableCell>Home Team</TableCell>
                <TableCell>Away Team</TableCell>
                <TableCell>Game Id</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Winner Team condition</TableCell>
                <TableCell>Status</TableCell>
                <TableCell >Action</TableCell>

            </TableRow>
            </TableHead>
            <TableBody>
                {bets?.map((bet) => (
                    <TableRow key={bet.id.toString()}>
                    <TableCell>{bet.id.toString()}</TableCell>
                    <TableCell>{bet.HomeTeam}</TableCell>
                    <TableCell>{bet.AwayTeam}</TableCell>
                    <TableCell>{bet.gameId.toString()}</TableCell>
                    <TableCell>{bet.price / 1e18}</TableCell>
                    <TableCell>{bet.teamName.toString()}</TableCell>
                    <TableCell>{bet.status}</TableCell>
                    <TableCell>
                        {bet.status === "Published" && (
                            <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            onClick={() => handleClick(bet.id)}
                            >
                            Cancel
                            </Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </TableContainer>
    );
};

export default MyBets;
