const toNum = { Low: 1, Medium: 2, High: 3, Adequate: 2 };
const closeness = (a, b) => 1 - Math.abs(toNum[a] - toNum[b]) / 2;
const W = { ph: 25, nitrogen: 15, phosphorus: 15, potassium: 15, moisture: 15, soilType: 15 }; // sums to 100
function recommendCrops(test, status, crops) {
  return crops.map(c => {
    const reasons = []; let s = 0;
    const phPart = Math.max(0, 1 - Math.abs(test.ph - c.idealPH) / 2); s += W.ph * phPart; if (phPart > 0.7) reasons.push('suitable pH');
    ['nitrogen', 'phosphorus', 'potassium', 'moisture'].forEach(k => {
      const f = closeness(status[k], c[k]); s += W[k] * f; if (f === 1) reasons.push(`${k} matches requirement`);
    });
    const soilOk = !test.soilType || !c.soilTypes?.length || c.soilTypes.map(x => x.toLowerCase()).includes(test.soilType.toLowerCase());
    if (soilOk) { s += W.soilType; if (test.soilType) reasons.push('compatible soil type'); }
    return { cropId: c._id, name: c.name, suitability: Math.round(s), reason: reasons.length ? 'Recommended due to ' + reasons.join(', ') + '.' : 'Partially matches the soil condition.',
      requiredCondition: `pH ~${c.idealPH}; N ${c.nitrogen}, P ${c.phosphorus}, K ${c.potassium}, moisture ${c.moisture}; soils: ${(c.soilTypes || []).join(', ')}`, info: c.description };
  }).sort((a, b) => b.suitability - a.suitability).slice(0, 5);
}
module.exports = { recommendCrops };
