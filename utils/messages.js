'use strict'

const moment = require('moment')

module.exports = (username, text) => ({
  username,
  text,
  time: moment().format('h:mm a')
})
