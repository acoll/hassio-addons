import React from "react";
import type { HassEntity } from "home-assistant-js-websocket";
import styles from "./Card.module.css";

interface CardProps {
  entity: HassEntity | undefined;
  state?: (entity: HassEntity) => React.ReactElement | string;
  name?: (entity: HassEntity) => React.ReactElement | string;
  icon1?: (entity: HassEntity) => React.ReactElement;
  icon2?: (entity: HassEntity) => React.ReactElement;
  isActive: (entity: HassEntity) => boolean;
  onTap?: (entity: HassEntity) => void;
}
export function Card(props: CardProps) {
  const { entity, state, name, icon1, icon2, isActive } = props;

  if (!entity) {
    return <div className={styles.card}>Loading...</div>;
  }

  const displayName = name ? name(entity) : entity.attributes.friendly_name;
  const displayState = state ? state(entity) : entity.state;
  const displayIcon1 = icon1 ? icon1(entity) : null;
  const displayIcon2 = icon2 ? icon2(entity) : null;

  return (
    <div
      className={styles.card + " " + isActive(entity) ? styles.cardActive : ""}
      onClick={() => {
        if (props.onTap) {
          props.onTap(entity);
        }
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          justifySelf: "start",
          gridArea: "icon1",
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        {displayIcon1}
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          justifySelf: "end",
          gridArea: "icon2",
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        {displayIcon2}
      </div>
      <h2 className={styles.cardName}>{displayName}</h2>
      <h2 className={styles.cardState}>{displayState}</h2>
    </div>
  );
}
