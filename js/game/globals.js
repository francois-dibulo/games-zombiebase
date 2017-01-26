var UNIT_SPECS = {
  HEALTH: {
    LOW: 1,
    MEDIUM: 3,
    HIGH: 5
  },
  BULLET_DISTANCE: {
    LOW: 150,
    MEDIUM: 250,
    HIGH: 300
  },
  AMMO: {
    LOW: 20,
    MEDIUM: 40,
    HIGH: 60
  },
  FIRE_RATE: {
    LOW: 300,
    MEDIUM: 400,
    HIGH: 600
  },
  SPEED: {
    LOW: 20,
    MEDIUM: 30,
    FAST: 70
  },
  KILL_COUTDOWN: {
    LOW: 15,
    MEDIUM: 25,
    HIGH: 35
  },
  KILL_COUTDOWN_RATE: {
    LOW: 2000,
    MEDIUM: 1000,
    HIGH: 500
  },
  // MEDIC ONLY
  HEAL_RATE: {
    LOW: 1000,
    MEDIUM: 600,
    HIGH: 400
  }
};

var UNITS = {
  "MedicUnit" : {
    name: "Medic",
    class_type: "MedicUnit",
    description: "Can heal other players"
  },
  "EngineerUnit": {
    name: "Engineer",
    class_type: "EngineerUnit",
    description: "Can repair stuff"
  },
  "SoldierUnit": {
    name: "Soldier",
    class_type: "SoldierUnit",
    description: "Increased combat skills"
  },
  "PilotUnit": {
    name: "Pilot",
    class_type: "PilotUnit",
    description: "Can Fly"
  }
};
