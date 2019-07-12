<template>
  <div id="app">
    <Navigation v-if='currentUser'></Navigation>
    <router-view/>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue'
import {mapState} from 'vuex'
export default {
  name: 'App',
  components: {Navigation},
  computed: {
    ...mapState(['currentUser'])
  }
}
</script>
