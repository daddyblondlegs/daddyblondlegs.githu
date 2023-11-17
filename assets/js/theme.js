 // alertbar later
    $(document).scroll(function () {
        var y = $(this).scrollTop();
        if (y > 280) {
            $('.alertbar').fadeIn();
        } else {
            $('.alertbar').fadeOut();
        }
    });


// Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('nav').outerHeight();

    $(window).scroll(function(event){
        didScroll = true;
    });

    setInterval(function() {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = $(this).scrollTop();
        
        // Make sure they scroll more than delta
        if(Math.abs(lastScrollTop - st) <= delta)
            return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight){
            // Scroll Down            
            $('nav').removeClass('nav-down').addClass('nav-up'); 
            $('.nav-up').css('top', - $('nav').outerHeight() + 'px');
           
        } else {
            // Scroll Up
            if(st + $(window).height() < $(document).height()) {               
                $('nav').removeClass('nav-up').addClass('nav-down');
                $('.nav-up, .nav-down').css('top', '0px');             
            }
        }

        lastScrollTop = st;
    }
    
    
    $('.site-content').css('margin-top', $('header').outerHeight() + 'px');


function loadSearch(){
    // Create a new Index
    idx = lunr(function(){
        this.field('id')
        this.field('title', { boost: 10 })
        this.field('summary')
    })
 
    // Send a request to get the content json file
    $.getJSON('/content.json', function(data){
 
        // Put the data into the window global so it can be used later
        window.searchData = data
 
        // Loop through each entry and add it to the index
        $.each(data, function(index, entry){
            idx.add($.extend({"id": index}, entry))
        })
    })
 
    // When search is pressed on the menu toggle the search box
    $('#search').on('click', function(){
        $('.searchForm').toggleClass('show')
    })
 
    // When the search form is submitted
    $('#searchForm').on('submit', function(e){
        // Stop the default action
        e.preventDefault()
 
        // Find the results from lunr
        results = idx.search($('#searchField').val())
 
        // Empty #content and put a list in for the results
        $('#content').html('<h1>Search Results (' + results.length + ')</h1>')
        $('#content').append('<ul id="searchResults"></ul>')
 
        // Loop through results
        $.each(results, function(index, result){
            // Get the entry from the window global
            entry = window.searchData[result.ref]
 
            // Append the entry to the list.
            $('#searchResults').append('<li><a href="' + entry.url + '">' + entry.title + '</li>')
        })
    })
}



// Smooth on external page
$(function() {
  setTimeout(function() {
    if (location.hash) {
      /* we need to scroll to the top of the window first, because the browser will always jump to the anchor first before JavaScript is ready, thanks Stack Overflow: http://stackoverflow.com/a/3659116 */
      window.scrollTo(0, 0);
      target = location.hash.split('#');
      smoothScrollTo($('#'+target[1]));
    }
  }, 1);

  // taken from: https://css-tricks.com/snippets/jquery/smooth-scrolling/
  $('a[href*=\\#]:not([href=\\#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      smoothScrollTo($(this.hash));
      return false;
    }
  });

  function smoothScrollTo(target) {
    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

    if (target.length) {
      $('html,body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  }
});

//lightbox
function is_youtubelink(url) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return (url.match(p)) ? RegExp.$1 : false;
}
function is_imagelink(url) {
  var p = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i;
  return (url.match(p)) ? true : false;
}
function is_vimeolink(url,el) {
  var id = false;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
          if (xmlhttp.status == 200) {
              var response = JSON.parse(xmlhttp.responseText);
              id = response.video_id;
              console.log(id);
              el.classList.add('lightbox-vimeo');
              el.setAttribute('data-id',id);

              el.addEventListener("click", function(event) {
                  event.preventDefault();
                  document.getElementById('lightbox').innerHTML = '<a id="close"></a><a id="next">&rsaquo;</a><a id="prev">&lsaquo;</a><div class="videoWrapperContainer"><div class="videoWrapper"><iframe src="https://player.vimeo.com/video/'+el.getAttribute('data-id')+'/?autoplay=1&byline=0&title=0&portrait=0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div></div>';
                  document.getElementById('lightbox').style.display = 'block';

                  setGallery(this);
              });
          }
          else if (xmlhttp.status == 400) {
              alert('There was an error 400');
          }
          else {
              alert('something else other than 200 was returned');
          }
      }
  };
  xmlhttp.open("GET", 'https://vimeo.com/api/oembed.json?url='+url, true);
  xmlhttp.send();
}
function setGallery(el) {
  var elements = document.body.querySelectorAll(".gallery");
  elements.forEach(element => {
      element.classList.remove('gallery');
});
if(el.closest('ul, p')) {
  var link_elements = el.closest('ul, p').querySelectorAll("a[class*='lightbox-']");
  link_elements.forEach(link_element => {
    link_element.classList.remove('current');
  });
  link_elements.forEach(link_element => {
    if(el.getAttribute('href') == link_element.getAttribute('href')) {
      link_element.classList.add('current');
    }
  });
  if(link_elements.length>1) {
    document.getElementById('lightbox').classList.add('gallery');
    link_elements.forEach(link_element => {
      link_element.classList.add('gallery');
    });
  }
  var currentkey;
  var gallery_elements = document.querySelectorAll('a.gallery');
  Object.keys(gallery_elements).forEach(function (k) {
    if(gallery_elements[k].classList.contains('current')) currentkey = k;
  });
  if(currentkey==(gallery_elements.length-1)) var nextkey = 0;
  else var nextkey = parseInt(currentkey)+1;
  if(currentkey==0) var prevkey = parseInt(gallery_elements.length-1);
  else var prevkey = parseInt(currentkey)-1;
  document.getElementById('next').addEventListener("click", function() {
    gallery_elements[nextkey].click();
  });
  document.getElementById('prev').addEventListener("click", function() {
    gallery_elements[prevkey].click();
  });
}
}

