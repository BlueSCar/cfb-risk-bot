(async() => {
    const dotEnv = require('dotenv');
    dotEnv.config();

    const db = require('./config/database')(require('bluebird'), require('pg-promise'));
    const Discord = require('discord.js');
    const risk = require('./lib/risk')(db);

    require('./lib/bot')(Discord, risk);
})()
.catch(err => {
  console.log(err);  
});