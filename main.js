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
    boxplot_data_filename: 'CelticSea_PREPARED-FOR-BOX-PLOTTING_7e-k_stock_weight-at-age_1971-2018_WGCSE2019.csv',
    precomputed: {
        FESOM_historical: {
            timespan: '1860-2000',
            all: 'FESOM_historical/CelticSea_FESOM_historical_all.csv',
            quant25: 'FESOM_historical/CelticSea_depth30-580_coord4752121_FESOMhist/CelticSea_depth30-580_coord4752121_FESOM_HIST_weight_0.25persent_1860-2000_nomasktemp_ages1-10.csv',
            quant50: 'FESOM_historical/CelticSea_depth30-580_coord4752121_FESOMhist/CelticSea_depth30-580_coord4752121_FESOM_HIST_weight_0.5persent_1860-2000_nomasktemp_ages1-10.csv',
            quant75: 'FESOM_historical/CelticSea_depth30-580_coord4752121_FESOMhist/CelticSea_depth30-580_coord4752121_FESOM_HIST_weight_0.75persent_1860-2000_nomasktemp_ages1-10.csv'
        },
        FESOM_RCP45: {
            timespan: '2060-2200',
            all: 'FESOM_RCP4.5/CelticSea_FESOM_RCP4.5_all.csv',
            quant25: 'FESOM_RCP4.5/CelticSea_depth30-580_coord4752121_RCP45/CelticSea_depth30-580_coord4752121_FESOM_RCP4.5_weight_0.25persent_2060-2200_nomasktemp_ages1-10.csv',
            quant50: 'FESOM_RCP4.5/CelticSea_depth30-580_coord4752121_RCP45/CelticSea_depth30-580_coord4752121_FESOM_RCP4.5_weight_0.5persent_2060-2200_nomasktemp_ages1-10.csv',
            quant75: 'FESOM_RCP4.5/CelticSea_depth30-580_coord4752121_RCP45/CelticSea_depth30-580_coord4752121_FESOM_RCP4.5_weight_0.75persent_2060-2200_nomasktemp_ages1-10.csv'
        },
        FESOM_RCP85: {
            timespan: '2060-2200',
            all: 'FESOM_RCP8.5/CelticSea_FESOM_RCP8.5_all.csv',
            quant25: 'FESOM_RCP8.5/CelticSea_depth30-580_coord4752121_RCP85/CelticSea_depth30-580_coord4752121_FESOM_RCP8.5_weight_0.25persent_2060-2200_nomasktemp_ages1-10.csv',
            quant50: 'FESOM_RCP8.5/CelticSea_depth30-580_coord4752121_RCP85/CelticSea_depth30-580_coord4752121_FESOM_RCP8.5_weight_0.5persent_2060-2200_nomasktemp_ages1-10.csv',
            quant75: 'FESOM_RCP8.5/CelticSea_depth30-580_coord4752121_RCP85/CelticSea_depth30-580_coord4752121_FESOM_RCP8.5_weight_0.75persent_2060-2200_nomasktemp_ages1-10.csv'
        },
        SODA: {
            timespan: '1960-2000',
            all: 'SODA/CelticSea_SODA_all.csv',
            quant25: 'SODA/CelticSea/CelticSea_depth30-580_coord4752121_SODA_weight_0.25persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
            quant50: 'SODA/CelticSea/CelticSea_depth30-580_coord4752121_SODA_weight_0.5persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
            quant75: 'SODA/CelticSea/CelticSea_depth30-580_coord4752121_SODA_weight_0.75persent_1959-2000_nomasktemp_nospawn_ages1-10.csv'
        }
    },
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
    precomputed: {
        FESOM_historical: {
            timespan: '1860-2000',
            all: 'FESOM_historical/NorthSea_FESOM_historical_all.csv',
            quant25: 'FESOM_historical/NorthSea_depth30-580_coord516238_FESOMhist/NorthSea_depth30-580_coord516238_FESOM_HIST_weight_0.25persent_1860-2000_nomasktemp_ages1-10.csv',
            quant50: 'FESOM_historical/NorthSea_depth30-580_coord516238_FESOMhist/NorthSea_depth30-580_coord516238_FESOM_HIST_weight_0.5persent_1860-2000_nomasktemp_ages1-10.csv',
            quant75: 'FESOM_historical/NorthSea_depth30-580_coord516238_FESOMhist/NorthSea_depth30-580_coord516238_FESOM_HIST_weight_0.75persent_1860-2000_nomasktemp_ages1-10.csv',
        },
        FESOM_RCP45: {
            timespan: '2060-2200',
            all: 'FESOM_RCP4.5/NorthSea_FESOM_RCP4.5_all.csv',
            quant25: 'FESOM_RCP4.5/NorthSea_depth30-580_coord516238_RCP45/NorthSea_depth30-580_coord516238_FESOM_RCP4.5_weight_0.25persent_2007-2203_nomasktemp_ages1-10.csv',
            quant50: 'FESOM_RCP4.5/NorthSea_depth30-580_coord516238_RCP45/NorthSea_depth30-580_coord516238_FESOM_RCP4.5_weight_0.5persent_2007-2203_nomasktemp_ages1-10.csv',
            quant75: 'FESOM_RCP4.5/NorthSea_depth30-580_coord516238_RCP45/NorthSea_depth30-580_coord516238_FESOM_RCP4.5_weight_0.75persent_2007-2203_nomasktemp_ages1-10.csv',
        },
        FESOM_RCP85: {
            timespan: '2060-2200',
            all: 'FESOM_RCP8.5/NorthSea_FESOM_RCP8.5_all.csv',
            quant25: 'FESOM_RCP8.5/NorthSea_depth30-580_coord516238_RCP85/NorthSea_depth30-580_coord516238_FESOM_RCP8.5_weight_0.25persent_2060-2200_nomasktemp_ages1-10.csv',
            quant50: 'FESOM_RCP8.5/NorthSea_depth30-580_coord516238_RCP85/NorthSea_depth30-580_coord516238_FESOM_RCP8.5_weight_0.5persent_2060-2200_nomasktemp_ages1-10.csv',
            quant75: 'FESOM_RCP8.5/NorthSea_depth30-580_coord516238_RCP85/NorthSea_depth30-580_coord516238_FESOM_RCP8.5_weight_0.75persent_2060-2200_nomasktemp_ages1-10.csv',
        },
        SODA: {
            timespan: '1960-2000',
            all: 'SODA/NorthSea_SODA_all.csv',
            quant25: 'SODA/NorthSea/NorthSea_depth30-580_coord516238_SODA_weight_0.25persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
            quant50: 'SODA/NorthSea/NorthSea_depth30-580_coord516238_SODA_weight_0.5persent_1959-2000_nomasktemp_nospawn_ages1-10.csv',
            quant75: 'SODA/NorthSea/NorthSea_depth30-580_coord516238_SODA_weight_0.75persent_1959-2007_nomasktemp_nospawn_ages1-10.csv'
        }
    },
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

