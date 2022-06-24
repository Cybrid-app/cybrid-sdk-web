export default {
  // General
  cancel: 'Cancel',
  confirm: 'Confirm',
  done: 'Done',
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
    buy: 'Buy',
    sell: 'Sell',
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
      loading: 'Fetching quote...',
      error: {
        quote: 'Error fetching quote'
      }
    },

    // Summary dialog
    summary: {
      header: 'Order Finalized',
      message: 'Your order has been placed, thank you.',
      purchased: 'Purchased',
      sold: 'Sold',
      id: 'Transaction ID:',
      loading: 'Submitting order...',
      error: 'Error fetching trade'
    }
  }
};
