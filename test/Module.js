describe('Module', function() {
	var cache = {}, pending = {}, module, injector;

	beforeEach(function() {
		module = new Module();
		injector = new window.injector.Injector(pending, cache);
	});

	it('should instantiate a module instance', function() {
		expect(module instanceof Module == 1).toBeTruthy();
	});

	describe('boot()', function() {
		it('should boot the module with a injector instance', function() {
			module.boot(injector);
		});

		it('should load all the service blocks on its right order', function() {
			module
			.service('someDepHere', function() {
				return function(o1, o2) {
					return o1 == o2;
				};
			})
			.service('service1', function(someDepHere) {
				return someDepHere;
			});

			expect(Object.keys(injector.pending)).toEqual([]);

			module.boot(injector);

			expect(Object.keys(injector.pending)).toEqual([
				'someDepHere',
				'service1'
			]);
		});
	});

	describe('service(), config(), run()', function() {
		it('should add the services to the services block', function() {
			var dependencyFactory = function() {};
			var sumServiceFactory = function() {};

			module.service('dependency', dependencyFactory);
			module.service('sumService', sumServiceFactory);

			expect(module.blocks.services[0]).toBe('dependency');
			expect(module.blocks.services[1]).toBe(dependencyFactory);

			expect(module.blocks.services[2]).toBe('sumService');
			expect(module.blocks.services[3]).toBe(sumServiceFactory);
		});
	});
});