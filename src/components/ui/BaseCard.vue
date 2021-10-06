<template>
  <div id="main-card" :class="{ battleColor: deck === 'deployed' }">
    <div
      id="card-container"
      :class="[
        'no-select',
        {
          cardActive: handActive && !energyError && player === 'two',
          attackable:
            activeFightCard.length &&
            activeCardHand.length &&
            player === 'one' &&
            deck === 'deployed',
        },
      ]"
    >
      <transition name="attack-message">
        <p v-if="attackInfo" class="attack-info">
          {{ hpChange.health }}
        </p>
      </transition>
      <div class="card-section" id="card-top-info">
        <span id="card-health">HP: {{ health }}</span>
        <span id="card-negative-status"></span>
        <span id="card-class">{{ race }}</span>
      </div>
      <div class="card-section" id="card-main">
        <img
          :src="`${publicPath}img/${cardImage}`"
          alt="card-image"
          id="card-image"
        />
        <span id="card-name" class="text-center">{{ name }}</span>
        <span id="desc" class="text-center">{{ specialDesc }}</span>
      </div>
      <div class="card-section" id="card-bottom-info">
        <span id="card-attack">Att: {{ attack }}</span>
        <span id="card-cost">{{ cost }}</span>
        <span id="card-defense">Def: {{ defense }}</span>
      </div>
    </div>
    <transition name="error-fade">
      <p v-if="errorActive || turnActive" class="errorActive">
        {{
          turnActive
            ? "Wait next turn!"
            : errorActive
            ? "Not enough energy!"
            : ""
        }}
      </p>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    attack: {
      type: Number,
      required: true,
    },
    defense: {
      type: Number,
      required: true,
    },
    specialDesc: {
      type: String,
      required: false,
      default: "",
    },
    specialEffect: {
      type: String,
      required: false,
      default: "",
    },
    health: {
      type: Number,
      required: true,
    },
    race: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    cardImage: {
      type: String,
      required: true,
    },
    activeCardHand: {
      type: String,
      required: false,
      default: "",
    },
    activeFightCard: {
      type: String,
      required: false,
      default: "",
    },
    energyError: {
      type: Boolean,
      required: false,
      default: false,
    },
    turnError: {
      type: Boolean,
      required: false,
      default: false,
    },
    player: {
      type: String,
      required: false,
    },
    hpChange: {
      type: Object,
      required: false,
      default() {
        return {
          active: false,
          name: "",
          player: "",
        };
      },
    },
    deck: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
    };
  },
  watch: {
    // Watch if monster hp drops to zero
    health(newVal) {
      if (newVal <= 0) {
        this.$emit("monsterDestroyed", {
          name: this.name,
          player: this.player,
        });
      }
    },
  },
  computed: {
    // Check if card is activated
    handActive() {
      return this.activeCardHand === this.name;
    },
    // Check if error message is at the correct card
    errorActive() {
      return this.energyError && this.handActive;
    },
    turnActive() {
      return this.turnError && this.handActive;
    },
    // Match attack info on correct card
    attackInfo() {
      return (
        this.hpChange.active &&
        this.hpChange.name === this.name &&
        this.hpChange.player === this.player
      );
    },
  },
};
</script>

<style lang="scss">
@import "~@/scss/card.scss";
</style>