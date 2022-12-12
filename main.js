/**
 * Website to visualize and manipulate the Growth Model 
 * provided by Nadezhda Valerievna Sokolova and AnjaRohner
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @link https://awi.de
 * 
 * @author Benjamin Thomas Schwertfeger (2022)
 * @email benjamin.schwertfeger@awi.de
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 **/

import {
    get_weight_by_temperature,
    get_temperature_index
} from './utils.js';

import {
    avg,
    range,
    quantile
} from './math.js';

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
                max: 26,
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
/*
    _                          _                 
   / \   __ _ _   _  __ _ _ __(_)_   _ _ __ ___  
  / _ \ / _` | | | |/ _` | '__| | | | | '_ ` _ \ 
 / ___ \ (_| | |_| | (_| | |  | | |_| | | | | | |
/_/   \_\__, |\__,_|\__,_|_|  |_|\__,_|_| |_| |_|
        |_| Experiment
*/
window.default_input_simple = {
    max_age: 15 * 365, // maximum age in days
    initial_weight: 1, // initial weight in kg
};

window.computeSimple = (data = null, parameters = null, initial_weight = null) => {
    data = (data === null) ? window.process_data_simple : data;
    parameters = (parameters === null) ? window.default_input_simple : parameters;
    initial_weight = (initial_weight === null) ? parameters.initial_weight * 1000 : parseFloat(initial_weight) * 1000; // * 1000 -> kg -> gramm

    let
        a_fit = data.a_fit,
        b_fit = data.b_fit,
        c_avg = data.c_avg,
        itemp = 0, //  temperature index
        dt = 1, //  time step in days 
        temperature_range = range(-2, 30.5 - .5, .5); //  Temperature range in °C

    let weight_at_age = [...new Array(parameters.max_age)].map( // weight at age (in g) for a given temperature && initial weight in kg
        (e, i) => [...new Array(a_fit.length)].map(() => (i === 0) ? initial_weight : 0)
    );

    // loop over temperatures, increasing values by 0.5°C
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
};

/*
 ____ Experiment _  __        __         _     _ 
|  _ \ ___  __ _| | \ \      / /__  _ __| | __| | 
| |_) / _ \/ _` | |  \ \ /\ / / _ \| '__| |/ _` |
|  _ <  __/ (_| | |   \ V  V / (_) | |  | | (_| |
|_| \_\___|\__,_|_|    \_/\_/ \___/|_|  |_|\__,_| 
*/

const
    n_generations_celtic_sea = 10,
    n_generations_barents_sea = 14;

/**
 * * Following is the plotting of precomputed stuff
 */
window.boxplot_data = {
    'Celtic_Sea': {
        data: [...new Array(n_generations_celtic_sea)].map(() => [...new Array(0)])
    },
    'Barents_Sea': {
        data: [...new Array(n_generations_barents_sea)].map(() => [...new Array(0)])
    }
};

window.regions = [{
    name: 'Celtic_Sea',
    index: 0, // specifies the index in computed and loaded arrays
    precomputed: {
        FESOM_RCP45: {
            '2081-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2181-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        FESOM_RCP85: {
            '2081-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2181-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        SODA: {
            '1981-2000': {
                quant25: null,
                quant50: null,
                quant75: null,
            }
        }
    },

}, {
    name: 'Barents_Sea',
    index: 1,
    precomputed: {
        FESOM_RCP45: {
            '2081-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2181-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        FESOM_RCP85: {
            '2081-2100': {
                quant25: null,
                quant50: null,
                quant75: null
            },
            '2181-2200': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        },
        SODA: {
            '1981-2000': {
                quant25: null,
                quant50: null,
                quant75: null
            }
        }
    },
}];

window.complex_charts = [
    null, null, // upper left, upper right,
];

