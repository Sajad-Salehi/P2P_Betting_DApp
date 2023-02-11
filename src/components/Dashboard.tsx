import React, { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AcceptBet from './AcceptBet';
import PublishBet from './PublishBet';
import MyBets from './MyBets';
import { ConnectButton } from '@rainbow-me/rainbowkit';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f1f1f1'
    },
    button: {
      margin: theme.spacing(1),
      width: '150px',
      height: '50px',
      fontWeight: 'bold'
    },
    box: {

      width: "60%",
      height: "80%",
      backgroundColor: 'blue',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  })
);

interface Props {}

const MainPage: React.FC<Props> = () => {
  const classes = useStyles();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);

  const handleClick = (option: string) => {
    setSelectedOption(option);
    setShowBack(true);
  };

  const handleBack = () => {
    setSelectedOption(null);
    setShowBack(false);
  };

  return (
    <div >
      <ConnectButton />
      {!selectedOption && (
        <div>
          <h1>Bet User Dashboard</h1>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick('accept')}
          >
            Accept Bet
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick('publish')}
          >
            Publish Bet
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleClick('list')}
          >
            My Bets
          </Button>
        </div>
      )}
      {showBack && (
        <Button variant="contained" color="secondary" onClick={handleBack}>
          Back
        </Button>
      )}
      {selectedOption === 'accept' && <AcceptBet />}
      {selectedOption === 'publish' && <PublishBet />}
      {selectedOption === 'list' && <MyBets />}
      
    </div>
  );
};

export default MainPage;
