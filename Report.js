const m = require('mongoose');
module.exports = m.model('Report', new m.Schema({userId:{type:m.Schema.Types.ObjectId,ref:'User'},soilTestId:{type:m.Schema.Types.ObjectId,ref:'SoilTest'},reportData:Object,createdAt:{type:Date,default:Date.now}}));
