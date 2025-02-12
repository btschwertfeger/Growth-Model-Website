/**
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @link https://awi.de
 *
 * @author Benjamin Thomas Schwertfeger (2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 *
 **/

/**
 * returns 4-dimensional array containing weight values for a specific year (`req_year`)
 *
 */
export function get_year(dataset, start_year, req_year) {
  // dimensions: [time][depth][lat][lon]
  const n_depths = dataset[0][0][0].length,
    n_lat = dataset[0].length,
    n_lon = dataset[0][0].length,
    n_months = 12; // time is always 12 because of 12 months

  let res = [...new Array(n_months)].map(() =>
    [...new Array(n_depths)].map(() =>
      [...new Array(n_lat)].map(() => [...new Array(n_lon)]),
    ),
  );

  const start_month = (req_year - start_year) * n_months;
  for (
    let month = start_month, filled_months = 0;
    filled_months < n_months;
    month++, filled_months++
  )
    for (let lat = 0; lat < n_lat; lat++)
      for (let lon = 0; lon < n_lon; lon++)
        for (let depth = 0; depth < n_depths; depth++)
          res[filled_months][depth][lat][lon] = dataset[month][lat][lon][depth];
  return res;
}

/**
 * returns the weight by given `temperature_index` of `weights`
 */
export function get_weight_by_temperature(weights, temperature_index) {
  let result = [...new Array(weights.length)];
  return result.map((e, i) => weights[i][temperature_index]);
}

/**
 * Returns the index of a specific `temperature` between the range -2°C to 30°C with a 0.5°C step
 * @param temperature of interest
 * @returns
 */
export function get_temperature_index(temperature) {
  temperature = parseFloat(temperature);
  for (let i = 0, t = -2; t < 30.5; t += 0.5, i++)
    if (t == temperature) return i;
  return 10;
}
