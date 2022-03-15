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
    window.plot_simple(parseFloat(temp_slider_simple.value));
}

// /* SLIDER  */
// for (let entry = 0; entry < tebm_sliders.length; entry++) {
//     tebm_sliders[entry].oninput = function () {
//         document.getElementById(tebm_sliders[entry].id + 'rAmount').innerHTML = document.getElementById(tebm_sliders[entry].id).value;
//     }
//     tebm_sliders[entry].onchange = function () {
//         window.doTEBM({
//             D: document.getElementById('D_slide').value,
//             A: document.getElementById('A_slide').value,
//             B: document.getElementById('B_slide').value,
//             cw: document.getElementById('cw_slide').value,
//             S0: document.getElementById('S0_slide').value,
//             S2: document.getElementById('S2_slide').value,
//             a0: document.getElementById('a0_slide').value,
//             a2: document.getElementById('a2_slide').value,
//             ai: document.getElementById('ai_slide').value,
//             F: document.getElementById('F_slide').value,
//             gamma: document.getElementById('gamma_slide').value
//         })
//     }
// }