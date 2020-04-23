import React from "react";

import { Link, useParams } from "react-router-dom";

import Tournaments from ".././tournaments.json";

export const TournamentList = () => {
    const arr = Tournaments.slice();
    arr.sort((t1, t2) => t1.date <= t2.date ? -1 : 1);

    const rows = arr.map(({ name, date, player_list, rounds }) => {
        const idx = Tournaments.findIndex(t => t.name === name);

        return (
            <tr>
                <td><Link to={"/tournaments/" + idx}>{name}</Link></td>
                <td>{date}</td>
                <td>{player_list.length}</td>
                <td>{rounds}</td>
            </tr>)
    });

    return (
        <div>
            <Link to="/">Back to main page</Link> <hr />
            Full list of tournaments: <br />
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Num players</th>
                        <th>Num rounds</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
}

export const TournamentPage = () => {
    const { id = "" } = useParams();

    const { date, name, player_list, rounds } = Tournaments[Number(id)];

    const results = player_list.map((name, idx) => (
        <tr>
            <td>{idx}</td>
            <td>{name}</td>
        </tr>
    ));

    return (
        <div>
            <Link to="/tournaments">Back to tournament list</Link> <hr />
            <h1>{name}</h1>
            <h3>{date}</h3>
            {rounds} rounds <br />
            {player_list.length} players <br />
            <h4>Results</h4>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {results}
                </tbody>
            </table>
        </div>
    );
}
