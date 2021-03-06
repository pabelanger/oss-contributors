#!/usr/bin/env node
/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const yargs = require('yargs');
const db_to_json = require('../src/db-to-json.js');
const json_to_bigquery = require('../src/json-to-bigquery.js');
const update_db = require('../src/update-db.js');
const rank = require('../src/rank.js');

yargs
    .command('db-to-json <output>', 'create a (huge) json blob of user-to-company associations based on database records', {
        output: {
            alias: 'o',
            demandOption: 'You must specify an output file to write to.',
            desc: 'Output file to write DB to (in JSON)'
        }
    }, db_to_json)
    .command('json-to-bigquery <input> <output>', 'send a JSON blob of user-to-company associations to a bigquery table', {
        input: {
            alias: 'i',
            demandOption: 'You must specify an input file to read from, the output of the `db-to-json` command.',
            desc: 'JSON file to send to BigQuery'
        },
        output: {
            alias: 'o',
            default: 'users_companies',
            desc: 'BigQuery table to send data to'
        }
    }, json_to_bigquery)
    .command('update-db <source> [db-json]', 'update user-to-company database based on source-table, optionally providing a db.json db cache (to speed things up)', {
        source: {
            alias: 's',
            demandOption: 'You must provide a BigQuery table name as a GitHub.com activity source!',
            desc: 'BigQuery table name housing GitHub.com activity data'
        },
        'db-json': {
            alias: 'j',
            demandOption: 'You must provide a db.json cache file.',
            desc: 'Local file storing GitHub username to company associations (with ETags), used to speed up processing'
        }
    }, update_db)
    .command('rank <source> [limit] [db-json]', 'show top [limit] companies based on number of active GitHubbers, parsed from the <source> BigQuery table', {
        source: {
            alias: 's',
            demandOption: 'You must provide a BigQuery table name as a GitHub.com activity source!',
            desc: 'BigQuery table name housing GitHub.com activity data'
        },
        limit: {
            alias: 'l',
            desc: 'How many top companies to show?',
            default: null,
            defaultDescription: 'Shows up to and including Adobe'
        },
        'db-json': {
            alias: 'j',
            demandOption: 'You must provide a db.json cache file.',
            desc: 'Local file storing GitHub username to company associations (with ETags), used to speed up processing'
        }
    }, rank)
    .env('OSS')
    .option('db-server', {
        alias: 'd',
        default: 'leopardprdd',
        desc: 'Database server name'
    })
    .option('db-user', {
        alias: 'u',
        default: 'GHUSERCO',
        desc: 'Database username'
    })
    .option('db-password', {
        demandOption: 'You must provide a database password!',
        type: 'string'
    })
    .option('db-name', {
        alias: 'n',
        default: 'GHUSERCO',
        desc: 'Database name'
    })
    .option('table-name', {
        alias: 't',
        default: 'usercompany',
        desc: 'Database table name'
    })
    .option('db-port', {
        alias: 'p',
        default: 3323,
        desc: 'Database port'
    })
    .argv;
