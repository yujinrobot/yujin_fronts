

define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/dom-style",
        "dijit/_WidgetBase",
        "mjpegcanvasjs/mjpegcanvas",
        ],
function(declare,lang,domClass,domStyle,_widgetbase,MjpegCanvas)
{
    var MjpegViewer = declare("roswidgets.MjpegViewer",[_widgetbase], {
        host :  null,
        topic : null,
        label : null,
        port : 8080,
        width : 320,
        height : 240,
        quality : 100,
        defaultStream : undefined,

        mjpeg : null,

        postCreate : function() {
            domClass.add(this.domNode,'mjpegviewer');            
            domStyle.set(this.domNode,"width",this.width+"px");
            domStyle.set(this.domNode,"height",this.height+"px");
            this.center = document.createElement('center');
            this.domNode.appendChild(this.center);

            if(this.host == null) {
                ros.on('host',lang.hitch(this,this.onConnect));
                ros.on('close',lang.hitch(this,this.onClose));
            }
            else {
                this.createStream(this.host);
            }
        },

        onConnect : function(host) {
            console.log("on Connect");
            if(host) {
                console.log("url = ",host); 
                this.createStream(host);
            }
        },

        onClose : function() {
            this.center.removeChild(this.canvas);
            delete this.mjpeg;
            delete this.canvas;
        },

        createStream : function(host) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = this.canvas.id || this.id+"_canvas";
            this.canvas.width = ""+this.width;
            this.canvas.height = ""+this.height;
            this.center.appendChild(this.canvas);

            this.mjpeg = new MjpegCanvas({
                host : host,
                port : this.port,
                topic : this.topic,
                label : this.label,
                canvasID : this.canvas.id,
                width : this.width,
                height : this.height,
                quality : this.quality,
                defaultStream : this.defaultStream,
                    });

            console.log(this.mjpeg);
        },
    });

    return MjpegViewer;
}
);
