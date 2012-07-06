Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {

        Ext.Msg.show({
            title:'Configure Workspace',
            msg: 'Clicking OK will reconfigure your workspace. Do you wish to continue?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn:this._setupStates,
            scope:this
        });

    },
    _setupStates:function(btn) {
        if (btn === 'yes') {
            this.setup = Ext.create("SetupState", {});
            this.setup.on("statesUpdated", this._setupComplete, this);
            this.setup.getStates();
        }
    },
    _createColumns:function (states) {
        var columns;

        if (states.length) {

            columns = [];

            Ext.Array.each(states, function (state) {
                columns.push({
                    value:state.get('_ref'),
                    displayValue:state.get('Name'),
                    wipLimit:state.get('WIPLimit'),
                    policies:state.get('Description')
                });
            });
        }

        return columns;
    },

    _setupComplete:function() {
        var columns = this._createColumns(this.setup.stateRecords);
        var cardboard = Ext.widget('rallycardboard', {
            types:['PortfolioItem'],
            itemId:'cardboard',
            attribute:'State',
            columns:columns,
            enableRanking:this.getContext().get('workspace').WorkspaceConfiguration.DragDropRankingEnabled,
            storeConfig:{
                filters:[
                    {
                        property:'PortfolioItemType',
                        value:this.setup.type._ref
                    }
                ]
            }
        });

        this.add(cardboard);
    }
});
