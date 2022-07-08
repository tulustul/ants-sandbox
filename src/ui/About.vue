<script setup lang="ts">
import FieldGroup from "./forms/FieldGroup.vue";
import { state } from "./state";
import Crypto from "./widgets/Crypto.vue";

function showWelcome() {
  state.tourMode = true;
  state.isWelcomed = false;
}
</script>

<template>
  <div class="wrapper">
    <div class="top">
      <h2>Ants Simulator</h2>
      <p class="description">
        A simple and completely useless simulation of an ant colony.
      </p>

      <FieldGroup class="tips" label="Tips accepted :)">
        <div>
          <Crypto
            crypto="Bitcoin"
            address="bc1qnmgjuquv6f5m5asrgnv3xv9mwu6whkuwmax39c"
          />
          <Crypto
            crypto="Bitcoin Lightning"
            address="ab34b1a9df58ecab7b0c0b1c636d6ea72fa29662152be8aaabcc82c2b631af07"
            short-address="743637x1488x1"
          />
          <Crypto
            crypto="Ethereum"
            address="0x8412Ac0B3d7cd2b1Bc0660e06df6bF3D3f2bE9Fd"
          />
          <Crypto
            crypto="Algorand"
            address="P3CG3C43XLDOASKINQMHMLLVLLKJYUUTQVSAK7EUZS6UUH6BN5UO5JG7KM"
          />
        </div>
      </FieldGroup>

      <p>
        The project is open source. You can find the code on
        <a href="https://github.com/tulustul/ants-sandbox" target="_blank">
          Github </a
        >.
      </p>
    </div>

    <p>
      Contact:
      <a href="mailto:mateusz.tomczyk.tul@gmail.com">
        mateusz.tomczyk.tul@gmail.com
      </a>
    </p>

    <div class="bottom">
      <span class="version">v0.1.0</span>
      <button class="btn btn-primary" @click="showWelcome">
        Show welcome screen
      </button>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.top {
  flex-grow: 1;
}
.bottom {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
h2 {
  text-align: center;
}
.description {
  color: #aaa;
}
.version {
  color: #aaa;
  font-size: 12px;
}
.tips {
  margin: 10px 0;
}
a:link,
a:visited {
  color: green;
}
</style>
