var main_div = document.getElementsByClassName("wealth-wrapper-outer")[0];
var marker_start = "<!--i18n-start-->";
var marker_end = "<!--i18n-end-->";

var xhttp = new XMLHttpRequest();

function translation_error() {
    main_div.innerHTML = '<p lang="de">Die Seite konnte nicht geladen werden. <a href="">Erneut versuchen</a> oder <a href="../index.html">auf Englisch lesen</a>.</p>';
    main_div.style.display = 'block';
}

xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
        if (this.status == 200) {translate_page(this.response);}
        else {translation_error();}

        main_div.style.display = 'block';
    }
}
xhttp.open("GET", "../index.html"); //Get the english version
xhttp.timeout = 15000;
xhttp.onerror = translation_error;
xhttp.ontimeout = translation_error;
xhttp.send();

var translated_images = i18n_data.images || ["cares.svg","ninety.svg","plane.png","poverty.svg"];

function translate_page(response){
    if (response.indexOf(marker_start) < 0 || response.indexOf(marker_end) < 0) {
        translation_error();
        return;
    }
    response = response.substring(response.indexOf(marker_start),response.indexOf(marker_end)); //discard metadata
    main_div.innerHTML = response;
    if(window.i18n_data){
        var all = document.querySelectorAll("p,div,h1,h2,h3,span,tspan");
        for (var el of all) {
            for(var cl of el.classList){
                if(cl.startsWith('i18n-')){
                    el.innerHTML = i18n_data.strings[cl] || el.innerHTML; //apply translations
                }
            }
        }

        var imgs = document.getElementsByTagName("IMG");
        for(var img of imgs){
            if(!translated_images.includes(img.src.substring(img.src.lastIndexOf("/")+1))){
                img.src = img.src.replace("/" + i18n_data.code + "/","/"); //set src for untranslated images to english version
            }
        }

        var script = document.createElement("script");
        script.src = "../main.js?version=2026-09-06-ux";
        document.body.appendChild(script);
    } 
}
