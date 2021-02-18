const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');

TimeAgo.addDefaultLocale(en);

function formatDate(date) {
  const timeAgo = new TimeAgo('en-US');
  const milliseconds = new Date() - new Date(date);
  return timeAgo.format(Date.now() - milliseconds);
}

module.exports = {
  formatDate
};
