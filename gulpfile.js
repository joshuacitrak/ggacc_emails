var gulp = require('gulp'),
  gutil = require('gulp-util'),
    glob = require('glob'),
    path = require('path'),
    rename= require('gulp-rename'),
    clean = require('gulp-clean'),
    inlineCss = require('gulp-inline-css'),
    dom = require('gulp-dom');

var components = glob.sync('./*.html').map(function(componentDir) {
        return path.basename(componentDir);
    });

var newFiles =[];
var inc = 0;

components.forEach(function(name) {
    var filename = path.basename(name, '.html');
    var fileToSplit = filename.split(/-wip|-wip-/);
    var numToAdd= 0;
            if(fileToSplit[1])
            {
                numToAdd = Number(fileToSplit[1]);
            }
    numToAdd--; //increment based on result
    var newFilesname = fileToSplit[0]+"-wip"+numToAdd;
       
    gulp.task(name, function() {
        return gulp.src('./'+filename+'.html')
            .pipe(clean({force:true}))//delete, but keep in stream so we can rename
            .pipe(gulp.dest('old'))//move to old dir
            .pipe(rename(newFilesname + '.html'))//rename
            .pipe(gulp.dest('./'))//keep in same dir
    });
    
    gulp.task('inline-email-css', function(){
        return gulp.src('./*.html')
        .pipe(inlineCss({ //inline the css
            applyStyleTags: true,
            applyLinkTags: true,
            removeStyleTags: true,
            removeLinkTags :true,
            preserveMediaQueries:true}))        
        .pipe(dom(function(){
            var mq = this.createElement('link'); //put back in the media query css which has been stripped out
            mq.setAttribute('rel', 'stylesheet');
            mq.setAttribute('href', 'http://www.ggacc.org:80/resources/EmailTemplates/css/mobile-styles.css');
            mq.setAttribute('media', 'screen');
            this.head.appendChild(mq);
            var resets = this.createElement('style');//put the resets css in a style tag
            resets.setAttribute('type','text/css');
            resets.innerHTML = "body { margin: 0 !important; } a:focus { outline: thin dotted !important; } a:hover { outline: 0 !important; } a:active { outline: 0 !important; } q:before { content: none !important; } q:after { content: none !important; } img { border: 0 !important; -ms-interpolation-mode: bicubic !important; } body { font-family: 'Arial', sans-serif !important; font-weight: 100 !important; color: #111C24 !important; -webkit-text-size-adjust: none !important; -ms-text-size-adjust: none !important; background-color: #ffffff !important; margin: 0 !important; padding: 0 !important; }a:hover { text-decoration: underline !important; }";
            this.head.appendChild(resets);
            return this;}))
        .pipe(gulp.dest('deploy/'))//move
    });

});

// rev up the emails
gulp.task('rev-build', components.map(function(name){ return name; }));

//ready for deployment
gulp.task('deploy', ['inline-email-css']);
