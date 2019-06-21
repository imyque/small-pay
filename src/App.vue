<template>
  
    <b-container id="app" >
      <!-- Header -->
      <b-row class="mb-3 mt-3" style="border-bottom: 3px solid #3e8ee4;">
        <b-col col sm="12" md="3"  class="text-left mb-2 pr-5">
          <img alt="Vue logo" src="./assets/logo.png" width="40px" >&nbsp;&nbsp; 
          <h4 style="display: inline">Small Pay</h4>
        </b-col>
        <b-col id="nav" col sm="9" md="7">
          <b-nav pills>
            <b-nav-item>
              <router-link v-show="currentUser" to="/home">
              <font-awesome-icon icon="money-bill-alt"/> Home</router-link>
            </b-nav-item>
            <b-nav-item>
              <router-link v-show="currentUser" to="/suppliers">
              <font-awesome-icon icon="truck-moving"/> Suppliers</router-link>
            </b-nav-item>
            <!--b-nav-item><router-link to="/login">Login</router-link></b-nav-item>
            <b-nav-item disabled>Disabled</b-nav-item-->
          </b-nav>
        </b-col>
        <b-col id="nav" col sm="3" md="2">
          <b-nav pills class="text-right flush">
            <b-nav-item >
              <a href="#" @click="logOut()" v-show="currentUser">
                <font-awesome-icon icon="sign-out-alt"/> Log Out</a>
            </b-nav-item>
          </b-nav>
        </b-col>
      </b-row>
      <!-- Body -->
      <b-row>
        <b-col  col sm="12" >
        <router-view/>
        </b-col>
      </b-row>
    </b-container>
  
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { mapGetters, mapMutations } from "vuex"
import * as ge from "./store/getters"
import * as mu from "./store/mutations"


export default {

  methods: {
    logOut() {
      // debugger
      const self = this
      firebase.auth().signOut()
        .then(function() {
          self[mu.SET_CURRENT_USER](null);
          this.$router.push('/login')
        }).catch(function(error) {
          alert(error)
        });
    },

    ...mapMutations([mu.SET_CURRENT_USER])
  },

  computed: {
    
    ...mapGetters({
      currentUser: ge.GET_CURRENT_USER
    })
  },

  
}


</script>


<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 12px;
  
}

.btn {
  font-size: 12px;
}

.form-control {
  font-size: 12px;
}

body {
  font-size: 12px;
}

#nav a {
  
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  font-weight: bold;
  color:#0056b3;;
}

.flush {
  float: right;
}

.svg-inline--fa {
  cursor: pointer;
}

</style>
