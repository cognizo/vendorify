var path = require('path');
var transformTools = require('browserify-transform-tools');
var resolve = require('resolve');
var packagePath = require('package-path');

module.exports = transformTools.makeRequireTransform('vendorify', { jsFilesOnly: true }, function (args, opts, done) {
    opts.config = opts.config || {};

    var vendorDir = opts.config.vendorDir || 'vendor';
    var baseDir = path.resolve(opts.config.baseDir || './');
    var moduleDir = opts.config.moduleDir || 'node_modules';
    var pkg = args && args[0];

    if (!pkg) {
        return done();
    }

    var isCore = resolve.isCore(pkg);

    if (isCore) {
        return done();
    }

    var basedir = path.dirname(opts.file);

    resolve(pkg, { basedir: basedir }, function (err, resolved) {
        if (err || !resolved) {
            return done();
        }

        packagePath(resolved, function (pkgPath) {
            if (!pkgPath) {
                return done();
            }

            if (path.resolve(pkgPath) === path.join(baseDir, moduleDir, pkg)) {
                var replacement = path.join(vendorDir, pkg);

                if (opts.config.verbose) {
                    console.log('Replacing ' + pkg + ' with ' + replacement);
                }

                return done(null, "require('" + replacement + "')");
            }

            done();
        });
    });
});
