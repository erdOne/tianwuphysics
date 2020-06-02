var URLstringify = obj => Object.keys(obj).map(function(k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
}).join('&')

var range = (start, end)=>new Array(end-start+1).fill(start).map((a,b)=>a+b);


export { URLstringify , range }
