import {
  getAuthOptions,
  HassEntities,
  HassServiceTarget,
  UnsubscribeFunc,
  createLongLivedTokenAuth,
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

  const connection = await createConnection({
    auth: createLongLivedTokenAuth(
      "http://homeassistant:8123",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1MGRhZjI4NmI5MjY0MWViYTU4NmU4Y2JiMGM4NzE2NSIsImlhdCI6MTY0OTk3MDk2MywiZXhwIjoxOTY1MzMwOTYzfQ.hc4mH4XEUJHOBH5ik2gk-Brm0pSmjvz0WskcMQ5oAdY"
    ),
  });
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
