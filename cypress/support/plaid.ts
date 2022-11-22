export class Plaid {
  static PLAID_NEXT_ON_SUCCESS = {
    workflow_session_id: 'fcbf19aa-e3a1-4481-8f6e-5418fcb27c98',
    continuation_token: 'b031e111-dad6-4bed-811d-1f967f44dd03',
    next_pane: {
      id: 'aa2d45f0-9227-4475-a08f-804a2892c637',
      pane_node_id: 'sink_node_id',
      navigation: {
        exit_visible: false,
        back_visible: false,
        back_stack_behavior: 'BACK_STACK_BEHAVIOR_TRANSIENT',
        transition: null,
        logo: 'SDK_ASSET_ILLUSTRATION_SDK_NAVBAR_PLAID_LOGO'
      },
      sandbox_message: 'You are currently in Sandbox mode.',
      sink: {
        result: {
          callback: 'SDK_RESULT_CALLBACK_SUCCESS',
          public_token: 'public-sandbox-b9d2c3c4-ec40-4bd5-bd37-4211834cef11',
          error: null,
          metadata: {
            status: '',
            link_session_id: 'fcbf19aa-e3a1-4481-8f6e-5418fcb27c98',
            request_id: '',
            institution: {
              name: 'Citibank Online',
              institution_id: 'ins_5'
            },
            accounts: [
              {
                id: 'o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej',
                name: 'Plaid Checking',
                mask: '0000',
                type: 'depository',
                iso_currency_code: 'USD',
                subtype: 'checking',
                verification_status: '',
                class_type: ''
              }
            ],
            account: {
              id: 'o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej',
              name: 'Plaid Checking',
              mask: '0000',
              type: 'depository',
              subtype: 'checking',
              verification_status: '',
              class_type: ''
            },
            account_id: 'o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej',
            transfer_status: ''
          }
        },
        public_token: 'public-sandbox-b9d2c3c4-ec40-4bd5-bd37-4211834cef11',
        error_json: '',
        metadata_json:
          '{"account":{"id":"o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej","mask":"0000","name":"Plaid Checking","subtype":"checking","type":"depository"},"account_id":"o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej","accounts":[{"id":"o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej","mask":"0000","name":"Plaid Checking","subtype":"checking","type":"depository"}],"institution":{"institution_id":"ins_5","name":"Citibank Online"},"link_session_id":"fcbf19aa-e3a1-4481-8f6e-5418fcb27c98","public_token":"public-sandbox-b9d2c3c4-ec40-4bd5-bd37-4211834cef11","transfer_status":""}',
        events: {
          on_appear: [
            {
              event_name: 'HANDOFF',
              metadata: {
                error_code: '',
                error_message: '',
                error_type: '',
                exit_status: '',
                institution_id: 'ins_5',
                institution_name: 'Citibank Online',
                institution_search_query: '',
                request_id: '2132Q32q9B905HF',
                link_session_id: 'fcbf19aa-e3a1-4481-8f6e-5418fcb27c98',
                mfa_type: '',
                view_name: '',
                timestamp: '',
                selection: '',
                brand_name: '',
                match_reason: '',
                routing_number: '',
                account_number_mask: ''
              },
              webview_redirect_uri:
                'plaidlink://event?error_code=\u0026error_message=\u0026error_type=\u0026event_name=HANDOFF\u0026exit_status=\u0026institution_id=ins_5\u0026institution_name=Citibank+Online\u0026institution_search_query=\u0026link_session_id=fcbf19aa-e3a1-4481-8f6e-5418fcb27c98\u0026mfa_type=\u0026request_id=2132Q32q9B905HF\u0026routing_number=\u0026selection=\u0026timestamp=\u0026view_name='
            }
          ]
        },
        redirect_uri: null,
        webview_redirect_uri:
          'plaidlink://connected?public_token=public-sandbox-b9d2c3c4-ec40-4bd5-bd37-4211834cef11\u0026account_id=o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej\u0026account_mask=0000\u0026account_name=Plaid+Checking\u0026account_subtype=checking\u0026account_type=depository\u0026accounts=%5B%7B%22_id%22%3A%22o3k7jb1ywkfJ38qvP61qUDm6gk3jxXuk6Z6ej%22%2C%22meta%22%3A%7B%22name%22%3A%22Plaid+Checking%22%2C%22number%22%3A%220000%22%7D%2C%22subtype%22%3A%22checking%22%2C%22type%22%3A%22depository%22%7D%5D\u0026institution_id=ins_5\u0026institution_name=Citibank+Online\u0026link_session_id=fcbf19aa-e3a1-4481-8f6e-5418fcb27c98',
        hosted_trusted_auth_callback_result: null,
        omit_known_null_fields: false
      },
      rendering_property_key: 'sink'
    },
    additional_panes: [],
    request_id: '2132Q32q9B905HF'
  };
}
