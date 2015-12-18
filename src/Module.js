var Injector = window.injector.Injector;

var toArray = function(value) {
	return Array.prototype.slice.call(value);
};

function addToBlock (name) {
	return function() {
		var args = toArray(arguments),
				blocks = this.blocks[name];

		blocks.push.apply(blocks, args);

		return this;
	};
}

Module.SERVICE = 'services';
Module.CONFIG = 'config';
Module.RUN = 'run';

function Module(name, dependencies) {
	this.blocks = {
		services: [],
		config: [],
		run: []
	};

	this.name = name;
	this.dependencies = dependencies;
}

Module.prototype = {
	service: addToBlock('services'),

	config: addToBlock('config'),

	run: addToBlock('run'),

	boot: function(injector) {
		var blocks = this.blocks;

		if(injector instanceof Injector !== true) {
			throw new Error('The injector must be an instance of Injector');
		}

		this.injector = injector;

		// Put all the blocks of service
		// definition on the injector pending
		// block and wait for the call of run
		// and config blocks
		this.execute('services');
	},

	execute: function() {
		var i,
				obj,
				name,
				blocks = toArray(arguments);

		for(i = blocks.length - 1; i >= 0; i--) {
			name = blocks[i];

			obj = {};
			obj[name] = this.blocks[name];
			obj[name] = this._blocks(obj);
		}

		return obj;
	},

	_blocks: function(blocks) {
		var keys = Object.keys(blocks);

		for(var i = 0; i < keys.length; i++) {
			this._block(keys[i], blocks[keys[i]]);
		}

		return this;
	},

	_block: function(name, items) {
		var deps, //factory deps
				factory;

		for(var j = items.length - 1; j >= 0; j--) {
			factory = items[j];

			// Store the deps for if we want to
			// preload anything before loading the
			// item, we can load the dependencies first
			deps = Injector.extractDeps(factory);

			if(deps.length > 0) {
				var dep, depIndex;

				// Iterate over the dependencies and
				// define them if their definition is
				// available inside the block items
				for(var i = 0; i < deps.length; i++) {
					dep = deps[i];

					if((depIndex = items.indexOf(dep)) > -1) {
						this.injector.pending[items[depIndex]] = items[++depIndex];
					}
				}
			}

			switch(name) {
				case Module.SERVICE:
					this.injector.pending[items[--j]] = factory;
					break;
				default:
					this.injector.invoke(factory);
					break;
			}
		}
	}
};