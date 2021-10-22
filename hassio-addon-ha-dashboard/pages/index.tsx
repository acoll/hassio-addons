import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import React from "react";
import type {
  getAuthOptions,
  HassEntities,
  HassEntity,
  HassServiceTarget,
  UnsubscribeFunc,
} from "home-assistant-js-websocket";
import { Card } from "../lib/Card";
import { GarageIcon, HeaterIcon, ThermometerIcon } from "../lib/icons";
import { format } from "date-fns";
import { relativeTimeShort } from "../lib/dates";

const Home: NextPage = () => {
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

  const callService = callServiceRef.current;

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

  console.log(states);

  return (
    <div>
      <Head>
        <title>HA Dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <CurrentTime />
          <CurrentDate />
          <Greeting />
          <Weather states={states} />
        </div>
        <CardBlock title="Home">
          <PersonCard entity={states["person.sam"]} />
          <PersonCard entity={states["person.whitney"]} />
          <PersonCard entity={states["person.craig"]} />
          <PersonCard entity={states["person.adam"]} />
        </CardBlock>
        <CardBlock title="Garage">
          <GarageDoorsCard
            left={states["binary_sensor.garage_door_left"]}
            right={states["binary_sensor.garage_door_right"]}
          />
        </CardBlock>
        <CardBlock title="Office">
          <Card
            entity={states["sensor.temperature_sensor_b"]}
            isActive={() => false}
            icon1={() => <ThermometerIcon />}
            state={(ent) => `${Math.round(Number.parseFloat(ent.state))}°`}
            name={() => ""}
          />
          <Card
            entity={states["switch.aqara_plug_office_heater"]}
            isActive={(ent) => ent.state === "on"}
            icon1={() => <HeaterIcon />}
            state={(ent) => (ent.state === "on" ? "On" : "Off")}
            onTap={(ent) =>
              callService(
                "switch",
                ent.state === "on" ? "turn_off" : "turn_on",
                {},
                {
                  entity_id: ent.entity_id,
                }
              )
            }
          />
        </CardBlock>
      </main>
    </div>
  );
};

interface CardBlockProps {
  title: string;
  children: React.ReactElement | React.ReactElement[];
}
function CardBlock(props: CardBlockProps) {
  return (
    <div className={styles.cardSection}>
      <div className={styles.cardSectionHeader}>{props.title}</div>
      {props.children}
    </div>
  );
}

const CurrentTime = () => {
  const displayTime = format(new Date(), "hh:mm");
  return <div style={{ fontSize: "82px" }}>{displayTime}</div>;
};

const CurrentDate = () => {
  const dayOfWeek = format(new Date(), "iiii");
  const displayDate = format(new Date(), "LLLL do");
  return (
    <div style={{ fontSize: "22px" }}>
      <div>{dayOfWeek}</div>
      <div></div>
      {displayDate}
    </div>
  );
};

const Greeting = () => {
  const time = new Date().getHours();

  return (
    <b style={{ color: "rgba(255, 255, 255, 0.8)" }}>
      {(() => {
        if (time <= 5) {
          return `Good night 😴`;
        } else if (time <= 10) {
          return `Good morning ☕️`;
        } else if (time <= 13) {
          return `Good afternoon 😊`;
        } else if (time <= 17) {
          return `Good afternoon 😎`;
        } else if (time <= 19) {
          return `Good evening 🍺`;
        } else if (time <= 22) {
          return `Good night 😌`;
        } else if (time <= 23) {
          return `Good night 🥴`;
        } else {
          return `Good night 🥴`;
        }
      })()}
    </b>
  );
};

interface WeatherProps {
  states: HassEntities;
}
const Weather = (props: WeatherProps) => {
  const { states } = props;

  const TEMP = "sensor.openweathermap_temperature";
  const FEELS_LIKE = "sensor.openweathermap_feels_like_temperature";
  const PRECIP = "sensor.openweathermap_forecast_precipitation_probability";

  if (!states[TEMP] || !states[FEELS_LIKE] || !states[PRECIP]) {
    return null;
  }

  const temperature = Number.parseFloat(states[TEMP].state);
  const apparent = Math.round(Number.parseFloat(states[FEELS_LIKE].state));
  const precip = Math.round(Number.parseFloat(states[PRECIP].state));

  return (
    <div>
      {(() => {
        if (temperature <= 31) {
          return `Feels like ${apparent}° with ${precip}% chance of snow \u2744\uFE0F`;
        } else if (temperature > 31) {
          return `Feels like ${apparent}° with ${precip}% chance of rain \u2614\uFE0F`;
        }
      })()}
    </div>
  );
};

const PersonCard: EntityComponent = ({ entity }) => {
  return (
    <Card
      entity={entity}
      state={(entity) => (entity.state === "home" ? "Home" : "Away")}
      icon1={(entity) => <Picture entity={entity} />}
      icon2={(entity) => <TimeSinceChangedCircle entity={entity} />}
      isActive={(entity) => entity.state === "home"}
    />
  );
};

interface GarageDoorsCardProps {
  left: HassEntity;
  right: HassEntity;
}
function GarageDoorsCard(props: GarageDoorsCardProps) {
  const { left, right } = props;

  return (
    <Card
      entity={left}
      name={() => ""}
      state={() =>
        left.state === "on" && right.state === "on"
          ? "Both Open"
          : left.state === "on"
          ? "Left Door Open"
          : right.state === "on"
          ? "Right Door Open"
          : "Closed"
      }
      icon1={() => <GarageIcon active={left.state === "on"} />}
      icon2={() => <GarageIcon active={right.state === "on"} />}
      isActive={() => left.state === "on" || right.state === "on"}
    />
  );
}

export default Home;

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
      console.log("loadTokens", v);

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

type EntityComponent = (props: { entity: HassEntity }) => React.ReactElement;

const Picture: EntityComponent = ({ entity }) => {
  return (
    <div
      className={styles.cardCircle}
      style={{
        backgroundImage: `url(http://homeassistant:8123${entity.attributes.entity_picture})`,
      }}
    ></div>
  );
};

const TimeSinceChangedCircle: EntityComponent = ({ entity }) => {
  return (
    <svg viewBox="0 0 50 50">
      <circle
        cx="25"
        cy="25"
        r="24"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="transparent"
      ></circle>
      <text
        x="50%"
        y="54%"
        fill="currentColor"
        fontSize="14"
        textAnchor="middle"
        alignmentBaseline="middle"
        dominantBaseline="middle"
      >
        {relativeTimeShort(new Date(entity.last_changed))}
      </text>
    </svg>
  );
};
