#!/usr/bin/env node

require('dotenv').config({ silent: true });
const package = require('../package.json');
const program = require('commander');

program
  .description('Manages the FileDepot server')
  .version(package.version)
  .command('create [path]', 'Create a new bucket where files are stored at [path]')
  .command('remove [bucketId]', 'Remove a bucket and delete all files in the bucket')
  .command('list', 'list all buckets', {isDefault: true})
  .command('key [bucketId] [origin]', 'Creates an access key for a bucket from an origin')
  .command('revoke [keyId]', 'Revokes the access of a given key')
  .command('keys [bucketId]', 'List of access keys of a bucket')
  .parse(process.argv);
