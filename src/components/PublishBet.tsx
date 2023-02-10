import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useSigner } from 'wagmi';
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

interface Data {
  GameID: string;
  HomeTeam: string;
  AwayTeam: string;
}

const PublishBet: React.FC = () => {
  const classes = useStyles();
  const [data, setData] = useState<Data[]>([]);
  const { data: signer, isError, isLoading } = useSigner()
  const ContractAddress = "0xAB206d594ae3fE15674e2Fa4Bb4dfe9316Fce822"


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        'https://api.sportsdata.io/v3/nba/scores/json/Games/2023?key=76c2b56ace2845c59e84f30b8a88ad36'
      );
      const result = await response.json();
      setData(result);
    };
    fetchData();
  }, []);

  const handleClick = (gameId: string, homeTeam: string, awayTeam: string) => {
    let price = prompt('Enter the price:');
    let condition = prompt('Enter the condition:');
    

    console.log(`Game ID: ${gameId} Home Team: ${homeTeam} Away Team: ${awayTeam} Price: ${price} Condition: ${condition}`);
    let contract = new ethers.Contract(ContractAddress, abi, signer)
    let tx = contract.publishBet(condition, ethers.utils.parseEther(price.toString()), gameId, {value: ethers.utils.parseEther(price.toString())})
    console.log(tx)
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Game ID</TableCell>
            <TableCell align="right">Home Team</TableCell>
            <TableCell align="right">Away Team</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {data.map(row => (
            <TableRow key={row.GameID}>
              <TableCell component="th" scope="row">
                {row.GameID}
              </TableCell>
              <TableCell align="right">{row.HomeTeam}</TableCell>
              <TableCell align="right">{row.AwayTeam}</TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={() => handleClick(row.GameID, row.HomeTeam, row.AwayTeam)}
                >
                  Publish Bet
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PublishBet;
