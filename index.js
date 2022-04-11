/**
 * Website to visualize and manipulate the Growth Model by XXX and XXX
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @author Benjamin Thomas Schwertfeger (January 2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 * All comments market with '#' are taken from the files provided by xxx
 * 
 * 
 * 
 * Simple Input Data from np array converted to csv using:
> grofup = np.load('gmorhua_growth_function_2018.npz')
> a_fit = grofup['a_fit'][::5]              # note: the original temperature increment       
> b_fit = grofup['b_fit'][::5]              # underlying a_fit and b_fit is 0.1 K
> c_avg = grofup['c_avg']
> np.savetxt('data/growth_function_parameters_simple.csv', np.array([a_fit,b_fit]).astype('float64'), delimiter=',', fmt='%.6f') 
 * 
 * Complex Input Data from xarray converted to csv using: 
def saveIt():
    m = input_files['thetao'].transpose('latitude','longitude', 'time', 'depth_coord').fillna(-999)
    len_lat, len_lon = len(m.latitude), len(m.longitude)
    len_ts, len_depth = len(m.time), len(m.depth_coord)

    output = np.arange(len_lat*len_lon*len_depth * len_ts).reshape(len_lat, len_lon, len_depth, len_ts).astype('float64')
    m = input_files['thetao'].transpose('latitude','longitude', 'depth_coord', 'time').fillna(-999).astype('float64')

    for lat in range(len_lat):
        for lon in range(len_lon):
            for depth in range(len_depth):
                output[lat,lon,depth] = m[lat,lon,depth,:].load()

    output = output.reshape(len_lat * len_lon * len_depth, len_ts)  
    # mask = output < -999; mask
    # output[mask] = -999
    np.savetxt('data_2000-2004.csv', output.astype('float64'), delimiter=',', fmt='%.6f')
> saveIt()
 **/

import {
    get_year,
    get_weight_by_temperature,
    get_temperature_index
} from './utils.js';

import {
    avg,
    std,
    range,
    quantile
} from './math.js';

// #######################################################################
// ##### SETTINGS #############################################
// #######################################################################

window.precomputed = true;
window.regions = [{
    name: 'Celtic Sea',
    boxplot_data_filename: 'CelticSea_PREPARED-FOR-BOX-PLOTTING_7e-k_stock_weight-at-age_1971-2018_WGCSE2019.csv',
    complex_data_filename: 'SODA_temp_Celtic-Sea_30-580m_1958-2007.csv', //CelticSea_2000-2004.csv',
    complex_precomputed_data_filename: 'Celtic-Sea_1958-2007_gen-10_quantiles_precomputed.csv',

    index: 0, // specifies the index in computed and loaded arrays

    // ---- begin slices
    // # Define geographic boundaries (latitudes, longitudes)
    // # Default coordinates: North Atlantic coordinates
    lat_bounds: [47, 52],
    lon_bounds: [-12, -1],
    // # Define depth_levels for your growth model output files
    depth_levels: [0, 600],
    // ---- end slices

    // # Define latitudes that you will use to save your weight-at-age data 
    lat: [47.25, 47.75, 48.25, 48.75, 49.25, 49.75, 50.25, 50.75, 51.25, 51.75],
    lon: [
        -11.75, -11.25, -10.75, -10.25, -9.75, -9.25, -8.75, -8.25, -7.75,
        -7.25, -6.75, -6.25, -5.75, -5.25, -4.75, -4.25, -3.75, -3.25, -2.75,
        -2.25, -1.75, -1.25
    ],
    // # Define depth that you will use to save your weight-at-age data
    depths: [
        //-0., 10., 20., 
        30., 40., 50., 60., 70., 80., 90., 100., 115.,
        135., 160., 190., 230., 280., 340., 410., 490., 580.
    ],
}, {
    name: 'North Sea',
    boxplot_data_filename: 'NorthSea...',
    complex_data_filename: 'SODA_temp_North-Atlantic_30-580m_1958-2007.csv',
    complex_precomputed_data_filename: 'North-Sea_1958-2007_gen-10_quantiles_precomputed.csv',

    index: 1,

    lat_bounds: [51, 65],
    lon_bounds: [-3, 8],
    depth_levels: [30, 600],

    lat: [
        51.25, 51.75, 52.25, 52.75, 53.25, 53.75, 54.25, 54.75, 55.25, 55.75,
        56.25, 56.75, 57.25, 57.75, 58.25, 58.75, 59.25, 59.75, 60.25, 60.75,
        61.25, 61.75, 62.25, 62.75, 63.25, 63.75, 64.25, 64.75
    ],
    lon: [
        -2.75, -2.25, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25,
        1.75, 2.25, 2.75, 3.25, 3.75, 4.25, 4.75, 5.25, 5.75, 6.25,
        6.75, 7.25, 7.75
    ],
    depths: [
        30., 40., 50., 60., 70., 80., 90., 100., 115., 135., 160.,
        190., 230., 280., 340., 410., 490., 580.
    ]
}];

