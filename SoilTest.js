const m = require('mongoose');
module.exports = m.model('SoilTest', new m.Schema({
  userId:{type:m.Schema.Types.ObjectId,ref:'User',required:true},
  farmerName:String, location:String, village:String, district:String, state:String,
  soilType:String, crop:String, previousCrop:String, irrigationType:String,
  ph:{type:Number,min:0,max:14,required:true}, nitrogen:{type:Number,min:0,required:true}, phosphorus:{type:Number,min:0,required:true},
  potassium:{type:Number,min:0,required:true}, organicCarbon:{type:Number,min:0,max:100,required:true}, moisture:{type:Number,min:0,max:100,required:true},
  testDate:{type:Date,default:Date.now}, notes:String,
  healthScore:Number, fertilityLevel:String, nutrientStatus:Object, deficiencies:[String], recommendations:[String],
  createdAt:{type:Date,default:Date.now}}));
