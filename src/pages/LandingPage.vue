<template>
  <div class="container">
    <transition name="game-over">
      <game-over
        v-if="(playerOneHP <= 0 || playerTwoHP <= 0) && showPopup"
        id="gameover"
        :player="playerOneHP <= 0 ? 'One' : playerTwoHP <= 0 ? 'Two' : ''"
        @close="closePopup($event)"
      ></game-over>
    </transition>
    <transition name="fade">
      <div v-if="playerTwoReady" id="ready-popup">Your turn!</div>
    </transition>
    <div id="main">
      <div id="top">
        <button @click="startNewGame" id="game-reset">New Game</button>
        <div id="switch">
          <p>Helper:</p>
          <div class="button" id="button-1">
            <input type="checkbox" class="checkbox" v-model="helperSwitch" />
            <div class="first"></div>
            <div class="second"></div>
          </div>
        </div>
      </div>

      <!-- First player base -->
      <div id="player-1">
        <div id="player-main-section">
          <!-- Player info -->
          <div class="player-info">
            <div class="player-icon">
              <span>AI</span>
              <img
                src="~@/assets/bot.svg"
                alt="bot"
                id="bot-icon"
                :class="{
                  attackable:
                    Object.keys(activatedCardHand).length &&
                    Object.keys(activatedFightCard).length,
                }"
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
                <transition name="attack-message">
                  <p
                    v-if="
                      hpChange.name === 'player' &&
                      hpChange.player === 'one' &&
                      hpChange.active
                    "
                    class="attack-info"
                  >
                    {{ hpChange.health }}
                  </p>
                </transition>
                <span>Health: </span> {{ playerOneHP }}
              </div>
              <div class="player-energy">
                <span>Energy: </span> {{ playerOneEnergy }}
              </div>
            </div>
          </div>
          <div id="player-1-main">
            <!-- Dealt cards from the deck -->
            <div id="player-1-hand" :class="{ m1: playerOneHand.length > 0 }">
              <!-- <img src="@/assets/card-game.svg" alt="card" /> -->
              <transition-group name="flip-list-2">
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
              </transition-group>
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
          <transition-group name="animate-deployed">
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
              :activeCardHand="activatedCardHand.name"
              :activeFightCard="activatedFightCard.name"
              player="one"
              deck="deployed"
              :hpChange="hpChange"
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
          </transition-group>
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
              player="two"
              deck="deployed"
              :hpChange="hpChange"
              @monsterDestroyed="removeMonsterFromDeployed"
              @click="selectAttackingCard(card, playerTwoDeployedDeck)"
            ></base-card>
          </transition-group>
        </div>

        <div
          v-if="
            playerTwoFightingPhase &&
            Object.keys(activatedFightCard).length === 0 &&
            !helperSwitch &&
            activePlayer === 'Player-2'
          "
          id="fightInstruction"
        >
          Select attacking card!
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
                  player="two"
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
          <div
            v-if="
              playerTwoDeploymentPhase &&
              !helperSwitch &&
              activePlayer === 'Player-2'
            "
            id="deployInstruction"
            class="text-center"
          >
            Tap twice on card to deploy!
          </div>
          <div class="player-info">
            <div class="player-icon">Player</div>
            <div class="player-right">
              <div class="player-hp">
                <transition name="attack-message">
                  <p
                    v-if="
                      hpChange.name === 'player' &&
                      hpChange.player === 'two' &&
                      hpChange.active
                    "
                    class="attack-info-player"
                  >
                    {{ hpChange.health }}
                  </p>
                </transition>
                <span>Health: </span> {{ playerTwoHP }}
              </div>
              <div class="player-energy">
                <span>Energy: </span> {{ playerTwoEnergy }}
              </div>
            </div>
          </div>
        </div>
        <div id="player-2-deck">
          <transition name="fade-out">
            <p
              v-if="activePlayer === 'Player-2' && currentMove > 0"
              id="end-turn"
              @click="endCurrentTurnAndInitiateNext('two')"
            >
              End turn
            </p>
          </transition>
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
            <div id="instruction" v-if="currentMove === 0">
              Click on deck to draw a card!
            </div>
          </transition>
          <div
            id="arrow"
            v-if="
              currentMove > 0 &&
              playerTwoDrawAvailable &&
              activePlayer === 'Player-2'
            "
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

        
<script>
import BaseCard from "../components/ui/BaseCard.vue";
import GameOver from "../components/ui/GameOver.vue";
export default {
  components: {
    BaseCard,
    GameOver,
  },
  data() {
    return {
      // Game state
      activePlayer: "Player-2",
      currentMove: 0,
      helperSwitch: false,
      playerOneHP: 10,
      playerTwoHP: 10,
      playerOneEnergy: 5,
      playerTwoEnergy: 5,
      playerOneHand: [],
      playerTwoHand: [],
      playerOneCardActive: false,
      playerTwoCardActive: false,
      activatedCardHand: {},
      activatedFightCard: {},
      playerOneDeployedDeck: [],
      playerTwoDeployedDeck: [],
      playerOneGraveyard: [],
      playerTwoGraveyard: [],
      playerOneDraw: false,
      playerTwoDraw: true,
      playerTwoReady: false,
      energyError: false,
      turnError: false,
      testDeploy: false,
      attackErrorTurn: false,
      showPopup: true,
      hpChange: {
        name: "",
        health: 0,
        player: "",
        active: false,
      },
    };
  },
  watch: {
    gameOver(val) {
      if (val) {
        this.activePlayer = "";
        this.playerOneDraw = false;
        this.playerTwoDraw = false;
      }
    },
  },
  computed: {
    // Main card set
    allCards() {
      return this.$store.getters.allCards;
    },

    // Shuffled set for player one
    playerOneDeck() {
      let cards = JSON.parse(JSON.stringify(this.allCards));
      this.shuffle(cards.length, cards);

      return cards;
    },

    // Shuffled set for player two
    playerTwoDeck() {
      let cards = JSON.parse(JSON.stringify(this.allCards));
      this.shuffle(cards.length, cards);

      return cards;
    },
    // Check if game is over
    gameOver() {
      return this.playerOneHP <= 0 || this.playerTwoHP <= 0;
    },
    // Check if draw is available
    playerOneDrawAvailable() {
      return this.playerOneDraw && this.playerOneDeck.length > 0;
    },
    playerTwoDrawAvailable() {
      return this.playerTwoDraw && this.playerTwoDeck.length > 0;
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
      if (!this.playerOneDeploymentPhase && !this.playerOneDrawAvailable) {
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
      if (!this.playerTwoDrawAvailable) {
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
      this.currentMove = 0;
      this.playerOneHP = 100;
      this.playerTwoHP = 100;
      this.playerOneEnergy = 5;
      this.playerTwoEnergy = 5;
      this.playerOneHand = [];
      this.playerTwoHand = [];
      this.playerOneCardActive = false;
      this.playerTwoCardActive = false;
      this.activatedCardHand = {};
      this.activatedFightCard = {};
      this.playerOneDeployedDeck = [];
      this.playerTwoDeployedDeck = [];
      this.playerOneDraw = false;
      this.playerTwoDraw = true;
      this.playerTwoReady = false;
      this.energyError = false;
      this.turnError = false;
      this.testDeploy = false;
      this.attackErrorTurn = false;
      this.showPopup = true;
      this.hpChange = {
        name: "",
        health: 0,
        player: "",
        active: false,
      };

      // Reset store state
      this.$store.dispatch("resetState");

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
    playerTwoCardDeal(deckTwo, handTwo) {
      // Deal a card for player if it is your turn and draw is available
      if (
        this.activePlayer === "Player-2" &&
        this.playerTwoDrawAvailable === true
      ) {
        // Draw a card and make drawing cards for player unavailable
        // Increase move counter
        this.currentMove++;

        // Deal card and make drawing for player unavailable
        this.playerCardDeal(deckTwo, handTwo);

        // End player drawing phase
        this.playerTwoDraw = false;

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
        if (this.activePlayer === "Player-1" && this.playerOneDraw === true) {
          // Deal card
          this.playerCardDeal(deckOne, handOne);

          // Invalidate draw availability
          this.playerOneDraw = false;

          setTimeout(() => {
            // Choose a card for deployment
            if (this.playerOneDeploymentPhase) {
              // Select a card
              const card = this.cardDeploymentSelect(handOne);

              if (card && this.activePlayer === "Player-1") {
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

            if (
              this.playerOneFightingPhase &&
              this.activePlayer === "Player-1"
            ) {
              // Initiate fight phase
              this.playerOneStartFightPhase(deployedOne);
            }

            // Check if its end of the turn and start player turn
            if (
              !this.playerOneDeploymentPhase &&
              !this.playerOneFightingPhase
            ) {
              this.endCurrentTurnAndInitiateNext("one");
            }
          }, 500);
        }
      }, 1000);
    },
    // Make cards deployable
    makeDeployable(handDeck) {
      for (let i = 0; i < handDeck.length; i++) {
        handDeck[i].deployReady = true;
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
      if (this.activePlayer === "Player-2") {
        // Check if selected card is activated
        if (this.activatedCardHand.name !== card.name) {
          this.activatedCardHand = card;
        } else {
          // Reset activated card name
          this.activatedCardHand = {};

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
              this.activatedCardHand = {};
            }, 100);

            // Remove error message
            setTimeout(() => {
              this.energyError = false;
              this.turnError = false;
            }, 1000);
          }
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
        this.activatedCardHand = {};

        // Use special
      }
    },
    // Player one attacked
    attacked(attacker, attacked) {
      if (this.activePlayer === "Player-2") {
        if (attacker.attackReady && !this.playerTwoDrawAvailable) {
          // Calculate attack after defense
          const calcAttack = this.calcAttack(attacker.attack, attacked.defense);

          // Calculate remaining hp after attacking
          attacked.health = attacked.health - calcAttack;

          // Add attack animation
          this.addAttackAnimation(attacked.name, calcAttack, "one");

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
            this.activatedFightCard = {};
          }, 1000);
        }

        // Reset card status
        this.activatedFightCard = {};
        this.activatedCardHand = {};
      }
    },
    // Recalculate player one hp after attack
    attackedPlayerOne(attacker) {
      if (this.activePlayer === "Player-2") {
        if (attacker.attackReady && !this.playerTwoDrawAvailable) {
          this.playerOneHP = this.playerOneHP - attacker.attack;

          // Add attack animation
          this.addAttackAnimation("player", attacker.attack, "one");

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
            this.activatedFightCard = {};
          }, 1000);
        }
        // Reset card status
        this.activatedFightCard = {};
        this.activatedCardHand = {};
      }
    },
    // Start attack phase for player one
    playerOneStartFightPhase(attackingDeck) {
      // Get enemy info
      const enemyDeck = this.playerTwoDeployedDeck;
      // Check if there are monsters in the enemy deck
      // And attack player if there are not
      if (enemyDeck.length === 0) {
        for (let i = 0; i < attackingDeck.length; i++) {
          if (attackingDeck[i].attackReady && attackingDeck[i].health > 0) {
            setTimeout(() => {
              // Recalculate enemy health
              this.playerTwoHP = this.playerTwoHP - attackingDeck[i].attack;

              // Add attack animation
              this.addAttackAnimation("player", attackingDeck[i].attack, "two");

              // End attacking turn for the card
              attackingDeck[i].attackReady = false;

              // Check if its end of the turn and start player turn
              if (
                !this.playerOneDeploymentPhase &&
                !this.playerOneFightingPhase
              ) {
                this.endCurrentTurnAndInitiateNext("one");
              }
            }, 500);
          }
        }
      } else {
        // Loop deck and attack enemy with lowest hp
        for (let i = 0; i < attackingDeck.length; i++) {
          if (
            attackingDeck[i].attackReady &&
            attackingDeck[i].health > 0 &&
            enemyDeck.length > 0
          ) {
            setTimeout(() => {
              // Check if there are enemy monsters left
              if (enemyDeck.length > 0) {
                // Find monster with lowest hp
                const lowestHPEnemy = enemyDeck.reduce(this.findLowestHP);

                // Calculate attack after defense
                const calcAttack = this.calcAttack(
                  attackingDeck[i].attack,
                  lowestHPEnemy.defense
                );

                // Recalculate enemy hp
                lowestHPEnemy.health = lowestHPEnemy.health - calcAttack;

                // Add attack animation
                this.addAttackAnimation(lowestHPEnemy.name, calcAttack, "two");
                // If there are no enemy monsters left, attack enemy player
              } else {
                // Recalculate enemy player health
                this.playerTwoHP = this.playerTwoHP - attackingDeck[i].attack;

                // Add attack animation
                this.addAttackAnimation(
                  "player",
                  attackingDeck[i].attack,
                  "two"
                );
              }

              // End attacking turn for the card
              attackingDeck[i].attackReady = false;

              // Check if its end of the turn and start player turn
              if (
                !this.playerOneDeploymentPhase &&
                !this.playerOneFightingPhase
              ) {
                this.endCurrentTurnAndInitiateNext("one");
              }
            }, 500 + i * 1000);
          }
        }
      }
    },
    // Remove destroyed monster
    removeMonsterFromDeployed(monsterInfo) {
      let deck = "";
      // Get correct deck
      if (monsterInfo.player === "one") {
        deck = this.playerOneDeployedDeck;
      } else {
        deck = this.playerTwoDeployedDeck;
      }

      // Get id and remove card
      const id = deck.findIndex((card) => card.name === monsterInfo.name);
      deck.splice(id, 1);
    },
    endTurn(player) {
      if (player === "one") {
        // Add energy for enemy
        this.playerOneEnergy++;

        // Change turn to player
        this.activePlayer = "Player-2";
        this.playerTwoDraw = true;

        // Add animation delay
        setTimeout(() => {
          this.playerTwoReady = true;
        }, 500);

        setTimeout(() => {
          this.playerTwoReady = false;
        }, 1000);
      } else {
        // Add energy for a player
        this.playerTwoEnergy++;

        // Change turn to enemy
        this.activePlayer = "Player-1";
        this.playerOneDraw = true;
      }
    },
    // End current turn and start next one
    endCurrentTurnAndInitiateNext(player) {
      if (player === "one") {
        // End current turn
        this.endTurn(player);

        // Make player cards deployable
        this.makeDeployable(this.playerTwoHand);

        // Fighting phase activation for player
        if (this.playerTwoDeployedDeck.length > 0) {
          this.initiateFightPhase(this.playerTwoDeployedDeck);
        }
      } else if (player === "two") {
        // End player turn
        this.endTurn(player);

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
    // Add attack animation and information
    addAttackAnimation(attackedName, health, player) {
      // Add animation
      let hpChange = {
        name: attackedName,
        health,
        player: player,
        active: true,
      };

      this.hpChange = { ...this.hpChange, ...hpChange };

      // Remove animation
      setTimeout(() => {
        this.hpChange.active = false;
      }, 500);
    },
    // Close gameover popup
    closePopup(newGame) {
      // Check if pop is just closing or starting a new game
      if (newGame) {
        this.startNewGame();
      } else {
        this.showPopup = false;
      }
    },
    // Randomize function
    randomize(n) {
      return Math.floor(Math.random() * n);
    },
    // Calculate attack after defense
    calcAttack(attack, defense) {
      const calc = Math.ceil(attack - defense / 3);

      return calc > 0 ? calc : 1;
    },
    // Find monster with lowest hp
    findLowestHP(prev, next) {
      return prev.health < next.health ? prev : next;
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

.flip-list-2-move {
  transition: transform 0.5s ease;
}

.flip-list-2-leave-to {
  transform: translateY(50px);
  opacity: 0;
  transition: all 0.3s ease;
}

.animate-deployed-move {
  transition: transform 0.5s ease;
}

.animate-deployed-leave-to {
  transform: translateX(200px);
  opacity: 0;
  transition: all 0.5s ease;
}
</style>