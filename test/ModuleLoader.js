describe('ModuleLoader', function() {
	var moduleLoader, pending, cache;

	beforeEach(function() {
		cache = {};
		pending = {};
		moduleLoader = new ModuleLoader(new injector.Injector(pending, cache));
	});

	describe('register()', function() {
		it('should register a module', function() {
			moduleLoader.register('app', []);

			expect(moduleLoader.modules.app instanceof Module == true).toBeTruthy();
		});

		it('should get a registered module', function() {
			var module = moduleLoader.register('app', []);

			expect(moduleLoader.register('app')).toBe(module);
		});
	});

	describe('bootstrap()', function() {
		it('should throw an error when validating undefined dependencies', function() {
			moduleLoader.register('c1', ['d1']);
			moduleLoader.register('b1', ['c1']);
			moduleLoader.register('a1', ['b1']);

			expect(function() {
				moduleLoader.bootstrap('c1');
			})
			.toThrow(new Error('Module "d1" does not exists as a dependency of "c1"'));
		});

		it('should handle throw an error when circular dependency is encountered', function() {
			moduleLoader.register('c', ['c']);
			moduleLoader.register('b', ['c']);
			moduleLoader.register('a', ['b']);

			expect(function() {
				moduleLoader.bootstrap('a');
			}).toThrow(new Error('Circular dependency found: a <- b <- c <- c'));
		});

		it('should load all the dependencies before load the main module of bootstrap', function() {
			var i = 0;
			var b1 = moduleLoader.register('b1', ['c1']);		
			var c1 = moduleLoader.register('c1', []);
			var a1 = moduleLoader.register('a1', ['d1','b1']);
			var d1 = moduleLoader.register('d1', []);

			var $qService = function() {};
			var factory = function($q) {
				i++;
			};

			b1.run(factory).config(factory);
			c1.service('$q', $qService).config(factory).run(factory);
			a1.run(factory).config(factory);
			d1.run(factory).config(factory);

			moduleLoader.bootstrap('a1');

			expect(i).toBe(8);
		});
	});
});