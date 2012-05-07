var fs = require('fs');
var exec = require('child_process').exec;
var events = require('events');
var io = require('socket.io').listen(1340);
var util = require("util");
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');

// mongoosen bitartez datu basera konektatu
mongoose.connect('mongodb://localhost/txat');


// mongoose database eskemak
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// erabiltzailea
var User = new Schema({
    name     : String
  , password      : String
  , created      : {type:Date,default:Date.now}
  , lastVisit : {type:Date,default:Date.now}
});

// txat mezuak
var ChatMsg = new Schema({
	  address : String
	, date : {type:Date,default:Date.now}	
	, user : String
	, msg  : String	
});

// mongoose modeloak gero erabiltzeko
var UserModel = mongoose.model('User',User);
var ChatMsgModel = mongoose.model('ChatMsg',ChatMsg);


var status = new Array();
var chatArray = new Array();
var izenak = [];
// erabiltzaileen kontrol hau ez da fidagarria
var userCount=0;

io.sockets.on('connection', function (socket) {
	
	// bezero honen ip helbidea
	var address = socket.handshake.address;
	var erabiltzailea = "Anon";
	
	socket.emit('userCount',userCount);
	socket.on('disconnect', function(){ 
		if(izena==="Anon"){util.log("Anon disconnected?");}else{
			--userCount;
			// bikoiztua, bezeroan aldaketa batzuk falta dira eta... 
			socket.broadcast.emit('erabiltzaile_deskonektatua',izena,userCount);
			socket.broadcast.emit('userCount',userCount);
		}
  	}); 

	socket.on('kaixo',function(izena,pwd,berria){
		
		// datubasean bilatu ea izen bereko erabiltzaileren bat dagoen
		UserModel.findOne({'name':izena},function(err,docs){
		
			if(docs!=null){
				// erabiltzailea topatu du. pasahitzaren hash-a berdina den konparatuko da bcrypt-ekin
				var erabiltzailea = docs;
				bcrypt.compare(pwd, erabiltzailea.password, function(err, res) {
					if(res){
						// dena ondo!
						// azken bixita eguneratuko du
						var conditions = {'name':izena};
						UserModel.update(conditions, { $set: { 'lastVisit': new Date() }},function(err, numAffected){
						});
						// ongietorria eta beste bezeroak abixatu
						erabiltzailea=izena;
						izenak[izenak.length]=izena;
		                                socket.emit('barrura_sartu');
				                ++userCount;
						socket.broadcast.emit('userCount',userCount);
						socket.emit('userCount',userCount);
		        		        socket.broadcast.emit('erabiltzaile_berria',izena,userCount);
		                		socket.emit('erabiltzaile_berria',izena,userCount);
					} else {
						// okerreko pasahitza
						socket.emit('sartzerakoan_errorea');
					}   
				});

			}else{
				// ez du erabiltzailea topatu, beraz berria sortuko du
				var userInstance = new UserModel();
		        	var salt = bcrypt.genSaltSync(10);
		                var hash = bcrypt.hashSync(pwd, salt);
			        //bcrypterabiltzen da pasahitzak gorde beharrean hauen "gazitutako" hash-a gordetzeko
				bcrypt.genSalt(10, function(err, salt) {
					 bcrypt.hash(pwd, salt, function(err, hash) {
						// erabiltzailea gorde generatutakoarekin batera
						userInstance.name = izena;
				                userInstance.password = hash;
		        			userInstance.save(function (err){
		                                        if(err){
								util.log('ERROR SAVING USER: '+err);
							}else{
								//dena ondo!
								erabiltzailea = izena;
								izenak[izenak.length]=izena;
		        			                socket.emit('barrura_sartu');
				                                ++userCount;
						                socket.broadcast.emit('erabiltzaile_berria',izena,userCount);
								socket.broadcast.emit('userCount',userCount);
			                			socket.emit('erabiltzaile_berria',izena,userCount);
							}
				        	});
					  });
				});


			}

		});

	});


	// konektatzerakoan azken 20 mezuak bidaliko dizkio erabiltzaileari, txata betetzeko. 
	// datubasetik erabiltzailea  

	var chatLogQuery = ChatMsgModel.find({});
	chatLogQuery.sort('date',-1);
	chatLogQuery.limit(20);
	chatLogQuery.select('user','date','msg');
	chatLogQuery.exec(function (err, docs) {
			socket.emit('chatLog',docs.reverse());  		
	});

	

	


	socket.on('chatMsg', function(date,msg){
		if(erabiltzailea=='Anon'){
			// ezin ditu mezuak bidali!!
		}else {
			var ar = new Array();
			// txat mezua bidaltzerakoan ez degu ip helbiderik bidaltzea nahi
			ar[0]="";	
			ar[1]=date;
			ar[2]=erabiltzailea;
			ar[3]=msg;
			chatArray[chCount]=ar;
			chCount++;
			socket.broadcast.emit('chatNew',ar);
			// behin bidali duela bai
			ar[0]=address;
			var chatMsgInstance = new ChatMsgModel();
			chatMsgInstance.address = address.address;
			chatMsgInstance.user = izena;
			chatMsgInstance.msg = msg;
			chatMsgInstance.save(function (err){
				if(err){
					//util.log('ERROR SAVING MESSAGE: '+err);
				}else{
					//util.log('Message saved in DB!');
				}
			});
		}
	});

});
