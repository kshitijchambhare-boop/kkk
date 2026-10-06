const DISCLAIMER = 'Advisory recommendation — verify fertilizer dose with a qualified agricultural expert or local soil-test recommendation.';
function recommendFertilizers(deficiencies, fertilizers) {
  const items = fertilizers.filter(f => deficiencies.includes(f.nutrient)).map(f => ({
    name: f.name, nutrient: f.nutrient, purpose: f.purpose, quantity: f.quantity || 'As per local recommendation',
    applicationMethod: f.applicationMethod, precautions: f.precautions }));
  return { disclaimer: DISCLAIMER, items };
}
module.exports = { recommendFertilizers, DISCLAIMER };
