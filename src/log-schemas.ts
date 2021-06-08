import chalk from 'chalk';

import { Model } from './parse-types';
import { logWithColor } from './utils/log-with-color';
import { strPadding } from './utils/str-padding';

const columns = [15, 26, 30];

export function logSchemas(schemas: Model[]) {
  logWithColor(
    'white',
    `
Deploying types
  `,
  );

  // row titles
  console.log(
    // 'grey',
    chalk.black.bgWhite(
      strPadding('Schema', columns[0]) + ' ' + strPadding('Field', columns[1]) + ' ' + strPadding('Type', columns[2]),
    ),
  );
  console.log('');

  // schemas
  schemas.forEach(schema => {
    // logWithColor('grey', logWithUnderline(`SCHEMA: ${schema.name}`));
    Object.keys(schema.fields).forEach((k, i) => {
      const f = schema.fields[k];

      const schemaName = strPadding(String(i === 0 ? schema.name : ''), columns[0]);
      const fieldName = strPadding(String(k), columns[1]);
      const fieldType = String(f.type);
      const arrayInfo = f.type === 'array' ? `of ${f.listType}s ` : '';
      const refInfo = f.type === 'reference' ? `to ${f.referenceType} ` : '';
      const required = f.opts.required ? chalk.grey('(required)') : '';

      console.log(`${schemaName} ${fieldName} ${fieldType} ${arrayInfo}${refInfo}${required}`);
    });
    console.log(' ');
  });
}