window.complex_charts = [null, null]
window.plot_complex = (region_params, data, kind, scenario_name) => {

    let
        config = JSON.parse(JSON.stringify(window.default_chart_config_simple)),
        ctx = $(`#complex_plot_canvas${region_params.index}`);
    const n_generations = 10;

    let weight_by_age_vector = [...new Array(n_generations)].map(() => new Array());
    for (var year = 0; year < data.length; year++) {
        for (var gen = 0; gen < n_generations; gen++) {
            if (!isNaN(data[year][gen])) weight_by_age_vector[gen].push((data[year][gen]));
        }
    }

    let label, xdata, borderColor, borderDash, type;
    kind = kind.toString();
    if (kind == 'quant25') {
        type = 'line';
        label = '25% Quantile';
        xdata = [...new Array(n_generations)].map((e, i) => avg(weight_by_age_vector[i]));
        borderColor = 'orange';
        borderDash = [10, 5];
    } else if (kind == 'quant50') {
        type = 'line';
        label = '50% Quantile';
        xdata = [...new Array(n_generations)].map((e, i) => avg(weight_by_age_vector[i]));
        borderColor = 'black';
        borderDash = [0];
    } else if (kind == 'quant75') {
        type = 'line';
        label = '75% Quantile';
        xdata = [...new Array(n_generations)].map((e, i) => avg(weight_by_age_vector[i]));
        borderColor = 'red';
        borderDash = [10, 5];
    }

    let plottable_dataset = {
        type: type,
        label: label,
        data: xdata,
        borderColor: borderColor,
        pointRadius: 0,
        borderDash: borderDash,
    };

    if (kind == 'boxplot') {
        plottable_dataset = {
            type: 'boxplot',
            label: 'weight at age',
            borderColor: 'blue',
            borderWidth: 1,
            outlierColor: '#999999',
            padding: 10,
            itemRadius: 0,
            data: weight_by_age_vector
        }
    }

    config.data.labels = range(1, n_generations);
    config.data.datasets = [plottable_dataset];
    config.options.plugins.title.text = `${region_params.name} ${scenario_name} (${region_params.precomputed[scenario_name].timespan})`;
    config.options.scales.x.title.text = 'Age, years';
    config.options.plugins.tooltip = {
        displayColors: true,
        callbacks: {
            label: (context) => {
                return (context.dataset.label !== null && context.parsed.y !== null) ? `${context.dataset.label}: ${parseFloat(Number(context.parsed.y.toFixed(2)))}kg` : '';
            },
            title: (context) => {
                return `Age, year: ${Number(context[0].parsed.x+1).toFixed(1)}`;
            },
        },
    };


    if (window.complex_charts[region_params.index] === null)
        window.complex_charts[region_params.index] = new Chart(ctx, config);
    else if (window.complex_charts[region_params.index].options.plugins.title.text != config.options.plugins.title.text) {
        window.complex_charts[region_params.index].destroy();
        window.complex_charts[region_params.index] = new Chart(ctx, config);
    } else {
        if (window.complex_charts[region_params.index].data.datasets.length < 4)
            window.complex_charts[region_params.index].data.datasets.push(plottable_dataset);
        window.complex_charts[region_params.index].update();
    }
};

