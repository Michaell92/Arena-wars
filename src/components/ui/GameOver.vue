<template>
  <div id="container">
    <h2 id="title" :class="{ red: player === 'Two', green: player === 'One' }">
      {{ player === "Two" ? lostMessage : player === "One" ? wonMessage : "" }}
    </h2>
    <div id="bottom">
      <h5 id="close" class="text-center" @click="$emit('close')">Close</h5>
      <h5 id="new-game" class="text-center" @click="$emit('close', 'gameOver')">
        New Game
      </h5>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    player: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      wonMessage: "Congratulations, you won!",
      lostMessage: "Tough luck, you lost!",
    };
  },
};
</script>

<style scoped>
#bottom {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

#title {
  margin-bottom: 30px;
}

.red {
  color: red;
}

.green {
  color: green;
}

#close,
#new-game {
  cursor: pointer;
  border-bottom: 3px solid lightblue;
  border-radius: 10px;
  padding: 2px 5px;
}
</style>