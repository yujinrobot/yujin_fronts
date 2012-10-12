
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_WidgetBase",
        "dojo/dom",
        ],
function(declare,lang,widgetbase,dom)
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
                var div = document.createElement('div');
                this.batteryDiv = div;
                this.domNode.appendChild(div);

                div = document.createElement('div');
                this.onoffDiv = div;
                this.domNode.appendChild(div);

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
                this.batteryDiv.innerHTML = "";
                var element = this.addElement('Battery',msg.battery_percentage)
                this.batteryDiv.appendChild(element);
            },

            onoffDeviceListener : function(msg){
                this.onoffDiv.innerHTML ="";
                var element;
                
                if(msg.touch[3] == true)
                    element = this.addElement('Mode','Auto');
                else
                    element = this.addElement('Mode','Manual');
                this.onoffDiv.appendChild(element);
                
                if(msg.touch[4] == true)
                    element = this.addElement('Velocity','Fast');
                else 
                    element = this.addElement('Velocity','Slow');
                this.onoffDiv.appendChild(element);
            },

            addElement : function(key,data)
            {
                 var div = document.createElement('div');
                 // key
                 var strong = document.createElement('strong');
                 strong.innerHTML = key + ' : ';

                 div.appendChild(strong);
                 div.innerHTML += data;

                 return div;
            },

        });

    return topseungDashBoard;
}
);
