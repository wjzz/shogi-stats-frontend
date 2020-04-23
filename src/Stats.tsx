import React from "react";
import { Link } from "react-router-dom";

import "./Stats.css";

import Players from "./players.json";
import Tournaments from "./tournaments.json";

export const Stats = () => {
    const total_players = Players.length;
    const total_tourneys = Tournaments.length;

    const total_games = Tournaments.reduce((acc, tourney) =>
        acc + (tourney.player_list.length * tourney.rounds) / 2, 0);

    return (
        <div>
            <h1>FESA Shogi Tournament Stats</h1>
            There are {total_players} players in the DB. <Link to="/players">See all</Link> <br />
            <Link to="/h2h/">See best rivalies</Link>
            <hr />
            There are (approx) {total_games} total games played in the DB.
            <hr />
            There are {total_tourneys} tournaments in the DB. <Link to="/tournaments">See all</Link>
        </div>
    );
};