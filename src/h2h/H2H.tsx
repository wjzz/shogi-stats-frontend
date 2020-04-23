import React from "react";

import { useParams } from "react-router-dom";

import { find_tournaments_by_player } from "../common";

import Tournaments from ".././tournaments.json";

export const Head2Head = () => {
    const { player1 = "", player2 = "" } = useParams();

    const p1 = player1.replace("+", " ");
    const p2 = player2.replace("+", " ");


    let h2h_games: Array<[string, string, string, string]> = [];

    find_tournaments_by_player(p1).forEach(({name, date, games, player_list}) => {
        const p1_idx = player_list.findIndex(p => p === p1);
        games[p1_idx].forEach(game => {
            const [opp, result, extra] = game;
            if (opp === p2){
                h2h_games.push([name, date, result, extra]);
            }
        });
    });

    h2h_games.sort((t1, t2) => t1[1] < t2[1] ? 1 : -1);

    const rows = h2h_games.map((game, idx) => {
        const [name, date, result, extra] = game;

        return (
            <tr>
                <td>{idx + 1}</td>
                <td>{name}</td>
                <td>{date}</td>
                <td>{result === "+" ? "WIN" : ""}</td>
                <td>{extra}</td>
            </tr>
        )
    });

    return (
        <div>
            <h1>Head to head</h1>
            <h2>{p1} vs {p2}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Tournament</th>
                        <th>Date</th>
                        <th>Result</th>
                        <th>Extra</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
}

export const process_all_games = (): Map<string, [number, number]> => {
    const all_games: Map<string, [number, number]> = new Map();
    Tournaments.forEach(({ games, player_list }) => {
        player_list.forEach(player => {
            const player_idx = player_list.findIndex(pl => pl === player);
            games[player_idx].forEach(data => {
                const [opp, result, extra] = data;
                if (player < opp) {
                    const key = `${player}#${opp}`;
                    const [total_games, total_wins] = all_games.get(key) ?? [0,0];
                    all_games.set(key, [total_games+1, result === "+" ? total_wins + 1 : total_wins]);
                }
            })
        })
    });
    return all_games;
}

export const Rivals = () => {
    const all_games = process_all_games();

    const cutoff = 15;

    const filtered_games = Array.from(all_games.keys()).filter(arg => {
        const [all, wins] = all_games.get(arg)!;
        return all > cutoff;
    });

    filtered_games.sort((x, y) => all_games.get(x)![0] < all_games.get(y)![0] ? 1 : -1);

    const rows = filtered_games.map(key => {
        const [p1r, p2r] = key.split("#");
        const [all, winsr] = all_games.get(key)!;

        const [p1, p2, wins] = winsr * 2 >= all ? [p1r, p2r, winsr] : [p2r, p1r, all-winsr];

        return (
            <tr>
                <td>{p1}</td>
                <td>{p2}</td>
                <td>{all}</td>
                <td>{wins}</td>
                <td>{all-wins}</td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Rivals with the most games between them</h1>
            There are {Array.from(all_games.keys()).length} pairs.
            There are {filtered_games.length} pairs with more than {cutoff} games.
            <hr />
            <table>
                <thead>
                    <tr>
                        <th>Player1</th>
                        <th>Player2</th>
                        <th>Total games</th>
                        <th>Total wins by #1</th>
                        <th>Total wins by #2</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
}
