import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import './App.css';

import { Stats } from "./Stats";
import { PlayerPage, PlayerList } from "./players/Players";
import { Head2Head, Rivals } from "./h2h/H2H";
import { TournamentPage, TournamentList } from "./tournaments/Tournaments";

function App() {
  return (
    <Router>
        <Switch>
            <Route path="/h2h/:player1/:player2">
                <Head2Head />
            </Route>
            <Route path="/h2h/">
                <Rivals />
            </Route>

            <Route path="/tournaments/:id">
                <TournamentPage />
            </Route>
            <Route path="/tournaments">
                <TournamentList />
            </Route>

            <Route path="/players/:player_name">
                <PlayerPage />
            </Route>
            <Route path="/players">
                <PlayerList />
            </Route>

            <Route path="/">
                <Stats />
            </Route>
        </Switch>
    </Router>
  );
}

export default App;