window.plot_complex_precomputed = (scenario, period) => {
    window.active_scenario = scenario;
    const
        get_weight_by_age = (data, n_generations) => {
            let weight_by_age_vector = [...new Array(n_generations)].map(() => new Array());
            for (var entry = 0, age = 0; entry < data.length; entry++) {
                if (!isNaN(data[entry])) weight_by_age_vector[age].push(data[entry]);
                age = (age + 1 !== n_generations) ? age + 1 : 0;
            }
            return weight_by_age_vector;
        },
        get_soda_boxplot = (data) => {
            return {
                type: 'boxplot',
                label: 'Observation',
                borderColor: 'blue',
                borderWidth: 1,
                outlierColor: '#999999',
                padding: 10,
                itemRadius: 0,
                data: data
            }
        };
    const
        get_line_datasets = (region, scenario, period) => {
            let datasets = [];
            Object.keys(region.precomputed[scenario][period]).forEach((quant, qindex) => {
                const weight_by_age_vector = get_weight_by_age(
                    region.precomputed[scenario][period][quant],
                    (region.name == 'Celtic_Sea') ? n_generations_celtic_sea : n_generations_barents_sea
                );
                datasets.push({
                    type: 'line',
                    label: `${quant.slice(-2)}% Quantile`,
                    data: [...new Array((region.name == 'Celtic_Sea') ? n_generations_celtic_sea : n_generations_barents_sea)].map((e, i) => avg(weight_by_age_vector[i])),
                    borderColor: (quant.includes('50')) ? 'black' : (quant.includes('25')) ? 'orange' : 'red',
                    borderDash: (quant.includes('50')) ? [0] : [10, 5],
                });
            });
            return datasets;
        };

    let general_config = JSON.parse(JSON.stringify(window.default_chart_config_simple));
    general_config.data.datasets = [];
    general_config.options.scales.x.title.text = 'Age, years';
    general_config.options.scales.x.min = 1;
    general_config.options.scales.x.max = Math.max(n_generations_celtic_sea, n_generations_barents_sea);

    if (scenario == 'SODA') {
        for (let regionidx = 0; regionidx < window.regions.length; regionidx++) {

            let config = null;

            if (window.complex_charts[regionidx]) {
                config = window.complex_charts[regionidx];
                config.data.datasets.splice(1);
            } else {
                let region = window.regions[regionidx]
                config = JSON.parse(JSON.stringify(general_config));
                config.data.labels = range(1, n_generations_barents_sea) //(region.name == 'Celtic_Sea') ? n_generations_celtic_sea : n_generations_barents_sea);
                config.data.datasets.push(get_soda_boxplot(window.boxplot_data[region.name].data));

                const bp_tooltip = {
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
                            } else return (context.dataset.label !== null && context.parsed.y !== null) ? ` ${context.dataset.label}: ${parseFloat(Number(context.parsed.y.toFixed(2)))}kg` : '';
                            return label;
                        },
                        title: (context) => {
                            return `Age, year: ${parseInt(Number(context[0].parsed.x + 1).toFixed(1))}`;
                        },
                    },
                }
                config.options.plugins.tooltip = bp_tooltip;
            }

            // Lineplot for upper plots
            get_line_datasets(window.regions[regionidx], scenario, period).forEach((dataset) => config.data.datasets.push(dataset));

            // ? Plotting ...
            config.options.plugins.title.text = `${window.regions[regionidx].name.replace('_', ' ')} ${scenario} (${Object.keys(window.regions[regionidx].precomputed[scenario])[0]})`;
            if (!window.complex_charts[regionidx]) window.complex_charts[regionidx] = new Chart($(`#complex_plot_canvas${regionidx}`), config);
            else config.update();
        }
    } else {
        window.active_scenario = scenario;

        for (let regionidx = 0; regionidx < window.regions.length; regionidx++) {
            let
                config = window.complex_charts[regionidx],
                region = window.regions[regionidx];

            config.data.datasets.splice(1);
            // * LINEPLOT 
            get_line_datasets(region, scenario, period).forEach((dataset) => config.data.datasets.push(dataset));
            let scenario_name = scenario.replace('_', '').toLowerCase().replace('fesom', '');
            scenario_name = `${scenario_name.toUpperCase().slice(0, -2)}${scenario_name.slice(-2, -1)}.${scenario_name.slice(-1)}`
            config.options.plugins.title.text = `${region.name.replace('_', ' ')} ${scenario_name} (${period})`;
            config.update();
        }
    }
};

