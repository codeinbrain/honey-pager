import mongoose, { Schema } from 'mongoose';
import { honeypager } from '../';

const { ObjectId } = Schema.Types;

const schema = mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  }
}, {
  versionKey: false,
  timestamps: true
});

schema.plugin(honeypager);

export default mongoose.model('User', schema);
