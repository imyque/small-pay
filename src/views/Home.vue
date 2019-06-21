<template>
  <b-container fluid>
    <b-row class="mb-2">
      <b-col col sm="6" class="text-left">
        <b-button v-b-modal.modal-disbursement variant="primary">
          <font-awesome-icon icon="plus-square"/> New Disbursement</b-button>
      </b-col>
      <b-col col sm="6" class="text-right">
        <span>
           <font-awesome-icon icon="balance-scale"/> Current Balance:
          <strong>{{ balance}}</strong>
        </span>
      </b-col>
    </b-row>

    <b-row>
      <b-col col sm="12" class="text-left">
        <b-tabs content-class="mt-3" justified>
          <b-tab title="Pending" active>
            <b-table striped hover :items="pendingDisbursements" :fields="fields">
              <template slot="actions" slot-scope="row">
                <span
                  v-b-tooltip.hover
                  title="Initiate Transfer"
                  v-if="!row.item.transfer_data.transfer_code"
                >
                  <font-awesome-icon @click="initiateTransfer(row)" icon="play"/>&nbsp;
                </span>

                <span
                  v-b-tooltip.hover
                  title="Edit Disbursement"
                  v-if="!row.item.transfer_data.transfer_code"
                >
                  <font-awesome-icon @click="editDisbursement(row.item)" icon="edit"/>&nbsp;
                </span>

                <span
                  v-b-tooltip.hover
                  title="Re-Initiate Transfer"
                  v-if="row.item.transfer_data.transfer_code"
                >
                  <font-awesome-icon @click="initiateTransfer(row)" icon="recycle"/>&nbsp;
                </span>

                <span
                  v-b-tooltip.hover
                  title="Resend Transfer OTP"
                  v-if="row.item.transfer_data.transfer_code && row.item.transfer_data.status == 'otp'"
                >
                  <font-awesome-icon
                    @click="resendOTP(row.item.transfer_data.transfer_code)"
                    icon="paper-plane"
                  />&nbsp;
                </span>

                <span
                  v-b-tooltip.hover
                  title="Finalize Transfer"
                  v-if="row.item.transfer_data.transfer_code && row.item.transfer_data.status == 'otp'"
                >
                  <font-awesome-icon @click="processOTP(row)" icon="stamp"/>&nbsp;
                </span>

                <span
                  v-b-tooltip.hover
                  title="Verify Transfer"
                  v-if="row.item.transfer_data.transfer_code"
                >
                  <font-awesome-icon @click="verifyTransfer(row.item)" icon="check-double"/>&nbsp;
                </span>

                <span
                  v-b-tooltip.hover
                  title="Delete Disbursement"
                >
                  <font-awesome-icon @click="deleteDisbursement(row.item)" icon="trash-alt"/>&nbsp;
                </span>

              </template>
            </b-table>
          </b-tab>
          <b-tab title="Paid">
            <b-table striped hover :items="paidDisbursements" :fields="fieldsPaid">
              <template
                slot="transfer_data.updatedAt"
                slot-scope="row"
              >{{row.item.transfer_data.updatedAt | date}}</template>
            </b-table>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>

    <!-- Disbursment Modal  -->

    <b-modal id="modal-disbursement" :title="(form.update ? 'Edit' : 'New') + '  Disbursement'">
      <b-form>
        <b-container fluid>
          <b-row>
            <b-col>
              <b-form-group id="input-group-2" label="Invoice Number:" label-for="invoice_number">
                <b-form-input
                  id="invoice_number"
                  v-model="form.invoice_number"
                  maxlength="20"
                  required
                  placeholder="Invoice Number"
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-1" label="Invoice Date:" label-for="invoice_date">
                <b-form-input
                  id="invoice_date"
                  v-model="form.invoice_date"
                  type="date"
                  required
                  placeholder="Invoice Date"
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group
                id="input-group-5"
                label="Supplier:"
                label-for="recipient"
                :description="accountInfo(form.recipient)"
              >
                <b-form-select
                  id="recipient"
                  v-model="form.recipient"
                  :options="recipients"
                  text-field="name"
                  value-field="recipient_code"
                  required
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group id="input-group-3" label="Amount:" label-for="amount">
                <b-form-input
                  id="amount"
                  v-model="form.amount"
                  required
                  type="number"
                  min="1"
                  placeholder="Amount to Pay"
                ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-4" label="Currency:" label-for="currency">
                <b-form-select id="currency" v-model="form.currency" :options="currencies" required></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group id="input-group-7" label="Purpose:" label-for="reason">
                <b-form-input
                  id="reason"
                  v-model="form.reason"
                  required
                  min="1"
                  placeholder="Purpose of Payment"
                ></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <!--  -->
      </b-form>

      <div slot="modal-footer" class="w-100">
        <b-button variant="secondary" class="float-left" @click="cancelDialog()">
          <font-awesome-icon icon="window-close"/>  
          Close</b-button>

        <b-button
          @click="createDisbursement(form)"
          class="float-right ml-1"
          variant="primary"
          :disabled="loading || !(form.amount && form.currency && form.recipient && form.reason)"
          v-if="!form.update"
        >
        <font-awesome-icon icon="save"/> 
        Save Disbursement</b-button>

        <b-button
          v-if="form.update"
          @click="updateDisbursement(form)"
          class="float-right ml-1"
          variant="primary"
          :disabled="loading || !(form.amount && form.currency && form.recipient && form.reason)"
        >
        <font-awesome-icon icon="save"/> 
        Update Disbursement</b-button>

      </div>
    </b-modal>

    <!-- OTP Modal -->
    <b-modal id="modal-otp" title="Finalize Payment">
      <b-form inline-block>
        <b-form-group id="input-group-2" label="Invoice Number:" label-for="invoice_number">
          <b-form-input
            id="invoice_number"
            v-model="currentDisbursement.invoice_number"
            maxlength="20"
            readonly
            placeholder="Invoice Number"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="input-group-5"
          label="Supplier:"
          label-for="recipient"
          :description="accountInfo(currentDisbursement.recipient)"
        >
          <b-form-select
            id="recipient"
            v-model="currentDisbursement.recipient"
            :options="recipients"
            text-field="name"
            value-field="recipient_code"
            disabled
          ></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-4" label="Currency:" label-for="currency">
          <b-form-select
            id="currency"
            v-model="currentDisbursement.currency"
            :options="currencies"
            disabled
          ></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-3" label="Amount:" label-for="amount">
          <b-form-input
            id="amount"
            v-model="currentDisbursement.amount"
            readonly
            type="number"
            min="1"
            placeholder="Amount to Pay"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-7" label="OTP:" label-for="otp">
          <b-form-input
            id="otp"
            v-model="currentDisbursement.otp"
            required
            min="1"
            placeholder="OTP"
          ></b-form-input>
        </b-form-group>
      </b-form>

      <div slot="modal-footer" class="w-100">
        <b-button variant="secondary" class="float-left" @click="cancelDialog()">
          <font-awesome-icon icon="window-close"/>  
          Close</b-button>

        <b-button
          @click="finalizeTransfer(currentDisbursement)"
          class="float-right ml-1"
          variant="primary"
          :disabled="loading"
        >
        <font-awesome-icon icon="stamp"/> 
        Finalize Transfer</b-button>
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
  name: "home",
  data() {

    return {
      form: {
        recipient: null,
        invoice_date: null,
        amount: null,
        currency: "NGN",
        invoice_number: null,
        reason: null,
        transfer_data: {},
        createdby: null,
        paidby: null,
        update: false
      },
      balance: "",
      currentDisbursement: {},
      paidDisbursements: [],
      pendingDisbursements: [],
      loading: false,
      fields: [
        {
          key: "invoice_number",
          label: "Invoice No.",
          sortable: true
        },
        {
          key: "invoice_date",
          label: "Invoice Date",
          sortable: true
        },

        {
          key: "recipient_obj.name",
          label: "Supplier",
          sortable: true
        },
        {
          key: "recipient_obj.details.bank_name",
          label: "Bank",
          sortable: true
        },
        {
          key: "recipient_obj.details.account_name",
          label: "Account Name",
          sortable: true
        },
        {
          key: "recipient_obj.details.account_number",
          label: "Account Number",
          sortable: true
        },
        {
          key: "reason",
          label: "Purpose",
          sortable: true
        },
        {
          key: "amount",
          label: "Amount",
          sortable: true,
          class: "numeric",
          formatter: value => {
            return parseFloat(value)
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, "$&,");
          }
        },
        {
          key: "transfer_data.status",
          label: "Transfer Status",
          sortable: true
        },
        {
          key: "actions",
          label: "Actions",
          sortable: false
        }
      ],
      fieldsPaid: [
        {
          key: "transfer_data.updatedAt",
          label: "Transfer Date",
          sortable: true
        },
        {
          key: "invoice_number",
          label: "Invoice No.",
          sortable: true
        },
        {
          key: "invoice_date",
          label: "Invoice Date",
          sortable: true
        },

        {
          key: "recipient_obj.name",
          label: "Supplier",
          sortable: true
        },
        {
          key: "recipient_obj.details.bank_name",
          label: "Bank",
          sortable: true
        },
        {
          key: "recipient_obj.details.account_name",
          label: "Account Name",
          sortable: true
        },
        {
          key: "recipient_obj.details.account_number",
          label: "Account Number",
          sortable: true
        },
        {
          key: "reason",
          label: "Purpose",
          sortable: true
        },
        {
          key: "amount",
          label: "Amount",
          sortable: true,
          class: "numeric",
          formatter: value => {
            return parseFloat(value)
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, "$&,");
          }
        }
      ]
    };
  },

  computed: {
    ...mapGetters({
      recipients: ge.GET_RECIPIENTS,
      currencies: ge.GET_CURRENCIES,
      user: ge.GET_CURRENT_USER
    })
  },

  methods: {
    cancelDialog() {
      this.form = {
        recipient: null,
        invoice_date: null,
        amount: null,
        currency: "NGN",
        invoice_number: null,
        reason: null,
        transfer_data: {},
        createdby: "",
        paidby: "",
        update: false
      };
      this.$bvModal.hide("modal-disbursement");
      this.$bvModal.hide("modal-otp");
    },


    accountInfo(recipient_code) {
      return this.getClientAccount(recipient_code);
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

    getClientAccount(recipient_code) {
      let res = "";
      if (!recipient_code) {
        return res;
      }

      let reci = this.recipients.find(rec => {
        return rec.recipient_code == recipient_code;
      });

      if (reci) {
        res = `${reci.details.account_name} (${reci.details.bank_name} - ${
          reci.details.account_number
        })`;
      }

      return res;
    },

    getClient(recipient_code) {
      let res = {};
      if (!recipient_code) {
        return res;
      }

      let reci = this.recipients.find(rec => {
        return rec.recipient_code == recipient_code;
      });

      return reci ? reci : res;
    },

    createDisbursement(form) {

      this.loading  = true
      form.createdby = this.user.email;
      form.recipient_obj = this.getClient(form.recipient);
      form.status = "Pending";
      FIRE_STORE.collection(DISBURSEMENTS)
        .add(form)
        .then(() => {
          // console.log(res);
          alert("Disbursement successfully saved!");
          this.cancelDialog();
          this.listPendingDisbursements();
          this.loading  = false
        })
        .catch(err => {
          alert("There was an error saving disbursement: " + err)
          this.loading  = false
          //console.error("Error saving Disbursement: ", err.response.data);
        })
      
    },

    listPaidDisbursements() {
      this.paidDisbursements = [];
      FIRE_STORE.collection(DISBURSEMENTS)
        .where("status", "==", "Paid")
        .orderBy("transfer_data.updatedAt", "desc")
        .get()
        .then(res => {
          //console.log(res);
          res.forEach(doc => {
            this.paidDisbursements.push(
              Object.assign({ id: doc.id }, doc.data())
            );
          });
          //this.paidDisbursements = res.docs
        })
    },

    listPendingDisbursements() {
      this.pendingDisbursements = [];
      FIRE_STORE.collection(DISBURSEMENTS)
        .where("status", "==", "Pending")
        .orderBy("invoice_date") 
        .orderBy("invoice_number")
        .get()
        .then(res => {
          //console.log(res);
          res.forEach(doc => {
            this.pendingDisbursements.push(
              Object.assign({ id: doc.id }, doc.data())
            );
          });
        });
    },

    getBalanceLocal() {
      this[ac.GET_BALANCE]()
        .then(res => {
          //console.log(res)
          this.balance =
            res.data.data[0].currency +
            this.$options.filters.money(res.data.data[0].balance / 100);
        })
        .catch(err => {
          alert("Error Getting balance: " + err.response.data.message);
        });
    },

    initiateTransfer(row) {
      
      let transfer = {
        amount: parseInt(row.item.amount * 100),
        currency: row.item.currency,
        reason: row.item.reason,
        recipient: row.item.recipient,
        source: "balance",
        reference: new Date().getTime()
      };

      this[ac.GET_INITIATE_TRANSFER](transfer)
        .then(res => {
          
          row.item.transfer_data = res.data.data;
          row.item.paidby = this.user.email;

          // Update Firestore
          return FIRE_STORE.collection(DISBURSEMENTS)
            .doc(row.item.id)
            .set(row.item);
        })
        .then(() => {
          //debugger
          //console.log("fire store update response", res);
          // load OTP form
          this.processOTP(row);
        })
        .catch(err => {
          alert("Error Initiating transfer: " + err);
        });
    },

    processOTP(row) {
      this.currentDisbursement = row.item;
      this.$bvModal.show("modal-otp");
    },

    finalizeTransfer(currentDisbursement) {
      // debugger;
      let transfer = {
        transfer_code: currentDisbursement.transfer_data.transfer_code,
        otp: currentDisbursement.otp
      };
      this[ac.GET_FINALIZE_TRANSFER](transfer)
        .then(() => {
          //verify transfer
          this.verifyTransfer(currentDisbursement);
        })
        .catch(err => {
          alert("Error Finalizing transfer: " + err.response.data.message);
        });
    },

    resendOTP(transfer_code) {
      this[ac.GET_RESEND_TRANSFER_OTP]({
        transfer_code: transfer_code,
        reason: "transfer"
      })
        .then(res => {
          alert(res.data.message);
        })
        .catch(err => {
          alert("Error Resending OTP: " + err.response.data.message);
        });
    },

    verifyTransfer(currentDisbursement) {
      this[ac.GET_VERIFY_TRANSFER](
        currentDisbursement.transfer_data.transfer_code
      )
        .then(res => {
          // Update Firestore
          currentDisbursement.transfer_data = res.data.data;

          currentDisbursement.transfer_data.status == "success";

          if (currentDisbursement.transfer_data.status == "success") {
            currentDisbursement.status = "Paid";
            alert("Transfer completed successfully");
          } else {
            alert("Transfer is incomplete, status is " + res.data.data.status);
          }
          return FIRE_STORE.collection(DISBURSEMENTS)
            .doc(currentDisbursement.id)
            .set(currentDisbursement);
        })
        .then( () => {
          // Refresh lists
          this.currentDisbursement = {};
          this.paidDisbursements = [];
          this.pendingDisbursements = [];

          this.getBalanceLocal();
          this.listPendingDisbursements();
          this.listPaidDisbursements();
          this.$bvModal.hide("modal-otp");
        })
        .catch(err => {
          alert("Error Verifying transfer: " + err.response.data.message);
        });
    },

    editDisbursement(disbus) {
      
      this.form =  JSON.parse(JSON.stringify(disbus))
      this.form.update = true
      this.$bvModal.show("modal-disbursement");
      
    },

    updateDisbursement(disbus) {

      this.loading  = true
      disbus.recipient_obj = this.getClient(disbus.recipient);
      FIRE_STORE.collection(DISBURSEMENTS)
            .doc(disbus.id)
            .set(disbus)
        .then( () => {
          // Refresh lists
          this.pendingDisbursements = [];
          this.listPendingDisbursements();
          this.cancelDialog()
          alert("Disbursement successfully updated")
          this.loading  = false
        })
        .catch(err => {
          alert("Error Verifying transfer: " + err.response.data.message);
          this.loading  = false
        })
    },

    deleteDisbursement(disbus) {

      if (disbus.transfer_data.status == 'success') {
        alert("Paid Disbursement cannot be deleted!")
        return
      }

      if ( confirm('Do you really want to delete this Disbursement?')) {

        // Delete Firestore
        FIRE_STORE.collection(DISBURSEMENTS).doc(disbus.id).delete()
        .then(() => {
          this.listPendingDisbursements()
          alert("Disbursement successfully deleted!")
          
        })
        .catch(err => {
          alert("Error Deleting Disbursement: " + err);
        })
      }
      
    },

    formatDate(dt) {
      if (dt == null) return "";
      var f = function(d) {
        return d < 10 ? "0" + d : d;
      };
      return (
        f(dt.getDate()) + "/" + f(dt.getMonth() + 1) + "/" + dt.getFullYear()
      );
    },
    ...mapActions([
      ac.GET_RECIPIENTS,
      ac.GET_BALANCE,
      ac.GET_INITIATE_TRANSFER,
      ac.GET_FINALIZE_TRANSFER,
      ac.GET_VERIFY_TRANSFER,
      ac.GET_RESEND_TRANSFER_OTP
    ]),

    ...mapMutations([mu.SET_RECIPIENTS])
  },

  filters: {
    money: function(value) {
      return parseFloat(value)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,");
    },

    date: function(dt) {
      dt = new Date(dt);
      var f = function(d) {
        return d < 10 ? "0" + d : d;
      };
      return (
        dt.getFullYear() + "-" + f(dt.getMonth() + 1) + "-" + f(dt.getDate())
      );
      //return this.formatDate(value)
    }
  },

  mounted() {
    this.listPendingDisbursements();
    this.listPaidDisbursements();
    this.getClients();
    this.getBalanceLocal();
  }
};
</script>

<style>
.numeric {
  text-align: right;
}
</style>

