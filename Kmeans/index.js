const parse = require('csv-parse/lib/sync');
const fs = require('fs');
// max loop for kmean-cluster
const MAX_LOOP = 100;

// Get distance between two data point with euclidean distance formula
function getDistance(row1, row2) {
  return Math.sqrt(
    row1.reduce((sum, value, index) => {
      return sum + Math.abs(value - row2[index]) ** 2;
    }, 0)
  );
}

// Update centroids. It take mean of all the data points that are wtihin cluster.
function getCenteroids() {
  const result = [];
  // Count of data point in clusters
  const benignCount = dataClusters.filter((x) => !x).length;
  const malignCount = dataClusters.filter((x) => x).length;

  result[0] = data
    .filter((row, rowIndex) => !dataClusters[rowIndex])
    .reduce((sum, value, index) => {
      if (index === 0) sum.push(...value);
      else sum = sum.map((sumValue, sumIndex) => sumValue + value[sumIndex]);

      return sum;
    }, [])
    .map((value) => value / benignCount);

  result[1] = data
    .filter((row, rowIndex) => dataClusters[rowIndex])
    .reduce((sum, value, index) => {
      if (index === 0) sum.push(...value);
      else sum = sum.map((sumValue, sumIndex) => sumValue + value[sumIndex]);

      return sum;
    }, [])
    .map((value) => value / malignCount);

  return result;
}
// Update dataClusters array according to centroids
function updateDataClusters() {
  prevDataClusters = dataClusters;

  data.forEach((value, index) => {
    // assign value to dataClusters according to distance
    if (getDistance(value, centeroids[0]) > getDistance(value, centeroids[1]))
      dataClusters[index] = 1;
    else dataClusters[index] = 0;
  });
}

const fileData = fs.readFileSync('./breast_data.csv');
// get datas from csv file
const data = parse(fileData, { columns: false, trim: true }).map((row) => {
  // convert every column string to float
  return row.map((col) => parseFloat(col));
});
// Define arrays
const dataClusters = [];
let centeroids = [];
// Select random data point as malign cluster's center
centeroids[1] = data[Math.floor(Math.random() * 570)];
// Get farther data point as benign cluster's center according to malign cluster's center
data.forEach((row, index) => {
  if (index === 0) centeroids[0] = row;
  else if (getDistance(row, centeroids[0]) > getDistance(...centeroids))
    centeroids[0] = row;
});

// Create dataClusters
updateDataClusters();
// Define prev centroid to check change of centroids
let prevFirstCentroid = centeroids[0];
let prevSecondCentroid = centeroids[1];
// Update centroids
centeroids = getCenteroids();
// Update dataClusters
updateDataClusters();
// Update centroids and dataClusters until that controids does not change or reach max loop
for (
  let i = 0;
  (i < MAX_LOOP && getDistance(prevFirstCentroid, centeroids[0]) > 0) ||
  getDistance(prevSecondCentroid, centeroids[1]) > 0;
  i++
) {
  prevFirstCentroid = centeroids[0];
  prevSecondCentroid = centeroids[1];
  centeroids = getCenteroids();
  updateDataClusters();
}

// Print malign and benign count that the algorithm find
console.log(
  'Malign count : ' + dataClusters.filter((cluster) => cluster === 1).length
);
console.log(
  'Benign count : ' + dataClusters.filter((cluster) => cluster === 0).length
);

// Get truth data from brest_truth.csv
const truthData = fs.readFileSync('./breast_truth.csv');
const truth = parse(truthData, { columns: false, trim: true }).map((row) => {
  // conver every column string to int
  return parseInt(row);
});
// Count matches clusters according to truth data
const countOfMatches = truth.reduce((sum, value, index) => {
  if (dataClusters[index] === value) return sum + 1;

  return sum;
}, 0);

// Print accuracy of algorithm
console.log(
  'Accuracy of algorithm : ' + parseInt((countOfMatches * 100) / 569) + '%'
);
