<!--guitar hero launchpad/DDR launchpad-->
$(document).ready(function(){
    if(document.getElementById("editor_canvas") != null){
        loadSounds(sound1Srcs, sounds1, 1);
        loadSounds(sound4Srcs, sounds4, 4);
        loadSounds(sound2Srcs, sounds2, 2);
        loadSounds(sound3Srcs, sounds3, 3);
        
        $(window).resize(function(){
            reformat();
        });
    }
});

function loadSounds(srcArr, soundArr, chain){
    for(var i = 0; i < srcArr.length; i++){
        soundArr.push(null);
    }

    for(var i = 0; i < srcArr.length; i++){
        if(srcArr[i] == ""){
            checkLoaded();
        }
        else{
            requestSound(i, srcArr, soundArr, chain);
        }
    }
}

function requestSound(i, srcArr, soundArr, chain){
    setTimeout(function(){
        $.ajax({
            type: "POST",
            url: "/get_asset_path",
            data: {file_name: srcArr[i], sindex: i, chain: chain},
            success: function(data, textStatus, jqXHR) {
              //console.log(data);
              // console.log(textStatus);
              // console.log(jqXHR);
              var tempi = parseInt(data.sindex);
              soundArr[tempi] = new Howl({urls: [data.asset_path]});
              checkLoaded();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error=" + errorThrown);
                //$(".soundPack").html("There was an error. Please Reload the page");
                if(errorThrown == "Request Time-out")
                    requestSound(i, srcArr, soundArr, chain);
                else
                    $("#error_msg").html("There was an error. Please reload the page");
            }
        });
    },i*50);
}

function checkLoaded(){
    numLoaded++;
    $(".soundPack").html("Loading sounds ("+numLoaded+"/"+(4*12*numSoundPacks)+"). This should only take a few seconds.");
    if(numLoaded == 4*12*numSoundPacks){
        combSounds = [sounds1, sounds4, sounds2, sounds3];
        loadKeyboard();
    }
}

function loadKeyboard(){
    for(var i = 0; i < 4; i++){
        $(".buttons").append('<div class="button-row"></div>');
        for(var j = 0; j < 12; j++){
            var press = false;
            if(pressures[0].indexOf((i*12+j)) != -1)
                press = true;
            var str = String.fromCharCode(keyPairs[i*12+j]);
            if(keyPairs[i*12+j] == 13)
                str = "\\n"
            if(keyPairs[i*12+j] == 16)
                str = "\\s"
            $(".button-row:last").append('<div class="button button-'+(i*12+j)+'" pressure="'+press+'" released="true" buttonnum='+(i*12+j)+'>'+str+'</div>');
            $('.button-'+(i*12+j)+'').css("background-color", $('.button-'+(i*12+j)+'').attr("pressure") == "true" ? "lightgray" : "white");
        }
    }
    
    $(".button").bind("touchstart", function(){
       var num = parseInt($(this).attr("buttonnum"));
       playKey(keyPairs[num]);
       event.preventDefault();
       return false;
    });
    
    $(".button").bind("touchend", function(){
       var num = parseInt($(this).attr("buttonnum"));
       releaseKey(keyPairs[num]);
       event.preventDefault();
       return false;
    });
    
    $(".button").bind("touchcancel", function(){
       var num = parseInt($(this).attr("buttonnum"));
       releaseKey(keyPairs[num]);
       event.preventDefault();
       return false;
    });
    
    $(document).keydown(function(e){
        if($("#gray_background").css("display") == "none"){
            //console.log(e.keyCode);
            if(e.keyCode == 39){
                curSound = 1;
                switchSoundPack();
            }
            else if(e.keyCode == 37){
                curSound = 0;
                switchSoundPack();
            }
            else if(e.keyCode == 38){
                curSound = 2;
                switchSoundPack();
            }
            else if(e.keyCode == 40){
                curSound = 3;
                switchSoundPack();
            }
            else{
                //console.log(e.keyCode);
                if($(".button-"+(keyPairs.indexOf(e.keyCode))+"").attr("released") == "true" && combSounds[curSound][keyPairs.indexOf(e.keyCode)] != null){
                    playKey(e.keyCode);
                }
            }
            
            kdRecordInputSwitch(e.keyCode);
        }
    });
    $(document).keyup(function(e){
        if(combSounds[curSound][keyPairs.indexOf(e.keyCode)] != null)
            releaseKey(e.keyCode);
    });
    
        
    initUI();
}

