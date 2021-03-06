
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-style",
        "dijit/_WidgetBase",
        "dojo/dom",
       ],
function(declare,lang,domStyle,widgetbase,dom)
{
  var turtlebotDashBoard =declare("turtlebot.Dashboard",[widgetbase],
  {
    sensorTopic : '/mobile_base/sensors/core',
    sensorTopicType : 'kobuki_comms/SensorState',

    postCreate : function() {
      this.createDiv();
      this.createSubscribers();
      domStyle.set(this.domNode,'vertical-align','middle');

      ros.on('connection',lang.hitch(this,this.onConnect));
      ros.on('close',lang.hitch(this,this.onClose));
    },

    onConnect : function() {
      this.sensorSub.subscribe(lang.hitch(this,this.sensorListener));
      //this.connectDiv.innerHTML = 'On';
      this.connectDiv.style.backgroundColor ='#00FF00';
    },

    onClose : function() {
      this.sensorSub.unsubscribe();
      //this.connectDiv.innerHTML = 'Off';
      this.connectDiv.style.backgroundColor ='#FF0000';
//      this.connectDiv.innerHTML = 'Disconnected';
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
//      this.batteryDiv.style.border = '1px solid';
      this.batteryDiv.innerHTML = '&nbsp';

    },

    createSubscribers : function() {
      this.sensorSub = new ros.Topic({
        name : this.sensorTopic,
        type : this.sensorTopicType,
        throttle_rate : 500,
      });
    },

    sensorListener : function(msg) {
      var level = parseFloat(msg.battery);
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
      this.batteryDiv.innerHTML = level;
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

  return turtlebotDashBoard;
}
);
