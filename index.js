/**
 * Website to visualize and manipulate the Growth Model
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2021)
 * @author Benjamin Thomas Schwertfeger (January 2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 **/

const constants = {
    A_R: 8.660,
    B_r: 0.3055,
    THETA_A: 18145,
    THETA_B: 4258,
    THETA_H: 25234,
    T_R: 283,
    T_H: 286,
    C_AVG: 0.291
}

let input = {
    experiment_name: 'SODA',
    region: 'CeltricSea',

    // # Specification of biological parameters  
    // # Number of years in one life cycle of an individual 
    generation: 2,
    // # The year when the input temeperature dataset starts 
    initial_year: 2000,
    // # Number of years in the input temperature dataset
    years: [2000, 2001, 2002, 2003, 2004],

    // begin slices
    // # Define geographic boundaries (latitudes, longitudes)
    // # Default coordinates: North Atlantic coordinates
    lat_bounds: [47, 54],
    lon_bounds: [-12, -1],

    // # Define depth_levels for your growth model output files
    depth_levels: [0, 600],
    // end slices

    // # Define latitudes that you will use to save your weight-at-age data 
    lat: [47.25, 47.75, 48.25, 48.75, 49.25, 49.75, 50.25, 50.75, 51.25, 51.75],
    lon: [
        -11.75, -11.25, -10.75, -10.25, -9.75, -9.25, -8.75, -8.25, -7.75,
        -7.25, -6.75, -6.25, -5.75, -5.25, -4.75, -4.25, -3.75, -3.25, -2.75,
        -2.25, -1.75, -1.25
    ],
    // # Define depth that you will use to save your weight-at-age data
    depths: [
        -0., 10., 20., 30., 40., 50., 60., 70., 80., 90., 100., 115.,
        135., 160., 190., 230., 280., 340., 410., 490., 580.
    ]
}

const
    N_depths = input.depths.length,
    N_lat = input.lat.length,
    N_lon = input.lon.length,
    N_time = input.years.length * 12;

function doit(input = input) {
    const
        c_weights = [...new Array(N_depths)].map((e, i) => [...new Array(N_lat * N_lon)].map(() => 0)),
        c_growth_rates = [...new Array(N_depths)].map((e, i) => [...new Array(N_lat * N_lon)].map(() => 1));

    input.years.forEach((year) => {
        let
            last_year = input.initial_year + input.generation,
            age = 0,
            weight = [...c_weights],
            growth_rates = [...c_growth_rates];
    });
}

function processData(allText) {
    let
        allTextLines = allText.split('\n'),
        lines = [];

    for (var i = 0; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        var tarr = [];
        for (var j = 0; j < N_time; j++) tarr.push(parseFloat(data[j]));
        lines.push(tarr);
    }
    console.log('Dataset loaded!')

    // prepare final array
    let reshaped_data = [...new Array(N_time)].map(
        () => [...new Array(N_lat)].map(
            () => [...new Array(N_lon)].map(
                () => [...new Array(N_depths)]
            )
        )
    );

    // insert parsed values from csv to empty final array
    for (let row = 0, lat = 0, lon = 0; row < lines.length; row++) {
        const depth = row % N_depths;
        if (row % N_depths === 0 && row != 0) lon += 1;
        if (lon === N_lon) {
            lon = 0;
            lat += 1;
        }
        if (lat === N_lat) break;
        for (let time = 0; time < N_time; time++) reshaped_data[time][lat][lon][depth] = lines[row][time]
    }
    // Dataset has now shape of 60 x 10 x 12 x 21 for time x lat x lon x depth
    console.log(reshaped_data);
    return reshaped_data;
}

$(document).ready(() => {
    // laod csv data
    $.ajax({
        type: 'GET',
        url: 'data_2000-2004.csv',
        dataType: 'text',
        success: (data) => {
            processData(data);
        }
    });

    doit(input)
});