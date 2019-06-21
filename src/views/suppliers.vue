<template>
  <b-container fluid>
    <b-row class="mb-2">
      <b-col col sm="12" class="text-left">
        <b-button v-b-modal.modal-supplier variant="primary">
          <font-awesome-icon icon="plus-square"/> New Supplier
        </b-button>
      </b-col>
    </b-row>

    <b-row>
      <b-col col sm="12" class="text-left">
        <b-table striped hover :items="recipients" :fields="fields">
          <template slot="actions" slot-scope="row">
            <span v-b-tooltip.hover title="Edit Supplier">
              <font-awesome-icon @click="openEditDialog(row.item)" icon="edit"/>&nbsp;
            </span>

            <span v-b-tooltip.hover title="Delete Supplier">
              <font-awesome-icon @click="deleteClient(row.item)" icon="trash-alt"/>&nbsp;
            </span>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <b-modal id="modal-supplier" :title="(form.update ? 'Edit' : 'New') + ' Supplier'">
      <b-form>
        <b-form-group id="input-group-1" label="Name:" label-for="name">
          <b-form-input id="name" v-model="form.name" maxlength="150" required placeholder="Name"></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-6" label="Email:" label-for="email" description="Optional">
          <b-form-input
            id="email"
            v-model="form.email"
            maxlength="100"
            type="email"
            placeholder="Email"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label="Account Number:" label-for="accountnumber">
          <b-form-input
            id="accountnumber"
            v-model="form.account_number"
            maxlength="10"
            minlength="10"
            required
            :disabled="form.update"
            placeholder="NUBAN Account Number"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-5" label="Bank:" label-for="bank">
          <b-form-select
            id="bank"
            v-model="form.bank_code"
            :options="banks"
            text-field="name"
            value-field="code"
            required
            :disabled="form.update"
          ></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-4" label="Currency:" label-for="currency">
          <b-form-select id="currency" 
          v-model="form.currency" 
          :options="currencies" 
          :disabled="form.update"
          required></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-3" label="Account Name:" label-for="accountname">
          <b-form-input
            id="accountname"
            v-model="form.account_name"
            required
            readonly
            placeholder="Account Name"
          ></b-form-input>
        </b-form-group>
      </b-form>

      <div slot="modal-footer" class="w-100">
        <b-button variant="secondary" class="float-left" @click="cancelDialog()">
          <font-awesome-icon icon="window-close"/> Close
        </b-button>

        <b-button
          @click="createClient(form)"
          class="float-right ml-1"
          variant="primary"
          v-if="!form.update"
          :disabled="loading || !form.account_name || !form.account_number || !form.bank_code || !form.currency || !form.name"
        >
          <font-awesome-icon icon="save"/> Save Supplier
        </b-button>

        <b-button
          @click="updateClient(form)"
          class="float-right ml-1"
          variant="primary"
          v-if="form.update"
          :disabled="loading || !form.name"
        >
          <font-awesome-icon icon="save"/> Update Supplier
        </b-button>

        <b-button
          @click="validateAccount(form)"
          class="float-right ml-1"
          variant="primary"
          v-if="!form.update"
          :disabled="loading || !form.account_number || !form.bank_code || !form.currency || !form.name"
        >
          <font-awesome-icon icon="user-check"/> Verifiy
        </b-button>
      </div>
    </b-modal>
  </b-container>
</template>


<script>

import { FIRE_STORE, DISBURSEMENTS } from "../main";

import { mapGetters, mapMutations, mapActions } from "vuex";
import * as ac from "../store/actions";
import * as mu from "../store/mutations";
import * as ge from "../store/getters";


