require('dotenv').config();
const bcrypt = require('bcryptjs'), mongoose = require('mongoose'), User = require('./User'), Crop = require('./Crop'), Fertilizer = require('./Fertilizer');
const crops = [
 ['Wheat',6.8,'Medium','Medium','Medium','Medium',['Loamy','Clay'],'Rabi cereal; sow Nov–Dec.'],['Rice',6.0,'High','Medium','Medium','High',['Clay','Loamy'],'Needs standing water.'],
 ['Maize',6.5,'High','Medium','Medium','Medium',['Loamy','Sandy'],'Warm-season cereal.'],['Cotton',7.0,'Medium','Low','Medium','Medium',['Black','Loamy'],'Fibre crop for deep black soils.'],
 ['Soybean',6.5,'Low','Medium','Medium','Medium',['Loamy','Black'],'Legume; fixes nitrogen.'],['Tomato',6.5,'High','High','High','Medium',['Loamy','Sandy'],'Vegetable needing good drainage.'],
 ['Potato',5.8,'High','High','High','Medium',['Sandy','Loamy'],'Tuber crop for loose soils.'],['Onion',6.5,'Medium','Medium','Medium','Low',['Loamy','Sandy'],'Bulb crop; avoid waterlogging.'],
 ['Chickpea',7.0,'Low','Medium','Medium','Low',['Black','Loamy'],'Drought-tolerant pulse.'],['Sugarcane',7.0,'High','Medium','High','High',['Loamy','Black','Clay'],'Long-duration crop.']
].map(([name,idealPH,nitrogen,phosphorus,potassium,moisture,soilTypes,description]) => ({ name, idealPH, nitrogen, phosphorus, potassium, moisture, soilTypes, description }));
const P = 'Do not over-apply; keep away from seeds and roots.';
const ferts = [
 { name:'Urea', nutrient:'Nitrogen', composition:'46-0-0', purpose:'Quick nitrogen supply', applicationMethod:'Split top-dressing', quantity:'Approx. 100–130 kg/ha (advisory)', precautions:P },
 { name:'Ammonium Sulphate', nutrient:'Nitrogen', composition:'21-0-0 (24% S)', purpose:'Nitrogen + sulphur', applicationMethod:'Broadcast and incorporate', quantity:'Approx. 150–200 kg/ha (advisory)', precautions:'Can acidify soil over time.' },
 { name:'DAP', nutrient:'Phosphorus', composition:'18-46-0', purpose:'Phosphorus at sowing', applicationMethod:'Basal drilling', quantity:'Approx. 50–100 kg/ha (advisory)', precautions:P },
 { name:'SSP', nutrient:'Phosphorus', composition:'0-16-0 (11% S)', purpose:'Phosphorus + sulphur', applicationMethod:'Basal application', quantity:'Approx. 150–250 kg/ha (advisory)', precautions:'Store dry.' },
 { name:'MOP', nutrient:'Potassium', composition:'0-0-60', purpose:'Potassium supply', applicationMethod:'Basal or split', quantity:'Approx. 40–80 kg/ha (advisory)', precautions:'Avoid on chloride-sensitive crops.' },
 { name:'Compost', nutrient:'Organic Carbon', composition:'Organic', purpose:'Improve organic matter', applicationMethod:'Spread and mix before sowing', quantity:'Approx. 5–10 t/ha (advisory)', precautions:'Use fully decomposed material.' },
 { name:'Farmyard Manure', nutrient:'Organic Carbon', composition:'Organic', purpose:'Organic matter and micronutrients', applicationMethod:'Incorporate 2–3 weeks before sowing', quantity:'Approx. 10 t/ha (advisory)', precautions:'Avoid fresh manure.' },
 { name:'Vermicompost', nutrient:'Organic Carbon', composition:'Organic', purpose:'Soil biology and carbon', applicationMethod:'Apply near root zone', quantity:'Approx. 2–5 t/ha (advisory)', precautions:'Keep moist, not waterlogged.' }];
(async () => {
  if (!process.env.MONGO_URI) { console.error('MONGO_URI is not set (backend/.env)'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  await Crop.deleteMany(); await Crop.insertMany(crops); await Fertilizer.deleteMany(); await Fertilizer.insertMany(ferts);
  const hash = p => bcrypt.hash(p, 10);
  await User.updateOne({ email:'admin@soilcare.com' }, { name:'Admin', email:'admin@soilcare.com', password: await hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@123'), role:'admin', status:'active' }, { upsert:true });
  await User.updateOne({ email:'farmer@soilcare.com' }, { name:'Demo Farmer', email:'farmer@soilcare.com', phone:'9876543210', village:'Kuhi', district:'Nagpur', state:'Maharashtra', password: await hash(process.env.SEED_FARMER_PASSWORD || 'Farmer@123'), role:'farmer' }, { upsert:true });
  console.log('Seeded. Admin: admin@soilcare.com / Admin@123  (CHANGE THIS PASSWORD AFTER FIRST LOGIN)'); process.exit(0);
})();