function releaseKey(kc){
    if($(".button-"+(keyPairs.indexOf(kc))+"").attr("pressure") == "true")
        combSounds[curSound][keyPairs.indexOf(kc)].stop();
    $(".button-"+(keyPairs.indexOf(kc))+"").attr("released","true");
    $(".button-"+(keyPairs.indexOf(kc))+"").css("background-color", $(".button-"+(keyPairs.indexOf(kc))+"").attr("pressure") == "true" ? "lightgray" : "white");
    kuRecordInput(kc); 
}

function playKey(kc){
    combSounds[curSound][keyPairs.indexOf(kc)].stop();
    combSounds[curSound][keyPairs.indexOf(kc)].play();
    areas[curSound].forEach(function(el, ind, arr){
        for(var j = 0; j < el.length; j++){
            if(keyPairs.indexOf(kc) == el[j]){
                for(var k = 0; k < el.length; k++){
                    if(k != j)
                        combSounds[curSound][el[k]].stop();
                }
                break;
            }
        }
    });
    kdRecordInput(kc);
    
    $(".button-"+(keyPairs.indexOf(kc))+"").attr("released","false");
    $(".button-"+(keyPairs.indexOf(kc))+"").css("background-color","rgb(255,160,0)");
}

function initUI(){
    $(".soundPack").html("Sound Pack: "+(curSound+1));
    
    setupEditor();
    
    reformat();
    $("#editor_canvas").attr({"width": $(".buttons").width()+"px", "height": "250px"});
    $("#toggle_editor_container").css("display", "inline-block");
    
    $("#info_button").css("display", "inline-block");
    $("#info_button").click(function(){
        $("#info").toggle("display");
        $("#links").css("display","none");
        $("#editor_container").css("display", "none");
        $(".click_button").css("background-color","white");
        $(this).css("background-color","lightgray");
    });
    $("#links_button").css("display", "inline-block");
    $("#links_button").click(function(){
        $("#links").toggle("display");
        $("#editor_container").css("display","none");
        $("#info").css("display", "none");
        $(".click_button").css("background-color","white");
        $(this).css("background-color","lightgray");
    });
    
    edcWidth = parseInt($("#editor_canvas").attr("width"));
    edcHeight = parseInt($("#editor_canvas").attr("height"));
    setupToolBar();
}

function switchSoundPack(){
    $(".soundPack").html("Sound Pack: "+(curSound+1));
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 12; j++){
            var press = false;
            if(pressures[curSound].indexOf((i*12+j)) != -1)
                press = true;
            $('.button-'+(i*12+j)+'').attr("pressure", ""+press+"");
            $('.button-'+(i*12+j)+'').css("background-color", $('.button-'+(i*12+j)+'').attr("pressure") == "true" ? "lightgray" : "white");
        }
    }
}

function keyTap(keycode, duration){
    $(document).trigger(jQuery.Event( 'keydown', { which: keycode, keyCode: keycode } ));
    if(current_tool == 8)
        duration = duration/playback_speed;
    setTimeout(function(){
        $(document).trigger(jQuery.Event( 'keyup', { which: keycode, keyCode: keycode } ));
    },duration);
}

function reformat(){
    $(".buttons").css("margin", "0");
    $(".buttons").css("margin","0 "+(($("body").innerWidth()-$(".buttons").width()-30)/2)+"px");
    
    $("#editor_canvas").css("margin", "10px "+(($("body").innerWidth()-$(".buttons").width()-30)/2)+"px");
}