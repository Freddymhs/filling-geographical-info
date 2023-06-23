const timesPushed = {
  data: [],
  count: 0,
  maxQueryPerDay: 15000,
  // maxQueryPerDay: 1,
  newIndex: 0,
  prevIndex: 0,
  errorOcurred: false,
};

module.exports = timesPushed;
