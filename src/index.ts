import { deploy } from './deploy';

function usage() {
  console.log(`
A command-line tool to manage your typism apps.

Usage:
  typism <command>

Commands:
  deploy:    Deploy types to your app
  help:      Show this help message
`);
}

export async function cli(args: string[]): Promise<void> {
  const command = args[2];

  if (!command) {
    return usage();
  }

  switch (command) {
    case 'deploy':
      deploy(args);
      break;
    case 'help':
      usage();
      break;
    default:
      console.log('invalid command');
      usage();
      break;
  }
}

process.on('unhandledRejection', (err: Error) => {
  console.log(err.message);
});
