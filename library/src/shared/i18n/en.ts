export default {
  // General
  cancel: 'CANCEL',
  confirm: 'CONFIRM',
  done: 'DONE',
  back: 'Back',
  date: 'Date',
  fatal: 'An unrecoverable error occurred',

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
      header: 'Order Submitted',
      message: 'Your order has been placed, thank you.',
      purchased: 'Purchased',
      sold: 'Sold',
      id: 'Transaction ID:',
      loading: 'Submitting Crypto Order',
      error: 'Error fetching trade'
    }
  },

  // Account list component
  accountList: {
    total: 'TOTAL VALUE',
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
    buy: 'Buy',
    sell: 'Sell',
    transactions: 'Recent Transctions',
    balance: 'Balance',
    error: {
      trade: 'Error fetching trades',
      noData: 'No trades found'
    }
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
  }
};
