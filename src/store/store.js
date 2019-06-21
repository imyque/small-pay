import Vue from 'vue'
import Vuex from 'vuex'
import * as ac from "./actions"
import * as mu from "./mutations"
import * as ge from "./getters"
import {API} from "../main" 

Vue.use(Vuex)

export default new Vuex.Store({

  state: {
    banks: [],
    recipients: [],
    currencies: [{ text: "Nigerian Naira", value: "NGN" }],
    user: {}
  },


  mutations: {
    [mu.SET_RECIPIENTS] (state, recipients) {     
      state.recipients = recipients
    },
    [mu.SET_BANKS] (state, banks) {     
      state.banks = banks
    },

    [mu.SET_CURRENT_USER] (state, user ) {
      
      localStorage.setItem(ge.GET_CURRENT_USER, JSON.stringify(user))
      state.user = user
    }
  },


  actions: {
    [ac.GET_BANKS] () {
      return API.get('bank')
    },

    [ac.VERIFY_ACCOUNT] (ctx, account) {

      return API.get(`bank/resolve?account_number=${account.account_number}&bank_code=${account.bank_code}`)

    },

    [ac.CREATE_RECIPIENT] (ctx, recip) {

      
      return API.post("transferrecipient", recip)

    },

    [ac.GET_RECIPIENTS]() {

      return API.get("transferrecipient")

    },

    [ac.GET_BALANCE]() {
      return API.get("balance")
    },

    [ac.GET_RECIPIENT_LOCAL](ctx, recipient_code) {

      if (!recipient_code ) {
        return {}
      }

      return ctx.state.recipients.find(rec => {
        rec.recipient_code === recipient_code
      })
    },

    [ac.GET_INITIATE_TRANSFER] (ctx, transfer) {

      return API.post("transfer", transfer)

    },

    [ac.GET_FINALIZE_TRANSFER] (ctx, transfer) {

      return API.post("transfer/finalize_transfer", transfer)

    },

    [ac.GET_VERIFY_TRANSFER] (ctx, transfer_code) {

      return API.get(`transfer/${transfer_code}`)

    },

    [ac.GET_RESEND_TRANSFER_OTP](ctx, transfer) {

      return API.post("transfer/resend_otp", transfer)

    },

    [ac.UPDATE_RECIPIENT](ctx, recip) {
      //name, email
      return API.put(`transferrecipient/${recip.recipient_code}`, recip)

    },


    [ac.DELETE_RECIPIENT](ctx, recipient_code) {

      return API.delete(`transferrecipient/${recipient_code}`)

    },
    

},


getters: {

  [ge.GET_RECIPIENTS] (state) {
    return state.recipients   
  },

  [ge.GET_BANKS] (state) {
    return state.banks   
  },

  [ge.GET_CURRENCIES] (state) {
    return state.currencies   
  },

  [ge.GET_CURRENT_USER] (state) {
    // debugger
    if (!state.user || !state.user.email) {
      state.user = JSON.parse(localStorage.getItem(ge.GET_CURRENT_USER))
    }  
    return state.user
  },

}


})
