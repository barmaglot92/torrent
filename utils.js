const getNearNumber = (arr, number) => {
  const near = arr
    .map((itemNum, index) => ({ diff: Math.abs(itemNum - number), index }))
    .sort((a, b) => a.diff - b.diff)[0];

  return near?.index;
};

module.exports = { getNearNumber };
