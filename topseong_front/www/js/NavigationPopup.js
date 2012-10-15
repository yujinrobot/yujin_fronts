
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_WidgetBase",
        "dijit/form/Button",
        "dojo/on",
        "yujin_webtools/widgets/NavigationControl",
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

                this.goalButton.setDisabled(true);
                this.cancelButton.setDisabled(true);

                this.domNode.appendChild(this.goalButton.domNode);
                this.domNode.appendChild(this.cancelButton.domNode);
            },

            onConnect : function() {
                this.goalButton.setDisabled(false);
                this.cancelButton.setDisabled(false);
            },

            onClose : function() {
                this.goalButton.setDisabled(true);
                this.cancelButton.setDisabled(true);
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
