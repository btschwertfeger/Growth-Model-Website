/**
 * 
 * © Alfred-Wegener-Institute Bremerhaven, Germany (2022)
 * @author Benjamin Thomas Schwertfeger (January 2022)
 * @email development@b-schwertfeger.de
 * @link https://b-schwertfeger.de
 * 
 **/

// returns an array from start to end (including end) 
// e.g.: range(1,5,1) == [1,2,3,4,5]
export function range(start, end, step = 1) {
    var
        range = [],
        typeofStart = typeof start,
        typeofEnd = typeof end;

    if (step === 0) throw TypeError("Step cannot be zero.");
    if (typeofStart == "undefined" || typeofEnd == "undefined") throw TypeError("Must pass start and end arguments.");
    else if (typeofStart != typeofEnd) throw TypeError("Start and end arguments must be of same type.");

    typeof step == "undefined" && (step = 1);

    if (end < start) step = -step;
    if (typeofStart == "number")
        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }
    else if (typeofStart == "string") {
        if (start.length != 1 || end.length != 1) throw TypeError("Only strings with one character are supported.");
        start = start.charCodeAt(0);
        end = end.charCodeAt(0);
        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start));
            start += step;
        }
    } else throw TypeError("Only string and number types are supported");
    return range;
}
export function avg(grades, nan = null) {
    if (nan === null) return grades.reduce((acc, c) => acc + c, 0) / grades.length;
    else {
        let values = new Array();
        for (var val = 0; val < grades.length; val++)
            if (grades[val] !== nan) values.push(grades[val]);
        return values.reduce((acc, c) => acc + c, 0) / values.length;
    }
}