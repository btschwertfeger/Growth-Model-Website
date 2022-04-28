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
    // boxplot_data_filename: 'observation4boxplot/CelticSea_PREPARED-FOR-BOX-PLOTTING_7e-k_stock_weight-at-age_1971-2018_WGCSE2019.csv',

    precomputed: {
        FESOM_HISTORICAL: {
            '1860-1900': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '1960-2000': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        FESOM_RCP45: {
            '2060-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2160-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        FESOM_RCP85: {
            '2060-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2160-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        SODA: {
            '1960-2000': {
                quant25: null,
                quant50: null,
                quant75: null,
            }
        }
    },
    // precomputed: {
    //     FESOM_historical: {
    //         timespan: '1860-2000',
    //         all: 'FESOM_historical/CelticSea_FESOM_historical_all.csv',
    //         quant25: 'FESOM_historical/CelticSea_depth30-580_coord4752121_FESOMhist/CelticSea_depth30-580_coord4752121_FESOM_HIST_weight_0.25persent_1860-2000_nomasktemp_ages1-10.csv',
    //         quant50: 'FESOM_historical/CelticSea_depth30-580_coord4752121_FESOMhist/CelticSea_depth30-580_coord4752121_FESOM_HIST_weight_0.5persent_1860-2000_nomasktemp_ages1-10.csv',
    //         quant75: 'FESOM_historical/CelticSea_depth30-580_coord4752121_FESOMhist/CelticSea_depth30-580_coord4752121_FESOM_HIST_weight_0.75persent_1860-2000_nomasktemp_ages1-10.csv'
    //     },
    //     FESOM_RCP45: {
    //         timespan: '2060-2200',
    //         all: 'FESOM_RCP4.5/CelticSea_FESOM_RCP4.5_all.csv',
    //         quant25: 'FESOM_RCP4.5/CelticSea_depth30-580_coord4752121_RCP45/CelticSea_depth30-580_coord4752121_FESOM_RCP4.5_weight_0.25persent_2060-2200_nomasktemp_ages1-10.csv',
    //         quant50: 'FESOM_RCP4.5/CelticSea_depth30-580_coord4752121_RCP45/CelticSea_depth30-580_coord4752121_FESOM_RCP4.5_weight_0.5persent_2060-2200_nomasktemp_ages1-10.csv',
    //         quant75: 'FESOM_RCP4.5/CelticSea_depth30-580_coord4752121_RCP45/CelticSea_depth30-580_coord4752121_FESOM_RCP4.5_weight_0.75persent_2060-2200_nomasktemp_ages1-10.csv'
    //     },
    //     FESOM_RCP85: {
    //         timespan: '2060-2200',
    //         all: 'FESOM_RCP8.5/CelticSea_FESOM_RCP8.5_all.csv',
    //         quant25: 'FESOM_RCP8.5/CelticSea_depth30-580_coord4752121_RCP85/CelticSea_depth30-580_coord4752121_FESOM_RCP8.5_weight_0.25persent_2060-2200_nomasktemp_ages1-10.csv',
    //         quant50: 'FESOM_RCP8.5/CelticSea_depth30-580_coord4752121_RCP85/CelticSea_depth30-580_coord4752121_FESOM_RCP8.5_weight_0.5persent_2060-2200_nomasktemp_ages1-10.csv',
    //         quant75: 'FESOM_RCP8.5/CelticSea_depth30-580_coord4752121_RCP85/CelticSea_depth30-580_coord4752121_FESOM_RCP8.5_weight_0.75persent_2060-2200_nomasktemp_ages1-10.csv'
    //     },
    //     SODA: {
    //         timespan: '1960-2000',
    //         all: 'SODA/CelticSea_SODA_all.csv',
    //         quant25: 'SODA/CelticSea/CelticSea_depth30-580_coord4752121_SODA_weight_0.25persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
    //         quant50: 'SODA/CelticSea/CelticSea_depth30-580_coord4752121_SODA_weight_0.5persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
    //         quant75: 'SODA/CelticSea/CelticSea_depth30-580_coord4752121_SODA_weight_0.75persent_1959-2000_nomasktemp_nospawn_ages1-10.csv'
    //     }
    // },
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
    precomputed: {
        FESOM_HISTORICAL: {
            '1860-1900': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '1960-2000': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        FESOM_RCP45: {
            '2060-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2160-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        FESOM_RCP85: {
            '2060-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2160-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        SODA: {
            '1960-2000': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        }
    },
    // boxplot_data_filename: 'observation4boxplot/NorthSea_PREPARED-FOR-BOX-PLOTTING_averaged_south_and_north_fromDATRAS_weight-at-age_1971-2020.csv',
    // precomputed: {
    //     FESOM_historical: {
    //         timespan: '1860-2000',
    //         all: 'FESOM_historical/NorthSea_FESOM_historical_all.csv',
    //         quant25: 'FESOM_historical/NorthSea_depth30-580_coord516238_FESOMhist/NorthSea_depth30-580_coord516238_FESOM_HIST_weight_0.25persent_1860-2000_nomasktemp_ages1-10.csv',
    //         quant50: 'FESOM_historical/NorthSea_depth30-580_coord516238_FESOMhist/NorthSea_depth30-580_coord516238_FESOM_HIST_weight_0.5persent_1860-2000_nomasktemp_ages1-10.csv',
    //         quant75: 'FESOM_historical/NorthSea_depth30-580_coord516238_FESOMhist/NorthSea_depth30-580_coord516238_FESOM_HIST_weight_0.75persent_1860-2000_nomasktemp_ages1-10.csv',
    //     },
    //     FESOM_RCP45: {
    //         timespan: '2060-2200',
    //         all: 'FESOM_RCP4.5/NorthSea_FESOM_RCP4.5_all.csv',
    //         quant25: 'FESOM_RCP4.5/NorthSea_depth30-580_coord516238_RCP45/NorthSea_depth30-580_coord516238_FESOM_RCP4.5_weight_0.25persent_2007-2203_nomasktemp_ages1-10.csv',
    //         quant50: 'FESOM_RCP4.5/NorthSea_depth30-580_coord516238_RCP45/NorthSea_depth30-580_coord516238_FESOM_RCP4.5_weight_0.5persent_2007-2203_nomasktemp_ages1-10.csv',
    //         quant75: 'FESOM_RCP4.5/NorthSea_depth30-580_coord516238_RCP45/NorthSea_depth30-580_coord516238_FESOM_RCP4.5_weight_0.75persent_2007-2203_nomasktemp_ages1-10.csv',
    //     },
    //     FESOM_RCP85: {
    //         timespan: '2060-2200',
    //         all: 'FESOM_RCP8.5/NorthSea_FESOM_RCP8.5_all.csv',
    //         quant25: 'FESOM_RCP8.5/NorthSea_depth30-580_coord516238_RCP85/NorthSea_depth30-580_coord516238_FESOM_RCP8.5_weight_0.25persent_2060-2200_nomasktemp_ages1-10.csv',
    //         quant50: 'FESOM_RCP8.5/NorthSea_depth30-580_coord516238_RCP85/NorthSea_depth30-580_coord516238_FESOM_RCP8.5_weight_0.5persent_2060-2200_nomasktemp_ages1-10.csv',
    //         quant75: 'FESOM_RCP8.5/NorthSea_depth30-580_coord516238_RCP85/NorthSea_depth30-580_coord516238_FESOM_RCP8.5_weight_0.75persent_2060-2200_nomasktemp_ages1-10.csv',
    //     },
    //     SODA: {
    //         timespan: '1960-2000',
    //         all: 'SODA/NorthSea_SODA_all.csv',
    //         quant25: 'SODA/NorthSea/NorthSea_depth30-580_coord516238_SODA_weight_0.25persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
    //         quant50: 'SODA/NorthSea/NorthSea_depth30-580_coord516238_SODA_weight_0.5persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
    //         quant75: 'SODA/NorthSea/NorthSea_depth30-580_coord516238_SODA_weight_0.75persent_1959-2007_nomasktemp_nospawn_ages1-10.csv'
    //     }
    // },
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
    const color = (choosen_temperature > 16) ? 'red' : (choosen_temperature > 8) ? 'orange' : (choosen_temperature > 0) ? 'black' : 'blue'
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

window.complex_charts = [
    null, null, // upper left, upper right,
    null, null // lower left, lower right
]
window.plot_complex = (scenario, period) => {
    const n_generations = 10;

    let general_config = JSON.parse(JSON.stringify(window.default_chart_config_simple));
    general_config.data.labels = range(1, n_generations);
    general_config.data.datasets = [];
    general_config.options.scales.x.title.text = 'Age, years';

    const
        get_weight_by_age = (data, n_generations) => {
            let weight_by_age_vector = [...new Array(n_generations)].map(() => new Array());
            for (var entry = 0, age = 0; entry < data.length; entry++) {
                if (!isNaN(data[entry])) weight_by_age_vector[age].push(data[entry]);
                age = (age + 1 !== n_generations) ? age + 1 : 0;
            }
            return weight_by_age_vector
        },
        get_soda_boxplot = (region) => {
            // ! SODA BOXPLOT 
            return {
                type: 'boxplot',
                label: 'Observation',
                borderColor: 'blue',
                borderWidth: 1,
                outlierColor: '#999999',
                padding: 10,
                itemRadius: 0,
                data: get_weight_by_age(region.precomputed['SODA']['1960-2000']['quant25'].concat(
                    region.precomputed['SODA']['1960-2000']['quant50']
                ).concat(
                    region.precomputed['SODA']['1960-2000']['quant75']
                ), n_generations)
            }
        };
    const
        get_line_datasets = (region, scenario, period, n_generations) => {
            let datasets = [];
            Object.keys(region.precomputed[scenario][period]).forEach((quant, qindex) => {
                const weight_by_age_vector = get_weight_by_age(region.precomputed[scenario][period][quant], n_generations);
                datasets.push({
                    type: 'line',
                    label: `${quant.slice(-2)}`,
                    data: [...new Array(n_generations)].map((e, i) => avg(weight_by_age_vector[i])),
                    borderColor: (quant.includes('50')) ? 'black' : (quant.includes('25')) ? 'orange' : 'red',
                    borderDash: (quant.includes('50')) ? [0] : [10, 5],
                });
            });
            return datasets;
        };
    if (scenario == 'SODA') {
        // * Upper 2 plots for historical SODA && BOXPLOT for lower 2 plots
        for (let regionidx = 0; regionidx < window.regions.length; regionidx++) {
            let config = JSON.parse(JSON.stringify(general_config));

            let region = window.regions[regionidx]
            const
                ctx1 = $(`#complex_plot_canvas${regionidx}`),
                ctx2 = $(`#complex_plot_canvas${regionidx+2}`);

            // * BOXPLOT for upper two plots
            const boxplot_dataset = get_soda_boxplot(region);
            config.data.datasets.push(boxplot_dataset);
            config.options.plugins.tooltip = {
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        let label = ' ';
                        if (context.dataset.label !== null && context.dataset.label === 'Observation') {
                            if (context.parsed.min !== null) label += `min: ${Number(context.parsed.min).toFixed(2)}kg; `;
                            if (context.parsed.q1 !== null) label += `25% Quantile: ${Number(context.parsed.q1).toFixed(2)}kg; `;
                            if (context.parsed.median !== null) label += `median: ${Number(context.parsed.median).toFixed(2)}kg; `;
                            if (context.parsed.mean !== null) label += `mean: ${Number(context.parsed.mean).toFixed(2)}kg; `;
                            if (context.parsed.q3 !== null) label += `75% Quantile: ${Number(context.parsed.q3).toFixed(2)}kg; `;
                            if (context.parsed.max !== null) label += `max: ${Number(context.parsed.max).toFixed(2)}kg`;
                        } else {
                            return (context.dataset.label !== null && context.parsed.y !== null) ? ` ${context.dataset.label}: ${parseFloat(Number(context.parsed.y.toFixed(2)))}kg` : '';
                        }
                        return label;
                    },
                    title: (context) => {
                        return `Age, year: ${parseInt(Number(context[0].parsed.x+1).toFixed(1))}`;
                    },
                },
            }
            // * LINEPLOT for upper plots
            get_line_datasets(region, scenario, period, n_generations).forEach((dataset) => config.data.datasets.push(dataset));

            // ** BOXPLOT for lower plots
            let config2 = JSON.parse(JSON.stringify(config));

            // ? ----- PLOTTING ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
            config.options.plugins.title.text = `${region.name} ${scenario} (${Object.keys(region.precomputed[scenario])[0]})`;
            window.complex_charts[regionidx] = new Chart(ctx1, config);

            config2.data.datasets = [boxplot_dataset];
            config2.options.plugins.title.text = '';
            window.complex_charts[regionidx + 2] = new Chart(ctx2, config2);

        }
    } else {
        window.active_scenario = scenario;
        console.log(period)
        window.opposite_period = (period === '1860-1900') ? '1960-2000' :
            (period === '1960-2000') ? '1860-1900' :
            (period === '2060-2100') ? '2160-2200' :
            (period === '2160-2200') ? '2060-2100' : null;
        // * Lower two plots
        for (let regionidx = 0; regionidx < window.regions.length; regionidx++) {
            let
                config = window.complex_charts[regionidx + 2],
                region = window.regions[regionidx];

            config.data.datasets = config.data.datasets.slice(0, 1);

            // * LINEPLOT 
            get_line_datasets(region, scenario, period, n_generations).forEach((dataset) => config.data.datasets.push(dataset));
            config.options.plugins.title.text = `${region.name} ${scenario.replace('_', ' ').toLowerCase().replace('fesom', 'FESOM')} (${Object.keys(region.precomputed[scenario])[0]})`;
            config.update();
        }
    }
};

