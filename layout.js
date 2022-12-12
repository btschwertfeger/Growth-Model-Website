/**
 * File that connects the inputs with actions
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @link https://awi.de
 * 
 * @author Benjamin Thomas Schwertfeger (2022)
 * @email benjamin.schwertfeger@awi.de
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 * 
 **/

/*
    _                          _                 
   / \   __ _ _   _  __ _ _ __(_)_   _ _ __ ___  
  / _ \ / _` | | | |/ _` | '__| | | | | '_ ` _ \ 
 / ___ \ (_| | |_| | (_| | |  | | |_| | | | | | |
/_/   \_\__, |\__,_|\__,_|_|  |_|\__,_|_| |_| |_|
        |_| Experiment
*/

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

/*
 ____ Experiment _  __        __         _     _ 
|  _ \ ___  __ _| | \ \      / /__  _ __| | __| | 
| |_) / _ \/ _` | |  \ \ /\ / / _ \| '__| |/ _` |
|  _ <  __/ (_| | |   \ V  V / (_) | |  | | (_| |
|_| \_\___|\__,_|_|    \_/\_/ \___/|_|  |_|\__,_| 
*/

document.getElementById('complex_soda_btn').onclick = () => {
    window.plot_complex_precomputed('SODA', '1981-2000');
}
document.getElementById('complex_rcp45-1').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP45', '2081-2100');
}
document.getElementById('complex_rcp45-2').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP45', '2181-2200');
}
document.getElementById('complex_rcp85-1').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP85', '2081-2100');
}
document.getElementById('complex_rcp85-2').onclick = () => {
    window.plot_complex_precomputed('FESOM_RCP85', '2181-2200');
}

const
    image1 = 'images/test1.png',
    image2 = 'images/test2.png',
    image3 = 'images/test3.png';

document.getElementById('complex_back_image').onclick = () => {
    const image_src = document.getElementById('complex_image').src;
    if (image_src.includes(image1)) return;
    else if (image_src.includes(image2)) document.getElementById('complex_image').src = image1;
    else if (image_src.includes(image3)) document.getElementById('complex_image').src = image2;
};
document.getElementById('complex_next_image').onclick = () => {
    const image_src = document.getElementById('complex_image').src;
    if (image_src.includes(image3)) return;
    else if (image_src.includes(image1)) document.getElementById('complex_image').src = image2;
    else if (image_src.includes(image2)) document.getElementById('complex_image').src = image3;

};

/*
     _       _  _           _        _     _      
    / \   __| |(_)_   _ ___| |_ __ _| |__ | | ___ 
   / _ \ / _` || | | | / __| __/ _` | '_ \| |/ _ \
  / ___ \ (_| || | |_| \__ \ || (_| | |_) | |  __/
 /_/   \_\__,_|/ |\__,_|___/\__\__,_|_.__/|_|\___|
                |__/ Experiment
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