import React from "react";

import { Link, useParams } from "react-router-dom";

import { TournamentInfo, find_tournaments_by_player } from "../common";

import Players from ".././players.json";
// import Tournaments from ".././tournaments.json";

const make_flag_url = (short_path: string): string => {
    return `${process.env.PUBLIC_URL}/${short_path}`;
}

export const find_profile_by_player = (player: string) => {
    return Players.find(profile => profile[0] === player) || [];
}

export const count_tournaments_by_year = (year: string, tournaments: Array<TournamentInfo>): number => {
    return tournaments.filter((({date}) => date.substr(0,4) === year)).length;
}


export const PlayerList = () => {
    const arr = Players.slice();
    // const arr2 = arr.map(profile => ({ profile, count: Tournaments.filter(({player_list}) => player_list.includes(profile[0])).length }));
    // arr2.sort((x, y) => y.count - x.count);

    const rows = arr.map((profile /*, count*/, idx) => {
        const [name, country, flag] = profile;
        const escaped_name = name.replace(" ", "+");

        return (
            <tr>
                <td>{idx+1}</td>
                <td>{name}</td>
                <td>{country} <img src={make_flag_url(flag)} alt={country}/></td>
                {/* <td>{count}</td> */}
                <td><Link to={"/players/" + escaped_name}>Profile</Link></td>
            </tr>)
    });

    return (
        <div>
            <Link to="/">Back to main page</Link> <hr />
            <table>
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Name</th>
                        <th>Country</th>
                        {/* <th>Tournaments</th> */}
                        <th>Profile</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
}

const find_rivals_by_player = (name: string, tournaments: Array<TournamentInfo>): Array<[string, number, number]> => {
    const rivals: Set<string> = new Set();
    const count: Map<string, number> = new Map();
    const wins: Map<string, number> = new Map();

    tournaments.forEach(({ player_list, games }) => {
        const id = player_list.findIndex(pl => pl === name);
        games[id].forEach(game => {
            const [opp, result, extra] = game;
            rivals.add(opp);
            count.set(opp, 1 + (count.get(opp) ?? 0));
            if (result === "+") {
                wins.set(opp, 1 + (wins.get(opp) ?? 0));
            }
        });
    });

    const tmp: Array<[string, number, number]> = Array.from(rivals).map(
        pl => [pl, count.get(pl) as number, wins.get(pl) ?? 0]);
    tmp.sort((x, y) => y[1] - x[1]);
    return tmp;
}

const RivalStats = (args: {name: string, tournaments: Array<TournamentInfo>}) => {
    const { name, tournaments } = args;
    const player1_escaped = name.replace(" ", "+");

    const rivals = find_rivals_by_player(name, tournaments);

    const rows = rivals.map((rival, idx) => {
        const [name, games, wins] = rival;
        const percentage = wins === 0 ? 0 : Math.round(wins * 100 / games);
        const escaped_name = name.replace(" ", "+");

        return (
            <tr>
                <td>{idx + 1}</td>
                <td>{name}</td>
                <td>{games}</td>
                <td>{percentage}%</td>
                <td>{wins}</td>
                <td><Link to={"/players/"+escaped_name}>Profile</Link></td>
                <td><Link to={`/h2h/${player1_escaped}/${escaped_name}`}>Head2Head</Link></td>
            </tr>);
    });

    return (
        <div>
            {name} has played against {rivals.length} distinct players during {tournaments.length} tournaments. <br /><br />
            <table>
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Name</th>
                        <th>Games</th>
                        <th>Win %</th>
                        <th>Wins</th>
                        <th>Profile</th>
                        <th>Rivaly</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    );
}

const PlayerStatsByYear = (args: { nice_name: string; tournaments: Array<TournamentInfo> }) => {
    const { nice_name, tournaments } = args;
    const tourney_count = tournaments.length;

    const keys = Array.from(new Set(tournaments.map(({date}) => date.substr(0, 4))));

    const rows = keys.map(key =>
        <tr>
            <td>{key}</td>
            <td>{count_tournaments_by_year(key, tournaments)}</td>
        </tr>
    );

    return (
        <div>
            {nice_name} has participated in {tourney_count} tournaments.
            <br /><br />
            <table>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <hr />
        </div>
    )
}


export const PlayerPage = () => {
    const { player_name = "" } = useParams();
    const nice_name = player_name.replace('+', ' ');
    const [_, country, flag] = find_profile_by_player(nice_name);
    const tournaments = find_tournaments_by_player(nice_name);

    tournaments.sort((t1, t2) => t1.date >= t2.date ? -1 : 1);

    const tournament_html = tournaments.map(({ name, date}) =>
        <tr>
            <td>{name}</td>
            <td>{date}</td>
        </tr>
    );



    return (
        <div>
             <Link to="/">Back to main page</Link> <hr />
            <h2>{nice_name}</h2>
            Player from {country} <img src={make_flag_url(flag)} alt={country}/> <br /> <br />
            <a href={"http://www.shogi.net/fesa/index.php?mid=5&player=" + player_name}>FESA profile</a>
            <h3>Rivals</h3>
            <RivalStats name={nice_name} tournaments={tournaments} />
            <h3>Tournaments</h3>
            <PlayerStatsByYear nice_name={nice_name} tournaments={tournaments} />
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {tournament_html}
                </tbody>
            </table>
        </div>
    );
}