export default {
  name: "suppliers",
  data() {
    return {
      form: {
        account_number: null,
        name: null,
        currency: null,
        account_name: null,
        bank_code: null,
        email: null,
        update: false
      },
      loading: false,
      fields: [
        {
          key: "name",
          label: "Name",
          sortable: true
        },
        {
          key: "email",
          label: "Email",
          sortable: true
        },
        {
          key: "details.account_name",
          label: "Account Name",
          sortable: true
        },
        {
          key: "details.account_number",
          label: "Account Number",
          sortable: true
        },
        {
          key: "details.bank_name",
          label: "Bank",
          sortable: true
        },
        "currency",
        {
          key: "actions",
          label: "Actions",
          sortable: false
        }
      ]
    };
  },

  computed: {
    ...mapGetters({
      banks: ge.GET_BANKS,
      recipients: ge.GET_RECIPIENTS,
      currencies: ge.GET_CURRENCIES
    })
  },

  methods: {
    validateAccount() {
      this.loading = true;
      this[ac.VERIFY_ACCOUNT](this.form)
        .then(res => {
          this.loading = false;
          this.form.account_name = res.data.data.account_name;
        })
        .catch(err => {
          this.loading = false;
          alert(err.response.data.message);
        });
    },

    createClient() {
      this.loading = true;

      this.form.description = this.form.name;
      this.form.metadata = {
        type: "Supplier"
      };
      this.form.type = "nuban";
      this[ac.CREATE_RECIPIENT](this.form)
        .then(res => {
          //console.log(res.data.data);

          this.recipients.push(res.data.data);

          this.loading = false;
          this.$bvModal.hide("modal-supplier");
        })
        .catch(err => {
          this.loading = false;
          alert(err.response.data.message);
        });
    },

    cancelDialog() {
      this.form = {
        account_number: null,
        name: null,
        currency: "NGN",
        account_name: null,
        bank_code: null,
        email: null,
        update: false
      };
      this.$bvModal.hide("modal-supplier");
    },

    getClients(remote = false) {
      if (!this.recipients.length || remote) {
        this[ac.GET_RECIPIENTS]()
          .then(res => {
            this[mu.SET_RECIPIENTS](res.data.data);
            // console.log(res);
          })
          .catch(err => {
            alert(err.response.data.message);
          });
      }
    },

    getBankList() {
      if (!this.banks.length) {
        this[ac.GET_BANKS]()
          .then(res => {
            this[mu.SET_BANKS](res.data.data);
            // console.log(res);
          })
          .catch(err => {
            alert(err.response.data.message);
          });
      }
    },

    deleteClient(recipient) {

      // Check if supplier has transactions
      FIRE_STORE.collection(DISBURSEMENTS)
        .where("recipient", "==", recipient.recipient_code)
        .get()
        .then(res => {
          //debugger
          if (res.docs.length){
            alert(`The Supplier cannot be deleted because it associated with ${res.docs.length} disbursements`)
            return false;
          }

          if ( confirm('Do you really want to delete this Supplier?')) {
            // proceed to delete if 0 transactions
            return this[ac.DELETE_RECIPIENT](recipient.recipient_code)
          } else {
            return false
          }
          
        })
        .then(res => {

          if (!res) {
            return
          }
          // refresh list from paystack
          this.getClients(true)
          this.cancelDialog() 
          alert(res.data.message)

        })
        .catch(err => {
          alert(err);
        })

    },

    openEditDialog(recip) {
      
      
      this.form = {
        account_number: recip.details.account_number,
        name: recip.name,
        currency: recip.currency,
        account_name: recip.details.account_name,
        bank_code: recip.details.bank_code,
        email: recip.email,
        id: recip.id
      };
      this.form.update = true
      this.$bvModal.show("modal-supplier");
    },

    updateClient(form){
      this.loading = true;

      let recip = {
        name: form.name,
        email: form.email,
        recipient_code: form.id
      }

      this[ac.UPDATE_RECIPIENT](recip)
        .then(res => {
          
          this.getClients(true);
          alert(res.data.message)

          this.loading = false;
          this.$bvModal.hide("modal-supplier");
        })
        .catch(err => {
          // debugger
          this.loading = false;
          alert(err.response.data.message);
        });
    },

    ...mapActions([
      ac.GET_BANKS,
      ac.VERIFY_ACCOUNT,
      ac.CREATE_RECIPIENT,
      ac.GET_RECIPIENTS,
      ac.UPDATE_RECIPIENT,
      ac.DELETE_RECIPIENT
    ]),

    ...mapMutations([mu.SET_RECIPIENTS, mu.SET_BANKS])
  },
  mounted() {
    this.getBankList();

    this.getClients();
  }
};
</script>
