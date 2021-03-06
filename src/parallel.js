(function() {

	function requireDependencies(context, parallel) {
		var dependencies = context.get('parallelDependencies');

		for (var dep in dependencies) if (dependencies.hasOwnProperty(dep)) {
			parallel.require({ name: dep, fn: dependencies[dep] });
		}
	}

	function wrapPromise(promise) {
		return new Em.RSVP.Promise(function(resolve) {
			promise.then(function(data) {
				resolve(data);
			});
		});
	}

	Em.parallelConfig = {
		maxWorkers: 4,
		evalPath: null
	};

	Em.computed.parallel = {

		map: function(data, fn, initValue) {
			return Em.computed.promise(data + '.[]', function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)), Em.parallelConfig);

				requireDependencies(this, parallel);

				return wrapPromise(parallel.map(fn));
			}, initValue);
		},

		reduce: function(data, fn, initValue) {
			return Em.computed.promise(data + '.[]', function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)), Em.parallelConfig);

				requireDependencies(this, parallel);

				return wrapPromise(parallel.reduce(fn));
			}, initValue);
		},

		spawn: function(dependency, fn, initValue) {
			var data = dependency.replace(/(\.\[\]|\.@each.*)$/, '');
			return Em.computed.promise(dependency, function() {
				var parallel = new Parallel(Em.JSONify(this.get(data)), Em.parallelConfig);

				requireDependencies(this, parallel);

				return wrapPromise(parallel.spawn(fn));
			}, initValue);
		}

	};

}());
