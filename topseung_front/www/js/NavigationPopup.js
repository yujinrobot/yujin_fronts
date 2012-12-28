
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_WidgetBase",
        "dijit/form/Button",
        "dojo/on",
        "rosdojo/navigation/NavigationControl",
        ],
function(declare,lang,widgetbase,Button,on,NavControl)
{
    var popup = declare("topseung.NavigationPopup",[widgetbase],
        {
            postCreate : function()
            {
                ros.on('connection',lang.hitch(this,this.onConnect));
                ros.on('close',lang.hitch(this,this.onClose));
                this.createButtons(); 
                
                dojo.connect(this.goalButton,"onClick",this,"setGoalClicked");
                dojo.connect(this.cancelButton,"onClick",this,"cancelGoalClicked");

                this.goalButton.set('disabled',true);
                this.cancelButton.set('disabled',true);

                this.domNode.appendChild(this.goalButton.domNode);
                this.domNode.appendChild(this.cancelButton.domNode);
            },

            onConnect : function() {
                this.goalButton.set('disabled',false);
                this.cancelButton.set('disabled',false);
            },

            onClose : function() {
                this.goalButton.set('disabled',true);
                this.cancelButton.set('disabled',true);
            },

            createButtons : function() 
            {
                this.goalButton = new Button({label:'Set Goal'});
                this.cancelButton = new Button({label:'Cancel Goal'});
            },

            setGoalClicked : function(e) {},
            cancelGoalClicked : function(e) {},

        });
        return popup;
});
