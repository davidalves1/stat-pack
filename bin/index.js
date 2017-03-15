#! /usr/bin/env node

'use strict';

const https = require('https');
const querystring = require('querystring');
const meow = require('meow');

const cli = meow(`
    Modo de uso
      $ stat-pack <pacote-name> 

    Options
      --period, -p Define um período: last-day, last-week, last-month

      --help, -h Este manual de ajuda

    Exemplos
      $ stat-pack clima-app
	  
      $ stat-pack clima-app -p last-week  
`, {
	alias: {
		p: 'period',
		h: 'help'
	}
});

let pacote = cli.input;

if (pacote.length === 0) {
	console.log('Ops, você precisa informar um pacote!');
	return;
}

let period = 'last-month';

let option = cli.flags.period;

if (option !== undefined)
	period = option;

let valido = ['last-day', 'last-week', 'last-month'].filter((value) => {
	return period === value;
});

if (valido.length === 0) {	
	console.log('Período informado é inválido');
	return;
}
	
https
	.get(`https://api.npmjs.org/downloads/point/${period}/${pacote}`, (response) => {
		let body = '';

		response.on('data', (data) => {
			body += data;
		});

		response.on('error', (e) => {
			console.log('\nOps, parece que algo de errado aconteceu! Informe o problema no link: https://github.com/davidalves1/stat-pack/issues/new\n');
		});

		response.on('end', () => {
			let results = JSON.parse(body);

			if (results.error !== undefined)
				console.log(`Ops, parece que o pacote ${pacote} não foi encontrado`);
			else
				// Verifica o período consultado para exibir a mensagem compatível
				console.log(`O pacote ${pacote} teve ${results.downloads} downloads`,
					period == 'last-day' ? `no dia ${formatDate(results.start)}` : `entre os dias ${formatDate(results.start)} e ${formatDate(results.end)}`);
		});
	});

function formatDate(word) {
	return word.split('-').reverse().join('/')
}
