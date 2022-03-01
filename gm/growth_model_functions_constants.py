#coding: utf-8

# SPDX-FileCopyrightText: 2021 Alfred-Wegener-Institut, Helmholtz-Zentrum fuer Polar- und Meeresforschung (AWI)
#
# SPDX-License-Identifier: MIT

# Schoolfield and Arrhenius equations from Butzin and Poertner, 2016 

from scipy import exp

""" Definitions of growth model constants from Butzin and Pörtner, 2016  """

A_R = 8.660        # Rate of uninhibited growth at reference temperature T_R (% d^-1 g^1/b)
B_R = 0.3055       # Value of allometric exponent at reference temperature Tr
THETA_A = 18145    # Arrhenius temperature (K) for uninhibited reaction kinetics = 17871,85°C
THETA_B = 4258     # Arrhenius temperature (K) = 3984,85°C 
THETA_H =  25234   # Arrhenius temperature (K) for inhibited reaction kinetics = 24960,85°C
T_R = 283          # Reference optimum temperature (K) = 9.85°C
T_H = 286          # Temperature for inhibitive processes (K) = 12.85°C
C_AVG =  0.291     # Independent of temperature and weight constant (% d^-1)



""" Definitions of kinetic functions """

def equation2(input_temp):
        
    T0 = 273.15                                  # O°C in K
    temperature_kelvin = input_temp + T0         
               
    # Calculate a
    a_numerator = A_R*exp(THETA_A/T_R - THETA_A/temperature_kelvin) 
    a_denominator = 1 + exp(THETA_H/T_H - THETA_H/temperature_kelvin)
    a = a_numerator/a_denominator
    return (a)


def equation3(input_temp):
    """ Arrhenius equation """
    T0 = 273.15                                # 0°C in K
    temperature_kelvin = input_temp + T0 

    # Calculate b
    b = B_R*exp(THETA_B/T_R - THETA_B/temperature_kelvin)
    return(b)

""" End of kinetic function definitions """