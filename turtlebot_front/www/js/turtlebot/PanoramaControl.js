define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_WidgetBase",
        "dijit/form/Button",
        "dojo/on",
        "dijit/Tooltip",
        ],
function(declare,lang,widgetbase,Button,on,Tooltip)
{
    var popup = declare("turtlebot.PanoramaControl",[widgetbase],
        {
            panoServiceName : '/turtlebot_panorama/take_pano',
            panoServiceType : 'turtlebot_panorama/TakePano',

            postCreate : function()
            {
                ros.on('connection',lang.hitch(this,this.onConnect));
                ros.on('close',lang.hitch(this,this.onClose));


                this.createButtons(); 
                this.createService();

                
                dojo.connect(this.takePanoButton,"onClick",this,"takePanoClicked");
                dojo.connect(this.stopButton,"onClick",this,"stopClicked");

                this.takePanoButton.setDisabled(true);
                this.stopButton.setDisabled(true);

                this.domNode.appendChild(this.takePanoButton.domNode);
                this.domNode.appendChild(this.stopButton.domNode);
            },

            onConnect : function() {
                this.takePanoButton.setDisabled(false);
            },

            onClose : function() {
                this.takePanoButton.setDisabled(true);
                this.stopButton.setDisabled(true);
            },

            createService : function()
            {
              this.panoClient = new ros.Service({
                name        : this.panoServiceName,
                serviceType : this.panoServiceType,
              });

              this.startRequest = new ros.ServiceRequest({
                    angle : 360,
                    interval_angle : 0,
                    snap_interval : 0.1,
                    zvel : 0.2,
                  });

              this.stopRequest = new ros.ServiceRequest({
                    angle : -1,
                    interval_angle : 0,
                    snap_interval : 0,
                    zvel : 0.0,
                  });
            },

            createButtons : function() 
            {
                this.takePanoButton = new Button({ label:'Take Panorama'});
                this.stopButton = new Button({label:'Stop Panorama'});
            },

            takePanoClicked : function(e) {
                this.takePanoButton.setDisabled(true);
                this.panoClient.callService(this.startRequest,lang.hitch(this,this.processTakeResponse));
            },

            stopClicked : function(e) {
                this.stopButton.setDisabled(true);
                this.panoClient.callService(this.stopRequest,lang.hitch(this,this.processStopResponse));
            },

            parseStatus : function(resp)
            {
              console.log(resp);
                var msg;
                if(resp.status == 0) {
                  msg = "Started"; 
                }
                else if(resp.status == 1) {
                  msg = "Already Taking Panorama";
                }
                else if(resp.status == 2) {
                  msg = "In Error";
                }
                else if(resp.status == 3) {
                  msg = "Stopped";
                }
                else {
                  msg = resp.status;
                }
                return msg;
            },

            processTakeResponse : function(resp) {
                var msg = this.parseStatus(resp);
                var that = this;
                Tooltip.show(msg,that.takePanoButton.domNode,["below"]);
                window.setTimeout(function() { Tooltip.hide(that.takePanoButton.domNode);},1000);
                this.takePanoButton.setDisabled(false);
                this.stopButton.setDisabled(false);
            },

            processStopResponse : function(resp) {
                var msg = this.parseStatus(resp);
                var that = this;
                Tooltip.show(msg,that.stopButton.domNode,["below"]);
                window.setTimeout(function() { Tooltip.hide(that.stopButton.domNode);},1000);
            },
        });
        return popup;
});
