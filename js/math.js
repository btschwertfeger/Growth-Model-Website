/**
 *
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @link https://awi.de
 *
 * @author Benjamin Thomas Schwertfeger (2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 *
 **/

/**
 * returns an array from start to end (including end)
 * e.g.: range(1,5,1) == [1,2,3,4,5]
 * @param {*} start begin
 * @param {*} end stop
 * @param {*} step step size
 * @returns array from to by step
 */
export function range(start, end, step = 1) {
  var range = [],
    typeofStart = typeof start,
    typeofEnd = typeof end;

  if (step === 0) throw TypeError("Step cannot be zero.");
  if (typeofStart == "undefined" || typeofEnd == "undefined")
    throw TypeError("Must pass start and end arguments.");
  else if (typeofStart != typeofEnd)
    throw TypeError("Start and end arguments must be of same type.");

  typeof step == "undefined" && (step = 1);

  if (end < start) step = -step;
  if (typeofStart == "number")
    while (step > 0 ? end >= start : end <= start) {
      range.push(start);
      start += step;
    }
  else if (typeofStart == "string") {
    if (start.length != 1 || end.length != 1)
      throw TypeError("Only strings with one character are supported.");
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    while (step > 0 ? end >= start : end <= start) {
      range.push(String.fromCharCode(start));
      start += step;
    }
  } else throw TypeError("Only string and number types are supported");
  return range;
}

/**
 * Returns the average of `grades`
 * @param {*} grades array of values
 * @param {*} nan can be customized to have for example -999 as nan
 * @returns average of grades
 */
export function avg(grades, nan = null) {
  if (nan === null)
    return grades.reduce((acc, c) => acc + c, 0) / grades.length;
  else {
    let values = new Array();
    for (var val = 0; val < grades.length; val++)
      if (grades[val] !== nan) values.push(grades[val]);
    return values.reduce((acc, c) => acc + c, 0) / values.length;
  }
}

/**
 * misc
 */
const asc = (arr) => arr.sort((a, b) => a - b),
  sum = (arr) => arr.reduce((a, b) => a + b, 0),
  mean = (arr) => sum(arr) / arr.length;

/**
 * Standard deviation
 * @param {*} arr
 * @returns standard deviation of `arr`
 */
export function std(arr) {
  const mu = mean(arr);
  const diffArr = arr.map((a) => (a - mu) ** 2);
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
}

/**
 * Returns quantile values of `arr` by given quantile `q`
 * @param {*} arr array to get the values from
 * @param {*} q quantile of interest
 * @returns values of `arr` in quantile `q`
 */
export function quantile(arr, q) {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined)
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  else return sorted[base];
}

/**
 * Returns random values
 * @param {*} count number of values
 * @param {*} min minimum random value
 * @param {*} max maximum random value
 * @returns ...
 */
export function randomValues(count, min, max) {
  const delta = max - min;
  return Array.from({
    length: count,
  }).map(() => Math.random() * delta + min);
}
