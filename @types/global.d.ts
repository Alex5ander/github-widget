import { MongoClient } from 'mongodb';
declare global {
  var mongoose: MongoClient;
}
