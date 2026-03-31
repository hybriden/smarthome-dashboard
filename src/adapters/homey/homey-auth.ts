const ATHOM_AUTH_URL = "https://api.athom.com/oauth2/authorise";
const ATHOM_TOKEN_URL = "https://api.athom.com/oauth2/token";
const ATHOM_API_URL = "https://api.athom.com";

const CLIENT_ID = import.meta.env.VITE_HOMEY_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_HOMEY_CLIENT_SECRET as string;
const REDIRECT_URI = import.meta.env.VITE_HOMEY_REDIRECT_URI as string;

const SCOPES = [
  "homey",
  "homey.device",
  "homey.device.control",
  "homey.device.readonly",
  "homey.zone",
  "homey.flow",
  "homey.insight",
  "homey.energy",
].join(",");

const STORAGE_KEY = "smarthome-homey-auth";

export interface HomeyAuthData {
  cloudToken: string;
  refreshToken: string;
  expiresAt: number;
  homeyToken: string;
  homeyId: string;
  homeyLocalUrl: string;
  homeyCloudUrl?: string;
}

export function startHomeyLogin(): void {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scopes: SCOPES,
  });
  window.location.href = `${ATHOM_AUTH_URL}?${params}`;
}

export async function handleHomeyCallback(code: string): Promise<HomeyAuthData> {
  // Step 1: Exchange code for cloud tokens
  const tokenRes = await fetch(ATHOM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokenData = await tokenRes.json();
  const cloudToken = tokenData.access_token as string;
  const refreshToken = tokenData.refresh_token as string;
  const expiresIn = tokenData.expires_in as number;

  // Step 2: Get user info to find Homey ID and IP
  const meRes = await fetch(`${ATHOM_API_URL}/user/me`, {
    headers: { Authorization: `Bearer ${cloudToken}` },
  });
  if (!meRes.ok) throw new Error("Failed to get user info");

  const me = await meRes.json();

  // homeys can be an array or an object depending on the API version
  let homeyId = "";
  let homeyLocalUrl = "";
  let homeyCloudUrl = "";

  const homeysList = me.homeys as
    | Array<{ _id?: string; id?: string; name: string; ipInternal?: string; localUrl?: string; remoteUrl?: string }>
    | Record<string, { name: string; ipInternal?: string; remoteUrl?: string }>
    | undefined;

  if (Array.isArray(homeysList)) {
    const h = homeysList[0];
    if (!h) throw new Error("No Homey found on your account");
    homeyId = h._id ?? h.id ?? "";
    homeyLocalUrl = h.localUrl ?? (h.ipInternal ? `http://${h.ipInternal}` : "");
    homeyCloudUrl = h.remoteUrl ?? "";
  } else if (homeysList && typeof homeysList === "object") {
    const [id, h] = Object.entries(homeysList)[0] ?? [];
    if (!id || !h) throw new Error("No Homey found on your account");
    homeyId = id;
    homeyLocalUrl = h.ipInternal ? `http://${h.ipInternal}` : "";
    homeyCloudUrl = h.remoteUrl ?? "";
  } else {
    throw new Error("No Homey found on your account");
  }

  // Step 3: Get delegation token for this Homey
  const delegationRes = await fetch(
    `${ATHOM_API_URL}/delegation/token?audience=homey`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cloudToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!delegationRes.ok) {
    const err = await delegationRes.text();
    throw new Error(`Delegation token failed: ${err}`);
  }

  // API returns the JWT directly as a JSON string (not an object)
  const delegationToken = await delegationRes.json() as string;

  // Step 4: Create a session on the local Homey using the delegation token
  const localUrl = window.location.port === "9999"
    ? `${window.location.origin}/homey-api`
    : (homeyLocalUrl || `http://192.168.10.107`);
  const sessionRes = await fetch(`${localUrl}/api/manager/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: delegationToken }),
  });

  let homeyToken: string;

  if (sessionRes.ok) {
    homeyToken = await sessionRes.json() as string;
  } else {
    console.warn("Local session failed, trying cloud relay...", await sessionRes.text());

    if (homeyCloudUrl) {
      const cloudSessionRes = await fetch(
        `${homeyCloudUrl}/api/manager/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: delegationToken }),
        },
      );

      if (cloudSessionRes.ok) {
        const sessionData = await cloudSessionRes.json();
        homeyToken = sessionData.token as string;
      } else {
        console.warn("Cloud session also failed, using cloud token directly");
        homeyToken = cloudToken;
      }
    } else {
      homeyToken = cloudToken;
    }
  }

  // Prefer local URL, fall back to cloud URL
  const bestUrl = homeyLocalUrl || homeyCloudUrl;
  if (!bestUrl) throw new Error("Could not determine Homey URL");

  const authData: HomeyAuthData = {
    cloudToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
    homeyToken,
    homeyId,
    homeyLocalUrl: bestUrl,
    homeyCloudUrl: homeyCloudUrl || undefined,
  };

  saveAuth(authData);
  return authData;
}

export async function refreshHomeyToken(
  auth: HomeyAuthData,
): Promise<HomeyAuthData> {
  const res = await fetch(ATHOM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: auth.refreshToken,
    }),
  });

  if (!res.ok) {
    clearAuth();
    throw new Error("Token refresh failed — please log in again");
  }

  const data = await res.json();
  const newCloudToken = data.access_token as string;

  // Re-delegate to get a fresh Homey token
  let homeyToken = auth.homeyToken;
  try {
    const delegRes = await fetch(
      `${ATHOM_API_URL}/delegation/token?audience=homey`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${newCloudToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (delegRes.ok) {
      const delegToken = await delegRes.json() as string;

      const refreshLocalUrl = window.location.port === "9999"
        ? `${window.location.origin}/homey-api`
        : auth.homeyLocalUrl;
      const sessionRes = await fetch(
        `${refreshLocalUrl}/api/manager/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: delegToken }),
        },
      );
      if (sessionRes.ok) {
        homeyToken = await sessionRes.json() as string;
      } else {
        console.warn("Refresh: local session failed", await sessionRes.text());
      }
    } else {
      console.warn("Refresh: delegation failed", await delegRes.text());
    }
  } catch (err) {
    console.warn("Refresh: re-delegation error, keeping existing token", err);
  }

  const updated: HomeyAuthData = {
    ...auth,
    cloudToken: newCloudToken,
    refreshToken: data.refresh_token ?? auth.refreshToken,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
    homeyToken,
  };

  saveAuth(updated);
  return updated;
}

export function loadAuth(): HomeyAuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HomeyAuthData) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: HomeyAuthData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isTokenExpired(auth: HomeyAuthData): boolean {
  return Date.now() > auth.expiresAt - 60_000;
}