// #######################################################################
// ##### ON - READY #############################################
// #######################################################################

window.loadNewScenario = (scenario = 'FESOM_historical') => {
    // the solution below does not work because ajax is called after loop so the parameters are wrong
    // window.regions.forEach((params) => {
    //     for (var scenario in params.precomputed) {
    //         if (name == scenario.toString()) {
    //             for (var quant_name in params.precomputed[scenario]) {
    //                 console.log(scenario, quant_name, params.name)
    //                 $.ajax({
    //                     type: 'GET',
    //                     url: `data/modelled_weights_csv/${params.precomputed[scenario][quant_name]}`,
    //                     dataType: 'text',
    //                     success: (data) => {
    //                         const processed_data = processData(data, 'complex-precomputed');
    //                         plot_complex(params, processed_data, quant_name, scenario);
    //                     }
    //                 });
    //             }
    //             return;
    //         }
    //     }
    // })


    /**
     * 
     * Yes, the following is not optimal, because loading everything separate costs time
     * it would be better to load all at once and compute the quantiles in JS (without preprocessing)
     * 
     */
    // ! Load separate
    // ? LEFT Chart

    // BOXPLOT
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[0].precomputed[scenario].all}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[0], processed_data, 'boxplot', scenario);
        }
    });

    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[0].precomputed[scenario].quant25}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[0], processed_data, 'quant25', scenario);
        }
    });
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[0].precomputed[scenario].quant50}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[0], processed_data, 'quant50', scenario);
        }
    });
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[0].precomputed[scenario].quant75}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[0], processed_data, 'quant75', scenario);
        }
    });


    // ? Right Chart

    // BOXPLOT
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[1].precomputed[scenario].all}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[1], processed_data, 'boxplot', scenario);
        }
    });

    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[1].precomputed[scenario].quant25}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[1], processed_data, 'quant25', scenario);
        }
    });
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[1].precomputed[scenario].quant50}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[1], processed_data, 'quant50', scenario);
        }
    });
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights_csv/${regions[1].precomputed[scenario].quant75}`,
        dataType: 'text',
        success: (data) => {
            const processed_data = processData(data, 'complex-precomputed');
            plot_complex(regions[1], processed_data, 'quant75', scenario);
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
    } else if (kind === 'complex-precomputed') {
        let data = new Array(0);
        for (let line = 1; line < allTextLines.length - 1; line++) {
            data.push(new Array(0));
            allTextLines[line].split(',').forEach((e, i) => {
                if (i !== 0) data[line - 1].push(parseFloat(e));
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
    window.loadNewScenario('FESOM_historical');
});