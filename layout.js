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
    // window.plot_simple(parseFloat(temp_slider_simple.value), parseFloat(initial_weight_input.value));
    window.computeSimple(null, null, parseFloat(initial_weight_input.value));
    console.log('conmputed')
    window.plot_simple(parseFloat(temp_slider_simple.value));
    console.log('plotted')
}


/**
 * Complex section
 */


const complex_cletric_sea_btn = document.getElementById('complex_cletric_sea_btn');

complex_cletric_sea_btn.onclick = () => {
    window.loadNewRegion('CeltricSea');
}