window.processed_data_complex = [{}, {}, {}];
window.processed_precomputed_data_complex = [{}, {}, {}];
window.computed_data_complex = [{}, {}, {}];

window.default_input_complex = {
    // # Specification of biological parameters  
    // # Number of years in one life cycle of an individual 
    generation: 3, //10,
    // # The year when the input temeperature dataset starts 
    initial_year: 1997,
    // # Number of years in the input temperature dataset
    years: range(1997, 2007, 1),

    // # Quantiles that we want to caclulate (median - 0.5; IQR - 0.25 and 0.75)
    quantiles: [0.25, 0.50, 0.75],
};
window.default_input_simple = {
    max_age: 15 * 365, // # maximum age in days
    initial_weight: 1, // initial weight in kg
};
window.constants = { // # Values from Eg.2 Butzin and Poertner, 2016)
    A_R: 8.660,
    B_R: 0.3055,
    THETA_A: 18145,
    THETA_B: 4258,
    THETA_H: 25234,
    T_R: 283,
    T_H: 286,
    C_AVG: 0.291,
    T0: 273.15,
};

// #######################################################################
// ##### COMPUTATION #############################################
// #######################################################################

function equation2(input_temp) {
    const T_Kelvin = input_temp.map((value) => (value < -99) ? -999 : parseFloat((value + constants.T0).toFixed(5)));
    const
        a_numerator = T_Kelvin.map((value) => (value === -999) ? -999 : constants.A_R * Math.exp(constants.THETA_A / constants.T_R - constants.THETA_A / value)),
        a_dominator = T_Kelvin.map((value) => (value === -999) ? -999 : 1 + Math.exp(constants.THETA_H / constants.T_H - constants.THETA_H / value));
    return a_numerator.map((value, index) => (value === -999) ? -999 : value / a_dominator[index]);
}

function equation3(input_temp) {
    // """ Arrhenius equation """
    return input_temp.map((value) => (value == -999) ? -999 : constants.B_R * Math.exp(constants.THETA_B / constants.T_R - constants.THETA_B / (value + constants.T0)));
}

window.computeSimple = (data = null, parameters = null, initial_weight = null) => {
    data = (data === null) ? window.process_data_simple : data;
    // console.log(window.default_input_simple)
    parameters = (parameters === null) ? window.default_input_simple : parameters;
    initial_weight = (initial_weight === null) ? parameters.initial_weight * 1000 : parseFloat(initial_weight) * 1000; // * 1000 -> kg -> gramm

    let
        a_fit = data.a_fit,
        b_fit = data.b_fit,
        c_avg = data.c_avg,
        itemp = 0, // # temperature index
        dt = 1, // # time step in days 
        temperature_range = range(-2, 30.5 - .5, .5); // # Temperature range in °C

    let weight_at_age = [...new Array(parameters.max_age)].map(
        (e, i) => [...new Array(a_fit.length)].map(() => (i === 0) ? initial_weight : 0)
    ); // # weight at age (in g) for a given temperature && initial weight in kg

    // # loop over temperatures, increasing values by 0.5°C
    temperature_range.forEach(() => {
        range(1, parameters.max_age - 1, 1).forEach((age) => {
            let growth_rate = .01 * (a_fit[itemp] * Math.pow(weight_at_age[age - 1][itemp], b_fit[itemp]) - c_avg);
            weight_at_age[age][itemp] = weight_at_age[age - 1][itemp] * (1 + dt * growth_rate);
        });
        itemp++;
    });

    window.last_result_simple = {
        a_fit: a_fit,
        b_fit: b_fit,
        c_avg: c_avg,
        weight_at_age: weight_at_age,
        temperature_range: temperature_range,
    }
    return window.last_result_simple;
}

