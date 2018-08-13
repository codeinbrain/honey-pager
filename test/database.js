import mongoose from 'mongoose';

mongoose.Promise = require('bluebird');

const mongoUrl = "mongodb://localhost:27017/honeypager-test";

export default {
  connect: () => mongoose.connect(mongoUrl, { useNewUrlParser: true }),
  disconnect: () => mongoose.disconnect()
}