// #######################################################################
// ##### ON - READY #############################################
// #######################################################################


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
    } else if (kind === 'complex-precomputed') {
        let gather_lines = (region_name, scenario, period, quant, lines) => {
            let data = new Array(0);
            for (let i = 0; i < lines.length; i++) lines[i].split(',').forEach((e, i) => {
                if (i !== 0) data.push(parseFloat(e));
            });

            region_name = region_name.replace('_', ' ');
            period = period.replace('_', '-');
            scenario = scenario.toUpperCase();

            for (let i = 0; i < window.regions.length; i++)
                if (window.regions[i].name == region_name) {
                    if (scenario == 'SODA') window.regions[i].precomputed[`${scenario}`][period][quant] = data;
                    else window.regions[i].precomputed[`FESOM_${scenario}`][period][quant] = data;
                }
        };

        let gather_quant = (full_descr, region_name, scenario, period, lines) => {
            if (full_descr.includes('quant25')) gather_lines(region_name, scenario, period, 'quant25', lines)
            else if (full_descr.includes('quant50')) gather_lines(region_name, scenario, period, 'quant50', lines)
            else if (full_descr.includes('quant75')) gather_lines(region_name, scenario, period, 'quant75', lines)
        }

        let gather_period = (full_descr, region_name, scenario, lines) => {
            if (full_descr.includes('1860_1900')) gather_quant(full_descr, region_name, scenario, '1860_1900', lines)
            else if (full_descr.includes('1960_2000')) gather_quant(full_descr, region_name, scenario, '1960_2000', lines)
            else if (full_descr.includes('2060_2100')) gather_quant(full_descr, region_name, scenario, '2060_2100', lines)
            else if (full_descr.includes('2160_2200')) gather_quant(full_descr, region_name, scenario, '2160_2200', lines)
        }

        let gather_scenario = (full_descr, region_name, lines) => {
            if (full_descr.includes('historical')) gather_period(full_descr, region_name, 'historical', lines);
            else if (full_descr.includes('rcp45')) gather_period(full_descr, region_name, 'rcp45', lines);
            else if (full_descr.includes('rcp85')) gather_period(full_descr, region_name, 'rcp85', lines);
            else if (full_descr.includes('SODA')) gather_period(full_descr, region_name, 'SODA', lines);
        }

        for (let line = 0; line < allTextLines.length - 1; line++) {
            const description = allTextLines[line];
            if (description.includes('Celtic_Sea')) {
                gather_scenario(description, 'Celtic_Sea', allTextLines.slice(line + 1, line + 42));
                line += 41;
            } else if (description.includes('North_Sea')) {
                gather_scenario(description, 'North_Sea', allTextLines.slice(line + 1, line + 42));
                line += 41;
            }
        }
    }
}

$(document).ready(() => {
    // Simple
    // $.ajax({
    //     type: 'GET',
    //     url: 'data/growth_function_parameters_simple.csv',
    //     dataType: 'text',
    //     success: (data) => {
    //         window.process_data_simple = processData(data, 'Simple');
    //         console.log('Simple data loaded!')
    //         window.computeSimple();
    //         console.log('Default Aquarium Experiment computed!')
    //         window.plot_simple();
    //     }
    // });

    // Complex
    // window.loadNewScenario('FESOM_historical');
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/ALL_DATA.csv`,
        dataType: 'text',
        success: (data) => {
            processData(data, 'complex-precomputed');
            // console.log(regions[0].precomputed)
            // console.log(regions[1].precomputed)
            plot_complex('SODA', '1960-2000');
            plot_complex('FESOM_HISTORICAL', '1960-2000');
            // plot_complex(regions[0], processed_data, 'boxplot', scenario);
        }
    });
});