export const GESTURE_IDS = [
  "LIGHTS_ON",
  "LIGHTS_OFF",
  "FAN_ON",
  "FAN_OFF",
  "AUX",
] as const;

export type GestureId = (typeof GESTURE_IDS)[number];

export type ApplianceId = "light" | "fan" | "aux";

export interface GestureDef {
  id: GestureId;
  label: string;
  asl: string;
  pose: string;
  serial: "1" | "2" | "3" | "4" | "5";
  pin: "D2" | "D3" | "D4";
  appliance: ApplianceId;
  action: "on" | "off" | "toggle";
  summary: string;
  keys: string;
  how: string;
}

export const GESTURES: Record<GestureId, GestureDef> = {
  LIGHTS_ON: {
    id: "LIGHTS_ON",
    label: "Lights On",
    asl: "5 / B",
    pose: "Open palm",
    serial: "1",
    pin: "D2",
    appliance: "light",
    action: "on",
    summary: "Living room light ON",
    keys: "1",
    how: "All four fingers extended, palm facing the camera.",
  },
  LIGHTS_OFF: {
    id: "LIGHTS_OFF",
    label: "Lights Off",
    asl: "S / A",
    pose: "Closed fist",
    serial: "2",
    pin: "D2",
    appliance: "light",
    action: "off",
    summary: "Living room light OFF",
    keys: "2",
    how: "Make a fist. Thumb can rest over the fingers.",
  },
  FAN_ON: {
    id: "FAN_ON",
    label: "Fan On",
    asl: "1 / D",
    pose: "Index up",
    serial: "3",
    pin: "D3",
    appliance: "fan",
    action: "on",
    summary: "Bedroom fan ON",
    keys: "3",
    how: "Only the index finger extended. Other fingers curled.",
  },
  FAN_OFF: {
    id: "FAN_OFF",
    label: "Fan Off",
    asl: "V / 2",
    pose: "V sign",
    serial: "4",
    pin: "D3",
    appliance: "fan",
    action: "off",
    summary: "Bedroom fan OFF",
    keys: "4",
    how: "Index and middle fingers up, spread like a V. Others curled.",
  },
  AUX: {
    id: "AUX",
    label: "Aux Toggle",
    asl: "L",
    pose: "L shape",
    serial: "5",
    pin: "D4",
    appliance: "aux",
    action: "toggle",
    summary: "Toggle aux appliance",
    keys: "5",
    how: "Thumb and index form an L. Ring and pinky curled.",
  },
};

export const GESTURE_LIST = GESTURE_IDS.map((id) => GESTURES[id]);

export const APPLIANCES: Record<
  ApplianceId,
  { id: ApplianceId; name: string; room: string; pin: "D2" | "D3" | "D4"; relay: string }
> = {
  light: { id: "light", name: "Living Room Light", room: "Living room", pin: "D2", relay: "Relay 1" },
  fan: { id: "fan", name: "Bedroom Fan", room: "Bedroom", pin: "D3", relay: "Relay 2" },
  aux: { id: "aux", name: "Aux Appliance", room: "Shelf", pin: "D4", relay: "Relay 3" },
};

export const COOLDOWN_MS = 1400;