function computeComplex(region_index = 0, parameters = null) {

    parameters = (parameters === null) ? window.default_input_complex : parameters;
    const data = window.processed_data_complex[region_index];

    const
        n_lat = data.region.lat.length,
        n_lon = data.region.lon.length,
        n_depths = data.region.depths.length,
        n_months = 12,
        n_days_per_month = 30,
        dt = 1; // one month

    const
        c_weights = [...new Array(n_depths)].map(() => [...new Array(n_lat * n_lon)].map(() => 1)),
        c_growth_rates = [...new Array(n_depths)].map(() => [...new Array(n_lat * n_lon)].map(() => 0));

    let
        initial_year = parameters.initial_year,
        last_year = parameters.initial_year + parameters.generation,
        generation = parameters.generation,
        dataset = data.dataset,
        region = data.region,
        results = {};

    while (last_year < parameters.years.at(-1)) {
        let
            weight = JSON.parse(JSON.stringify(c_weights)),
            growth_rates = JSON.parse(JSON.stringify(c_growth_rates)),
            age = 0;

        range(initial_year, last_year - 1, 1).forEach((year) => {
            const tmp = get_year(dataset, parameters.years.at(0), year); // month depth lat lon

            // console.log(tmp)
            // tmp.forEach((e) => {
            //     console.log(e[0][0].slice(13, 19))
            // })
            // return

            // tmp3d = tmp.values.reshape(12, n_depths, n_lat*n_lon)             
            let tmp3d = [...new Array(n_months)].map(
                () => [...new Array(n_depths)].map(
                    () => [...new Array(n_lat * n_lon)]
                )
            );
            for (let month = 0; month < n_months; month++) {
                const depth_lat_lon = tmp[month];
                // console.log(depth_lat_lon[0][0].slice(13, 19))
                for (let depth = 0, i = 0; depth < n_depths; depth++, i = 0)
                    for (let lat = 0; lat < n_lat; lat++)
                        for (let lon = 0; lon < n_lon; lon++)
                            tmp3d[month][depth][i++] = depth_lat_lon[depth][lat][lon];
            }

            // a = np.zeros(shape=(N_depths, N_lat*N_lon), dtype='f')
            let a = [...new Array(n_depths)].map(() => [...new Array(n_lat * n_lon)].map(() => 0));
            // b = np.zeros(shape=(N_depths, N_lat*N_lon), dtype='f')
            let b = JSON.parse(JSON.stringify(a));

            let mm0 = (year === initial_year) ? 2 : 0;

            for (let month = 0; month < n_months; month++) {
                for (let day = 0; day < n_days_per_month; day++) {
                    for (let ilev = 0; ilev < n_depths; ilev++) {
                        // a[ilev, :] = equation2(temp_input_3d[mon, ilev, :])
                        a[ilev] = equation2(tmp3d[month][ilev]);
                        // b[ilev, :] = equation3(temp_input_3d[mon, ilev, :]) * (-1.)
                        b[ilev] = equation3(tmp3d[month][ilev]).map((value) => (value == -999) ? -999 : value * -1);

                        // growth_rates[ilev, :] = 0.01 * ( a[ilev, :] * weight[ilev, :]** b[ilev, :] - C_AVG )  
                        growth_rates[ilev] = a[ilev].map(
                            (value, index) => (value == -999 || b[ilev][index] == -999) ? -999 :
                            0.01 * (value * Math.pow(weight[ilev][index], b[ilev][index]) - constants.C_AVG)
                        );
                        // growth_rates[ilev, :] = np.where(growth_rates[ilev, :] < 0,0, growth_rates[ilev, :])
                        growth_rates[ilev] = growth_rates[ilev].map((value) => (value < 0 && value !== -999) ? 0 : value);

                        // weight[ilev, :] = weight[ilev, :] * (1. + dt * growth_rates[ilev, :])
                        weight[ilev] = weight[ilev].map(
                            (value, index) => (value == -999 || growth_rates[ilev][index] == -999) ? -999 :
                            value * (1 + dt * growth_rates[ilev][index])
                        );
                    }
                }
            }

            const new_year = parseInt(year + 1); // ?

            // Reshape data to original shape
            let a_3d = [...new Array(n_depths)].map(() => [...new Array(n_lat)].map(() => [...new Array(n_lon)]));
            let
                b_3d = JSON.parse(JSON.stringify(a_3d)),
                growth_rates_3d = JSON.parse(JSON.stringify(a_3d)),
                weight_3d = JSON.parse(JSON.stringify(a_3d));

            // a_3d = a.reshape(N_depths, N_lat, N_lon)
            // b_3d = b.reshape(N_depths, N_lat, N_lon)
            // growth_rates_3d = growth_rates.reshape(N_depths, N_lat, N_lon)
            // weight_3d = 0.001 * weight.reshape((N_depths, N_lat, N_lon))
            for (let d = 0; d < n_depths; d++) {
                for (let i = 0, lat = 0, lon = 0; i < n_lat * n_lon; i++) {
                    a_3d[d][lat][lon] = parseFloat(a[d][i]);
                    b_3d[d][lat][lon] = parseFloat(b[d][i]);
                    growth_rates_3d[d][lat][lon] = growth_rates[d][i];
                    weight_3d[d][lat][lon] = (weight[d][i] == -999) ? -999 : weight[d][i] * 0.001; // 3D field with asymptotic weight
                    lon++;
                    if (lon === n_lon) {
                        lon = 0;
                        lat++;
                    }
                }
            }
            // # Calculate maximum asymptotic weight at a given location 
            // # ("W*" in Butzin and Pörtner (2016)) 
            // # weight_max = np.nanmax(weight_3d, axis = 0)
            let max_weight_lat_lon = [...new Array(n_lat)].map(() => [...new Array(n_lon)].map(() => -999));
            for (let lat = 0; lat < n_lat; lat++)
                for (let lon = 0; lon < n_lon; lon++)
                    for (let depth = 0; depth < n_depths; depth++)
                        if (weight_3d[depth][lat][lon] > max_weight_lat_lon[lat][lon])
                            max_weight_lat_lon[lat][lon] = weight_3d[depth][lat][lon]

            const content = {
                age: `${age}`,
                a_3d: a_3d,
                b_3d: b_3d,
                growth_rates: growth_rates,
                weight_3d: weight_3d,
                max_weight_lat_lon: max_weight_lat_lon,
            }
            if (typeof results[`${year}`] === 'undefined') results[`${year}`] = [content];
            else results[`${year}`].push(content);
            age++;
        });

        initial_year += 1;
        last_year = initial_year + generation;
    }

    window.computed_data_complex[region_index] = results;

    // console.log(window.computed_data_complex)
    return results;
}

