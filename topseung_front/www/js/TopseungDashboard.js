
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-style",
        "dijit/_WidgetBase",
        "dojo/dom",
        "dojo/dom-construct",
        "dijit/Dialog",
        "dijit/form/Button",
        "dijit/Tooltip",
        ],
function(declare,lang,domStyle,widgetbase,dom,domConstruct,Dialog,Button,Tooltip)
{
    var topseungDashBoard =declare("topseung.Dashboard",[widgetbase],
        {
            batteryTopic : '/topseung/sensors/PowerSystem',
            batteryType : 'sensor_integration_board_comms/PowerSystem',
            onoffDeviceTopic : '/topseung/sensors/OnOffDevice',
            onoffDeviceType : 'sensor_integration_board_comms/OnOffDevice',
            statusSrvName : '/topseung/webbridge/status',
            statusSrvType : '/topseung_webbridge/Status',
            commandSrvName : '/topseung/webbridge/command',
            commandSrvType : '/topseung_webbridge/Command',
            resultTopicName : '/topseung//move_base/result',
            resultTopicType : '/move_base_msgs/MoveBaseActionResult',

            postCreate : function() {

                this.init = false;

                this.createDiv();
                this.createSubscribers();
                this.createService();
                domStyle.set(this.domNode,'vertical-align','middle');

                ros.on('connection',lang.hitch(this,this.onConnect));
                ros.on('close',lang.hitch(this,this.onClose));
            },

            onConnect : function() {
                this.batterySub.subscribe(lang.hitch(this,this.batteryListener));
                this.onoffDeviceSub.subscribe(lang.hitch(this,this.onoffDeviceListener));
                this.resultTopic.subscribe(lang.hitch(this,this.resultListener));
                //this.connectDiv.innerHTML = 'On';
                this.connectDiv.style.backgroundColor ='#00FF00';
                this.checkStatus();
                this.init = true;
            },

            onClose : function() {
                this.batterySub.unsubscribe();
                this.onoffDeviceSub.unsubscribe();
                //this.connectDiv.innerHTML = 'Off';
                this.connectDiv.style.backgroundColor ='#FF0000';
//                this.connectDiv.innerHTML = 'Disconnected';
                if(this.init)
                  this.disconnectedPopup();
                else
                  this.notconnectedPopup();
            },

            createDiv : function() {
                var div = this.createElement(this.domNode,'Connection : ','150px','80%');
                this.connectDiv = div;
                this.connectDiv.style.width='15%';
                this.connectDiv.innerHTML = '&nbsp';
                this.connectDiv.style.backgroundColor ='#FF0000';
                
                var div = this.createElement(this.domNode,'Battery : ','120px','50%');
                this.batteryDiv = div;
                this.batteryDiv.style.width='48%';
//                this.batteryDiv.style.border = '1px solid';
                this.batteryDiv.innerHTML = '&nbsp';

                div = this.createElement(this.domNode,'Mode : ','120px','50%');
                this.modeDiv = div;

                div = this.createElement(this.domNode,'Vel :','100px','50%');
                this.velDiv = div;
            },

            createSubscribers : function() {
                this.batterySub = new ros.Topic({
                    name : this.batteryTopic,
                    type : this.batteryType,
                    throttle_rate : 500,
                });
                this.onoffDeviceSub = new ros.Topic({
                    name : this.onoffDeviceTopic,
                    type : this.onoffDeviceType,
                    throttle_rate : 500,
                });

                this.resultTopic = new ros.Topic({
                  name: this.resultTopicName,
                  messageType : this.resultTopicType 
                });
            },

            createService : function() {
                this.statusSrv = new ros.Service({
                    name : this.statusSrvName,
                    serviceType : this.statusSrvType
                });

                this.commandSrv = new ros.Service({
                    name : this.commandSrvName,
                    serviceType : this.commandSrvType
                });
            },

            createContinuePopup : function() {
              var dialog = new Dialog({ title: "You have been disconnected!",style: "width: 40%; height:40%; background-color:white; vertical-align:middle", content : "Would you like to continue the last goal?<br/><br/>"});

              var div = domConstruct.create('div', {}, dialog.containerNode);
//              domStyle.set(dojo.byId(div), "float", "left");

              var that = this;
              var noBtn = new Button({ label: "Cancel", onClick: function(){ dialog.hide(); domConstruct.destroy(dialog);}});
              var yesBtn = new Button({label: "Yes", style : "width : 60px",onClick : function() { that.continueLastGoal(); dialog.hide(); domConstruct.destroy(dialog);}});

              //adding buttons to the div, created inside the dialog
              domConstruct.create(yesBtn.domNode,{}, div);
              domConstruct.create(noBtn.domNode,{}, div);
              dialog.show();
            },


            continueLastGoal : function() {
              var req = new ros.ServiceRequest({
                 command : 'last_goal',
                 pose : { 
                   header : { 
                     frame_id : '/map'
                   },  
                   pose : { 
                     position : { 
                       x : 0,
                       y : 0,
                       z : 0 
                     },  
                     orientation : { 
                       x : 0,
                       y : 0,
                       z : 0,
                       w : 1
                     }   
                   }   
                 }   
                }); 
               this.commandSrv.callService(req,function(resp) {}); 
            },

            checkStatus : function() {
                var req = new ros.ServiceRequest({});
                this.statusSrv.callService(req, lang.hitch(this,this.statusResponse));
            },

            statusResponse : function(resp) {
                console.log(resp.status);
                // if the connection was disconnectedd in the middle of navigation
                // ask user to continue
                if(resp.status == 'Disconnected') {
                  this.createContinuePopup();
                }
            },

            batteryListener : function(msg) {
                var level = parseFloat(msg.battery_percentage);
                this.batteryDiv.innerHTML = msg.battery_percentage;
            },

            onoffDeviceListener : function(msg){
                var element;
                
                if(msg.touch[3] == true)
                    this.modeDiv.innerHTML = ' Auto';
                else
                    this.modeDiv.innerHTML = ' Manual';
                
                if(msg.touch[4] == true)
                    this.velDiv.innerHTML = ' Fast';
                else 
                    this.velDiv.innerHTML = ' Slow';
            },


            resultListener : function(msg) {
                var text = msg.status.text;

                if(msg.status.status == 2 && text == "")
                {
                  text = "Goal has been canceled";
                }

                if (this.tooltipTimer) {
                  window.clearTimeout(this.tooltipTimer);
                }   
                window.setTimeout(dojo.hitch(this, this.hideTooltip), 3000);
                Tooltip.show(text,this.domNode,["below"],false,"");
              },  
                                 
              // Immediately hides any tooltip
              hideTooltip : function() {
                Tooltip.hide(this.domNode);
              },  

            createElement : function(parent,key,width,width2)
            {
                 var div = document.createElement('div');
                 
                 div.style.display='inline-block';
                 div.style.textAlign='center';
                 div.style.width=width;
                 // key
                 var strong = document.createElement('strong');
                 strong.style.display='inherit';
                 strong.style.width=width2;
                 strong.innerHTML = key;

                 div.appendChild(strong);

                 var childdiv = document.createElement('div');
                 childdiv.style.display='inherit';
                 childdiv.style.textAlign='center';
                 div.appendChild(childdiv);
                 parent.appendChild(div);

                 return childdiv;
            },

            disconnectedPopup : function() 
            {
              var dialog = new Dialog({ title: "You have been disconnected!",style: "width: 40%; height:40%; background-color:white; vertical-align:middle", content : "Would you like to try to reconnect?<br/><br/>"});

              var div = domConstruct.create('div', {}, dialog.containerNode);
//              domStyle.set(dojo.byId(div), "float", "left");

              var that = this;
              var noBtn = new Button({ label: "Cancel", onClick: function(){ dialog.hide(); domConstruct.destroy(dialog);}});
              var yesBtn = new Button({label: "Yes", style : "width : 60px",onClick : function() { that.reconnect(); dialog.hide(); domConstruct.destroy(dialog);}});

              //adding buttons to the div, created inside the dialog
              domConstruct.create(yesBtn.domNode,{}, div);
              domConstruct.create(noBtn.domNode,{}, div);
              dialog.show();
            },

            notconnectedPopup : function() 
            {
              var dialog = new Dialog({ title: "No connection",style: "width: 40%; height:40%; background-color:white; vertical-align:middle", content : "Would you like to connect?<br/><br/>"});

              var div = domConstruct.create('div', {}, dialog.containerNode);
//              domStyle.set(dojo.byId(div), "float", "left");

              var that = this;
              var noBtn = new Button({ label: "Cancel", onClick: function(){ dialog.hide(); domConstruct.destroy(dialog);}});
              var yesBtn = new Button({label: "Yes", style : "width : 60px",onClick : function() { that.reconnect(); dialog.hide(); domConstruct.destroy(dialog);}});

              //adding buttons to the div, created inside the dialog
              domConstruct.create(yesBtn.domNode,{}, div);
              domConstruct.create(noBtn.domNode,{}, div);
              dialog.show();
            },

            reconnect : function() 
            {
            document.location.reload(true);
           //   ros.connect(url);
            },

        });

    return topseungDashBoard;
}
);
