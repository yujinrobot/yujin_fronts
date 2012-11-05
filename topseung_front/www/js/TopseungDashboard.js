
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-style",
        "dijit/_WidgetBase",
        "dojo/dom",
        ],
function(declare,lang,domStyle,widgetbase,dom)
{
    var topseungDashBoard =declare("topseung.Dashboard",[widgetbase],
        {
            batteryTopic : '/topseung/sensors/PowerSystem',
            batteryType : 'sensor_integration_board_comms/PowerSystem',
            onoffDeviceTopic : '/topseung/sensors/OnOffDevice',
            onoffDeviceType : 'sensor_integration_board_comms/OnOffDevice',
            statusSrvName : '/topseung/webbridge/status',
            statusSrvType : '/topseung_webbridge/Status',

            postCreate : function() {
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
                //this.connectDiv.innerHTML = 'On';
                this.connectDiv.style.backgroundColor ='#00FF00';
                this.checkStatus();
            },

            onClose : function() {
                this.batterySub.unsubscribe();
                this.onoffDeviceSub.unsubscribe();
                //this.connectDiv.innerHTML = 'Off';
                this.connectDiv.style.backgroundColor ='#FF0000';
//                this.connectDiv.innerHTML = 'Disconnected';
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
            },

            createService : function() {
                this.statusSrv = new ros.Service({
                    name : this.statusSrvName,
                    serviceType : this.statusSrvType
                });
            },

            checkStatus : function() {
                var req = new ros.ServiceRequest({});
                this.statusSrv.callService(req, lang.hitch(this,this.statusResponse));
            },

            statusResponse : function(resp) {
                                 console.log(resp.status);
                // if the connection was disconnectedd in the middle of navigation
                // ask user to continue
                if(resp.status == 'disconnected') {
                     
                }
            },

            batteryListener : function(msg) {
                var level = parseFloat(msg.battery_percentage);
                /*
                level = level / 100;
                level = level * 16646400;
                level = level + 65280;
                level = level.toString(16);
                var tmp = level.substring(0,2);
                level[0] = level[2];
                level[1] = level[3];
                level[2]=tmp[0];
                level[3]=tmp[1];
                console.log(level);
                this.batteryDiv.style.backgroundColor='#'+level;*/
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

        });

    return topseungDashBoard;
}
);
