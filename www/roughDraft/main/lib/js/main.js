$(function(){
  $('nav').pushpin({ top: $('nav').offset().top  });
  $(".button-collapse").sideNav();
  setButtons();
  setTemplate("home");
  getPosts();
});

var posts = [];
var postHolder = $('<section>');

function setTemplate(name){
  switch(name){
    case "home":
      setHome();
      break;
    case "news":
      renderPosts(posts, 6, 10);
      break;
  }
}

//home template
function setHome(){
  $('main').html('');
  var source   = $("#home-template").html();
  var template = Handlebars.compile(source);
  var context = {title: "Welcome to OC Radio."};
  var html    = template(context);
  setClass('.home', '.news');
  $('main').html(html);
}

//news template
function renderPosts(posts, oldest, newest){
  $('main').html('');
  $(postHolder).empty();

  var source   = $("#post-template").html();
  var template = Handlebars.compile(source);
  var context, html;

  for(var i = newest; i >= oldest; i--){
    var listenTag = "'" + posts[i].title  + "'";
    var header = posts[i].images.header;
    context = {title: posts[i].title, author: posts[i].author, date: posts[i].date, image: header, body: posts[i].body};
    html = template(context);
    $(postHolder).append(html);
  }
  $('main').append(postHolder);
  source   = $("#pagination-template").html();
  template = Handlebars.compile(source);
  context = {};
  html = template(context);
  setClass('.news');
  $('main').append(html);
}
function getPosts(){
    $.getJSON('doc/test.json', function (json) {
        for(var key in json) {
                var item = json[key];
                posts.push({
                    title: item.title,
                    author: item.author,
                    date: item.date,
                    images:item.images,
                    body: item.body
                });
        }
    });
}

function setButtons(){
  var tuneIn = $('#tuneIn');
  var listenBTN = $('.listenBTN');

  $(tuneIn).click(function(){
    sorryToast();
  });
}

function setClass(elem){
  var scope = $('a' + elem);
  $(scope).addClass('active');
  $('a').not(scope).removeClass('active');
}

function listenTo(post){
  console.log(post);
  sorryToast();
}
function sorryToast(){
  Materialize.toast("We are sorry, but that feature is not quite worked out yet.", 4000);
}
