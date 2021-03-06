//copied from https://codepen.io/FelixRilling/pen/ExdIC

//Top level type is the defender
//example: Bug (line 10) is the defending team and Fire (line 17) is the attacking NFL player

const app = new Vue({
  el: "#app",
  data: {
    types: {
        BUG: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 0.5,
            FIRE: 2,
            FLYING: 2,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 0.5,
            ICE: 1,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 2,
            STEEL: 1,
            WATER: 1
          },
          DARK: {
            BUG: 2,
            DARK: 0.5,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 2,
            FIGHTING: 2,
            FIRE: 1,
            FLYING: 1,
            GHOST: 0.5,
            GRASS: 1,
            GROUND: 1,
            ICE: 1,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 0,
            ROCK: 1,
            STEEL: 1,
            WATER: 1
          },
          DRAGON: {
            BUG: 1,
            DARK: 1,
            DRAGON: 2,
            ELECTRIC: 0.5,
            FAIRY: 2,
            FIGHTING: 1,
            FIRE: 0.5,
            FLYING: 1,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 1,
            ICE: 2,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 1,
            WATER: 0.5
          },
          ELECTRIC: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 0.5,
            FAIRY: 1,
            FIGHTING: 1,
            FIRE: 1,
            FLYING: 0.5,
            GHOST: 1,
            GRASS: 1,
            GROUND: 2,
            ICE: 1,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 0.5,
            WATER: 1
          },
          FAIRY: {
            BUG: 0.5,
            DARK: 0.5,
            DRAGON: 0,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 0.5,
            FIRE: 1,
            FLYING: 1,
            GHOST: 1,
            GRASS: 1,
            GROUND: 1,
            ICE: 1,
            NORMAL: 1,
            POISON: 2,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 2,
            WATER: 1
          },
          FIGHTING: {
            BUG: 0.5,
            DARK: 0.5,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 2,
            FIGHTING: 1,
            FIRE: 1,
            FLYING: 2,
            GHOST: 1,
            GRASS: 1,
            GROUND: 1,
            ICE: 1,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 2,
            ROCK: 0.5,
            STEEL: 1,
            WATER: 1
          },
          FIRE: {
            BUG: 0.5,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 0.5,
            FIGHTING: 1,
            FIRE: 0.5,
            FLYING: 1,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 2,
            ICE: 0.5,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 2,
            STEEL: 0.5,
            WATER: 2
          },
          FLYING: {
            BUG: 0.5,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 2,
            FAIRY: 1,
            FIGHTING: 0.5,
            FIRE: 1,
            FLYING: 1,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 0,
            ICE: 2,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 2,
            STEEL: 1,
            WATER: 1
          },
          GHOST: {
            BUG: 0.5,
            DARK: 2,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 0,
            FIRE: 1,
            FLYING: 1,
            GHOST: 2,
            GRASS: 1,
            GROUND: 1,
            ICE: 1,
            NORMAL: 0,
            POISON: 0.5,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 1,
            WATER: 1
          },
          GRASS: {
            BUG: 2,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 0.5,
            FAIRY: 1,
            FIGHTING: 1,
            FIRE: 2,
            FLYING: 2,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 0.5,
            ICE: 2,
            NORMAL: 1,
            POISON: 2,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 1,
            WATER: 0.5
          },
          GROUND: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 0,
            FAIRY: 1,
            FIGHTING: 1,
            FIRE: 1,
            FLYING: 1,
            GHOST: 1,
            GRASS: 2,
            GROUND: 1,
            ICE: 2,
            NORMAL: 1,
            POISON: 0.5,
            PSYCHIC: 1,
            ROCK: 0.5,
            STEEL: 1,
            WATER: 2
          },
          ICE: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 2,
            FIRE: 2,
            FLYING: 1,
            GHOST: 1,
            GRASS: 1,
            GROUND: 1,
            ICE: 0.5,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 2,
            STEEL: 2,
            WATER: 1
          },
          NORMAL: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 2,
            FIRE: 1,
            FLYING: 1,
            GHOST: 0,
            GRASS: 1,
            GROUND: 1,
            ICE: 1,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 1,
            WATER: 1
          },
          POISON: {
            BUG: 0.5,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 0.5,
            FIGHTING: 0.5,
            FIRE: 1,
            FLYING: 1,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 2,
            ICE: 1,
            NORMAL: 1,
            POISON: 0.5,
            PSYCHIC: 2,
            ROCK: 1,
            STEEL: 1,
            WATER: 1
          },
          PSYCHIC: {
            BUG: 2,
            DARK: 2,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 0.5,
            FIRE: 1,
            FLYING: 1,
            GHOST: 2,
            GRASS: 1,
            GROUND: 1,
            ICE: 1,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 0.5,
            ROCK: 1,
            STEEL: 1,
            WATER: 1
          },
          ROCK: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 1,
            FAIRY: 1,
            FIGHTING: 2,
            FIRE: 0.5,
            FLYING: 0.5,
            GHOST: 1,
            GRASS: 2,
            GROUND: 2,
            ICE: 1,
            NORMAL: 0.5,
            POISON: 0.5,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 2,
            WATER: 2
          },
          STEEL: {
            BUG: 0.5,
            DARK: 1,
            DRAGON: 0.5,
            ELECTRIC: 1,
            FAIRY: 0.5,
            FIGHTING: 2,
            FIRE: 2,
            FLYING: 0.5,
            GHOST: 1,
            GRASS: 0.5,
            GROUND: 2,
            ICE: 0.5,
            NORMAL: 0.5,
            POISON: 0,
            PSYCHIC: 0.5,
            ROCK: 0.5,
            STEEL: 0.5,
            WATER: 1
          },
          WATER: {
            BUG: 1,
            DARK: 1,
            DRAGON: 1,
            ELECTRIC: 2,
            FAIRY: 1,
            FIGHTING: 1,
            FIRE: 0.5,
            FLYING: 1,
            GHOST: 1,
            GRASS: 2,
            GROUND: 1,
            ICE: 0.5,
            NORMAL: 1,
            POISON: 1,
            PSYCHIC: 1,
            ROCK: 1,
            STEEL: 0.5,
            WATER: 0.5
      }
    }
  },
  methods: {
    getTypeClass(typeName) {
      return `type type-${typeName.toLowerCase()}`;
    },
    getEffClass(typeEff) {
      const eff = {
        "0": "immune",
        "0.5": "noteffective",
        "1": "normal",
        "2": "veryeffective"
      };

      return `eff eff-${eff[typeEff]}`;
    }
  }
});