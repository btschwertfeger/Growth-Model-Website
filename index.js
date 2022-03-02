/**
 * Website to visualize and manipulate the Growth Model
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2021)
 * @author Benjamin Thomas Schwertfeger (January 2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 * 
 * 
 * Input Data from xarray converted to csv using: 
def saveIt():
    m = input_files['thetao'].transpose('latitude','longitude', 'time', 'depth_coord').fillna(-999)
    len_lat, len_lon = len(m.latitude), len(m.longitude)
    len_ts, len_depth = len(m.time), len(m.depth_coord)

    output = np.arange(len_lat*len_lon*len_depth * len_ts).reshape(len_lat, len_lon, len_depth, len_ts).astype('float32')
    m = input_files['thetao'].transpose('latitude','longitude', 'depth_coord', 'time').fillna(-999).astype('float32')

    for lat in range(len_lat):
        for lon in range(len_lon):
            for depth in range(len_depth):
                output[lat,lon,depth] = m[lat,lon,depth,:].load()

    output = output.reshape(len_lat * len_lon * len_depth, len_ts)  
    # mask = output < -999; mask
    # output[mask] = -999
    np.savetxt('data_2000-2004.csv', output, delimiter=',')#, fmt='%.7f')
saveIt()
 **/

import get_year from './utils.js';
import range from './math.js';


