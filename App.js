Ext.define('CustomApp', {
	extend: 'Rally.app.App',
	componentCls: 'app',

	launch: function() {

		Rally.data.ModelFactory.getModel({
			type: 'State',
			success: function(model) {
				this.tpl = new Ext.Template(
					'<div class="x-panel-header-text">{0}</div>',
					'<div></div>'
				);

				this.add(Ext.create('Ext.Component', {html: this.tpl.apply(["Current States"])}));

				this.stateGrid = this.add({
					xtype: 'rallygrid',
					model: model,
					columnCfgs: [
						'OrderIndex',
						'Name'
					],
					storeConfig: {
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
						]
					}
				});

				var me = this;
				var applyAction = Ext.create('Ext.Action', {
					icon: '',
					text: 'Apply Template',
					handler: function applyActionHandler(sender, event) {
						var rec = me.templatesGrid.getSelectionModel().getSelection()[0];
						if (rec) {
							Ext.Msg.show({
								title:'Configure Workspace',
								msg: 'Clicking OK will reconfigure your workspace. Do you wish to continue?',
								buttons: Ext.Msg.YESNO,
								icon: Ext.Msg.QUESTION,
								fn: function(btn) { me._setupStates(btn, rec.get('Name')); },
								scope:this
							});

						}
					}
				});

				var records = [
					{
						Name: 'Waterfall',
						Description: 'This template will configure Features in Rally to follow a traditional Waterfall process'
					}, {
						Name: 'Lean',
						Description: 'This template will configure Features in Rally to follow an Agile/Lean process'
					}
				];

				this.add(Ext.create('Ext.Component', {html: this.tpl.apply(["Available Templates"])}));

				this.templatesGrid = this.add({
					xtype: 'rallygrid',
					store: Ext.create('Rally.data.custom.Store', {
						data: records,
						pageSize: 5
					}),
					dockedItems: [{
						xtype: 'toolbar',
						items: [applyAction]
					}],
					columnCfgs: [
						{
							text: 'Name', dataIndex: 'Name', flex: 1
						},
						{
							text: 'Description', dataIndex: 'Description', flex: 2
						}
					]
				});
			},
			scope: this
		});
/*
		Ext.Msg.show({
			title:'Configure Workspace',
			msg: 'Clicking OK will reconfigure your workspace. Do you wish to continue?',
			buttons: Ext.Msg.YESNO,
			icon: Ext.Msg.QUESTION,
			fn:this._setupStates,
			scope:this
		});
*/
	},
	_setupStates:function(btn, typeName) {
		if (btn === 'yes') {
			var type = '';

			if (typeName === 'Waterfall') {
				type = 'SetupWaterfallState';
			} else {
				type = 'SetupLeanState';
			}

			this.setup = Ext.create(type, {});
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

	_setupComplete: function() {
		Ext.Msg.show({
			title:'Configuration Complete',
			msg: 'Configuration of the Workspace is now complete.  This page will now reload with the selected process',
			buttons: Ext.Msg.OK,
			icon: Ext.Msg.QUESTION,
			fn: function(btn) { window.location.reload() },
			scope:this
		});

	}
/*
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
*/
});