document.addEventListener("DOMContentLoaded", function() {

 /* //create lightbox div in the footer
  var newdiv = document.createElement("div");
  newdiv.setAttribute('id',"lightbox");
  document.body.appendChild(newdiv);

  //add classes to links to be able to initiate lightboxes
  var elements = document.querySelectorAll('a');
  elements.forEach(element => {
      var url = element.getAttribute('href');
      if(url) {
          if(url.indexOf('vimeo') !== -1 && !element.classList.contains('no-lightbox')) {
              is_vimeolink(url,element);
          }
          if(is_youtubelink(url) && !element.classList.contains('no-lightbox')) {
              element.classList.add('lightbox-youtube');
              element.setAttribute('data-id',is_youtubelink(url));
          }
          if(is_imagelink(url) && !element.classList.contains('no-lightbox')) {
              element.classList.add('lightbox-image');
              var href = element.getAttribute('href');
              var filename = href.split('/').pop();
              var split = filename.split(".");
              var name = split[0];
              element.setAttribute('title',name);
          }
      }
  });

  //remove the clicked lightbox
  document.getElementById('lightbox').addEventListener("click", function(event) {
      if(event.target.id != 'next' && event.target.id != 'prev'){
          this.innerHTML = '';
          document.getElementById('lightbox').style.display = 'none';
      }
  });
  
  //add the youtube lightbox on click
  var elements = document.querySelectorAll('a.lightbox-youtube');
  elements.forEach(element => {
      element.addEventListener("click", function(event) {
          event.preventDefault();
          document.getElementById('lightbox').innerHTML = '<a id="close"></a><a id="next">&rsaquo;</a><a id="prev">&lsaquo;</a><div class="videoWrapperContainer"><div class="videoWrapper"><iframe src="https://www.youtube.com/embed/'+this.getAttribute('data-id')+'?autoplay=1&showinfo=0&rel=0"></iframe></div>';
          document.getElementById('lightbox').style.display = 'block';

          setGallery(this);
      });
  });

  //add the image lightbox on click
  var elements = document.querySelectorAll('a.lightbox-image');
  elements.forEach(element => {
      element.addEventListener("click", function(event) {
          event.preventDefault();
          document.getElementById('lightbox').innerHTML = '<a id="close"></a><a id="next">&rsaquo;</a><a id="prev">&lsaquo;</a><div class="img" style="background: url(\''+this.getAttribute('href')+'\') center center / contain no-repeat;" title="'+this.getAttribute('title')+'" ><img src="'+this.getAttribute('href')+'" alt="'+this.getAttribute('title')+'" /></div><span>'+this.getAttribute('title')+'</span>';
          document.getElementById('lightbox').style.display = 'block';

          setGallery(this);
      });
  });

});*/


//Image Map Resize
window.onload = function () {
  var ImageMap = function (map) {
          var n,
              areas = map.getElementsByTagName('area'),
              len = areas.length,
              coords = [],
              previousWidth = 3072;
          for (n = 0; n < len; n++) {
              coords[n] = areas[n].coords.split(',');
          }
          this.resize = function () {
              var n, m, clen,
                  x = document.body.clientWidth / previousWidth;
              for (n = 0; n < len; n++) {
                  clen = coords[n].length;
                  for (m = 0; m < clen; m++) {
                      coords[n][m] *= x;
                  }
                  areas[n].coords = coords[n].join(',');
              }
              previousWidth = document.body.clientWidth;
              return true;
          };
          window.onresize = this.resize;
      },
      imageMap = new ImageMap(document.getElementById('map_ID'));
  imageMap.resize();
}
// Imape Map Resize (end)

//Scroll to top
var bike = document.getElementById('bike');
$(document).ready(function(){ 
    $(window).scroll(function(){ 
        if ($(this).scrollTop() > 100) { 
            $('#scroll').fadeIn(); 
        } else { 
            $('#scroll').fadeOut(); 
        } 
    }); 
    
    $('#scroll').click(function(){ 
        //$("html, body").animate({ scrollTop: 0 }, 600); 
        //return false;
        bike.scrollIntoView();
    }); 
});
//Scroll to top (end)