// Waits until content is built
document.addEventListener('DOMContentLoaded', function(){

  // Identifies tweet button in DOM
  const tweetButton = document.getElementById('tweetButton');

  // When tweet button is pressed
  // --- prevent refresh
  // --- get value of text area (tweet box)
  // --- make AJAX call using helper function
  tweetButton.addEventListener("click", function(event){
    event.preventDefault();
    let tweetText = document.getElementById('tweet-textarea').value;
    makeRequest('POST', '/', tweetText)
     .then(parse)
     .catch(function (response) {
       alert('Something went wrong')
    });
  });

  // Parses the reponse from the server
  function parse(response) {
    var results = JSON.parse(response)
    buildTweetHTML(results);
  }

  // AJAX helper function
  function makeRequest (method, url, content) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest()
      xhr.open(method, url)
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify({newTweet: content}));
      xhr.onload = function () {
       if (this.status >= 200 && this.status < 300) {
         resolve(xhr.response)
       } else {
         reject({status: this.status, statusText: xhr.statusText })
       }
      }
      xhr.onerror = function () {
       reject({ status: this.status, statusText: xhr.statusText });
      }
    })
  }

  // Builds HTML of new tweet
  function buildTweetHTML(response) {
    // Gets the UL list of tweets
    const tweetList = document.getElementsByClassName('app--tweet--list')[0];

    // Creates new list element
    let newTweet = document.createElement("LI");
    newTweet.classList.add("app--tweet--li");

    let newTweetHTML = `<strong class="app--tweet--timestamp">now</strong>` +
    `<a class="app--tweet--author">` +
    `<div class="app--avatar" style="background-image: url(${response.currentUser.profile_image_url});">` +
    `<img src="${response.currentUser.profile_image_url}">` +
    `</div><h4>${response.currentUser.name}</h4> @${response.currentUser.screen_name}</a>` +
    `<p>${response.tweetText}</p>` +
    `<ul class="app--tweet--actions circle--list--inline"><li><a class="app--reply"><span class="tooltip">Reply</span>` +
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 38 28" xml:space="preserve">` +
    `<path d="M24.9,10.5h-8.2V2.8c0-1.1-0.7-2.2-1.7-2.6c-1-0.4-2.2-0.2-3,0.6L0.8,12c-1.1,1.1-1.1,2.9,0,4L12,27.2 c0.5,0.5,1.2,0.8,2,0.8c0.4,0,0.7-0.1,1.1-0.2c1-0.4,1.7-1.5,1.7-2.6v-7.7h8.2c3.3,0,6,2.5,6,5.6v1.3c0,2,1.6,3.5,3.5,3.5 s3.5-1.6,3.5-3.5v-1.3C38,16.2,32.1,10.5,24.9,10.5z"></path>` +
    `</svg></a></li><li><a class="app--retweet"><span class="tooltip">Retweet</span>` +
    `<svg id="Layer_1" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 28" xml:space="preserve">` +
    `<path d="M25.2,22.4H13.1v-9.3h4.7c1.1,0,2.2-0.7,2.6-1.7c0.4-1,0.2-2.3-0.6-3.1l-7.5-7.5c-1.1-1.1-2.9-1.1-4,0L0.8,8.3 c-0.8,0.8-1,2-0.6,3.1c0.4,1,1.5,1.7,2.6,1.7h4.7v12.1c0,1.5,1.3,2.8,2.8,2.8h14.9c1.5,0,2.8-1.3,2.8-2.8 C28,23.7,26.7,22.4,25.2,22.4z"></path>` +
    `<path d="M49.8,16.7c-0.4-1-1.5-1.7-2.6-1.7h-4.7V2.8c0-1.5-1.3-2.8-2.8-2.8H24.8C23.3,0,22,1.3,22,2.8s1.3,2.8,2.8,2.8h12.1v9.3 h-4.7c-1.1,0-2.2,0.7-2.6,1.7c-0.4,1-0.2,2.3,0.6,3.1l7.5,7.5c0.5,0.5,1.3,0.8,2,0.8c0.7,0,1.4-0.3,2-0.8l7.5-7.5 C50,18.9,50.2,17.7,49.8,16.7z"></path>` +
    `</svg><strong>0</strong></a></li>` +
    `<li><a class="app--like"><span class="tooltip">Like</span>` +
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 35 28" xml:space="preserve"><path class="st0" d="M25.8,0c-3.6,0-6.8,2.1-8.3,5.1C16,2.1,12.9,0,9.2,0C4.1,0,0,4.1,0,9.2C0,21.4,17.3,28,17.3,28S35,21.3,35,9.2 C35,4.1,30.9,0,25.8,0L25.8,0z"></path>` +
    `</svg><strong>0</strong></a></li></ul>`;

    newTweet.innerHTML = newTweetHTML;

    // insert new tweet above other tweets
    tweetList.insertBefore(newTweet, tweetList.firstChild);

    // reset tweet text area
    document.getElementById('tweet-textarea').value = "";
  }
}, false);
