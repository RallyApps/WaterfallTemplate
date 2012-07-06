/**
 * Assures that the states named and ordered as specified in the states array.
 */
Ext.define('SetupState', {
    extend: 'Ext.util.Observable',
    states:[
        "System Requirements",
        "Software Requirements",
        "Analysis",
        "Program Design",
        "Coding",
        "Testing",
        "Operations"
    ],

    model:undefined,
    type:undefined,
    stateRecords:[],
    outstandingQueries:0,

    stateObject:{},

    renameStates:function(store, records) {
        this.model = store.model;
        var hash = {};
        Ext.each(records, function(record) {
            this.type = record.get("StateType");
            hash[record.get("OrderIndex")] = record;
        }, this);
        Ext.each(this.states, function(state, index) {
            var currentRecord = hash[index + 1];
            this.outstandingQueries++;
            if (currentRecord) {
                currentRecord.set("Name", state);
                currentRecord.save({
                    callback:this.ioCallback,
                    scope:this
                });
            }
            else {
                currentRecord = new store.model({
                    Name:state,
                    StateType:this.type
                });
                currentRecord.save({
                    callback:this.ioCallback,
                    scope:this
                });
            }
            this.stateRecords.push(currentRecord);
        }, this);

    },

    ioCallback:function() {
        this.outstandingQueries--;
        if (!this.outstandingQueries) {
            this.fireEvent("statesUpdated");
        }
    },

    getStates: function() {
        Ext.create('Rally.data.WsapiDataStore', {
            model: "State",
            autoLoad:true,
            fetch:["Name","OrderIndex","StateType","OrdinalValue"],
            filters: [
                {
                    property: 'StateType.OrdinalValue',
                    value: 1
                }
            ],
            sorters: [
                {
                    property: 'OrderIndex',
                    direction: 'ASC'
                }
            ],
            listeners:{
                load:this.renameStates,
                scope:this
            }
        });
    }
});
