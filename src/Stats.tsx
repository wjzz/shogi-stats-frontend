import React from "react";

import "./Stats.css";

import Results from "./all_results.json";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams
  } from "react-router-dom";


const Players = Results.players;
const Tournaments = Results.tournaments

const PlayerList = () => {
    const arr = Players.slice();
    const arr2 = arr.map(profile => ({ profile, count: Tournaments.filter(({player_list}) => player_list.includes(profile[0])).length }));
    arr2.sort((x, y) => y.count - x.count);

    const rows = arr2.map(({ profile, count }, idx) => {
        const [name, country, flag] = profile;
        const escaped_name = name.replace(" ", "+");

        return (
            <tr>
                <td>{idx+1}</td>
                <td>{name}</td>
                <td>{country} <img src={make_flag_url(flag)} alt={country}/></td>
                <td>{count}</td>
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
                        <th>Tournaments</th>
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

const TournamentList = () => {
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

const TournamentPage = () => {
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

const Stats = () => {
    const total_players = Players.length;
    const total_tourneys = Tournaments.length;

    const total_games = Tournaments.reduce((acc, tourney) => acc + (tourney.player_list.length * tourney.rounds) / 2, 0);

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

const make_flag_url = (short_path: string): string => {
    return `${process.env.PUBLIC_URL}/${short_path}`;
}

type TournamentInfo = {
    name: string;
    date: string;
    player_list: Array<string>
    games: Array<Array<Array<string>>>;
};

const find_tournaments_by_player = (player: string): Array<TournamentInfo> => {
    const tournaments = Tournaments.filter(({player_list}) => player_list.includes(player));
    return tournaments;
}

const count_tournaments_by_year = (year: string, tournaments: Array<TournamentInfo>): number => {
    return tournaments.filter((({date}) => date.substr(0,4) === year)).length;
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

const Head2Head = () => {
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

const process_all_games = (): Map<string, [number, number]> => {
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

const Rivals = () => {
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

const find_profile_by_player = (player: string) => {
    return Players.find(profile => profile[0] === player) || [];
}

const PlayerPage = () => {
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

const StatsMain = () =>
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

export default StatsMain;
