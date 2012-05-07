var socketT = io.connect('http://[zure-helbidea]:[portua]');
moment.lang('eu');
var barruan = false;

var nickname="";

var noReadMsg = 0;
var count = 0;
var lastChatLineUser;

var initialPageTitle = document.title;
var isWindowActive = false;


$(window).focus(function(){
	isWindowActive = true;
	if(barruan&&$('#txat-wrapper').css('display')!='none'){
		document.title=initialPageTitle;
		$('.txat-button-count').html("");
	}
});


$(window).blur(function(){
	isWindowActive = false;
});





socketT.on('chatNew', function(data){
        var isAlreadyDone = false;
	if(!isWindowActive&&barruan){
		noReadMsg++;
		isAlreadyDone=true;
		document.title= "("+noReadMsg+") "+initialPageTitle;
	}

        if(barruan&&$('#txat-wrapper').css('display')=='none'){
	if(!isAlreadyDone){
            noReadMsg++;
	}
            $('#txat-button-visual').stop().animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 );
            $('.txat-button-count').html("("+noReadMsg+")");
		
        }else{
          $('#txat-button-visual').stop().animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 ).animate({marginRight: "10px"}, 50 ).animate({marginRight: "0px"}, 50 );

        }

        var date = new Date(data[1]);
        
        if(data[2]==lastChatLineUser){
          
          $('#chat-ul li:first-child .date').attr('title',date).text('oraintxe');
          $('#chat-ul li:first-child').append('<span class="txat-msg msg'+count+'">'+urlify(data[3])+'</span>');
          $('.msg'+count).emoticonize();
        } else{
          lastChatLineUser=data[2];
          $('#chat-ul').prepend('<li style="padding:5px;border:1px solid #ddd;margin-bottom:3px;" class="txat-linea txat'+count+'"><span class="date"  title="'+date+'">oraintxe</span><span class="txat-user" title="erantzun erabiltzailea honi" onclick="erantzunHoni(this);">'+ data[2] +'</span><br><span class="txat-msg msg'+count+'">'+urlify(data[3])+'</span></li>');
          $('.msg'+count).emoticonize();
        }

        
count++;

});

socketT.on('chatLog', function(data){
  for(var i=0;i<data.length;i++){
        var date = new Date(data[i]['date']);
    if(data[i]['user']==lastChatLineUser){
        $('#chat-ul li:first-child .date').attr('title',date).text('oraintxe');
          $('#chat-ul li:first-child').append('<span class="txat-msg msg'+count+'">'+urlify(data[i]['msg'])+'</span>');

    }else{
      $('#chat-ul').prepend('<li style="opacity:.7;padding:5px;border:1px solid #ddd;margin-bottom:3px;" class="txat-linea txat'+count+'"><span class="date" title="'+date+'">'+date.toGMTString()+'</span><span title="erantzun erabiltzailea honi" class="txat-user" onclick="erantzunHoni(this);">'+data[i]['user']+'</span><br><span class="txat-msg msg'+count+'">'+urlify(data[i]['msg'])+'</span></li>');
      lastChatLineUser=data[i]['user'];
    }
  $('.msg'+count).emoticonize();
	if(data[i][2]==nickname){$('.txat'+count).addClass('mine');};
	
	count++;
	        
	}
	
});


socketT.on('userCount',function(data){
//  console.log("erailtzaileak:" +data);
	$('#txat-stats').html('<ul style="margin-top:5px;"><li>Txat erabiltzaileak orain: '+data+'</li></ul>');

});

socketT.on('barrura_sartu',function(){
  $('#txat-sarrera-testua').hide();
  $('#chatPwd').remove();

  $('#txat-wrapper').prepend("<span style='padding:5px;border-top-right-radius:5px;border-top-left-radius:5px;background: #333;color:#fff;height: 20px;display: block;'><img align='center' src='http://ttanttakun.comjs/txat/user.png'/>"+nickname+"<span style='cursor:pointer;float:right;' onclick='$(\"#txat-wrapper\").slideToggle()'>X</span></span>");
 // console.log("received OK from server");
	localStorage.txat=nickname;
  
        barruan=true;
        $('#chatMsg').val("");
        $('#chatMsg').prop('placeholder','Mezua idatzi');
        $('#chatBidaliBotoia').prop('value','Bidali');
  $("#chat-ul").css('height',430).prepend('<li style="padding:5px;background:#ddd;margin-bottom:3px;border:1px solid #333;" class="txat-linea txat'+count+'"><b>Kaixo!</b> Hau TtanttaTxata da! Frogatan ari gera oraindikan, beraz, arazoak sor ditzake eta barkaiguzue horregatik. Guztiz PUBLIKOA da, ez jarri datu pribaturik ಠ_ಠ</li>');
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
	$("#chat-ul").prepend('<li style="padding:5px;background:LightSteelBlue;margin-bottom:3px;" class="txat-linea txat'+count+'">Erabiltzaile konektatua: <b>'+ data +'</b></li>');
count++;
lastChatLineUser="";
});


socketT.on('erabiltzaile_deskonektatua',function(data,zenbat){
 // console.log(zenbat);
lastChatLineUser="";
  $("#chat-ul").prepend('<li class="chat-line info-linea" style="padding:5px;background:Salmon;margin-bottom:3px;" class="txat-linea txat'+count+'">Erabiltzaile  deskonektatua: <b>'+ data +'</b></li>');
count++;

});

function sendChat(){
        var cDate = new Date();
        var msg = $('#chatMsg').val();
        if(nickname==lastChatLineUser){
          $('#chat-ul li:first-child .date').attr('title',cDate).text('oraintxe');
          $('#chat-ul li:first-child').append('<span class="txat-msg msg'+count+'">'+urlify(msg)+'</span>');
        }else{
          lastChatLineUser=nickname;
          $("#chat-ul").prepend('<li style="padding:5px;background:#ccffce;margin-bottom:3px;" class="txat-linea txat'+count+'"><span class="date" title="'+cDate+'" >oraintxe</span><span class="txat-user"  onclick="erantzunHoni(this);">'+nickname+'</span><br><span class="txat-msg msg'+count+'">'+urlify(msg)+'</span></li>');
        }
       $('#chatMsg').val('');
	     $('.msg'+count).emoticonize({animate:true});
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





setTimeout(function() {$('#txat-wrapper .date').each(function(index){
  
  $(this).text(moment(new Date($(this).attr('title'))).fromNow());

})}, 2000);

setInterval(function() {$('#txat-wrapper .date').each(function(index){
  
  $(this).text(moment(new Date($(this).attr('title'))).fromNow());

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
  
  nickname= encodeHTML($('#chatMsg').val());

  socketT.emit("kaixo",nickname,$('#chatPwd').val(),true);
  
  
}

function sendForm(){
  
    if(barruan){
      if($('#chatMsg').val()){
        sendChat();
      }
    } else {
      
      if($('#chatMsg').val()){
        nickname= $('#chatMsg').val();
        
        sendKaixoMessage();
               
      }
    }
}

function erantzunHoni(userNameSpan){
  $('#chatMsg').val("@"+$(userNameSpan).text()+" ");

}


function encodeHTML(s) {
     var matchTag = /<(?:.|\s)*?>/g;
        // Replace the tag
        return s.replace(matchTag, "");
}

