
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
            },

            onClose : function() {
                this.batterySub.unsubscribe();
                this.onoffDeviceSub.unsubscribe();
            },

            createDiv : function() {
                
                var div = this.createElement(this.domNode,'Battery : ');
                this.batteryDiv = div;

                div = this.createElement(this.domNode,'Mode : ');
                this.modeDiv = div;

                div = this.createElement(this.domNode,'Vel :');
                this.velDiv = div;
            },

            createSubscribers : function() {
                this.batterySub = new ros.Topic({
                    name : this.batteryTopic,
                    type : this.batteryType,
                });
                this.onoffDeviceSub = new ros.Topic({
                    name : this.onoffDeviceTopic,
                    type : this.onoffDeviceType,
                });
            },

            batteryListener : function(msg) {
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

            createElement : function(parent,key)
            {
                 var div = document.createElement('div');
                 
                 div.style.display='inline-block';
                 div.style.width='120px';
                 // key
                 var strong = document.createElement('strong');
                 strong.style.display='inherit';
                 strong.innerHTML = key;

                 div.appendChild(strong);

                 var childdiv = document.createElement('div');
                 childdiv.style.display='inherit';
                 div.appendChild(childdiv);
                 parent.appendChild(div);

                 return childdiv;
            },

        });

    return topseungDashBoard;
}
);
