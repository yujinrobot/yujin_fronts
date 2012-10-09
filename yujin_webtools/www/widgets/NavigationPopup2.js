
define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/form/Button",
        "dojo/on",
        "./NavigationControl",
        ],
function(declare,widgetbase,Button,on,NavControl)
{
    var popup = declare("yujin_webtools.widgets.NavigationPopup",[widgetbase],
        {
            postCreate : function()
            {
                this.createButtons(); 
                
                dojo.connect(this.initButton,"onClick",this,"initPoseClicked");
                dojo.connect(this.goalButton,"onClick",this,"setGoalClicked");
                dojo.connect(this.cancelButton,"onClick",this,"cancelGoalClicked");

                this.domNode.appendChild(this.initButton.domNode);
                this.domNode.appendChild(this.goalButton.domNode);
                this.domNode.appendChild(this.cancelButton.domNode);
            },

            createButtons : function() 
            {
                this.initButton = new Button({ label:'Init Pose'});
                this.goalButton = new Button({label:'Set Goal'});
                this.cancelButton = new Button({label:'Cancel Goal'});
            },

            initPoseClicked : function(e){},
            setGoalClicked : function(e) {},
            cancelGoalClicked : function(e) {},

        });
        return popup;
});
