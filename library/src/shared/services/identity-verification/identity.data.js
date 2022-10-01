/* eslint-env es6 */
const INQUIRY_ID = 'itmpl_ArgEXWw8ZYtYLvfC26tr9zmY';

module.exports = {
  NEW: function () {
    return {
      type: 'kyc',
      provider: 'persona',
      state: 'storing',
      persona_inquiry_id: INQUIRY_ID
    };
  },
  STATE_STORING: function () {
    return {
      type: 'kyc',
      provider: 'persona',
      state: 'storing',
      persona_inquiry_id: INQUIRY_ID
    };
  }
};