// #######################################################################
// ##### PLOTTING #############################################
// #######################################################################

window.default_chart_config_simple = {
    type: 'line',
    data: {
        labels: null,
        datasets: null,
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Cod growth rates in the aquarium',
                font: {
                    Family: 'Helvetica',
                    size: 18,
                },
            },
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Age, years',
                    font: {
                        family: 'Helvetica',
                        size: 16,
                    },
                },
                ticks: {
                    display: true,
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Weight in kg',
                    font: {
                        family: 'Helvetica',
                        size: 16
                    },
                },
                min: 0,
            },
        },
        animations: {
            radius: {
                duration: 400,
                easing: 'linear',
                loop: (ctx) => ctx.activate
            },
        },
        hoverRadius: 8,
        hoverBackgroundColor: 'yellow',
        interaction: {
            mode: 'nearest',
            intersect: false,
            axis: 'x'
        },
    },
};

window.plot_simple = (temperature = 3.0) => {
    temperature = parseFloat(temperature);
    let config = JSON.parse(JSON.stringify(window.default_chart_config_simple));
    const
        data = window.last_result_simple,
        ctx = $('#simple_plot_canvas'),
        t_idx = get_temperature_index(temperature);

    const choosen_temperature = data.temperature_range[t_idx];
    const color = (choosen_temperature > 20) ? 'red' : (choosen_temperature > 8) ? 'orange' : (choosen_temperature > 0) ? 'black' : 'blue'
    const weights = get_weight_by_temperature(data.weight_at_age, t_idx);

    config.data.labels = range(1, weights.length);
    config.data.datasets = [{
        label: `Weight at ${choosen_temperature}°C`,
        data: weights.map((e) => e / 1000),
        fill: false,
        borderColor: color,
        pointRadius: 0
    }];
    config.options.scales.x.ticks = {
        stepSize: 1,
        autoskip: true,
        maxTicksLimit: 15,
        callback: (value, index, ticks) => {
            return index % 365 === 0 ? value / 365 : '';
        }
    }
    config.options.plugins.tooltip = {
        displayColors: true,
        callbacks: {
            label: (context) => {
                return (context.dataset.label !== null && context.parsed.y !== null) ? `${context.dataset.label}: ${parseFloat(Number(context.parsed.y.toFixed(2)))}kg` : '';
            },
            title: (context) => {
                return `Age, year: ${Number((context[0].parsed.x / 365)).toFixed(1)}`;
            }
        }
    };
    if (typeof window.simple_chart === 'undefined') window.simple_chart = new Chart(ctx, config)
    else {
        window.simple_chart.data.labels = config.data.labels;
        window.simple_chart.data.datasets = config.data.datasets;
        window.simple_chart.update();
    }
}

