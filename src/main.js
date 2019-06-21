import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth';


import { library } from '@fortawesome/fontawesome-svg-core'
import { faRecycle, faRetweet, faPlay, faCheckDouble, faStamp, faPaperPlane, 
  faEdit, faTrashAlt, faPlusSquare, faSignOutAlt, faMoneyBillAlt, faTruckMoving, faBalanceScale,
  faSave , faUserCheck, faWindowClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import axios from 'axios'

import App from './App.vue'
import router from './router'
import store from './store/store'

Vue.config.productionTip = false

library.add( faRecycle, faRetweet, faPlay, faCheckDouble, faStamp, faPaperPlane, 
  faEdit, faTrashAlt, faPlusSquare, faSignOutAlt, faMoneyBillAlt, faTruckMoving, faBalanceScale,
  faSave, faUserCheck, faWindowClose )
Vue.component('font-awesome-icon', FontAwesomeIcon)

//  Firebase Initialize
const firebaseConfig = {
  apiKey: "AIzaSyCjRuJydBF1NIS5TbFt33iTcJqu37sesws",
  authDomain: "small-pay.firebaseapp.com",
  databaseURL: "https://small-pay.firebaseio.com",
  projectId: "small-pay",
  storageBucket: "small-pay.appspot.com",
  messagingSenderId: "358015626647",
  appId: "1:358015626647:web:37615a5860f1dbb9"
};

firebase.initializeApp(firebaseConfig);
const firestoreConfig = { };
firebase.firestore().settings(firestoreConfig);

export const DISBURSEMENTS = 'disbursements'
export const FIRE_STORE = firebase.firestore()

// Axios API Configuration
export const API = axios.create({
  baseURL: 'https://api.paystack.co/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer sk_test_2b93e160b19241103569ab1372526a91575e0a1f'
  },
  withCredentials: false
})


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
