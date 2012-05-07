var socketT = io.connect('http://[zure-helbidea]:[portua]');
moment.lang('eu');
var $j = jQuery.noConflict();
var barruan = false;

var nickname="";

var noReadMsg = 0;
var count = 0;
var lastChatLineUser;

var initialPageTitle = document.title;
var isWindowActive = false;


$j(window).focus(function(){
	isWindowActive = true;
	if(barruan&&$j('#txat-wrapper').css('display')!='none'){
		document.title=initialPageTitle;
		$j('.txat-button-count').html("");
	}
});


$j(window).blur(function(){
	isWindowActive = false;
});





socketT.on('chatNew', function(data){
        var isAlreadyDone = false;
	if(!isWindowActive&&barruan){
		noReadMsg++;
		isAlreadyDone=true;
		document.title= "("+noReadMsg+") "+initialPageTitle;
	}

        if(barruan&&$j('#txat-wrapper').css('display')=='none'){
	if(!isAlreadyDone){
            noReadMsg++;
	}
            $j('#txat-button-visual').stop().animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 );
            $j('.txat-button-count').html("("+noReadMsg+")");
		
        }else{
          $j('#txat-button-visual').stop().animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 );

        }

        var date = new Date(data[1]);
        
        if(data[2]==lastChatLineUser){
          
          $j('#chat-ul li:first-child .date').attr('title',date).text('oraintxe');
          $j('#chat-ul li:first-child').append('<span class="txat-msg msg'+count+'">'+urlify(data[3])+'</span>');
          $j('.msg'+count).emoticonize();
        } else{
          lastChatLineUser=data[2];
          $j('#chat-ul').prepend('<li style="padding:5px;border:1px solid #ddd;margin-bottom:3px;" class="txat-linea txat'+count+'"><span class="date"  title="'+date+'">oraintxe</span><span class="txat-user" title="erantzun erabiltzailea honi" onclick="erantzunHoni(this);">'+ data[2] +'</span><br><span class="txat-msg msg'+count+'">'+urlify(data[3])+'</span></li>');
          $j('.msg'+count).emoticonize();
        }

        
count++;

});

socketT.on('chatLog', function(data){
  for(var i=0;i<data.length;i++){
        var date = new Date(data[i]['date']);
    if(data[i]['user']==lastChatLineUser){
        $j('#chat-ul li:first-child .date').attr('title',date).text('oraintxe');
          $j('#chat-ul li:first-child').append('<span class="txat-msg msg'+count+'">'+urlify(data[i]['msg'])+'</span>');

    }else{
      $j('#chat-ul').prepend('<li style="opacity:.7;padding:5px;border:1px solid #ddd;margin-bottom:3px;" class="txat-linea txat'+count+'"><span class="date" title="'+date+'">'+date.toGMTString()+'</span><span title="erantzun erabiltzailea honi" class="txat-user" onclick="erantzunHoni(this);">'+data[i]['user']+'</span><br><span class="txat-msg msg'+count+'">'+urlify(data[i]['msg'])+'</span></li>');
      lastChatLineUser=data[i]['user'];
    }
  $j('.msg'+count).emoticonize();
	if(data[i][2]==nickname){$j('.txat'+count).addClass('mine');};
	
	count++;
	        
	}
	
});


socketT.on('userCount',function(data){
//  console.log("erailtzaileak:" +data);
	$j('#txat-stats').html('<ul style="margin-top:5px;"><li>Txat erabiltzaileak orain: '+data+'</li></ul>');

});

socketT.on('barrura_sartu',function(){
  $j('#txat-sarrera-testua').hide();
  $j('#chatPwd').remove();

  $j('#txat-wrapper').prepend("<span style='padding:5px;border-top-right-radius:5px;border-top-left-radius:5px;background: #333;color:#fff;height: 20px;display: block;'><img align='center' src='http://ttanttakun.comjs/txat/user.png'/>"+nickname+"<span style='cursor:pointer;float:right;' onclick='$j(\"#txat-wrapper\").slideToggle()'>X</span></span>");
 // console.log("received OK from server");
	localStorage.txat=nickname;
  
        barruan=true;
        $j('#chatMsg').val("");
        $j('#chatMsg').prop('placeholder','Mezua idatzi');
        $j('#chatBidaliBotoia').prop('value','Bidali');
  $j("#chat-ul").css('height',430).prepend('<li style="padding:5px;background:#ddd;margin-bottom:3px;border:1px solid #333;" class="txat-linea txat'+count+'"><b>Kaixo!</b> Hau TtanttaTxata da! Frogatan ari gera oraindikan, beraz, arazoak sor ditzake eta barkaiguzue horregatik. Guztiz PUBLIKOA da, ez jarri datu pribaturik ಠ_ಠ</li>');
count++;
lastChatLineUser="";
});