/**
 * Plots the complex chart
 * if window.precomputed = true, the precomputed dataset must be loaded; the calc is done before then
 * @param {int} region_index 
 */
window.plot_complex = (region_index = null) => {
    region_index = (region_index === null) ? 0 : parseInt(region_index);
    let config = JSON.parse(JSON.stringify(window.default_chart_config_simple));

    const
        data = (precomputed) ? window.processed_precomputed_data_complex[region_index] : window.computed_data_complex[region_index],
        ctx = $(`#complex_plot_canvas0`);

    // age x weight(@quantile)
    let weight_by_age_quantile = {};

    if (!window.precomputed) {
        for (var year of Object.keys(data)) {
            for (var i of Object.keys(data[year])) {
                const age = data[year][i].age;

                var valid_values = data[year].find(obj => {
                    return obj.age === age
                })['weight_3d'].flat().flat().filter(value => value != -999);

                const quantiles = {
                    q_25: quantile(valid_values, .25),
                    q_50: quantile(valid_values, .5),
                    q_75: quantile(valid_values, .75)
                };

                console.log(age, quantiles.q_25)

                if (typeof weight_by_age_quantile[`${age}`] === 'undefined') weight_by_age_quantile[`${age}`] = {
                    q_25: [quantiles.q_25],
                    q_50: [quantiles.q_50],
                    q_75: [quantiles.q_75]
                }
                else {
                    weight_by_age_quantile[`${age}`].q_25.push(quantiles.q_25);
                    weight_by_age_quantile[`${age}`].q_50.push(quantiles.q_50);
                    weight_by_age_quantile[`${age}`].q_75.push(quantiles.q_75);
                }
            }
        }
    }

    const years = (window.precomputed) ? data[0].length : Object.keys(weight_by_age_quantile).length;
    let plottable_datasets = [{
        type: 'line',
        label: '25% Quantile',
        data: (window.precomputed) ? data[0] : [...new Array(years)].map((e, i) => avg(weight_by_age_quantile[i].q_25)),
        fill: false,
        borderColor: 'orange',
        pointRadius: 0,
        borderDash: [10, 5]
    }, {
        type: 'line',
        label: '50% Quantile',
        data: (window.precomputed) ? data[1] : [...new Array(years)].map((e, i) => avg(weight_by_age_quantile[i].q_50)),
        fill: false,
        borderColor: 'black',
        pointRadius: 0
    }, {
        type: 'line',
        label: '75% Quantile',
        data: (window.precomputed) ? data[2] : [...new Array(years)].map((e, i) => avg(weight_by_age_quantile[i].q_75)),
        fill: false,
        borderColor: 'red',
        pointRadius: 0,
        borderDash: [10, 5]
    }];

    config.data.labels = range(1, years);
    config.data.datasets = plottable_datasets;
    config.options.plugins.title.text = window.regions[region_index].name;

    config.options.plugins.tooltip = {
        displayColors: true,
        callbacks: {
            label: (context) => {
                return (context.dataset.label !== null && context.parsed.y !== null) ? `${context.dataset.label}: ${parseFloat(Number(context.parsed.y.toFixed(2)))}kg` : '';
            },
            title: (context) => {
                return `Age, year: ${Number(context[0].parsed.x+1).toFixed(1)}`;
            }
        }
    };

    if (typeof window.complex_chart === 'undefined') {
        config.options.scales.x.title.text = 'Age, years';
        window.complex_chart = new Chart(ctx, config);
    } else {
        window.complex_chart.data.labels = config.data.labels;
        window.complex_chart.data.datasets = config.data.datasets;
        window.complex_chart.update();
    }
}


