/**
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @author Benjamin Thomas Schwertfeger (August 2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 **/

const
    initial_weight_input = document.getElementById('weight_input_simple'),
    temp_slider_simple = document.getElementById('temp_slider_simple'),
    t_slide_amount_simple = document.getElementById('t_slide_amount_simple'),
    reset_btn_simple = document.getElementById('reset_btn_simple');

reset_btn_simple.onclick = () => {
    window.computeSimple();
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
    window.plot_simple(parseFloat(temp_slider_simple.value));
}


/**
 * * Complex section
 */

document.getElementById('complex_historical-1').onclick = () => {
    window.plot_complex_precomputed('FESOM_HISTORICAL', '1860-1900');
    period_switch.innerText = window.opposite_period;
}
document.getElementById('complex_historical-2').onclick = () => {
    window.plot_complex_precomputed('FESOM_HISTORICAL', '1960-2000');
    period_switch.innerText = window.opposite_period;
}
document.getElementById('complex_rcp4.5-1').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP45', '2060-2100');
    period_switch.innerText = window.opposite_period;
}
document.getElementById('complex_rcp4.5-2').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP45', '2160-2200');
    period_switch.innerText = window.opposite_period;
}
document.getElementById('complex_rcp8.5-1').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP85', '2060-2100');
    period_switch.innerText = window.opposite_period;
}
document.getElementById('complex_rcp8.5-2').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP85', '2160-2200');
    period_switch.innerText = window.opposite_period;
}

/**
 * * Adjustabel real world experiment
 */

const
    A_R_input = document.getElementById('A_R_adj_slide'),
    B_R_input = document.getElementById('B_R_adj_slide'),
    THETA_A_input = document.getElementById('THETA_A_adj_slide'),
    THETA_B_input = document.getElementById('THETA_B_adj_slide'),
    THETA_H_input = document.getElementById('THETA_H_adj_slide'),
    T_R_input = document.getElementById('T_R_adj_slide'),
    T_H_input = document.getElementById('T_H_adj_slide');

const
    A_R_amount = document.getElementById('A_R_adj_slide_amount'),
    B_R_amount = document.getElementById('B_R_adj_slide_amount'),
    THETA_A_amount = document.getElementById('THETA_A_adj_slide_amount'),
    THETA_B_amount = document.getElementById('THETA_B_adj_slide_amount'),
    THETA_H_amount = document.getElementById('THETA_H_adj_slide_amount'),
    T_R_amount = document.getElementById('T_R_adj_slide_amount'),
    T_H_amount = document.getElementById('T_H_adj_slide_amount'),
    reset_btn_adj = document.getElementById('reset_btn_complex_adjustable');

let
    slide_amounts = [A_R_amount, B_R_amount, THETA_A_amount, THETA_B_amount, THETA_H_amount, T_R_amount, T_H_amount],
    input_fields = [A_R_input, B_R_input, THETA_A_input, THETA_B_input, THETA_H_input, T_R_input, T_H_input];

input_fields.forEach((e, i) => {
    e.onchange = () => {
        window.plot_complex_adjustable(window.computeComplexAdjustable(constants = {
            A_R: A_R_input.value,
            B_R: B_R_input.value,
            THETA_A: THETA_A_input.value,
            THETA_B: THETA_B_input.value,
            THETA_H: THETA_H_input.value,
            T_R: T_R_input.value,
            T_H: T_H_input.value,
            C_AVG: window.default_constants.C_AVG,
            T0: window.default_constants.T0
        }));
    };
    e.oninput = () => {
        slide_amounts[i].innerText = e.value;
    };
});

reset_btn_adj.onclick = () => {
    A_R_input.value = window.default_constants.A_R;
    B_R_input.value = window.default_constants.B_R;
    THETA_A_input.value = window.default_constants.THETA_A;
    THETA_B_input.value = window.default_constants.THETA_B;
    THETA_H_input.value = window.default_constants.THETA_H;
    T_R_input.value = window.default_constants.T_R;
    T_H_input.value = window.default_constants.T_H;

    A_R_amount.innerText = window.default_constants.A_R;
    B_R_amount.innerText = window.default_constants.B_R;
    THETA_A_amount.innerText = window.default_constants.THETA_A;
    THETA_B_amount.innerText = window.default_constants.THETA_B;
    THETA_H_amount.innerText = window.default_constants.THETA_H;
    T_R_amount.innerText = window.default_constants.T_R;
    T_H_amount.innerText = window.default_constants.T_H;
    window.plot_complex_adjustable();
}