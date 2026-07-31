type Spec = {
  name: string;
  key: string;
  unit?: string;
  dataType?: "TEXT" | "NUMBER" | "BOOLEAN" | "ENUM" | "RANGE";
  options?: string[];
};

export type CategorySeed = {
  name: string;
  description: string;
  specs: Spec[];
};

export const categories: CategorySeed[] = [
  {
    name: "PLC & Controllers",
    description: "Programmable logic controllers, CPUs, and machine controllers.",
    specs: [
      { name: "I/O Count", key: "io_count", dataType: "NUMBER" },
      { name: "Communication", key: "communication", dataType: "ENUM", options: ["Ethernet", "Profinet", "EtherNet/IP", "Modbus RTU", "CANopen"] },
      { name: "Memory", key: "memory", unit: "KB", dataType: "NUMBER" },
      { name: "Power Supply", key: "power_supply", dataType: "ENUM", options: ["24V DC", "110-240V AC"] },
    ],
  },
  {
    name: "I/O Modules",
    description: "Digital and analog input/output expansion modules.",
    specs: [
      { name: "Type", key: "io_type", dataType: "ENUM", options: ["DI", "DO", "AI", "AO", "Mixed"] },
      { name: "Channels", key: "channels", dataType: "NUMBER" },
      { name: "Voltage", key: "voltage", unit: "V", dataType: "NUMBER" },
      { name: "Isolation", key: "isolation", dataType: "BOOLEAN" },
      { name: "Protocol", key: "protocol", dataType: "ENUM", options: ["Local bus", "Profinet", "EtherCAT", "Modbus"] },
    ],
  },
  {
    name: "Drives & VFDs",
    description: "Variable frequency drives and soft starters.",
    specs: [
      { name: "Power", key: "power_kw", unit: "kW", dataType: "NUMBER" },
      { name: "Voltage", key: "voltage", dataType: "ENUM", options: ["220V 1-ph", "380V 3-ph", "480V 3-ph", "690V 3-ph"] },
      { name: "Current", key: "current", unit: "A", dataType: "NUMBER" },
      { name: "IP Rating", key: "ip_rating", dataType: "ENUM", options: ["IP20", "IP21", "IP54", "IP55", "IP66"] },
      { name: "Communication", key: "communication", dataType: "ENUM", options: ["Modbus RTU", "Profinet", "EtherNet/IP", "BACnet"] },
      { name: "Brake Chopper", key: "brake_chopper", dataType: "BOOLEAN" },
    ],
  },
  {
    name: "HMI & Visualization",
    description: "Human-machine interfaces and operator panels.",
    specs: [
      { name: "Screen Size", key: "screen_size", unit: "in", dataType: "NUMBER" },
      { name: "Resolution", key: "resolution", dataType: "TEXT" },
      { name: "Touch Type", key: "touch_type", dataType: "ENUM", options: ["Resistive", "Capacitive", "Keypad"] },
      { name: "Protocol", key: "protocol", dataType: "TEXT" },
      { name: "Protection Rating", key: "ip_rating", dataType: "ENUM", options: ["IP65", "IP66", "IP20"] },
    ],
  },
  {
    name: "Servo & Motion",
    description: "Servo drives, motors, and motion controllers.",
    specs: [
      { name: "Power", key: "power_kw", unit: "kW", dataType: "NUMBER" },
      { name: "Torque", key: "torque", unit: "Nm", dataType: "NUMBER" },
      { name: "Speed", key: "speed", unit: "rpm", dataType: "NUMBER" },
      { name: "Encoder Type", key: "encoder_type", dataType: "ENUM", options: ["Incremental", "Absolute 17-bit", "Absolute 23-bit"] },
      { name: "Communication", key: "communication", dataType: "ENUM", options: ["EtherCAT", "Pulse/Dir", "CANopen", "Mechatrolink"] },
    ],
  },
  {
    name: "Motor Control",
    description: "Contactors, overload relays, and motor starters.",
    specs: [
      { name: "Current Rating", key: "current", unit: "A", dataType: "NUMBER" },
      { name: "Poles", key: "poles", dataType: "NUMBER" },
      { name: "Coil Voltage", key: "coil_voltage", dataType: "ENUM", options: ["24V DC", "24V AC", "110V AC", "230V AC", "400V AC"] },
      { name: "AC/DC", key: "ac_dc", dataType: "ENUM", options: ["AC", "DC"] },
      { name: "Mounting", key: "mounting", dataType: "ENUM", options: ["DIN Rail", "Panel", "Screw"] },
    ],
  },
  {
    name: "Sensors & Switches",
    description: "Proximity, photoelectric, ultrasonic sensors and limit switches.",
    specs: [
      { name: "Sensing Range", key: "sensing_range", unit: "mm", dataType: "NUMBER" },
      { name: "Output Type", key: "output_type", dataType: "ENUM", options: ["PNP", "NPN", "PNP+NPN", "Analog", "IO-Link"] },
      { name: "IP Rating", key: "ip_rating", dataType: "ENUM", options: ["IP65", "IP67", "IP68", "IP69K"] },
      { name: "Housing Material", key: "housing", dataType: "ENUM", options: ["Nickel-plated brass", "Stainless steel", "Plastic"] },
    ],
  },
  {
    name: "Safety",
    description: "Safety relays, light curtains, e-stops, and interlocks.",
    specs: [
      { name: "Safety Category", key: "safety_category", dataType: "ENUM", options: ["Cat 2", "Cat 3", "Cat 4"] },
      { name: "SIL/PL Rating", key: "sil_pl", dataType: "ENUM", options: ["SIL 2 / PL d", "SIL 3 / PL e"] },
      { name: "Contacts", key: "contacts", dataType: "TEXT" },
      { name: "Reset Type", key: "reset_type", dataType: "ENUM", options: ["Manual", "Automatic", "Monitored"] },
    ],
  },
  {
    name: "Power Supplies",
    description: "DIN-rail switching power supplies and redundancy modules.",
    specs: [
      { name: "Output Voltage", key: "output_voltage", unit: "V", dataType: "NUMBER" },
      { name: "Current", key: "current", unit: "A", dataType: "NUMBER" },
      { name: "Power", key: "power_w", unit: "W", dataType: "NUMBER" },
      { name: "Input Voltage", key: "input_voltage", dataType: "ENUM", options: ["100-240V AC", "380-480V AC 3-ph", "24V DC"] },
      { name: "DIN Rail", key: "din_rail", dataType: "BOOLEAN" },
    ],
  },
  {
    name: "Industrial Networking",
    description: "Ethernet switches, gateways, and media converters.",
    specs: [
      { name: "Ports", key: "ports", dataType: "NUMBER" },
      { name: "Speed", key: "speed", dataType: "ENUM", options: ["100 Mbps", "1 Gbps", "10 Gbps"] },
      { name: "Managed", key: "managed", dataType: "ENUM", options: ["Managed", "Unmanaged"] },
      { name: "Media", key: "media", dataType: "ENUM", options: ["Copper", "Fiber", "Copper+Fiber"] },
    ],
  },
  {
    name: "Relays & Timers",
    description: "Plug-in relays, solid state relays, and timing relays.",
    specs: [
      { name: "Contacts", key: "contacts", dataType: "TEXT" },
      { name: "Current", key: "current", unit: "A", dataType: "NUMBER" },
      { name: "Coil Voltage", key: "coil_voltage", dataType: "ENUM", options: ["12V DC", "24V DC", "24V AC", "110V AC", "230V AC"] },
      { name: "Timer Function", key: "timer_function", dataType: "ENUM", options: ["On-delay", "Off-delay", "Multi-function", "None"] },
      { name: "Mounting", key: "mounting", dataType: "ENUM", options: ["DIN Rail", "Socket", "PCB"] },
    ],
  },
  {
    name: "Pneumatics",
    description: "Cylinders, solenoid valves, and air preparation units.",
    specs: [
      { name: "Bore Size", key: "bore", unit: "mm", dataType: "NUMBER" },
      { name: "Stroke", key: "stroke", unit: "mm", dataType: "NUMBER" },
      { name: "Pressure", key: "pressure", unit: "bar", dataType: "NUMBER" },
      { name: "Port Size", key: "port_size", dataType: "ENUM", options: ["M5", "G1/8", "G1/4", "G3/8", "G1/2"] },
      { name: "Valve Function", key: "valve_function", dataType: "ENUM", options: ["3/2", "5/2", "5/3", "2/2"] },
    ],
  },
  {
    name: "Hydraulics",
    description: "Hydraulic valves, pumps, and power units.",
    specs: [
      { name: "Pressure", key: "pressure", unit: "bar", dataType: "NUMBER" },
      { name: "Flow", key: "flow", unit: "L/min", dataType: "NUMBER" },
      { name: "Port Size", key: "port_size", dataType: "TEXT" },
      { name: "Valve Type", key: "valve_type", dataType: "ENUM", options: ["Directional", "Proportional", "Pressure relief", "Check"] },
    ],
  },
  {
    name: "Process Instruments",
    description: "Pressure, flow, level, and temperature transmitters.",
    specs: [
      { name: "Measurement Type", key: "measurement", dataType: "ENUM", options: ["Pressure", "Flow", "Level", "Temperature", "pH"] },
      { name: "Range", key: "range", dataType: "TEXT" },
      { name: "Output", key: "output", dataType: "ENUM", options: ["4-20mA", "4-20mA + HART", "Profibus PA", "Foundation Fieldbus"] },
      { name: "Accuracy", key: "accuracy", dataType: "TEXT" },
      { name: "Process Connection", key: "process_connection", dataType: "TEXT" },
    ],
  },
  {
    name: "DCS & SCADA",
    description: "Distributed control systems and SCADA hardware/software.",
    specs: [
      { name: "I/O Capacity", key: "io_capacity", dataType: "NUMBER" },
      { name: "Redundancy", key: "redundancy", dataType: "BOOLEAN" },
      { name: "Protocols", key: "protocols", dataType: "TEXT" },
      { name: "Software License", key: "license", dataType: "TEXT" },
    ],
  },
  {
    name: "Robotics",
    description: "Industrial robot arms, cobots, and controllers.",
    specs: [
      { name: "Payload", key: "payload", unit: "kg", dataType: "NUMBER" },
      { name: "Reach", key: "reach", unit: "mm", dataType: "NUMBER" },
      { name: "Axes", key: "axes", dataType: "NUMBER" },
      { name: "Repeatability", key: "repeatability", unit: "mm", dataType: "NUMBER" },
      { name: "Controller", key: "controller", dataType: "TEXT" },
    ],
  },
  {
    name: "Cables & Connectors",
    description: "M12/M8 cordsets, fieldbus cables, and connectors.",
    specs: [
      { name: "Connector Type", key: "connector", dataType: "ENUM", options: ["M8", "M12", "M23", "7/8\"", "RJ45"] },
      { name: "Pins", key: "pins", dataType: "NUMBER" },
      { name: "Length", key: "length", unit: "m", dataType: "NUMBER" },
      { name: "Shielding", key: "shielding", dataType: "BOOLEAN" },
      { name: "IP Rating", key: "ip_rating", dataType: "ENUM", options: ["IP65", "IP67", "IP68"] },
    ],
  },
  {
    name: "Operator Devices",
    description: "Push buttons, pilot lights, selector switches, and e-stops.",
    specs: [
      { name: "Diameter", key: "diameter", unit: "mm", dataType: "ENUM", options: ["16", "22", "30"] },
      { name: "Function", key: "function", dataType: "ENUM", options: ["Momentary", "Latching", "Selector", "E-Stop", "Pilot light"] },
      { name: "Illumination", key: "illumination", dataType: "BOOLEAN" },
      { name: "Protection Rating", key: "ip_rating", dataType: "ENUM", options: ["IP65", "IP66", "IP69K"] },
    ],
  },
  {
    name: "Encoders",
    description: "Incremental and absolute rotary encoders.",
    specs: [
      { name: "Resolution", key: "resolution", unit: "PPR", dataType: "NUMBER" },
      { name: "Output Type", key: "output_type", dataType: "ENUM", options: ["Push-pull", "Line driver", "SSI", "EtherCAT"] },
      { name: "Shaft Diameter", key: "shaft", unit: "mm", dataType: "NUMBER" },
      { name: "IP Rating", key: "ip_rating", dataType: "ENUM", options: ["IP54", "IP65", "IP67"] },
    ],
  },
  {
    name: "Temperature Controllers",
    description: "PID temperature controllers and process indicators.",
    specs: [
      { name: "Input Type", key: "input_type", dataType: "ENUM", options: ["Thermocouple", "RTD Pt100", "Universal"] },
      { name: "Output", key: "output", dataType: "ENUM", options: ["Relay", "SSR drive", "4-20mA", "Relay+SSR"] },
      { name: "Control Method", key: "control_method", dataType: "ENUM", options: ["On/Off", "PID", "Auto-tuning PID"] },
      { name: "Display Size", key: "display_size", dataType: "TEXT" },
      { name: "Alarms", key: "alarms", dataType: "NUMBER" },
    ],
  },
];
