<template>
  <div id="app">
    <h1>Vue Inspector Plugin Demo</h1>
    <div>
      <router-link to="/a">Goto AlphaView</router-link>
      <span class="divider">|</span>
      <router-link to="/b">Goto BetaView</router-link>
    </div>
    <router-view />
  </div>
</template>

<style>
#app {
  margin: 100px auto;
  padding: 20px;
  width: 500px;
  text-align: center;
  border: 1px solid #ddd;
}

.divider {
  margin: 0 8px;
}

h1,
h2,
h3 {
  margin: 0 0 20px 0;
}
</style>
