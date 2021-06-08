import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs';

import { readAndParse } from './parse-types';
import { logSchemas } from './log-schemas';
import { modelsUpdate } from './api';
import { logWithUnderline } from './utils/log-with-underline';

function usage() {
  console.log(`
The deploy command will deploy your types to your app.

Usage:
  typism deploy <flags>

Flags:
  --url              URL for your typism server
  --token            Token for authenication request on server
  -t, --types        Location of type file "./types.ts"
  -f, --force        Disable the confirmation step (great for usage with CIs)

Global Flags:
  -h, --help         Show this help message
`);
}

interface Options {
  url: string;
  token: string;
  types: string;
  force: boolean;
  help: boolean;
}

function parseArgumentsIntoOpts(rawArgs: string[]): Partial<Options> {
  const args: any = arg(
    {
      '--url': String,
      '--token': String,
      '--types': String,
      '--force': Boolean,
      '--help': Boolean,

      // Aliases
      '-t': '--types',
      '-f': '--force',
      '-h': '--help',
    },
    {
      argv: rawArgs.slice(2),
    },
  );

  return {
    url: args['--url'],
    token: args['--token'],
    types: args['--types'],
    force: args['--force'],
    help: args['--help'],
  };
}

async function promptForMissingOpts(opts: Partial<Options>): Promise<Options> {
  const questions = [];

  if (!opts.url) {
    questions.push({
      type: 'input',
      name: 'url',
      message: 'Enter your url',
    });
  }

  if (!opts.token) {
    questions.push({
      type: 'token',
      name: 'token',
      message: 'Enter your token',
    });
  }

  if (!opts.types) {
    questions.push({
      type: 'input',
      name: 'types',
      message: 'Enter location of type file',
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    ...opts,
    ...answers,
  } as Options;
}

export async function deploy(args: string[]): Promise<void> {
  const optsInput: Partial<Options> = parseArgumentsIntoOpts(args);

  let currentConfig: any;
  try {
    currentConfig = fs.readFileSync('./typism.json', { encoding: 'utf8', flag: 'r' });
  } catch (err) {
    // no file found
  }

  if (currentConfig) {
    console.log('Existing typism config found');
    const conf = JSON.parse(currentConfig);
    if (!optsInput.url && conf.url) {
      optsInput.url = conf.url;
      console.log('Using url from config');
    }
    if (!optsInput.token && conf.token) {
      optsInput.token = conf.token;
      console.log('Using token from config');
    }
    if (!optsInput.types && conf.types) {
      optsInput.types = conf.types;
      console.log('Using types location from config');
    }
  }

  if (optsInput.help) return usage();
  const opts: Options = await promptForMissingOpts(optsInput);

  try {
    const schemas = readAndParse(opts.types);

    // confirm changes
    logSchemas(schemas);

    if (!opts.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to deploy this?',
        },
      ]);

      if (!confirm) return;
    }

    // NOTE don't catch this, as it deals with the error itself
    const errs = await modelsUpdate({ schemas, url: opts.url });
    if (errs !== 'OK') {
      console.log(logWithUnderline('Failed to update due to errors:'));
      errs.forEach((err: string) => console.log(err));
      // ERROR for
    } else {
      console.log(`types deployed`);

      // IF deployment was successful and typism.json doesn't exist
      // save opts into typism.json
      if (!currentConfig) {
        fs.writeFileSync(
          'typism.json',
          `{
  "url": "${opts.url}",
  "token": "${opts.token}",
  "types": "${opts.types}"
}`,
        );
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}
