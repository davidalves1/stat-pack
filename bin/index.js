#! /usr/bin/env node

'use strict';

const https = require('https');
const querystring = require('querystring');
const meow = require('meow');

const cli = meow(`
    Modo de uso
      $ stat <pacote-name> 

    Options
      --period, -p Define um período: last-day, last-week, last-month

      --help, -h Este manual de ajuda

    Exemplos
      $ stat clima-app
	  
      $ stat clima app -p last-week  
`, {
	alias: {
		p: 'period'
	}
});

let pacote = cli.input;

if (pacote.length === 0) {
	console.log('Ops, você precisa informar um pacote!');
	return;
}

let period = 'last-month';

let option = cli.flags;

if (option.period !== undefined)
	period = option.period;

https
	.get(`https://api.npmjs.org/downloads/point/${period}/${pacote}`, 
		(response) => {
		let body = '';
		response.on('data', (data) => {
			body += data;
		});
		response.on('error', (e) => {
			console.log('\nOps, pacote não encontrado! :(\n');
		});
		response.on('end', () => {

			let results = JSON.parse(body);

			if (results.error !== undefined)
				console.log(`Ops, parece que o pacote ${pacote} não foi encontrado`);
			else {
				console.log(`O pacote ${pacote} teve ${results.downloads} downloads entre os dias ${formatDate(results.start)} e ${formatDate(results.end)}`);
			}

		})
	});

function formatDate(word) {
	return word.split('-').reverse().join('-')
}