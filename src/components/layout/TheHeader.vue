<template>
  <div id="main-nav">
    <router-link to="/">
      <div id="homepage">
        <h2>ArenaWars</h2>
        <img src="~@/assets/swords.svg" alt="Arenawars-logo" />
      </div>
    </router-link>
    <a href="https://github.com/michaell92/Arena-wars" target="_blank"
      ><h2>Github</h2></a
    >
  </div>
</template>

<style scoped lang="scss">
h2 {
  /* margin: 50px; */
}

#main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 5px solid blueviolet;
  width: 100%;

  #homepage {
    display: flex;
    img {
      width: 40px;
      margin-left: 10px;
    }
  }
  a {
  }
}
</style>