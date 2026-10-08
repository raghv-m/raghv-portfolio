/**
 * How the estimator frames prices. The price list (admin → Pricing) holds typical MARKET rates:
 * what an agency or team would quote. Clients also see "my price": that market estimate times
 * myPriceRatio, because Raghav builds everything himself without agency overhead.
 */
export const estimatorConfig = {
  /** 0.5 = half the market estimate. Applies to the one-time build, not monthly hosting. */
  myPriceRatio: 0.5,
  /** Shown next to the market figure. */
  marketLabel: "Typical market quote",
  myPriceLabel: "My price",
  pitch:
    "That's what an agency or a team of specialists would typically quote. I'm one person handling design, development, security and launch myself, with no agency overhead, so I build it for around half that, and fast.",
} as const;
