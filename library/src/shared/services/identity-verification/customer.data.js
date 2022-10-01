module.exports = {
  KYC_STATE_REQUIRED: function () {
    return {
      guid: '1234',
      state: 'storing',
      kyc_state: 'required',
      kyc_checks: ['identity_authentication', 'missing']
    };
  }
};
