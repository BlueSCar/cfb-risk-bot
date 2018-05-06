module.exports = (db) => {
    let getSchoolList = async () => {
        let teams = await db.any('SELECT name FROM team ORDER BY name');
        let block = '```\r\n';
        let values = teams.map(t => `${t.name}\r\n`);
        for (let val of values) {
            block += val;
        }

        block += '```';

        return block;
    }

    let getStarPower = async () => {
        let turn = await getCurrentTurn();
        let teams = await db.any('SELECT t.name, COUNT(pt.id) as players, SUM(pt.stars) as stars FROM team t INNER JOIN player_turn pt ON t.id = pt.team_id WHERE pt.turn = $1 GROUP BY t.name ORDER BY SUM(pt.stars) DESC', [turn.max]);

        let max = Math.max(...teams.map(t => t.name.length));
        let buffer = '    ';

        let block = '```\r\nteam' + ' '.repeat(max) + 'players\tstars\r\n';
        let values = teams.map(t => `${t.name}${buffer}${' '.repeat(max - t.name.length)}${t.players}\t\t${t.stars}\r\n`);
        for (let val of values) {
            block += val;
        }

        block += '```';

        return block;
    }

    let getTerritoryStats = async (territory, turn) => {
        if (!territory) {
            return;
        }

        if (!turn) {
            let current = await getCurrentTurn();
            turn = --current.max;
        }

        let teams = await db.any('SELECT att.name as team, COUNT(pt.id) as players, SUM(pt.stars * pt.multiplier) AS stars FROM team t INNER JOIN territory_turn tt ON t.id = tt.territory_id INNER JOIN player_turn pt ON tt.territory_id = pt.territory_id AND tt.turn = pt.turn AND tt.game = pt.game INNER JOIN team att ON pt.team_id = att.id WHERE LOWER(t.name) = LOWER($1) AND tt.turn = $2 GROUP BY att.name ORDER BY SUM(pt.stars * pt.multiplier) DESC', [territory, turn]);

        let max = Math.max(...teams.map(t => t.team.length));
        let buffer = '    ';

        let block = '```\r\nteam' + ' '.repeat(max) + 'players\tstars\r\n';
        let values = teams.map(t => `${t.team}${buffer}${' '.repeat(max - t.team.length)}${t.players}\t\t${t.stars}\r\n`);
        for (let val of values) {
            block += val;
        }

        block += '```';

        return block;
    }

    let getTeamAttacksByTerritory = async (team, turn) => {
        if (!team) {
            return;
        }

        if (!turn) {
            let current = await getCurrentTurn();
            turn = --current.max;
        }

        let moves = await db.any("SELECT ter.name, COUNT(pt.id) as players, SUM(pt.stars * pt.multiplier) as stars FROM team t INNER JOIN player_turn pt ON t.id = pt.team_id INNER JOIN team ter ON pt.territory_id = ter.id WHERE LOWER(t.name) = LOWER($1) AND pt.turn = $2 GROUP BY ter.name ORDER BY stars DESC", [team, turn]);

        let max = Math.max(...moves.map(t => t.name.length));
        let buffer = '    ';

        let block = '```\r\nterritory' + ' '.repeat(max - 5) + 'players\tstars\r\n';
        let values = moves.map(t => `${t.name}${buffer}${' '.repeat(max - t.name.length)}${t.players}\t\t${t.stars}\r\n`);
        for (let val of values) {
            block += val;
        }

        block += '```';

        return block;
    }

    let getTeamAttacksByOpponent = async (team, turn) => {
        if (!team) {
            return;
        }

        if (!turn) {
            let current = await getCurrentTurn();
            turn = --current.max;
        }

        let moves = await db.any("SELECT opp.name, COUNT(pt.id) as players, SUM(pt.stars * pt.multiplier) as stars FROM team t INNER JOIN player_turn pt ON t.id = pt.team_id INNER JOIN team ter ON pt.territory_id = ter.id INNER JOIN territory_turn tt ON pt.territory_id = tt.territory_id AND pt.game = tt.game AND pt.turn = tt.turn INNER JOIN team opp ON tt.occupier_id = opp.id WHERE LOWER(t.name) = LOWER($1) AND pt.turn = $2 GROUP BY opp.name ORDER BY stars DESC", [team, turn]);

        let max = Math.max(...moves.map(t => t.name.length));
        let buffer = '    ';

        let block = '```\r\occupier' + ' '.repeat(max - 5) + 'players\tstars\r\n';
        let values = moves.map(t => `${t.name}${buffer}${' '.repeat(max - t.name.length)}${t.players}\t\t${t.stars}\r\n`);
        for (let val of values) {
            block += val;
        }

        block += '```';

        return block;
    }

    let getUserMoves = async (user) => {
        if (!user) {
            return;
        }

        let moves = await db.any('SELECT pt.turn, t.name as team, ter.name as territory, stars, multiplier, mvp FROM player p INNER JOIN player_turn pt ON p.id = pt.player_id INNER JOIN team t ON pt.team_id = t.id INNER JOIN team ter ON pt.territory_id = ter.id WHERE LOWER(p.name) = LOWER($1) ORDER BY pt.turn', [user]);

        let block = '```\r\nturn\tstars\tmultiplier\tmvp\tteam\t\t\tterritory\r\n';
        let values = moves.map(m => `${m.turn}\t\t${m.stars}\t\t${m.multiplier}\t\t\t${m.mvp}\t${m.team}\t${m.territory}\r\n`);
        for (let val of values) {
            block += val;
        }

        block += '```';

        return block;
    }

    let getCurrentTurn = async () => {
        return await db.one('SELECT MAX(turn) FROM player_turn LIMIT 1');
    }

    return {
        getSchoolList,
        getStarPower,
        getTerritoryStats,
        getUserMoves,
        getTeamAttacksByTerritory,
        getTeamAttacksByOpponent
    }
}