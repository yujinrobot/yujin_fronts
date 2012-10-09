
define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dojo/dom",
        "dojo/dom-class",
        "./nav2d",
        "./Loader",
        ],
function(declare,widgetbase,dom,domClass,Nav2D,Loader)
{
    var navCanvas = declare("yujin_webtools.widgets.NavigationCanvas",[widgetbase],
        {
            canvasid    : null,
            canvaswidth : 640,
            canvasheight : 480,
            continuous : false,
            image : null,
            serverName : '/move_base',
            mapTopic : '/map',
            mapMetaTopic : '/map_metadata',
            initialPoseTopic : '/initialpose',

            postCreate : function() {
                Loader.loadCSS("yujin_webtools/widgets/css/navcanvas.css");

                this.createCanvas();
                this.createNav2D();
                this.connectFunctions();
                
                domClass.add(this.canvas,"navigation-canvas");
            },

            startup : function() {
            },

            createCanvas : function() {
                this.canvas = document.createElement('canvas');
                this.canvas.id = this.canvasid || this.id+"_canvas";
                this.canvas.width = ""+this.canvaswidth;
                this.canvas.height = ""+this.canvasheight;
                this.domNode.appendChild(this.canvas);
            },

            createNav2D : function() {
                this.nav2d = new Nav2D({
                    ros:ros,
                    canvasID:this.canvas.id,
                    width : this.canvas.width,
                    height : this.canvas.height,
                    continuous : this.continuous,
                    image : this.image,
                    mapTopic : this.mapTopic,
                    mapMetaTopic : this.mapMetaTopic,
                    initialPoseTopic : this.initialPoseTopic,
                    serverName : this.serverName,
                });
            },

            connectFunctions : function() {
                this.getPoseFromEvent = this.nav2d.getPoseFromEvent;
                this.sendGoalPose = this.nav2d.sendGoalPose;
            },

            initPoseClicked : function() {
                this.nav2d.setmode('init');
            },

            setGoalClicked : function() {
                this.nav2d.setmode('goal');
            },

            cancelGoalClicked : function() {
                this.nav2d.cancel();
            },

        });

    return navCanvas;
}
);
