import {
  getAuthOptions,
  HassEntities,
  HassServiceTarget,
  UnsubscribeFunc,
} from "home-assistant-js-websocket";
import React from "react";

export function useHAState() {
  const [states, setStates] = React.useState<HassEntities>({});

  const callServiceRef = React.useRef<
    (
      domain: string,
      service: string,
      serviceData: object,
      target: HassServiceTarget
    ) => void
  >(() => {
    console.log("callService not ready");
  });

  React.useEffect(() => {
    let unsubFn: UnsubscribeFunc = () => {};

    connect((state) => setStates(state))
      .then(({ unsubscribe, callService }) => {
        unsubFn = unsubscribe;
        callServiceRef.current = callService;
      })
      .catch((err) => console.error(err));

    if (unsubFn) {
      return () => unsubFn();
    }
  }, []);

  return { states, callService: callServiceRef.current };
}

async function connect(fn: (state: HassEntities) => void) {
  const {
    getAuth,
    createConnection,
    subscribeEntities,
    callService,
    ERR_HASS_HOST_REQUIRED,
  } = await import("home-assistant-js-websocket");

  const config: getAuthOptions = {
    hassUrl: "http://homeassistant:8123/",
    redirectUrl: window.location.href,
    saveTokens: (tokens) => {
      localStorage.setItem("ha-dashboard-tokens", JSON.stringify(tokens));
    },
    loadTokens: () => {
      const v = localStorage.getItem("ha-dashboard-tokens");

      if (!v) {
        return undefined;
      }

      return JSON.parse(v);
    },
  };

  let auth;
  try {
    // Try to pick up authentication after user logs in
    auth = await getAuth(config);
  } catch (err) {
    if (err === ERR_HASS_HOST_REQUIRED) {
      auth = await getAuth(config);
    } else {
      throw `Unknown error: ${err}`;
    }
  }
  const connection = await createConnection({ auth });
  const unsubscribe = subscribeEntities(connection, fn);

  return {
    unsubscribe,
    callService: (
      domain: string,
      service: string,
      serviceData: object,
      target: HassServiceTarget
    ) => callService(connection, domain, service, serviceData, target),
  };
}
