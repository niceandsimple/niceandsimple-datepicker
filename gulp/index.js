import gulp from 'gulp'
import del from 'del'
import ngAnnotate from 'gulp-ng-annotate'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import babel from 'gulp-babel'
import jade from 'gulp-jade'
import templateCache from 'gulp-angular-templatecache'
import angularFilesort from 'gulp-angular-filesort'
import merge2 from 'merge2'
import bower from 'main-bower-files'
import sass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import server from 'gulp-webserver'
import sourcemaps from 'gulp-sourcemaps'

const moduleName = "niceandsimple-datepicker"

const distDir = "dist"
const srcDir = "src"
const demoDir = "demo"

const src = {
  js: srcDir + "/**/**.js",
  templates: srcDir + "/**/**.{jade,html}",
  styles: srcDir + "/**/**.{css,scss}"
}
const fileName = {
  js: moduleName + ".js",
  jsMin: moduleName + ".min.js",
  vendorJs: "vendor.js",
  vendorJsMin: "vendor.min.js",
  css: moduleName + ".css",
  cssMin: moduleName + ".min.css"
}
const jsFileName = moduleName + ".js"
const jsFileNameMin = moduleName + ".min.js"
const vendorFileNameMin = "vendor.min.js"

gulp.task('default', ['build', 'vendor', 'server', 'watch'])

gulp.task('watch', () => {
  return gulp.watch(srcDir + '/**/*', ['build']);
})

gulp.task('server', function() {
  return gulp.src('./demo')
    .pipe(server({
      livereload: true,
      port: 8081,
      directoryListening: true
    }))
});

gulp.task('clean', () => {
  return del.sync(distDir)
})

gulp.task('vendor', () => {
  return gulp.src(bower())
    .pipe(filter('**/*.js'))
    .pipe(concat(fileName.vendorJs, {
      newLine: '\n'
    }))
    .pipe(gulp.dest(distDir))
    .pipe(uglify())
    .pipe(rename(fileName.vendorJsMin))
    .pipe(gulp.dest(demoDir))
})

gulp.task('js', () => {
  var jadeFilter = filter('**/*.jade', {restore: true})

  return merge2(
      gulp.src(src.js)
        .pipe(babel())
        .on('error', function(e) {
          console.log('>>> ERROR', e);
          this.emit('end');
        })
        .pipe(angularFilesort())
        .pipe(ngAnnotate()),

      gulp.src(src.templates)
        .pipe(jadeFilter)
        .pipe(jade())
        .pipe(jadeFilter.restore)
        .pipe(templateCache('_templates.js', {
          module: 'componentsTemplates',
          root: '/' + srcDir,
          standalone:true
        }))
    )
    .pipe(concat(fileName.js, {
      newLine: '\n'
    }))
    .pipe(gulp.dest(distDir))
    .pipe(uglify())
    .pipe(rename(fileName.jsMin))
    .pipe(gulp.dest(demoDir))
})

gulp.task('styles', () => {
  var sassFilter = filter('**/*.scss', {restore: true})
  return gulp.src(src.styles)
    .pipe(sassFilter)
    .pipe(sass().on('error', sass.logError))
    .pipe(sassFilter.restore)
    .pipe(autoprefixer())
    .pipe(concat(fileName.css))
    .pipe(gulp.dest(distDir))
    .pipe(gulp.dest(demoDir))
})

gulp.task('build', ['clean', 'js', 'styles'])