/*
     _       _  _           _        _     _      
    / \   __| |(_)_   _ ___| |_ __ _| |__ | | ___ 
   / _ \ / _` || | | | / __| __/ _` | '_ \| |/ _ \
  / ___ \ (_| || | |_| \__ \ || (_| | |_) | |  __/
 /_/   \_\__,_|/ |\__,_|___/\__\__,_|_.__/|_|\___|
                |__/ Experiment
*/
window.default_constants = { // # Values from Eg. 2 Butzin and Poertner, 2016)
    A_R: 8.66,
    B_R: 0.3055,
    THETA_A: 18145,
    THETA_B: 4258,
    THETA_H: 25234,
    T_R: 283,
    T_H: 286,
    C_AVG: 0.291,
    T0: 273.15
};

window.default_input_complex_adjustable = {
    generation: 10,
    initial_year: 1960,
    last_year: 1999,
    years: range(1960, 2001, 1),
    n_depths: 18
}

let
    equation2 = (input_temp, constants) => {
        if (input_temp < -988) return -999;
        else {
            const T_Kelvin = parseFloat((input_temp + constants.T0).toFixed(5));
            const
                a_numerator = constants.A_R * Math.exp(constants.THETA_A / constants.T_R - constants.THETA_A / T_Kelvin),
                a_dominator = 1 + Math.exp(constants.THETA_H / constants.T_H - constants.THETA_H / T_Kelvin);
            return a_numerator / a_dominator;
        }
    },
    equation3 = (input_temp, constants) => {
        // """ Arrhenius equation ""
        if (input_temp < -998) return -999;
        else {
            const T_Kelvin = parseFloat((input_temp + constants.T0).toFixed(5));
            return constants.B_R * Math.exp(constants.THETA_B / constants.T_R - constants.THETA_B / T_Kelvin);
        }
    },
    get_adj_year = (year, data) => {
        const index = 12 * (year - window.default_input_complex_adjustable.initial_year); // x12 months
        return data.slice(index, index + 12); // 2d array first dim is year, second is depth
    };

window.computeComplexAdjustable = (constants = null) => {
    const default_ = constants === null;
    constants = (constants === null) ? window.default_constants : constants;

    const
        data = window.complex_adjustable_data,
        settings = window.default_input_complex_adjustable,
        n_months = 12,
        n_days_per_month = 30,
        dt = 1;

    let
        initial_year = settings.initial_year,
        last_year = settings.initial_year + settings.generation,
        results = {};

    while (last_year < settings.years.at(-1)) {
        let
            weight = [...new Array(settings.n_depths)].map(() => 1),
            growth_rates = [...new Array(settings.n_depths)].map(() => 0),
            age = 0;

        for (let year = initial_year; year < last_year; year++) {
            const tmp = get_adj_year(initial_year, data);
            let
                a = [...new Array(settings.n_depths)].map(() => 1),
                b = [...new Array(settings.n_depths)].map(() => 1);

            for (let month = 0; month < n_months; month++) {
                for (let day = 0; day < n_days_per_month; day++) {
                    for (let level = 0; level < settings.n_depths; level++) {
                        if (tmp[month][level] < -998) {
                            a[level] = -999;
                            b[level] = -999;
                            growth_rates[level] = -999;
                            weight[level] = -999;
                        } else {
                            a[level] = equation2(tmp[month][level], constants);
                            b[level] = equation3(tmp[month][level], constants) * (-1.0);

                            growth_rates[level] = 0.01 * (a[level] * Math.pow(weight[level], b[level]) - constants.C_AVG);
                            growth_rates[level] = (growth_rates[level] < 0) ? 0 : growth_rates[level];
                            weight[level] = (weight[level] < -998) ? -999 : weight[level] * (1.0 + dt * growth_rates[level]);
                        }
                    }
                }
            }
            // ? this does not works; idk why; values will always be overwritten when new iteration starts
            // weight = weight.map((e) => (e < -998) ? -999 : e * 0.001);

            const content = {
                age: `${age}`,
                a: a,
                b: b,
                growth_rates: growth_rates,
                weight: weight.map((e) => (e < -998) ? -999 : e * 0.001),
                weight_max: Math.max(...weight.map((e) => (e < -998) ? -999 : e * 0.001))
            }

            if (typeof results[`${year}`] === 'undefined') results[`${year}`] = [content];
            else results[`${year}`].push(content);
            age++;
        }

        initial_year += 1;
        last_year = initial_year + settings.generation;
    }
    if (default_) window.default_complex_adj_computed = results;
    return results
};

