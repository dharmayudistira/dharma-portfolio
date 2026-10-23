const configuredUrl = import.meta.env.GOATCOUNTER_URL?.trim();
const url = configuredUrl ? new URL(configuredUrl) : undefined;

if (url && (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash)) {
  throw new Error("GOATCOUNTER_URL must be an HTTPS dashboard origin, such as https://yourcode.goatcounter.com.");
}

export const GOATCOUNTER_URL = url?.origin;
