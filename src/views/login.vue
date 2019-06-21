<template>
  <b-container fluid>
    <b-row>
      <b-col col sm="12" md="6" offset-md="3" class="text-left pt-5">
        <b-form @submit="onSubmit">
      <b-form-group
        id="input-group-1"
        label="Email address:"
        label-for="email" >
        <b-form-input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="Enter email"
        ></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-2" label="Password:" label-for="password">
        <b-form-input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="Enter password"
        ></b-form-input>
      </b-form-group>

   

      <b-button type="submit" variant="primary" :disabled="loading">Login</b-button> 
    </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

 import * as firebase from 'firebase/app';
 import 'firebase/auth';
import { mapMutations } from 'vuex';
import * as mu from "../store/mutations";
    
export default {
  name: "login",
  data() {
    return {
        form : {
            email:'',
            password:''
        },
        loading: false
    };
  },

  methods: {
      onSubmit() {
          // debugger
          this.loading = true
          firebase.auth().signInWithEmailAndPassword(this.form.email, this.form.password)
          .then( () => {

              this.loading = false
              this[mu.SET_CURRENT_USER](firebase.auth().currentUser);
              this.$router.replace('home')
              
          })
          .catch(err => {
              alert(err.message)
              // console.log(err)
              this.loading = false
          })

      },

      ...mapMutations([
          mu.SET_CURRENT_USER
      ])
  }


 
};
</script>


<style scoped>
</style>


