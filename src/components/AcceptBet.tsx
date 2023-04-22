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
import { BigNumber, ethers } from 'ethers';
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


interface Bet {
  id: BigNumber;
  HomeTeam: string;
  AwayTeam: string;
  gameId: BigNumber;
  price: BigNumber;
  DateTime: string;
  teamName: string;
  challenger: string;
}


const GameTable: React.FC = ({  }) => {


  const classes = useStyles();
  const {address} = useAccount();
  const [betId, setBetId] = useState('')
  const { data: signer, isError, isLoading } = useSigner()
  const [bets, setBets] = useState<Bet[]>([]);
  const ContractAddress = "0x67206ddFf1B347aBdFa02eC3B703145930344977"


  const handleClick = (gameId: number, price: string) => {
    try{
      if(signer){
        console.log(typeof(gameId), gameId);
        let contract = new ethers.Contract(ContractAddress, abi, signer)
        let tx = contract.acceptBet(gameId,  { value: price})
        console.log(tx)
      }
      
    } catch(err) {
      console.error('Error in Accept bet:', err);
    }
  }  

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
    
    setBets(AvailableBets as never)
  }, []);




  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Bet ID</TableCell>
            <TableCell align="right">Home Team</TableCell>
            <TableCell align="right">Away Team</TableCell>
            <TableCell align="right">Game ID</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Date Time</TableCell>
            <TableCell align="right">Winner Team Condition</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bets?.map((row) => {
            if (row.challenger !== address) {
              return (
                <TableRow key={row.gameId.toNumber()}>
                  <TableCell component="th" scope="row">
                    {row.id.toNumber()}
                  </TableCell>
                  <TableCell align="right">{row.HomeTeam}</TableCell>
                  <TableCell align="right">{row.AwayTeam}</TableCell>
                  <TableCell align="right">{row.gameId.toNumber()}</TableCell>
                  <TableCell align="right">{parseInt(row.price.toString()) / 1e18}</TableCell>
                  <TableCell align="right">{row.DateTime}</TableCell>
                  <TableCell align="right">{row.teamName.toString()}</TableCell>
                  <TableCell align="right">
                    <Button
                      className={classes.button}
                      variant="contained"
                      color="primary"
                      onClick={() => handleClick( row.id.toNumber(), row.price.toString())}
                    >
                      Accept
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }
            return null;
          })}
        </TableBody>

      </Table>
    </TableContainer>
  );
};

export default GameTable;
