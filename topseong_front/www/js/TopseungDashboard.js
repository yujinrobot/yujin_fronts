
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

            postCreate : function() {
                this.createDiv();
                this.createSubscribers();
                domStyle.set(this.domNode,'vertical-align','middle');

                ros.on('connection',lang.hitch(this,this.onConnect));
                ros.on('close',lang.hitch(this,this.onClose));
            },

            onConnect : function() {
                this.batterySub.subscribe(lang.hitch(this,this.batteryListener));
                this.onoffDeviceSub.subscribe(lang.hitch(this,this.onoffDeviceListener));
                //this.connectDiv.innerHTML = 'On';
                this.connectDiv.style.backgroundColor ='#00FF00';
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

            batteryListener : function(msg) {
                var level = parseFloat(msg.battery_percentage);
                console.log(level);
                /*
                console.log(level);
                level = level / 100;
                level = level * 16646400;
                level = level + 65280;
                console.log(level.toString(16));*/
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