window.complex_box_plot = (region_params, boxdata) => {
    /**  BOXPLOT
     * <script type="text/javascript" src="https://unpkg.com/@sgratzl/chartjs-chart-boxplot@3.6.0/build/index.umd.min.js"></script>
     * */

    const labels = range(1, 10); //boxdata.length);
    const boxplotDatasets = {
        labels: labels,
        datasets: [{
            type: 'boxplot',
            label: 'Weight at age',
            borderColor: 'blue',
            borderWidth: 1,
            outlierColor: '#999999',
            padding: 10,
            itemRadius: 0,
            data: boxdata
        }]
    };
    console.log(boxdata)

    // ! DAS HIER AUSKOMMENTIEREN, DAMIT KEIN BOXPLOT IN LINE IST
    window.complex_chart.data.datasets.push(boxplotDatasets.datasets[0]);
    window.complex_chart.update();

    const boxconfig = {
        type: 'boxplot',
        data: boxplotDatasets,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'top',
                display: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: region_params.name,
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    },
                },
                tooltip: {
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            let label = '';
                            if (context.dataset.label !== null) {
                                if (context.parsed.min !== null) label += `min: ${Number(context.parsed.min).toFixed(2)}kg; `;
                                if (context.parsed.q1 !== null) label += `25% Quantile: ${Number(context.parsed.q1).toFixed(2)}kg; `;
                                if (context.parsed.median !== null) label += `median: ${Number(context.parsed.median).toFixed(2)}kg; `;
                                if (context.parsed.mean !== null) label += `mean: ${Number(context.parsed.mean).toFixed(2)}kg; `;
                                if (context.parsed.q3 !== null) label += `75% Quantile: ${Number(context.parsed.q3).toFixed(2)}kg; `;
                                if (context.parsed.max !== null) label += `max: ${Number(context.parsed.max).toFixed(2)}kg`;
                            }
                            return label;
                        },
                        title: (context) => {
                            return `Age, year: ${Number(context[0].parsed.x+1).toFixed(1)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Age, years',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        },
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Weight in kg',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        },
                    },
                    max: window.complex_chart.scales.y.max,
                    min: window.complex_chart.scales.y.min,
                },
            },
        },
    };

    if (typeof window.complex_boxplot === 'undefined') window.complex_boxplot = new Chart($(`#complex_plot_canvas1`), boxconfig);
    else {
        window.complex_boxplot.data.labels = boxconfig.data.labels;
        window.complex_boxplot.data.datasets = boxconfig.data.datasets;
        window.complex_boxplot.options.plugins.title.text = region_params.name;
        window.complex_boxplot.update();
    }
}

// #######################################################################
// ##### ON - READY #############################################
// #######################################################################

