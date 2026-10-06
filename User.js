const m = require('mongoose');
module.exports = m.model('User', new m.Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true},
  phone:String, password:{type:String,required:true,minlength:6,select:false},
  location:String, village:String, district:String, state:String,
  role:{type:String,enum:['farmer','admin'],default:'farmer'}, status:{type:String,enum:['active','disabled'],default:'active'},
  createdAt:{type:Date,default:Date.now}}));
