var gulp = require('gulp');
var rsp = require('../index.js').stream;

gulp.task('default', function () {
    gulp.src('./src/*.svg')
    .pipe(rsp.remove({
        properties: [rsp.PROPS_FILL]
    }))
    .pipe(gulp.dest('./dest'));
});