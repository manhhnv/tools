import { MongoClient } from 'mongodb';
import { DB_URI } from './constants';

const createConnection = async () => {
  const client = new MongoClient(DB_URI);
  await client.connect();
  return client;
};

export default createConnection;
