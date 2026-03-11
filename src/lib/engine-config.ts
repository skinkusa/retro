/**
 * Tunable match engine parameters.
 * Defaults are aligned with stats.md (Premier League–level realism).
 * Override with partial config when calling simulateMatch to tune the game.
 */

export interface MatchEngineConfig {
  // —— Goals & shots (stats.md: 2–3 total goals common, 18–28 shots) ——
  /** Base threat probability per minute. Volume from tempo/style; MID only affects who gets it. */
  chanceProbabilityBase: number;
  /** Scale for midfield influence (chanceProb = base + totalMid / chanceMidScale), then clamped. */
  chanceMidScale: number;
  /** Clamp threat probability per minute to this range (avoid 35–50 chances). */
  chanceProbabilityMin: number;
  chanceProbabilityMax: number;
  /**
   * Global conversion multiplier applied to raw goal probability (shot on target).
   * Target: 8–15% of shots become goals.
   */
  conversionMultiplier: number;
  /** Clamp goal probability per shot to this range (xG-like). */
  goalProbabilityMin: number;
  goalProbabilityMax: number;
  /** Probability a threat becomes a shot (rest = blocked/corner/etc). */
  shotProbabilityFromThreat: number;
  /** Probability a shot is on target (rest = miss). */
  sotProbabilityFromShot: number;
  /** Goal probability multiplier to reach 1.2-1.4 PPG. */
  goalScoringOverallScale: number;

  // —— Set Pieces, Fouls & Offsides (benchmarks.md: Corners ~5, Fouls ~11, Offsides ~2) ——
  /** Probability per minute that a corner is awarded. */
  cornerProbabilityPerMinute: number;
  /** Probability per minute that a foul (non-card) occurs. */
  foulProbabilityPerMinute: number;
  /** Probability per minute that an offside occurs. */
  offsideProbabilityPerMinute: number;

  // —— Cards (stats.md: 2–6 yellows, 3–4 average; reds in ~10–20% of matches) ——
  /** Probability per minute that a disciplinary (card) check occurs. */
  cardCheckPerMinute: number;
  /** When a card is given, probability it is a direct red (otherwise yellow, or second yellow → red). */
  directRedProbability: number;

  // —— Injuries (stats.md: most matches 0; minor 10–20%, moderate 5–8%, serious 1–3%) ——
  /** Probability per minute that an injury check occurs. */
  injuryCheckPerMinute: number;
  /** When injury occurs, probability it is minor (1–2 weeks). Remainder split moderate/serious. */
  injuryMinorProbability: number;
  /** When injury occurs, probability it is moderate (3–6 weeks) given not minor. */
  injuryModerateGivenNotMinorProbability: number;
  /** Minor injury: weeks = 1 or 2. Moderate: 3–6. Serious: 8–12. */
  injuryWeeksSeriousMin: number;
  injuryWeeksSeriousMax: number;

  // —— Non-goal chance outcome (stats.md: 25–35% shots on target; saves vs misses) ——
  /** When a chance is not a goal, probability it is a save (vs miss). */
  saveVsMissProbability: number;

  // —— Penalty shootout (stats.md: ~80% scored) ——
  /** Probability a penalty in a shootout is scored. */
  penaltyShootoutConversion: number;
}

export const DEFAULT_ENGINE_CONFIG: MatchEngineConfig = {
  chanceProbabilityBase: 0.35,
  chanceMidScale: 2500,
  chanceProbabilityMin: 0.11,
  chanceProbabilityMax: 0.48,
  conversionMultiplier: 1.05,
  goalProbabilityMin: 0.08,
  goalProbabilityMax: 0.30,
  shotProbabilityFromThreat: 0.72,
  sotProbabilityFromShot: 0.38,
  goalScoringOverallScale: 1.38,

  cornerProbabilityPerMinute: 0.12,
  foulProbabilityPerMinute: 0.26,
  offsideProbabilityPerMinute: 0.11,

  cardCheckPerMinute: 0.038,
  directRedProbability: 0.06,

  injuryCheckPerMinute: 0.0018,
  injuryMinorProbability: 0.7,
  injuryModerateGivenNotMinorProbability: 0.75,
  injuryWeeksSeriousMin: 8,
  injuryWeeksSeriousMax: 12,

  saveVsMissProbability: 0.45,
  penaltyShootoutConversion: 0.8,
};

/** Merge partial config with defaults. */
export function mergeEngineConfig(partial?: Partial<MatchEngineConfig>): MatchEngineConfig {
  return partial ? { ...DEFAULT_ENGINE_CONFIG, ...partial } : DEFAULT_ENGINE_CONFIG;
}

/** Higher scoring, more cards – for a more arcade feel. */
export const ARCADE_ENGINE_CONFIG: Partial<MatchEngineConfig> = {
  chanceProbabilityBase: 0.18,
  conversionMultiplier: 0.55,
  cardCheckPerMinute: 0.05,
  directRedProbability: 0.12,
  injuryCheckPerMinute: 0.001,
  penaltyShootoutConversion: 0.85,
  cornerProbabilityPerMinute: 0.07,
  foulProbabilityPerMinute: 0.15,
  offsideProbabilityPerMinute: 0.03,
};
