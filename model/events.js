const mongoose = require('mongoose');

const publiceventSchema = new mongoose.Schema({
  title: {
    type:String,
    required: true
  },
  description: {
    type:String,
    required: true
  },
  content: {
    type:String,
    required: true
  },
  organiser: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
  },
  name: {
    type:String,
    required:true
  },
  createdAt: {
    type:Date,
    default: new Date()
  },
  ppl_accepted: {
    type: Array,
    default:[]
  },
  ppl_reject: {
    type: Array,
    default:[]
  }
});

const Publicevent = mongoose.model('Publicevent' ,  publiceventSchema);


const privateeventSchema = new mongoose.Schema({
  title: {
    type:String,
    required: true
  },
  description: {
    type:String,
    required: true
  },
  content: {
    type:String,
    required: true
  },
  organiser: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
  },
  name: {
    type:String,
    required:true
  },
  createdAt: {
    type:Date,
    default: new Date()
  },
  close_friends:{
    type:Array,
    required:true

  },
  ppl_accepted: {
    type: Array
  },
  ppl_reject: {
    type: Array
  }
});

const Privateevent = mongoose.model('Privateevent' , privateeventSchema);

module.exports = { Publicevent,Privateevent };
