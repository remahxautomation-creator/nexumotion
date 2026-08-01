import {
  Cpu, ToggleLeft, Gauge, MonitorSmartphone, Move3d, Zap, Radar, ShieldCheck,
  BatteryCharging, Network, Timer, Wind, Droplets, Thermometer, Server, Bot,
  Cable, CircleDot, RotateCw, ThermometerSun, Package, type LucideIcon,
} from "lucide-react";

// Category slug → icon. Slugs come from slugify(category.name) in the seed.
const ICONS: Record<string, LucideIcon> = {
  "plc-controllers": Cpu,
  "i-o-modules": ToggleLeft,
  "drives-vfds": Gauge,
  "hmi-visualization": MonitorSmartphone,
  "servo-motion": Move3d,
  "motor-control": Zap,
  "sensors-switches": Radar,
  safety: ShieldCheck,
  "power-supplies": BatteryCharging,
  "industrial-networking": Network,
  "relays-timers": Timer,
  pneumatics: Wind,
  hydraulics: Droplets,
  "process-instruments": Thermometer,
  "dcs-scada": Server,
  robotics: Bot,
  "cables-connectors": Cable,
  "operator-devices": CircleDot,
  encoders: RotateCw,
  "temperature-controllers": ThermometerSun,
};

export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Package;
}
