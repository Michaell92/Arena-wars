<template>
  <router-link to="/">
    <div id="homepage">
      <h2>ArenaWars</h2>
      <img src="~@/assets/swords.svg" alt="Arenawars-logo" />
    </div>
  </router-link>
</template>

<style scoped>
h2 {
  /* margin: 50px; */
}

#homepage {
  display: flex;
  padding: 20px;
  border-bottom: 5px solid blueviolet;
  width: 100%;
}

img {
  width: 40px;
  margin-left: 10px;
}
</style>