socketT.on('izen_erabilia',function(){
	alert("Izen hori erabilia dago, ezin dezu hartu. Beste bat erabili!");
});

socketT.on('sartzerakoan_errorea',function(){
	alert("Okerreko erabiltzaile edo pasahitza erabili duzu. Saiatu berriro!");
});

socketT.on('erabiltzaile_berria',function(data,zenbat){
//console.log(data);
//console.log(zenbat);
	$j("#chat-ul").prepend('<li style="padding:5px;background:LightSteelBlue;margin-bottom:3px;" class="txat-linea txat'+count+'">Erabiltzaile konektatua: <b>'+ data +'</b></li>');
count++;
lastChatLineUser="";
});


socketT.on('erabiltzaile_deskonektatua',function(data,zenbat){
 // console.log(zenbat);
lastChatLineUser="";
  $j("#chat-ul").prepend('<li class="chat-line info-linea" style="padding:5px;background:Salmon;margin-bottom:3px;" class="txat-linea txat'+count+'">Erabiltzaile  deskonektatua: <b>'+ data +'</b></li>');
count++;

});

function sendChat(){
        var cDate = new Date();
        var msg = $j('#chatMsg').val();
        if(nickname==lastChatLineUser){
          $j('#chat-ul li:first-child .date').attr('title',cDate).text('oraintxe');
          $j('#chat-ul li:first-child').append('<span class="txat-msg msg'+count+'">'+urlify(msg)+'</span>');
        }else{
          lastChatLineUser=nickname;
          $j("#chat-ul").prepend('<li style="padding:5px;background:#ccffce;margin-bottom:3px;" class="txat-linea txat'+count+'"><span class="date" title="'+cDate+'" >oraintxe</span><span class="txat-user"  onclick="erantzunHoni(this);">'+nickname+'</span><br><span class="txat-msg msg'+count+'">'+urlify(msg)+'</span></li>');
        }
       $j('#chatMsg').val('');
	     $j('.msg'+count).emoticonize({animate:true});
	     count++;
       socketT.emit('chatMsg',cDate,encodeHTML(msg));
}


function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank" title="Kontuz zeri egiten diozun klik!!!!">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}





setTimeout(function() {$j('#txat-wrapper .date').each(function(index){
  
  $j(this).text(moment(new Date($j(this).attr('title'))).fromNow());

})}, 2000);

setInterval(function() {$j('#txat-wrapper .date').each(function(index){
  
  $j(this).text(moment(new Date($j(this).attr('title'))).fromNow());

})}, 30000);

function initTxat(){
  
 // console.log("txat init");

  
  /*if(localStorage.txat){
    
    nickname=localStorage.txat;
    socketT.emit('kaixo',nickname,false);
  
  }*/

   
}

function sendKaixoMessage(){
  var cDate = new Date();
  
  nickname= encodeHTML($j('#chatMsg').val());

  socketT.emit("kaixo",nickname,$j('#chatPwd').val(),true);
  
  
}

function sendForm(){
  
    if(barruan){
      if($j('#chatMsg').val()){
        sendChat();
      }
    } else {
      
      if($j('#chatMsg').val()){
        nickname= $j('#chatMsg').val();
        
        sendKaixoMessage();
               
      }
    }
}

function erantzunHoni(userNameSpan){
  $j('#chatMsg').val("@"+$j(userNameSpan).text()+" ");

}


function encodeHTML(s) {
     var matchTag = /<(?:.|\s)*?>/g;
        // Replace the tag
        return s.replace(matchTag, "");
}