window.plot_complex_adjustable = (data = null) => {
    if (data === null) data = window.default_complex_adj_computed;

    const
        settings = window.default_input_complex_adjustable,
        ctx = $(`#complex_plot_canvas_adjustable`);

    // ? create array that contains the weights of all depths per age
    let weight_by_age_vector = [...new Array(settings.generation)].map(() => new Array());
    for (let year = settings.initial_year; year < settings.last_year + 1; year++) {
        for (let entry = 0; entry < data[year].length; entry++) {
            const age = parseInt(data[year][entry].age);
            for (let depth = 0; depth < settings.n_depths; depth++) {
                const weight = data[year][entry].weight[depth];
                if (weight === -999) continue;
                else weight_by_age_vector[age].push(data[year][entry].weight[depth]);
            }
        }
    }

    /**
     * ? compute quantiles 
     * age x weight(@quantile)
     */
    let weight_by_age_quantile = {};
    for (let age = 0; age < settings.generation; age++) {
        const quantiles = {
            q_25: quantile(weight_by_age_vector[age], .25),
            q_50: quantile(weight_by_age_vector[age], .5),
            q_75: quantile(weight_by_age_vector[age], .75)
        };
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

    // Start plotting 

    const years = Object.keys(weight_by_age_quantile).length;
    let plottable_datasets = [{
        type: 'line',
        label: '25% Quantile',
        data: [...new Array(years)].map((e, i) => avg(weight_by_age_quantile[i].q_25)),
        fill: false,
        borderColor: 'orange',
        pointRadius: 0,
        borderDash: [10, 5]
    }, {
        type: 'line',
        label: '50% Quantile',
        data: [...new Array(years)].map((e, i) => avg(weight_by_age_quantile[i].q_50)),
        fill: false,
        borderColor: 'black',
        pointRadius: 0
    }, {
        type: 'line',
        label: '75% Quantile',
        data: [...new Array(years)].map((e, i) => avg(weight_by_age_quantile[i].q_75)),
        fill: false,
        borderColor: 'red',
        pointRadius: 0,
        borderDash: [10, 5]
    }];

    let config = JSON.parse(JSON.stringify(window.default_chart_config_simple));

    config.data.labels = range(1, years);
    config.data.datasets = plottable_datasets;
    config.options.plugins.title.text = 'SODA North Sea 1960 - 2000';
    config.options.scales.y.min = null;
    config.options.scales.y.max = null;
    config.options.plugins.tooltip = {
        displayColors: true,
        callbacks: {
            label: (context) => {
                return (context.dataset.label !== null && context.parsed.y !== null) ? `${context.dataset.label}: ${parseFloat(Number(context.parsed.y.toFixed(2)))}kg` : '';
            },
            title: (context) => {
                return `Age, year: ${Number(context[0].parsed.x + 1).toFixed(1)}`;
            }
        }
    };

    if (typeof window.complex_adj_chart === 'undefined') {
        config.options.scales.x.title.text = 'Age, years';
        window.complex_adj_chart = new Chart(ctx, config);
    } else {
        window.complex_adj_chart.data.labels = config.data.labels;
        window.complex_adj_chart.data.datasets = config.data.datasets;
        window.complex_adj_chart.update();
    }
};

/*
  ___        ____                _       
 / _ \ _ __ |  _ \ ___  __ _  __| |_   _ 
| | | | '_ \| |_) / _ \/ _` |/ _` | | | |
| |_| | | | |  _ <  __/ (_| | (_| | |_| |
 \___/|_| |_|_| \_\___|\__,_|\__,_|\__, |
                                    |___/ 
*/

/**
 * Load data from csv files
 * @param {*} allText 
 * @param {*} kind 
 * @returns 
 */
window.processData = (allText, kind) => {
    let allTextLines = allText.split('\n');

    if (kind == 'Simple') return {
        a_fit: allTextLines[0].split(',').map((element) => parseFloat(element)),
        b_fit: allTextLines[1].split(',').map((element) => parseFloat(element)),
        c_avg: 0.29100703,
    }
    else if (kind === 'complex-precomputed') {
        const gather_lines = (region_name, scenario, period, quant, lines) => {
            let data = new Array(0);
            for (let i = 0; i < lines.length; i++) lines[i].split(',').forEach((e, i) => {
                if (i !== 0) {
                    if (region_name == 'Celtic_Sea' && i > 10) data.push(parseFloat(.0)) // Celtic_Sea only has 10 generations
                    else data.push(parseFloat(e));
                }
            });

            //region_name = region_name.replace('_', ' ');
            period = period.replace('_', '-');
            scenario = scenario.toUpperCase();

            for (let i = 0; i < window.regions.length; i++)
                if (window.regions[i].name == region_name) {
                    if (scenario == 'SODA') window.regions[i].precomputed[`${scenario}`][period][quant] = data;
                    else window.regions[i].precomputed[`FESOM_${scenario}`][period][quant] = data;
                }
        };

        const gather_quant = (full_descr, region_name, scenario, period, lines) => {
            if (full_descr.includes('quant25')) gather_lines(region_name, scenario, period, 'quant25', lines)
            else if (full_descr.includes('quant50')) gather_lines(region_name, scenario, period, 'quant50', lines)
            else if (full_descr.includes('quant75')) gather_lines(region_name, scenario, period, 'quant75', lines)
        }

        const gather_period = (full_descr, region_name, scenario, lines) => {
            if (full_descr.includes('1981_2000')) gather_quant(full_descr, region_name, scenario, '1981_2000', lines)
            else if (full_descr.includes('2081_2100')) gather_quant(full_descr, region_name, scenario, '2081_2100', lines)
            else if (full_descr.includes('2181_2200')) gather_quant(full_descr, region_name, scenario, '2181_2200', lines)
        }

        const gather_scenario = (full_descr, region_name, lines) => {
            if (full_descr.includes('rcp45')) gather_period(full_descr, region_name, 'rcp45', lines);
            else if (full_descr.includes('rcp85')) gather_period(full_descr, region_name, 'rcp85', lines);
            else if (full_descr.includes('SODA')) gather_period(full_descr, region_name, 'SODA', lines);
        }

        for (let line = 0; line < allTextLines.length - 1; line++) {
            const description = allTextLines[line];
            if (description.includes('Celtic_Sea')) {
                gather_scenario(description, 'Celtic_Sea', allTextLines.slice(line + 1, line + 21));
                line += 20;
            } else if (description.includes('Barents_Sea')) {
                gather_scenario(description, 'Barents_Sea', allTextLines.slice(line + 1, line + 21));
                line += 20;
            }
        }
    } else if (kind == 'complex-precomputed-boxplot') {
        let current_scenario = null;
        for (let line = 0; line < allTextLines.length - 1; line++) {
            const description = allTextLines[line];

            const gather_scenario = (scenario_name, data) => {
                data.split(',').forEach((e, i) => {
                    if (i != 0 && i < window.boxplot_data[scenario_name].data.length + 1) window.boxplot_data[scenario_name].data[i - 1].push(parseFloat(e));
                });
            };
            if (description.includes('Celtic_Sea') || (current_scenario == 'Celtic_Sea' && !description.includes('Barents_Sea'))) {
                current_scenario = 'Celtic_Sea';
                if (!description.includes('Celtic_Sea')) gather_scenario('Celtic_Sea', allTextLines[line])
            } else if (description.includes('Barents_Sea') || (current_scenario == 'Barents_Sea' && !description.includes('Celtic_Sea'))) {
                current_scenario = 'Barents_Sea';
                if (!description.includes('Barents_Sea')) gather_scenario('Barents_Sea', allTextLines[line])
            }
        }

        // ? remove nans from boxplot data
        ['Celtic_Sea', 'Barents_Sea'].forEach(region_name => {
            window.boxplot_data[region_name].data.forEach((e, i) => {
                window.boxplot_data[region_name].data[i] = window.boxplot_data[region_name].data[i].filter(
                    value => !Number.isNaN(value)
                )
            })
        });
    } else if (kind === 'complex-one-region') {
        let x_data = new Array(0);
        for (let line = 0; line < allTextLines.length - 1; line++) {
            let linedata = new Array(0);
            allTextLines[line].split(',').forEach((e) => {
                linedata.push(parseFloat(e))
            });
            x_data.push(linedata);
        }
        window.complex_adjustable_data = x_data;
    }
}

$(document).ready(() => {
    // * Simple
    $.ajax({
        type: 'GET',
        url: 'data/growth_function_parameters_simple.csv',
        dataType: 'text',
        success: (data) => {
            window.process_data_simple = processData(data, 'Simple');
            window.computeSimple();
            window.plot_simple();
        }
    });

    //? load boxplot ajax
    $.ajax({
        type: 'GET',
        url: `data/boxdata.csv`,
        dataType: 'text',
        success: (data) => {
            processData(data, 'complex-precomputed-boxplot');
            // * load real world precomputed
            $.ajax({
                type: 'GET',
                url: `data/modeled_weights.csv`,
                dataType: 'text',
                success: (data) => {
                    processData(data, 'complex-precomputed');
                    plot_complex_precomputed('SODA', '1981-2000');
                }
            });
        }
    });

    // * Complex - one location for computation with adjustable parameters

    /**
     * 
     * ? Python code to get the .csv file in the correct form: 
        input_files = xr.open_dataset('data/SODA_North_Atlantic_1958_2007_sliced.nc')
        new_time = pd.date_range('1958-01-01', '2008-01-01', freq='M')
        input_files = input_files.assign_coords({'time': new_time})
        depth_levels = slice(30, 600)   # 0-600 meters according to Atlantic cod distribution
        initial_year = 1960 
        years = range(initial_year, 2000)

        lat, lon = 55, 0
        input_files = input_files.sel(
            latitude=lat, longitude=lon, method='nearest'
        ).sel(time=slice(str(years.start),str(years.stop-1)), depth_coord=depth_levels)
        
        # dimensions: time x depth
        np.savetxt(
            'data/northsea_lat55_lon0_1960-2000.csv', 
            np.array(pd.DataFrame(np.array(input_files.thetao)).fillna(-999)), 
            delimiter=','
        )
        # this can be foudn in /data/validate_adjustable_1loc.ipynb
     */
    $.ajax({
        type: 'GET',
        url: 'data/northsea_lat55_lon0_1960-2000.csv',
        dataType: 'text',
        success: (data) => {
            window.processed_data_complex_adjustable = processData(data, 'complex-one-region');
            window.computeComplexAdjustable();
            window.plot_complex_adjustable();
        }
    });
});