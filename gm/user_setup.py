#coding: utf-8

# SPDX-FileCopyrightText: 2021 Alfred-Wegener-Institut, Helmholtz-Zentrum für 
# Polar- und Meeresforschung (AWI)
# SPDX-License-Identifier: MIT

# User set-up file
# Here you can provide parameters for geographical boundaries,
# input/output paths, time slices etc

# We provide the default 4-dimensional SODA input temperature dataset 
# All the geographical boundaries are set to the Celtic Sea region

import numpy as np
from pathlib import Path


# Get user home directory
user_home = Path.home()
print('My home directory: ', user_home)
# Get current directory
user_current = Path.cwd()


# Specify directories 
# The default directory for input temperatures from gitlab repository
input_directory = user_current 
# Define input data format (default - netCDF)
file_extension = '*.nc'
my_files = str(input_directory) + '/input_data/' + file_extension
print('My input directory: ', input_directory)
print('My input files: ', my_files)


# Specify output directory and folder names
# The default output directory on user_home
output_directory = str(user_home) + '/growth_model_output/'
# Define experiment name
# The default - experiment with SODA input temperatures
experiment_name = 'SODA'
region = 'CelticSea'


# Specification of biological parameters  
# Number of years in one life cycle of an individual 
generation = 2 
# The year when the input temeperature dataset starts 
# Should be one year less than starting year in the dataset
initial_year = 1999  		        
# Number of years in the input temperature dataset
years = range(2000, 2005)  	 


# Define geographic boundaries (latitudes, longitudes)
# Default coordinates: North Atlantic coordinates
lat_coords = slice(47,52)
lon_coords = slice(-12,-1)

# Define depth_levels for your growth model output files
depth_levels = slice(0, 600)   # 0-600 meters according to Atlantic cod distribution

# Define latitudes that you will use to save your weight-at-age data to netcdf
lat = np.array([47.25, 47.75, 48.25, 48.75, 49.25, 49.75, 50.25, 50.75, 51.25, 51.75], dtype='f')
lon = np.array([ -11.75, -11.25, -10.75, -10.25, -9.75, -9.25, -8.75, -8.25, -7.75,
                -7.25, -6.75, -6.25, -5.75, -5.25, -4.75, -4.25, -3.75, -3.25, -2.75, -2.25, -1.75,
                -1.25], dtype='f')

# Define depth that you will use to save your weight-at-age data to netcdf
depths = np.array([ -0.,  10.,  20.,  30.,  40.,  50.,  60.,  70.,  80.,  90., 100., 115.,
                       135., 160., 190., 230., 280., 340., 410., 490., 580.], dtype='f')

