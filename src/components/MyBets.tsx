import React from 'react';
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
import { useAccount, useConnect, useContractRead, useSigner, useContractWrite  } from 'wagmi'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
const {abi} = require('../abi.json')


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

const MyBets: React.FC = ({  }) => {


    interface Bet {
        id: number;
        gameId: number;
        price: number;
        teamId: number;
        status: string;
        HomeTeam: string
    
    }

    const classes = useStyles();
    const {address} = useAccount();
    const [bets, setBets] = useState<Bet[]>([]);
    const [betId, setBetId] = useState('')
    const { data: signer, isError, isLoading } = useSigner()
    const ContractAddress = "0x16C957EDF52601165373c97d0316c2ca5A71b121"


    const handleClick = (gameId: number) => {

        let contract = new ethers.Contract(ContractAddress, abi, signer)
        let tx = contract.cancelBet(gameId)
    };


    const contractConfig = {
        address: ContractAddress,
        abi: abi,
    }

    const { data: UserBets } = useContractRead({
        ...contractConfig,
        functionName: 'getUserBets',
        watch: true,
        chainId: 80001,
        overrides: { from: address },

    });

    useEffect(() => {
        
        console.log(UserBets)
        setBets(UserBets)
    }, []);




    return (
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Bet ID</TableCell>
                <TableCell>Home Team</TableCell>
                <TableCell>Game Id</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Winner Team ID Condition</TableCell>
                <TableCell>Status</TableCell>
                <TableCell >Action</TableCell>

            </TableRow>
            </TableHead>
            <TableBody>
                {bets?.map((bet) => (
                    <TableRow key={bet.id.toNumber()}>
                    <TableCell>{bet.id.toNumber()}</TableCell>
                    <TableCell>{bet.HomeTeam}</TableCell>
                    <TableCell>{bet.gameId.toNumber()}</TableCell>
                    <TableCell>{bet.price.toNumber() / 1e18}</TableCell>
                    <TableCell>{bet.teamId.toNumber()}</TableCell>
                    <TableCell>{bet.status}</TableCell>
                    <TableCell>
                        {bet.status === "Published" && (
                            <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            onClick={() => handleClick(bet.id.toNumber())}
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
