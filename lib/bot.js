module.exports = (Discord, risk) => {
    const client = new Discord.Client();
    const guildId = process.env.GUILD_ID;

    const inputPattern = /^\[{2}([^\[\]]+)\]{2}$/g;

    const methods = {
        "schools": risk.getSchoolList,
        "territories": risk.getSchoolList,
        "power": risk.getStarPower,
        "territory": risk.getTerritoryStats,
        "user": risk.getUserMoves,
        "team_ter": risk.getTeamAttacksByTerritory,
        "team_opp": risk.getTeamAttacksByOpponent
    }

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', async msg => {
        if (msg.guild.id != guildId) {
            return;
        }
        let match = inputPattern.exec(msg.content);
        if (match && match.length > 1) {
            let input = match[1].split(',').map(i => i.trim().toLowerCase());
            if (input.length) {
                let method = methods[input.shift()];

                if (method) {
                    let response = await method(...input);
                    if (response) {
                        msg.channel.send(response);
                    }
                }
            }
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}