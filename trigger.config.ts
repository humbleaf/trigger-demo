// Trigger.dev v3 config
export const config = {
  project: "proj_ezfayglorrotuzsgzlcd",
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 1,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
}