const
    regions = {
        CeltricSea: {
            name: 'CeltricSea',
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
    },
    default_input = {
        // # Specification of biological parameters  
        // # Number of years in one life cycle of an individual 
        generation: 2,
        // # The year when the input temeperature dataset starts 
        initial_year: 2000,
        // # Number of years in the input temperature dataset
        years: [2000, 2001, 2002, 2003, 2004],
    },
    constants = {
        A_R: 8.660,
        B_R: 0.3055,
        THETA_A: 18145,
        THETA_B: 4258,
        THETA_H: 25234,
        T_R: 283,
        T_H: 286,
        C_AVG: 0.291,
        T0: 273.15
    }

function equation2(input_temp) {
    const T_Kelvin = input_temp.map((value) => (value < -99) ? -999 : value + constants.T0);
    // # Calculate a
    const
        a_numerator = T_Kelvin.map((value) => (value === -999) ? -999 : constants.A_R * Math.exp(constants.THETA_A / constants.T_R - constants.THETA_A / value)),
        a_dominator = T_Kelvin.map((value) => (value === -999) ? -999 : 1 + Math.exp(constants.THETA_H / constants.T_H - constants.THETA_H / value));
    return a_numerator.map((value, index) => (value === -999) ? -999 : value / a_dominator[index]);
}

function equation3(input_temp) {
    // """ Arrhenius equation """
    // # Calculate b
    return input_temp.map((value) => (value == -999) ? -999 : constants.B_R * Math.exp(constants.THETA_B / constants.T_R - constants.THETA_B / (value + constants.T0)));
}

function compute(data, parameters) {

    const
        n_lat = data.region.lat.length,
        n_lon = data.region.lon.length,
        n_depths = data.region.depths.length,
        n_months = 12,
        n_days_per_month = 30,
        dt = 1;

    const
        c_weights = [...new Array(n_depths)].map(() => [...new Array(n_lat * n_lon)].map(() => 1)),
        c_growth_rates = [...new Array(n_depths)].map(() => [...new Array(n_lat * n_lon)].map(() => 0));
    let
        initial_year = parameters.initial_year,
        last_year = parameters.initial_year + parameters.generation,
        generation = parameters.generation,
        age = 0,
        dataset = data.dataset,
        region = data.region;

    let results = {};

    while (last_year <= parameters.years.at(-1)) {
        let
            weight = JSON.parse(JSON.stringify(c_weights)),
            growth_rates = JSON.parse(JSON.stringify(c_growth_rates));

        range(initial_year, last_year - 1, 1).forEach((year) => {
            const tmp = get_year(dataset, parameters.years.at(0), year); // month depth lat lon
            let tmp3d = [...new Array(n_months)].map(
                () => [...new Array(n_depths)].map(
                    () => [...new Array(n_lat * n_lon)]
                )
            );
            // console.log(tmp)
            // tmp.forEach((e) => {
            //     console.log(e[0][0].slice(13, 19)) //.slice(13, 19))
            // })
            // return

            // tmp3d = tmp.values.reshape(12, n_depths, n_lat*n_lon)             
            for (let month = 0; month < n_months; month++) {
                const depth_lat_lon = tmp[month];
                // console.log(depth_lat_lon[0][0].slice(13, 19))
                for (let depth = 0, i = 0; depth < n_depths; depth++, i = 0)
                    for (let lat = 0; lat < n_lat; lat++)
                        for (let lon = 0; lon < n_lon; lon++)
                            tmp3d[month][depth][i++] = depth_lat_lon[depth][lat][lon];
            }


            let a = [...new Array(n_depths)].map(() => [...new Array(n_lat * n_lon)].map(() => 0));
            let b = JSON.parse(JSON.stringify(a));
            // console.log(tmp3d)
            let mm0 = (year === initial_year) ? 2 : 0;
            for (let month = 0; month < n_months; month++) {
                for (let day = 0; day < n_days_per_month; day++) {
                    for (let ilev = 0; ilev < n_depths; ilev++) {
                        a[ilev] = equation2(tmp3d[month][ilev]);
                        b[ilev] = equation3(tmp3d[month][ilev]).map((value) => (value === -999) ? -999 : value * -1);
                        console.log(a[ilev]) // <--- HIER WEITER MACHEN | ES SCHEINT RUNDUNGSFEHLER ZU GEBEN
                        return
                        growth_rates[ilev] = a[ilev].map(
                            (value, index) => (value === -999 || b[ilev][index] === -999) ? -999 : 0.01 * (value * Math.pow(weight[ilev][index], b[ilev][index]) - constants.C_AVG)
                        );
                        // if (ilev == 0 && month == 7 && day == 0) {
                        //     console.log(a[ilev][18], weight[ilev][18], b[ilev][18], constants.C_AVG)
                        //     console.log(0.01 * (a[ilev][18] * Math.pow(weight[ilev][18], b[ilev][18]) - constants.C_AVG))
                        //     console.log(growth_rates[ilev][18])
                        // }
                        // growth_rates[ilev].every(e => {
                        //     if (e < 0 && e != -999) console.log('_____')
                        // })


                        growth_rates[ilev] = growth_rates[ilev].map((value) => (value < 0 && value !== -999) ? 0 : value);
                        weight[ilev] = weight[ilev].map(
                            (value, index) => (value === -999 || growth_rates[ilev][index] === -999) ? -999 : value * (1 + dt * growth_rates[ilev][index])
                        );



                        // if (ilev == 20) {
                        //     console.log(weight[ilev])
                        //     break
                        // }
                    }

                    // break
                }

                // console.log(weight[0].slice(13, 19))
                // break
            }
            // console.log(weight)
            return
            // console.log(weight)
        });
        return
        break
        initial_year += 1;
        last_year = initial_year + generation;
    }

    return results;
}

function processData(allText, region, n_time) {
    let
        allTextLines = allText.split('\n'),
        lines = [];
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

    console.log('Dataset loaded!')

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
        if (row % n_depths === 0 && row != 0) lon += 1;
        if (lon === n_lon) {
            lon = 0;
            lat += 1;
        }
        if (lat === n_lat) break;
        for (let time = 0; time < n_time; time++) reshaped_data[time][lat][lon][depth] = lines[row][time]
    }
    // Dataset has now shape of 60 x 10 x 12 x 21 for time x lat x lon x depth
    // console.log(reshaped_data);
    return {
        region: region,
        dataset: reshaped_data
    };
}

$(document).ready(() => {
    // laod csv data
    $.ajax({
        type: 'GET',
        url: 'data_2000-2004.csv',
        dataType: 'text',
        success: (data) => {
            // Celtric Sea
            const n_time = default_input.years.length * 12;
            const processed_data = processData(data, regions.CeltricSea, n_time);

            const result = compute(processed_data, default_input);
        }
    });

});