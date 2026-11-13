import { SAFARIS } from '../data/safaris';

/**
 * Rule-based smart recommendation engine for WildTrail
 * Evaluates wildlife target, budget, season, travel type and region
 * Computes an explainable 0-100% match score with specific rationale points
 */
export function calculateSafariMatch(safari, preferences) {
  let score = 0;
  const reasons = [];

  const {
    wildlife = "tiger",
    budget = 6000,
    timeframe = "next-month",
    party = "family",
    region = "any"
  } = preferences;

  // 1. Wildlife alignment (40 max)
  const wildlifeMap = {
    tiger: ["Royal Bengal Tiger"],
    elephant: ["Asian Elephant Herds", "Asian Elephant"],
    leopard: ["Indian Leopard"],
    rhino: ["Great One-horned Rhino"],
    bird: ["Malabar Pied Hornbill", "Marsh Crocodile"],
    deer: ["Hard-ground Barasingha", "Spotted Deer (Chital)", "Sambar Deer"]
  };

  const targets = wildlifeMap[wildlife] || ["Royal Bengal Tiger"];
  const matchedProbability = safari.wildlifeProbabilities.find(wp =>
    targets.some(t => wp.animal.toLowerCase().includes(t.toLowerCase()))
  );

  if (matchedProbability) {
    if (matchedProbability.level === "high") {
      score += 40;
      reasons.push(`Exceptional ${matchedProbability.animal} encounter probability (${matchedProbability.probability})`);
    } else if (matchedProbability.level === "med") {
      score += 26;
      reasons.push(`Moderate sighting chance for ${matchedProbability.animal}`);
    } else {
      score += 15;
    }
  } else {
    // general wildlife diversity
    score += 18;
    reasons.push("Diverse ecosystem with high chances of apex predator sightings");
  }

  // 2. Budget suitability (25 max)
  const lowestSlot = Math.min(...safari.slots.map(s => s.price));
  if (budget >= lowestSlot * 2) {
    score += 25;
    reasons.push(`Well within your target budget (starts at ₹${lowestSlot.toLocaleString('en-IN')}/person)`);
  } else if (budget >= lowestSlot) {
    score += 18;
    reasons.push(`Fits your budget for standard slots`);
  } else {
    score += 8;
    reasons.push(`Premium tier slots available with canter sharing options`);
  }

  // 3. Travel Party & Experience (15 max)
  if (party === "family") {
    if (safari.rating >= 4.8) {
      score += 15;
      reasons.push("Safe, comfortable trail with high comfort ratings for family travel");
    } else {
      score += 10;
    }
  } else if (party === "photographer") {
    if (safari.slots.some(s => s.type.includes("Gypsy"))) {
      score += 15;
      reasons.push("Dedicated open 4x4 Gypsy slots available for unobstructed 360° lens angles");
    } else {
      score += 10;
    }
  } else {
    score += 12;
    reasons.push("Flexible departure times and certified naturalist guidance included");
  }

  // 4. Region Match (10 max)
  if (region === "any" || safari.region.toLowerCase().includes(region.toLowerCase()) || safari.state.toLowerCase().includes(region.toLowerCase())) {
    score += 10;
    reasons.push(`Located in ${safari.state} with accessible airport and railway links`);
  } else {
    score += 3;
  }

  // 5. Booking Availability Health (10 max)
  const totalSeats = safari.slots.reduce((acc, s) => acc + s.seatsAvailable, 0);
  if (totalSeats >= 8) {
    score += 10;
    reasons.push("Healthy slot availability for upcoming dates");
  } else {
    score += 6;
    reasons.push("Limited inventory remaining — early reservation recommended");
  }

  // Cap between 68% and 98% for realistic feel
  const finalScore = Math.min(98, Math.max(68, score));

  return {
    safari,
    score: finalScore,
    reasons: reasons.slice(0, 3)
  };
}

export function getRecommendedSafaris(preferences) {
  const scored = SAFARIS.map(safari => calculateSafariMatch(safari, preferences));
  return scored.sort((a, b) => b.score - a.score);
}
