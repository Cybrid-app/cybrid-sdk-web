export default {
  // General
  cancel: 'CANCEL',
  confirm: 'CONFIRM',
  done: 'DONE',
  begin: 'BEGIN',
  resume: 'RESUME',
  disconnect: 'DISCONNECT',
  reconnect: 'RECONNECT',
  back: 'Back',
  date: 'Date',
  to: 'To',
  from: 'From',
  fatal: 'An unrecoverable error occurred',
  unexpectedError: 'Unexpected error.',

  // Price list component
  priceList: {
    title: 'Price List',
    table: {
      symbol: 'Currency',
      price: 'Price',
      filter: 'Search for crypto currency'
    },
    error: 'Error fetching coins',
    empty: 'No coins found',
    refreshButton: 'Refresh'
  },

  // Trade component
  trade: {
    amount: 'amount',
    quantity: 'quantity',
    currency: 'Currency',
    buy: 'BUY',
    sell: 'SELL',
    error: 'Positive number required',
    transaction: 'Transaction fee',

    // Confirm dialog
    confirm: {
      header: 'Order Quote',
      refresh: {
        message: 'Market rates will automatically refresh every',
        unit: 'seconds'
      },
      purchase: 'Purchase',
      sell: 'Sell',
      loading: 'Quote Pending',
      error: {
        quote: 'Error fetching quote',
        trade: 'Error confirming trade'
      }
    },

    // Summary dialog
    summary: {
      submission: 'Order Submitted',
      details: 'in',
      message: 'Your order has been placed, thank you.',
      status: 'Status',
      purchased: 'Purchased',
      sold: 'Sold',
      buy: 'Buy',
      sell: 'Sell',
      id: 'Transaction ID:',
      submitting: 'Submitting crypto order',
      loading: 'Loading crypto order',
      error: 'Error fetching trade'
    }
  },

  // Account list component
  accountList: {
    total: 'Account Value',
    available: 'Available to Trade',
    account: {
      header: 'Asset',
      subheader: 'Market Price'
    },
    balance: 'Balance',
    error: {
      account: 'Error fetching accounts',
      noData: 'No accounts found'
    }
  },

  // Account details component
  accountDetails: {
    holdings: 'Holdings',
    trade: 'Trade',
    transactions: 'Recent Transctions',
    balance: 'Balance',
    error: {
      trade: 'Error fetching trades',
      noData: 'No trades found'
    }
  },

  // Account balance component
  accountBalance: {
    pending: 'Pending',
    settled: 'No trades pending'
  },

  // Account trade component
  accountTrade: {
    side: {
      buy: 'Bought',
      sell: 'Sold'
    },
    subheader: 'in',
    status: 'Status',
    placed: 'Placed',
    finalized: 'Finalized',
    date: 'Date',
    fee: 'Fee',
    order: 'Trade ID',

    message: 'Your order has been placed, thank you.',
    purchased: 'Purchased',
    sold: 'Sold',
    loading: 'Submitting Crypto Order',
    error: 'Error fetching trade'
  },

  // Paginator
  paginator: {
    firstPageLabel: 'First page',
    itemsPerPageLabel: 'Items per page',
    lastPageLabel: 'Last page',
    nextPageLabel: 'Next page',
    previousPageLabel: 'Previous page',
    page: 'Page',
    of: 'of'
  },

  // Identity verification component
  identityVerification: {
    checkStatus: 'Checking status...',
    verifying: 'Verifying...',
    verified: 'You have been verified.',
    rejected: 'Unable to verify identity.',
    support: 'Please contact customer support.',
    reviewing: 'Identity being reviewed.',
    processing: 'Processing identity verification, check back later',
    resume: 'Resume identity verification.'
  },

  // Bank account connect component
  bankAccountConnect: {
    addAccount: 'Adding account...',
    reconnectAccount: 'Reconnecting account...',
    successAdded: 'Account successfully added.',
    successReconnect: 'Account successfully reconnected.',
    resumeAdding: 'Resume adding account.',
    resumeConnect: 'Resume reconnecting account',
    mobile: {
      warning: 'Temporarily unavailable on mobile.',
      explanation: 'Please connect your bank account using a desktop browser.'
    },

    // Confirm dialog
    confirm: {
      title: 'Confirm Currency',
      message: 'This account is in '
    }
  },

  // Bank account list component
  bankAccountList: {
    account: 'Account',
    status: 'Status',
    addAccount: 'ADD ACCOUNT',
    empty: 'No bank accounts connected.',
    error: 'Error fetching bank accounts.',
    state: {
      storing: 'Pending',
      completed: 'Connected',
      failed: 'Failed',
      refresh_required: 'Refresh required',
      deleting: 'Disconnecting...',
      deleted: 'Disconnected'
    },

    // Details dialog
    details: {
      title: 'Account Details',
      name: 'Name',
      asset: 'Asset',
      number: 'Number',
      status: 'Status',
      success: 'Disconnected',
      error: 'Error disconnecting'
    },

    // Disconnect dialog
    disconnect: {
      title: 'Confirm Disconnect',
      confirm: 'Please confirm removal of',
      warning: 'Deposits will no longer be possible from this account'
    }
  },

  // Transfer component
  transfer: {
    transfer: 'Transfer',
    amount: 'Amount',
    bankAccount: 'Bank Account',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    withdrawal: 'Withdrawal',
    processing: 'Processing',
    noAccount: 'No bank accounts connected.',
    addAccount: 'Add Account',
    nonSufficientFunds: 'Non-sufficient funds',
    error: 'Error creating transfer',

    // Confirm dialog
    confirm: {
      confirm: 'Confirm',
      depositDate: 'Deposit Date'
    },

    // Details dialog
    details: {
      details: 'Details',
      state: 'State'
    }
  }
};
