import Tournaments from "./tournaments.json";

export type TournamentInfo = {
    name: string;
    date: string;
    player_list: Array<string>
    games: Array<Array<Array<string>>>;
};

export const find_tournaments_by_player = (player: string): Array<TournamentInfo> => {
    const tournaments = Tournaments.filter(({player_list}) => player_list.includes(player));
    return tournaments;
}
