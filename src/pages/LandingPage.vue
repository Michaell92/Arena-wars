<template>
  <div class="container">
    <transition name="fade">
      <div v-if="playerTwoReady" id="ready-popup">Your turn!</div>
    </transition>
    <div id="main">
      <button @click="startNewGame" id="game-reset">New Game</button>
      <!-- First player base -->
      <div id="player-1">
        <div id="player-main-section">
          <!-- Player info -->
          <div class="player-info" style="margin-bottom: 30px">
            <div class="player-icon">
              <span>AI</span>
              <img
                src="~@/assets/bot.svg"
                alt="bot"
                id="bot-icon"
                @click="
                  attackedPlayerOne(
                    activatedFightCard,
                    this.playerTwoFightingPhase
                  )
                "
              />
            </div>
            <div class="player-right">
              <div class="player-hp">
                <span>Health: </span> {{ playerOneHP }}
              </div>
              <div class="player-energy">
                <span>Energy: </span> {{ playerOneEnergy }}
              </div>
            </div>
          </div>
          <div id="player-1-main">
            <!-- Dealt cards from the deck -->
            <div id="player-1-hand">
              <!-- <img src="@/assets/card-game.svg" alt="card" /> -->
              <base-card
                v-for="card in playerOneHand"
                :key="card.name"
                :name="card.name"
                :attack="card.attack"
                :defense="card.defense"
                :specialDesc="card.specialDesc"
                :specialEffect="card.specialEffect"
                :health="card.health"
                :race="card.race"
                :cost="card.cost"
                :cardImage="card.image"
              ></base-card>
            </div>
          </div>
        </div>
        <div id="player-1-deck">
          <!-- Button for dealing a card from the deck -->
          <button class="no-select">
            <img
              src="@/assets/cards.svg"
              alt="card-deck"
              style="cursor: default"
            />
          </button>
        </div>
      </div>

      <!-- Battleground with deployed cards -->
      <div id="battleground">
        <div id="player-1-deployed">
          <base-card
            v-for="card in playerOneDeployedDeck"
            :key="card.name"
            :name="card.name"
            :attack="card.attack"
            :defense="card.defense"
            :specialDesc="card.specialDesc"
            :specialEffect="card.specialEffect"
            :health="card.health"
            :race="card.race"
            :cost="card.cost"
            :cardImage="card.image"
            player="one"
            @monsterDestroyed="removeMonsterFromDeployed"
            @click="
              attacked(
                activatedFightCard,
                card,
                playerOneDeployedDeck,
                this.playerTwoFightingPhase
              )
            "
          ></base-card>
        </div>
        <h1 class="no-select">Battleground</h1>
        <div id="player-2-deployed">
          <transition-group name="animate-deployed">
            <base-card
              v-for="card in playerTwoDeployedDeck"
              :key="card.name"
              :name="card.name"
              :attack="card.attack"
              :defense="card.defense"
              :specialDesc="card.specialDesc"
              :specialEffect="card.specialEffect"
              :health="card.health"
              :race="card.race"
              :cost="card.cost"
              :cardImage="card.image"
              :activeCardHand="activatedCardHand.name"
              :turnError="turnError"
              :activeFightCard="activatedFightCard"
              player="two"
              @monsterDestroyed="removeMonsterFromDeployed"
              @click="selectAttackingCard(card, playerTwoDeployedDeck)"
            ></base-card>
          </transition-group>
        </div>
      </div>
      <!-- Second player base -->
      <div id="player-2">
        <div id="player-main-section">
          <div id="player-2-main">
            <div id="player-2-hand">
              <transition-group name="flip-list">
                <base-card
                  v-for="card in playerTwoHand"
                  :key="card.name"
                  :name="card.name"
                  :attack="card.attack"
                  :defense="card.defense"
                  :specialDesc="card.specialDesc"
                  :specialEffect="card.specialEffect"
                  :health="card.health"
                  :race="card.race"
                  :cost="card.cost"
                  :cardImage="card.image"
                  :activeCardHand="activatedCardHand.name"
                  :energyError="energyError"
                  :turnError="turnError"
                  @click="
                    changeHandCardStatusAndDeploy(
                      playerTwoDeployedDeck,
                      playerTwoHand,
                      card,
                      playerTwoEnergy,
                      'two'
                    )
                  "
                ></base-card>
              </transition-group>
            </div>
          </div>
          <div class="player-info" style="margin-top: 30px">
            <div class="player-icon">Player</div>
            <div class="player-right">
              <div class="player-hp">
                <span>Health: </span> {{ playerTwoHP }}
              </div>
              <div class="player-energy">
                <span>Energy: </span> {{ playerTwoEnergy }}
              </div>
            </div>
          </div>
        </div>
        <div id="player-2-deck">
          <button
            @click="
              playerTwoCardDeal(
                playerTwoDeck,
                playerTwoHand,
                playerTwoDeployedDeck
              )
            "
            class="no-select"
          >
            <img src="@/assets/cards.svg" alt="card-deck" />
          </button>
          <transition name="fade-out">
            <div id="instruction" v-if="currentMove === 1">
              Click on deck to draw a card!
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseCard from "../components/ui/BaseCard.vue";
export default {
  components: {
    BaseCard,
  },
  data() {
    return {
      // Game state
      activePlayer: "Player-2",
      currentMove: 0,
      playerOneHP: 100,
      playerTwoHP: 100,
      playerOneEnergy: 5,
      playerTwoEnergy: 5,
      playerOneHand: [],
      playerTwoHand: [],
      playerOneCardActive: false,
      playerTwoCardActive: false,
      activatedCardHand: "",
      activatedFightCard: "",
      playerOneDeployedDeck: [],
      playerTwoDeployedDeck: [],
      playerOneGraveyard: [],
      playerTwoGraveyard: [],
      playerOneDrawAvailable: false,
      playerTwoDrawAvailable: true,
      playerTwoReady: false,
      energyError: false,
      turnError: false,
      testDeploy: false,
      attackErrorTurn: false,
      attackErrorPhase: false,
    };
  },
  computed: {
    // Main card set
    allCards() {
      return this.$store.getters.allCards;
    },

    // Shuffled set for player one
    playerOneDeck() {
      let cards = this.allCards.slice(0);
      this.shuffle(cards.length, cards);

      return cards;
    },

    // Shuffled set for player two
    playerTwoDeck() {
      let cards = this.allCards.slice(0);
      this.shuffle(cards.length, cards);

      return cards;
    },
    // Check if deployment phase is over
    playerTwoDeploymentPhase() {
      for (let i = 0; i < this.playerTwoHand.length; i++) {
        if (this.playerTwoHand[i].deployReady === true) {
          if (this.playerTwoHand[i].cost <= this.playerTwoEnergy) {
            return true;
          }
        }
      }
      return false;
    },
    // Enemy deployment phase check
    playerOneDeploymentPhase() {
      for (let i = 0; i < this.playerOneHand.length; i++) {
        if (this.playerOneHand[i].deployReady === true) {
          if (this.playerOneHand[i].cost <= this.playerOneEnergy) {
            return true;
          }
        }
      }
      return false;
    },
    // Fight phase check for enemy
    playerOneFightingPhase() {
      // Check if deployment phase is over
      if (!this.playerOneDeploymentPhase) {
        // Activate fighting phase
        for (let i = 0; i < this.playerOneDeployedDeck.length; i++) {
          if (this.playerOneDeployedDeck[i].attackReady === true) {
            return true;
          }
        }
      }

      return false;
    },
    // Fight phase check for player
    playerTwoFightingPhase() {
      if (!this.playerTwoDeploymentPhase) {
        for (let i = 0; i < this.playerTwoDeployedDeck.length; i++) {
          if (this.playerTwoDeployedDeck[i].attackReady === true) {
            return true;
          }
        }
      }

      return false;
    },
  },
  methods: {
    // Start a new game
    startNewGame() {
      // Reset game state
      this.activePlayer = "Player-2";
      this.currentMove = 1;
      this.playerOneHP = 100;
      this.playerTwoHP = 100;
      this.playerOneEnergy = 5;
      this.playerTwoEnergy = 5;
      this.playerOneHand = [];
      this.playerTwoHand = [];
      this.playerOneCardActive = false;
      this.playerTwoCardActive = false;
      this.activatedCardHand = "";
      this.activatedFightCard = "";
      this.playerOneDeployedDeck = [];
      this.playerTwoDeployedDeck = [];
      this.playerOneDrawAvailable = false;
      this.playerTwoDrawAvailable = true;
      this.playerTwoReady = false;
      this.energyError = false;
      this.turnError = false;
      this.testDeploy = false;

      // Reset deploy status
      this.undeploy(this.allCards);

      // Reset fight status
      this.resetFightStatus(this.allCards);

      // Reshuffle decks
      this.shuffle(this.allCards.length, this.allCards);
    },
    // Basic shuffle method
    shuffle(length, array) {
      for (let i = length - 1; i > 0; i--) {
        // Sweep through array from the end and swap places
        const e = Math.floor(Math.random() * (i + 1));
        [array[i], array[e]] = [array[e], array[i]];
      }
    },
    // Deal a card to the hand
    playerCardDeal(playerDeck, playerHand) {
      // Check if there are cards left in the deck
      if (playerDeck.length > 0) {
        const card = playerDeck[0];
        // Add card to the hand
        playerHand.push(card);

        // Remove dealt card from the deck
        playerDeck.splice(0, 1);
      } else {
        return;
      }
    },
    // Deal a card for a player, go through all turn phases and switch to enemy turn
    playerTwoCardDeal(deckTwo, handTwo, deployedTwo) {
      deployedTwo;
      // Deal a card for player if it is your turn and draw is available
      if (
        this.activePlayer === "Player-2" &&
        this.playerTwoDrawAvailable === true &&
        deckTwo.length > 0
      ) {
        // Draw a card and make drawing cards for player unavailable
        // Increase move counter
        this.currentMove++;

        // Deal card and make drawing for player unavailable
        this.playerCardDeal(deckTwo, handTwo);

        // End player drawing phase
        this.playerTwoDrawAvailable = false;

        // Check if its end of the turn and start enemy turn
        if (!this.playerTwoFightingPhase && !this.playerTwoDeploymentPhase) {
          this.endCurrentTurnAndInitiateNext("two");
        }
      } else {
        return;
      }
    },
    playerOneCardDeal(deckOne, handOne, deployedOne) {
      setTimeout(() => {
        // Deal a card for enemy if it is correct turn and draw is available
        if (
          this.activePlayer === "Player-1" &&
          this.playerOneDrawAvailable === true
        ) {
          // Deal card
          this.playerCardDeal(deckOne, handOne);

          // Invalidate draw availability
          this.playerOneDrawAvailable = false;

          // Choose a card for deployment
          if (this.playerOneDeploymentPhase) {
            // Select a card
            const card = this.cardDeploymentSelect(handOne);

            if (card) {
              // Get final energy result
              const energyResult = this.playerOneEnergy - card.cost;

              // Deploy cards for enemy
              this.deployCard(
                handOne,
                card.name,
                energyResult,
                "one",
                deployedOne
              );
            }
          }

          if (this.playerOneFightingPhase) {
            // Initiate fight phase
            this.playerOneStartFightPhase(deployedOne);
          }

          // Check if its end of the turn and start player turn
          if (!this.playerOneDeploymentPhase && !this.playerOneFightingPhase) {
            this.endCurrentTurnAndInitiateNext("one");
          }
        }
      }, 1000);
    },
    // Make cards deployable
    makeDeployable(handDeck) {
      for (let i = 0; i < handDeck.length; i++) {
        handDeck[i].deployReady = true;
      }
    },
    // Undeploy cards
    undeploy(deck) {
      for (let i = 0; i < deck.length; i++) {
        deck[i].deployReady = false;
      }
    },
    // Reset fight status
    resetFightStatus(deck) {
      for (let i = 0; i < deck.length; i++) {
        deck[i].attackReady = false;
      }
    },
    // Select a card for oponents deployment
    cardDeploymentSelect(hand) {
      // Current player energy
      const ener = this.playerOneEnergy;

      // Sort hand by cost
      const handSorted = hand.slice(0).sort((a, b) => {
        return a.cost - b.cost;
      });

      // Sorted and deployable
      const handSortedAndDeployable = hand
        .slice(0, hand.length - 1)
        .sort((a, b) => {
          return a.cost - b.cost;
        });

      // Highest cost deployable card
      const highestCostCard = this.selectHighestCostCard(
        handSortedAndDeployable,
        ener
      );

      // Check if current highest cost card is equal to current energy and return if it is
      if (Object.keys(highestCostCard).length > 0) {
        if (ener === highestCostCard.cost) {
          return highestCostCard;
        }
      }

      // Check if should wait another turn for a stronger card
      if (this.shouldSaveTurnForCard(handSorted, ener)) {
        this.endTurn("one");
        return;
      } else if (Object.keys(highestCostCard).length > 0) {
        return highestCostCard;
      }
    },
    // Select highest cost card for the enemy
    selectHighestCostCard(hand, ener) {
      const card = {};
      // Loop cards and select one
      for (let i = hand.length - 1; i >= 0; i--) {
        if (hand[i].cost <= ener) {
          card.name = hand[i].name;
          card.cost = hand[i].cost;
          card.deployReady = hand[i].deployReady;

          break;
        }
      }

      return card;
    },
    // Check if should wait turn for a stronger card between top 3 cards
    shouldSaveTurnForCard(hand, ener) {
      if (hand.length > 2) {
        for (let i = hand.length - 1; i >= hand.length - 3; i--) {
          // Check for a new, cost ready card
          if (!hand[i].deployReady && hand[i].cost === ener) {
            return true;
          }
          // Check for any future cost ready card
          if (hand[i].cost === ener + 1) {
            return true;
          }
        }
      } else return false;
    },
    // Check if selected card is activated and deploy if it is
    changeHandCardStatusAndDeploy(deck, hand, card, playerEnergy, player) {
      // Check if selected card is activated
      if (this.activatedCardHand.name !== card.name) {
        this.activatedCardHand = card;
      } else {
        // Reset activated card name
        this.activatedCardHand = "";

        // Get card and deploy it if there is enough energy
        const energyResult = playerEnergy - card.cost;

        if (energyResult >= 0 && card.deployReady) {
          // Deploy card for player
          this.deployCard(hand, card.name, energyResult, player, deck);

          // Check if its enemy turn
          if (
            !this.playerTwoDeploymentPhase &&
            !this.playerTwoDrawAvailable &&
            !this.playerTwoFightingPhase
          ) {
            this.endCurrentTurnAndInitiateNext("two");
          }
        } else {
          // Set error message
          if (energyResult < 0) {
            this.energyError = true;
          }
          if (!card.deployReady) {
            this.turnError = true;
          }

          // Set activated card name to match correct card
          this.activatedCardHand = card;

          setTimeout(() => {
            // Set activated card name
            this.activatedCardHand = "";
          }, 100);

          // Remove error message
          setTimeout(() => {
            this.energyError = false;
            this.turnError = false;
          }, 1000);
        }
      }
    },
    deployCard(hand, cardName, energyResult, player, deck) {
      // Get index of the card
      const index = hand.findIndex((value) => value.name === cardName);

      // Recalculate energy
      if (player === "two") {
        this.playerTwoEnergy = energyResult;
      } else {
        this.playerOneEnergy = energyResult;
      }

      // Deploy card
      const card = hand.find((card) => card.name === cardName);

      // Checker for deploy readiness
      card.deployReady = false;
      deck.push(card);

      // Remove card from the hand
      hand.splice(index, 1);
    },
    // Start fighting phase
    initiateFightPhase(deck) {
      for (let i = 0; i < deck.length; i++) {
        deck[i].attackReady = true;
      }
    },
    // Initiate attack
    selectAttackingCard(card, deployedDeck) {
      deployedDeck;
      // Check if selected card is activated
      if (this.activatedCardHand.name !== card.name) {
        this.activatedCardHand = card;

        // Select card for attack
        this.activatedFightCard = card;
      } else {
        // Reset activated card name
        this.activatedCardHand = "";

        // Use special
      }
    },
    attacked(attacker, attacked) {
      if (this.playerOneDeploymentPhase) {
        // Get info for error activation
        this.attackErrorPhase = true;
        this.activatedFightCard = attacker;

        setTimeout(() => {
          this.attackErrorPhase = false;
          this.activatedFightCard = "";
        }, 1000);
      } else {
        if (attacker.attackReady) {
          // Calculate attack after defense
          const calcAttack = this.calcAttack(attacker.attack, attacked.defense);

          // Calculate remaining hp after attacking
          attacked.health = attacked.health - calcAttack;

          // Invalidate attacking card
          attacker.attackReady = false;

          // Check if its enemy turn
          if (
            !this.playerTwoDeploymentPhase &&
            !this.playerTwoDrawAvailable &&
            !this.playerTwoFightingPhase
          ) {
            this.endCurrentTurnAndInitiateNext("two");
          }
        } else {
          // Error activation...
          this.attackErrorTurn = true;
          this.activatedFightCard = attacker;

          setTimeout(() => {
            this.attackErrorTurn = false;
            this.activatedFightCard = "";
          }, 1000);
        }
      }

      // Reset card status
      this.activatedFightCard = "";
      this.activatedCardHand = "";
    },
    // Recalculate player one hp after attack
    attackedPlayerOne(attacker) {
      if (this.playerOneDeploymentPhase) {
        // Get info for error activation
        this.attackErrorPhase = true;
        this.activatedFightCard = attacker;

        setTimeout(() => {
          this.attackErrorPhase = false;
          this.activatedFightCard = "";
        }, 1000);
      } else {
        if (attacker.attackReady) {
          this.playerOneHP = this.playerOneHP - attacker.attack;

          // Reset attacker fight readiness
          attacker.attackReady = false;

          // Check if its enemy turn
          if (
            !this.playerTwoDeploymentPhase &&
            !this.playerTwoDrawAvailable &&
            !this.playerTwoFightingPhase
          ) {
            this.endCurrentTurnAndInitiateNext("two");
          }
        } else {
          // Error activation...
          this.attackErrorTurn = true;
          this.activatedFightCard = attacker;

          setTimeout(() => {
            this.attackErrorTurn = false;
            this.activatedFightCard = "";
          }, 1000);
        }
      }
      // Reset card status
      this.activatedFightCard = "";
      this.activatedCardHand = "";
    },
    // Start attack phase for player one
    playerOneStartFightPhase(attackingDeck) {
      // Get enemy info
      const enemyDeck = this.playerTwoDeployedDeck;
      // Check if there are monsters in the enemy deck
      // And attack player if there are not
      if (enemyDeck.length === 0) {
        for (let i = 0; i < attackingDeck.length; i++) {
          if (attackingDeck[i].attackReady) {
            // Recalculate enemy health
            this.playerOneHP = this.playerOneHP - attackingDeck[i].attack;

            // End attacking turn for the card
            attackingDeck[i].attackReady = false;
          }
        }
      } else {
        // Sort by lowest hp
        const enemySorted = enemyDeck.sort((a, b) => {
          a.health - b.health;
        });

        // Loop deck and attack enemy with lowest hp
        for (let i = 0; i < attackingDeck.length; i++) {
          if (attackingDeck[i].attackReady) {
            // Calculate attack after defense
            const calcAttack = this.calcAttack(
              attackingDeck[i].attack,
              enemySorted[0].defense
            );

            enemySorted[0].health = enemySorted[0].health - calcAttack;

            // End attacking turn for the card
            attackingDeck[i].attackReady = false;
          }
        }
      }
    },
removeMonsterFromDeployed(monsterInfo) {
  console.log(monsterInfo)
},
    endTurn(player) {
      if (player === "one") {
        // Add energy for enemy
        this.playerOneEnergy++;

        // Change turn to player
        this.activePlayer = "Player-2";
        this.playerTwoDrawAvailable = true;

        // Add animation delay
        setTimeout(() => {
          this.playerTwoReady = true;
        }, 1000);

        setTimeout(() => {
          this.playerTwoReady = false;
        }, 1000);
      } else {
        // Add energy for a player
        this.playerTwoEnergy++;

        // Change turn to enemy
        this.activePlayer = "Player-1";
        this.playerOneDrawAvailable = true;
      }
    },
    // End current turn and start next one
    endCurrentTurnAndInitiateNext(player) {
      if (player === "one") {
        // End current turn
        this.endTurn("one");

        // Make player cards deployable
        this.makeDeployable(this.playerTwoHand);

        // Fighting phase activation for player
        if (this.playerTwoDeployedDeck.length > 0) {
          this.initiateFightPhase(this.playerTwoDeployedDeck);
        }
      } else {
        // End player turn
        this.endTurn("two");

        // Deployment phase activation for enemy
        this.makeDeployable(this.playerOneHand);

        // Fighting phase activation for enemy
        this.initiateFightPhase(this.playerOneDeployedDeck);

        // Deal a card for enemy
        this.playerOneCardDeal(
          this.playerOneDeck,
          this.playerOneHand,
          this.playerOneDeployedDeck
        );
      }
    },

    // Randomize function
    randomize(n) {
      return Math.floor(Math.random() * n);
    },
    calcAttack(attack, defense) {
      const calc = Math.ceil(attack - defense / 3);

      return calc > 0 ? calc : 1;
    },
  },
  mounted() {
    console.log();
  },
};
</script>

<style lang="scss">
@import "../scss/landingPage.scss";

.flip-list-move {
  transition: transform 0.5s ease;
}

.flip-list-leave-to {
  transform: translateY(-50px);
  opacity: 0;
  transition: all 0.3s ease;
}

.animate-deployed-move {
  transition: transform 0.5s ease;
}
</style>
