import React from 'react';

import Result from './Result';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import {generateRandomSheet} from '../functions/general';


const useStyles = makeStyles((theme) => ({
    root: {
        padding: '0 30px',
    },
    appbar: {
        background: 'rgb(209, 50, 53);',
    },
    title: {
        flexGrow: 1,
    },
    button: {
        background: 'rgb(209, 50, 53);',
        color: "#FAFAFA",
    },
    input: {
        color: 'rgb(209, 50, 53)',
    },
    formControl: {
        display: 'flex',
        margin: theme.spacing(1),
    }
}));

const MainScreen = () => {
    const classes = useStyles();

    // const randomSheet = generateRandomSheet();
    const [randomSheet, setRandomSheet] = React.useState();

    const onClickGenerate = () => {
        const randomSheet = generateRandomSheet();
        setRandomSheet(randomSheet);
    };
    
    return (
        <div>
            <AppBar position="static" className={classes.appbar}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Gerador de Ficha - Tormenta 20
                    </Typography>
                </Toolbar>
            </AppBar>
            
            <div style={{margin: '20px', display: 'flex'}}>
                <Button variant="contained" onClick={onClickGenerate} className={classes.button}>
                    Gerar Ficha
                </Button>
            </div>
    
            {randomSheet && (
                <Result sheet={randomSheet} />
            )}
        </div>
    )
};

export default MainScreen;