// All thresholds/penalties are configurable here. Values are demo defaults (N,P,K in kg/ha; OC and moisture in %).
const CONFIG = {
  ph: { low: 6.0, high: 7.5, severeLow: 5.0, severeHigh: 8.5 },
  nitrogen: { low: 280, high: 560 }, phosphorus: { low: 10, high: 25 }, potassium: { low: 110, high: 280 },
  organicCarbon: { low: 0.5, high: 0.75 }, moisture: { low: 15, high: 40, veryLow: 8, veryHigh: 55 },
  penalty: { phMild: 10, phSevere: 25, nitrogen: 15, phosphorus: 15, potassium: 15, organicCarbon: 15, moistureMild: 5, moistureSevere: 10 },
  levels: [[80, 'Excellent'], [60, 'Good'], [40, 'Moderate'], [20, 'Poor'], [0, 'Critical']]
};
const rate = (v, t) => (v < t.low ? 'Low' : v > t.high ? 'High' : 'Adequate');
function analyzeSoil({ pH, nitrogen, phosphorus, potassium, organicCarbon, moisture }) {
  const c = CONFIG, p = c.penalty, deficiencies = [], recommendations = [];
  let score = 100;
  const phStatus = pH < c.ph.low ? 'Acidic' : pH > c.ph.high ? 'Alkaline' : 'Neutral';
  if (phStatus !== 'Neutral') {
    const severe = pH < c.ph.severeLow || pH > c.ph.severeHigh;
    score -= severe ? p.phSevere : p.phMild;
    recommendations.push(phStatus === 'Acidic' ? 'Soil is acidic: consider liming (agricultural lime) after local advice.' : 'Soil is alkaline: consider gypsum/organic matter and acidifying amendments.');
  }
  const nutrientStatus = { pH: phStatus, nitrogen: rate(nitrogen, c.nitrogen), phosphorus: rate(phosphorus, c.phosphorus),
    potassium: rate(potassium, c.potassium), organicCarbon: rate(organicCarbon, c.organicCarbon), moisture: rate(moisture, c.moisture) };
  [['nitrogen', 'Nitrogen'], ['phosphorus', 'Phosphorus'], ['potassium', 'Potassium'], ['organicCarbon', 'Organic Carbon']].forEach(([k, label]) => {
    if (nutrientStatus[k] === 'Low') { score -= p[k]; deficiencies.push(label); recommendations.push(`${label} is low: apply suitable fertilizer/organic source.`); }
  });
  if (nutrientStatus.moisture !== 'Adequate') {
    score -= (moisture < c.moisture.veryLow || moisture > c.moisture.veryHigh) ? p.moistureSevere : p.moistureMild;
    recommendations.push(nutrientStatus.moisture === 'Low' ? 'Moisture is low: improve irrigation and use mulching.' : 'Moisture is high: improve drainage.');
  }
  const healthScore = Math.max(0, Math.min(100, score));
  const fertilityLevel = c.levels.find(([min]) => healthScore >= min)[1];
  return { healthScore, fertilityLevel, nutrientStatus, deficiencies, recommendations };
}
module.exports = { analyzeSoil, CONFIG };
