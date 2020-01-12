import { ICPConnection } from './client';
import { ICPServer } from './server';

console.warn(`You are importing whole icp base, instead of doing
import { ICPServer }from 'icp'
use 
import { ICPServer }from 'icp/server'
`);

export default {
  ICPConnection,
  ICPServer
};
