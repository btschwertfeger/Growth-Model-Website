#coding: utf-8

# SPDX-FileCopyrightText: 2021 Alfred-Wegener-Institut, Helmholtz-Zentrum fuer Polar- und Meeresforschung (AWI)
#
# SPDX-License-Identifier: MIT

# Schoolfield and Arrhenius equations from Butzin and Poertner, 2016 

import xarray as xr
from user_setup import lat, lon, depths


""" Output Function save_netcdf 
    Definition of the filename
"""
            
def save_netcdf(data, var_name, directory, year, age, dimension_labels = 
               ("depth_coord", "latitude", "longitude")):
                
    if "depth_coord" in dimension_labels:
                    coordinates = [('depth_coord', depths), 
                                   ('latitude', lat), 
                                   ('longitude', lon)]
                    
    if "depth_coord" not in dimension_labels:
                    coordinates = [('latitude', lat), 
                                   ('longitude', lon)] 
                
    da = xr.DataArray(data, dims=dimension_labels, coords=coordinates, 
                      name=var_name)
                
    filename = directory + str(year) + '_' + var_name + '_' 
    filename += str(age) + '.nc'
                
    da.to_netcdf(filename)

    return

""" End of output function definitions """



"""Parse Comman Line Function"""

def parse_command_line():
    
    import argparse
    
    # parse command line
    parser = argparse.ArgumentParser('Takes input temperature and weight from command line')
    
    # add command line arguments
    parser.add_argument('input_temp', type=float, help='give input temperature in Â°C')                                       # First command line argument - input temperature
    parser.add_argument('init_weight', type=float, help='give initial weight in g')                                          # Second command line argument - initial weight
    args = parser.parse_args()
    argument1 = args.input_temp
    argument2 = args.init_weight
    
    return argument1, argument2

""" End of Parse Command Line Function"""


