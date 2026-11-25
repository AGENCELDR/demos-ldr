(function(w){
var OCC_SVG={"anniversaire":'<svg viewBox="0 0 24 24"><path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/></svg>',"merci":'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M9 11l2 2 4-4"/></svg>',"amour":'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',"naissance":'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 21c0-4 2.7-7 6-7s6 3 6 7M10 7.5h.01M14 7.5h.01"/></svg>',"sans raison":'<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></svg>'};
function TAILLE_SVG(i){var k=[.62,.8,1][i],f="";[[12,6],[8,8],[16,8],[10,4.5],[14,4.5],[6,5],[18,5]].slice(0,[3,5,7][i]).forEach(function(p){f+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.4"/>'});return '<svg viewBox="0 0 24 24" class="t-'+i+'"><g transform="translate('+(12-12*k)+' '+(24-24*k)+') scale('+k+')">'+f+'<path d="M5 10l7 13 7-13z"/></g></svg>'}

w.ICO={occ:OCC_SVG,taille:TAILLE_SVG};
})(window);