window.loadNewRegion = (name = null) => {
    name = (name === null) ? 'Celtic Sea' : name;
    let reigon_param;
    regions.forEach((region) => {
        if (region.name === name) reigon_param = region;
    })

    // Complex Lineplot

    if (window.precomputed) $.ajax({
        type: 'GET',
        url: `data/${reigon_param.complex_precomputed_data_filename}`,
        dataType: 'text',
        success: (data) => {
            const n_time = default_input_complex.years.length * 12;
            window.processed_precomputed_data_complex[reigon_param.index] = processData(data, 'complex-precomputed', reigon_param, n_time);
            window.plot_complex(reigon_param.index);
        }
    });
    else $.ajax({
        type: 'GET',
        url: `data/${reigon_param.complex_data_filename}`,
        dataType: 'text',
        success: (data) => {
            const n_time = default_input_complex.years.length * 12;
            window.processed_data_complex[reigon_param.index] = processData(data, 'complex', reigon_param, n_time);
            computeComplex(reigon_param.index);
            window.plot_complex(reigon_param.index);
        }
    });

    // Complex Boxplot
    $.ajax({
        type: 'GET',
        url: `data/${reigon_param.boxplot_data_filename}`,
        dataType: 'text',
        success: (data) => {
            const processedData = processData(data, 'complex-boxplot');
            window.complex_box_plot(reigon_param, processedData);
        }
    });
}

function processData(allText, kind, region = null, n_time = null) {
    let
        allTextLines = allText.split('\n'),
        lines = [];

    if (kind == 'Simple') {
        return {
            a_fit: allTextLines[0].split(',').map((element) => parseFloat(element)),
            b_fit: allTextLines[1].split(',').map((element) => parseFloat(element)),
            c_avg: 0.29100703
        }
    } else if (kind === 'complex') {
        const
            n_lat = region.lat.length,
            n_lon = region.lon.length,
            n_depths = region.depths.length;

        for (var i = 0; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            var tarr = [];
            for (var j = 0; j < n_time; j++) tarr.push(parseFloat(data[j]));
            lines.push(tarr);
        }

        // prepare final array
        let reshaped_data = [...new Array(n_time)].map(
            () => [...new Array(n_lat)].map(
                () => [...new Array(n_lon)].map(
                    () => [...new Array(n_depths)]
                )
            )
        );

        // insert parsed values from csv to empty final array
        for (let row = 0, lat = 0, lon = 0; row < lines.length; row++) {
            const depth = row % n_depths;
            if (row % n_depths === 0 && row !== 0) lon += 1;
            if (lon === n_lon) {
                lon = 0;
                lat += 1;
            }
            if (lat === n_lat) break;
            for (let time = 0; time < n_time; time++) reshaped_data[time][lat][lon][depth] = lines[row][time]
        }

        // Dataset has now shape of 60 x 10 x 12 x 21 for time x lat x lon x depth
        return {
            region: region,
            dataset: reshaped_data
        };
    } else if (kind === 'complex-precomputed') {
        let data = new Array(0);
        for (let line = 0; line < allTextLines.length - 1; line++) {
            data.push(new Array(0));
            allTextLines[line].split(',').forEach((e, i) => {
                data[line].push(parseFloat(e));
            });
        }
        return data;
    } else if (kind === 'complex-boxplot') {
        let data = [...new Array(allTextLines[0].split(',').length - 1)].map(() => [...new Array(0)]);
        for (let line = 1; line < allTextLines.length - 1; line++) {
            allTextLines[line].split(',').forEach((e, i) => {
                if (i !== 0) data[i - 1].push(parseFloat(e));
            });
        }
        return data;
    }
}

$(document).ready(() => {
    // Simple
    $.ajax({
        type: 'GET',
        url: 'data/growth_function_parameters_simple.csv',
        dataType: 'text',
        success: (data) => {
            window.process_data_simple = processData(data, 'Simple');
            console.log('Simple data loaded!')
            window.computeSimple();
            console.log('Default Aquarium Experiment computed!')
            window.plot_simple();
        }
    });

    // Complex
    window.loadNewRegion('Celtic Sea');
});