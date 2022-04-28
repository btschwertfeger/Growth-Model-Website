/**
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @author Benjamin Thomas Schwertfeger (January 2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 **/

let
    initial_weight_input = document.getElementById('weight_input_simple'),
    temp_slider_simple = document.getElementById('temp_slider_simple'),
    t_slide_amount_simple = document.getElementById('t_slide_amount_simple'),
    reset_btn_simple = document.getElementById('reset_btn_simple');

reset_btn_simple.onclick = () => {
    window.computeSimple()
    window.plot_simple();
    temp_slider_simple.value = 3;
    initial_weight_input.value = 1;
    t_slide_amount_simple.innerText = `${temp_slider_simple.value}°C`;
}

temp_slider_simple.onchange = () => {
    window.plot_simple(parseFloat(temp_slider_simple.value), parseFloat(initial_weight_input.value));
};
temp_slider_simple.oninput = () => {
    t_slide_amount_simple.innerText = `${temp_slider_simple.value}°C`;
};

initial_weight_input.onchange = () => {
    window.computeSimple(null, null, parseFloat(initial_weight_input.value));
    console.log('conmputed')
    window.plot_simple(parseFloat(temp_slider_simple.value));
    console.log('plotted')
}


/**Complex section*/

const
    complex_historical_btn = document.getElementById('complex_historical'),
    complex_rcp45 = document.getElementById('complex_rcp45'),
    complex_rcp85 = document.getElementById('complex_rcp85'),
    period_switch = document.getElementById('switch_period');

complex_historical_btn.onclick = () => {
    window.plot_complex('FESOM_HISTORICAL', (period_switch.checked) ? '1860-1900' : '1960-2000');
    period_switch.innerText = window.opposite_period;
}
complex_rcp45.onclick = () => {
    window.plot_complex('FESOM_RCP45', (period_switch.checked) ? '2060-2100' : '2160-2200');
    period_switch.innerText = window.opposite_period;
}
complex_rcp85.onclick = () => {
    window.plot_complex('FESOM_RCP85', (period_switch.checked) ? '2060-2100' : '2160-2200');
    period_switch.innerText = window.opposite_period;
}
period_switch.onclick = () => {
    window.plot_complex(window.active_scenario, window.opposite_period);
    period_switch.innerText = window.opposite_period;
}