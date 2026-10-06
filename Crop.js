const m = require('mongoose'); const lvl = {type:String,enum:['Low','Medium','High'],default:'Medium'};
module.exports = m.model('Crop', new m.Schema({name:{type:String,required:true,unique:true},idealPH:{type:Number,min:0,max:14,required:true},
  nitrogen:lvl,phosphorus:lvl,potassium:lvl,moisture:lvl,soilTypes:[String],description:String}));
