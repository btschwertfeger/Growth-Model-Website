/**
 * Website to visualize and manipulate the Growth Model 
 * provided by Nadezhda Valerievna Sokolova and AnjaRohner
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @author Benjamin Thomas Schwertfeger (April 2022)
 * @email benjamin.schwertfeger@awi.de
 * @link https://awi.de
 * 
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
} from './math.js';

// #######################################################################
// ##### SETTINGS #############################################
// #######################################################################

window.regions = [{
    name: 'Celtic Sea',
    index: 0, // specifies the index in computed and loaded arrays
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

}, {
    name: 'North Sea',
    index: 1,
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
}];

window.default_input_simple = {
    max_age: 15 * 365, // # maximum age in days
    initial_weight: 1, // initial weight in kg
};

// #######################################################################
// ##### COMPUTATION #############################################
// #######################################################################


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
            // * SODA BOXPLOT 
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
                    label: `${quant.slice(-2)}% Quantile`,
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
                        return `Age, year: ${parseInt(Number(context[0].parsed.x+1).toFixed(1))}`;
                    },
                },
            }
            config.options.scales.x.min = 1;
            config.options.scales.x.max = 10;
            config.options.scales.y.min = 0;
            config.options.scales.y.max = 20;

            config.options.plugins.tooltip = bp_tooltip;
            // * LINEPLOT for upper plots
            get_line_datasets(region, scenario, period, n_generations).forEach((dataset) => config.data.datasets.push(dataset));

            // ** BOXPLOT for lower plots
            let config2 = JSON.parse(JSON.stringify(config));
            config2.options.plugins.tooltip = bp_tooltip;

            // ? ----- PLOTTING ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
            config.options.plugins.title.text = `${region.name} ${scenario} (${Object.keys(region.precomputed[scenario])[0]})`;
            window.complex_charts[regionidx] = new Chart(ctx1, config);

            config2.data.datasets = [boxplot_dataset];
            config2.options.plugins.title.text = '';
            window.complex_charts[regionidx + 2] = new Chart(ctx2, config2);
        }
    } else {
        window.active_scenario = scenario;
        window.opposite_period = (period === '1860-1900') ? '1960-2000' :
            (period === '1960-2000') ? '1860-1900' :
            (period === '2060-2100') ? '2160-2200' :
            (period === '2160-2200') ? '2060-2100' : null;

        // * Lower two plots
        for (let regionidx = 0; regionidx < window.regions.length; regionidx++) {
            let
                config = window.complex_charts[regionidx + 2],
                region = window.regions[regionidx];

            // if (period === '1960-2000') config.data.datasets = [get_soda_boxplot(region)];
            // else config.data.datasets = [];
            config.data.datasets.splice(1);
            // * LINEPLOT 
            get_line_datasets(region, scenario, period, n_generations).forEach((dataset) => config.data.datasets.push(dataset));
            let scenario_name = scenario.replace('_', ' ').toLowerCase().replace('fesom', 'FESOM');
            scenario_name = (scenario_name.includes('historical')) ? scenario_name : `${scenario_name.toUpperCase().slice(0,-2)}${scenario_name.slice(-2,-1)}.${scenario_name.slice(-1)}`
            config.options.plugins.title.text = `${region.name} ${scenario_name} (${period})`;
            config.update();
        }
    }
};

// #######################################################################
// ##### ON - READY #############################################
// #######################################################################


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

        const gather_quant = (full_descr, region_name, scenario, period, lines) => {
            if (full_descr.includes('quant25')) gather_lines(region_name, scenario, period, 'quant25', lines)
            else if (full_descr.includes('quant50')) gather_lines(region_name, scenario, period, 'quant50', lines)
            else if (full_descr.includes('quant75')) gather_lines(region_name, scenario, period, 'quant75', lines)
        }

        const gather_period = (full_descr, region_name, scenario, lines) => {
            if (full_descr.includes('1860_1900')) gather_quant(full_descr, region_name, scenario, '1860_1900', lines)
            else if (full_descr.includes('1960_2000')) gather_quant(full_descr, region_name, scenario, '1960_2000', lines)
            else if (full_descr.includes('2060_2100')) gather_quant(full_descr, region_name, scenario, '2060_2100', lines)
            else if (full_descr.includes('2160_2200')) gather_quant(full_descr, region_name, scenario, '2160_2200', lines)
        }

        const gather_scenario = (full_descr, region_name, lines) => {
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
    // * Simple
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

    // * Complex
    $.ajax({
        type: 'GET',
        url: `data/modelled_weights.csv`,
        dataType: 'text',
        success: (data) => {
            processData(data, 'complex-precomputed');
            plot_complex('SODA', '1960-2000');
            plot_complex('FESOM_HISTORICAL', '1960-2000');
        }
    });
});