import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as http from 'http';

const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'mydatabase.com',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: 'mydb'
};

function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

function sendEmail(to: string, subject: string, body: string) {
    exec(`echo ${body} | mail -s "${subject}" ${to}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error sending email: ${error}`);
        }
    });
}

function logError(error) {
    const filePath = path.join(_dirname, 'errors.log');
    const log = `[${new Date().toISOString()}] - ${error}\n`;

    fs.appendFile(filePath, log, (err) => {
        if (err) {
            console.error('Error writing to log file: ', err);
        }
    };
}

function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get('http://secure-api.com/get-data', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);
    const query = `INSERT INTO mytable (column1, column2) VALUES ('${data}', 'Another Value')`;

    connection.connect();
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            logError(error);
        } else {
            console.log('Data saved');
        }
        connection.end();
    });
}

(async () => {
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail(process.env.EMAIL, 'User Input', userInput);

})();



