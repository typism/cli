import chalk from 'chalk';

export function logWithColor(color: string, str: string): void {
  console.log(chalk.keyword(color)(str));
}

