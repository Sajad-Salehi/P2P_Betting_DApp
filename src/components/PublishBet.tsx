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
import { useSigner, useContractRead } from 'wagmi';
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
  GameID: number;
  HomeTeam: string;
  AwayTeam: string;
  DateTime: string;
  IsClosed: boolean;
  AwayTeamID: number;
  HomeTeamID: number;
}

const PublishBet: React.FC = () => {
  const classes = useStyles();
  const [data, setData] = useState<Data[]>([]);
  const [currentId, setCurrentGame] = useState<number>();
  const { data: signer, isError, isLoading } = useSigner()
  const ContractAddress = "0x436925b7ECaf17818CcE9ef9F715D54B9B917aC2"



  const contractConfig = {
    address: ContractAddress,
    abi: abi,
  }

  const { data: GameID } = useContractRead({
    ...contractConfig,
    functionName: 'currentGameId',
    watch: true,
    chainId: 80001,
  });

  useEffect(() => {
    try{
      console.log(GameID)
      setCurrentGame(GameID as number)
    } catch(err) {
      console.log("Error: ", err)
    }
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.sportsdata.io/v3/nba/scores/json/Games/2023?key=76c2b56ace2845c59e84f30b8a88ad36'
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleClick = (gameId: number, homeTeam: string, awayTeam: string, dataTime: string, homeId: number, awayId: number) => {

    let _teamId;
    let price = prompt('Enter the price:');
    if (!price || isNaN(parseFloat(price))) {
      alert("Invalid price input");
      return;
    }

    let condition = prompt('Enter the name of Winner Team: ');
    if (condition !== awayTeam && condition !== homeTeam) {
      alert("Invalid Team Name")
      return;
    }
    if (condition === awayTeam){
      _teamId = awayId
    }
    if (condition === homeTeam){
      _teamId = homeId
    }


   
    console.log(_teamId, typeof(_teamId))
    let priceToWei = ethers.utils.parseEther(price);
    try {
      if (signer) {
        let contract = new ethers.Contract(ContractAddress, abi, signer)
        let tx = contract.publishBet(priceToWei, gameId, homeTeam, awayTeam, dataTime, _teamId, condition, {value: priceToWei})
        console.log(tx)
      }
    }catch (err) {
      console.error('Error in publish bet:', err);
    }

    
    
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Game ID</TableCell>
            <TableCell align="right">Home Team</TableCell>
            <TableCell align="right">Away Team</TableCell>
            <TableCell align="right">Date Time</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .sort((a, b) => a.GameID - b.GameID)
            .filter(row => currentId && row.GameID > currentId)
            .slice(10, 30)
            .map(row => (
              <TableRow key={row.GameID}>
                <TableCell component="th" scope="row">
                  {row.GameID}
                </TableCell>
                <TableCell align="right">{row.HomeTeam}</TableCell>
                <TableCell align="right">{row.AwayTeam}</TableCell>
                <TableCell align="right">{row.DateTime}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => handleClick(row.GameID, row.HomeTeam, row.AwayTeam, row.DateTime, row.HomeTeamID, row.AwayTeamID)}
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
