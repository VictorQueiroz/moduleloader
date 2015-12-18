function ModuleLoader(injector) {
	this.loaded = [];
	this.modules = {};
	this.injector = injector;
}

ModuleLoader.prototype = {
	register: function(name, deps) {
		if(deps) {
			if(this.modules.hasOwnProperty(name)) {
				throw new Error('Error while trying to redefine "' + name + '"');
			} else {
				// Define a new module
				return (this.modules[name] = new Module(name, deps));
			}
		} else if(this.modules.hasOwnProperty(name)) {
			return this.modules[name];
		} else {
			throw new Error('Module "' + name + '" does not exists');
		}
	},

	load: function(module, path) {
		path = path || [];

		var name = module.name,
				dep,
				deps = module.dependencies;

		path.push(name);

		module.boot(this.injector);
		this.loaded.push(module);

		for(var i = 0; i < deps.length; i++) {
			if(this.modules.hasOwnProperty(deps[i])) {
				dep = this.modules[deps[i]];

				if(path.indexOf(dep.name) > -1) {
					throw new Error('Circular dependency found: ' + path.join(' <- ') + ' <- ' + dep.name);
				}
				
				this.load(dep, path);
			} else {
				throw new Error('Module "' + deps[i] + '" does not exists as a dependency of "' + name + '"');
			}
		}

		path.pop();
	},

	// Load all the modules and its
	// dependencies
	bootstrap: function(name) {
		var module,
				loaded = this.loaded;

		this.load(this.register(name));

		for(var i = loaded.length - 1; i >= 0; i--) {
			module = loaded[i];
			module.execute('config');
		}

		for(var i = loaded.length - 1; i >= 0; i--) {
			module = loaded[i];
			module.execute('run');
		}
	}
};