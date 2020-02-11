// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBDBp2u7K7FFOpqxBjFuT7yOiw3YH_cOso",
  authDomain: "link-shortener-9b8d2.firebaseapp.com",
  databaseURL: "https://link-shortener-9b8d2.firebaseio.com",
  projectId: "link-shortener-9b8d2",
  storageBucket: "link-shortener-9b8d2.appspot.com",
  messagingSenderId: "467276698788",
  appId: "1:467276698788:web:6464a73417b604a54e0231"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();
var USER = null;

var loginButton = document.getElementById("loginButton");
var logoutButton = document.getElementById("logoutButton");
var submitButton = document.getElementById("submitButton");
var submitDiv = document.getElementById("submitDiv");

loginButton.addEventListener("click", login);
logoutButton.addEventListener("click", logout);
submitButton.addEventListener("click", submit);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    if(user.uid != "1V2gVT2O0LesBHvGl3whGHJ1w1O2") {
      logout();
    }
    USER = {};
    USER.displayName = user.displayName;
    USER.email = user.email;
    USER.emailVerified = user.emailVerified;
    USER.photoURL = user.photoURL;
    USER.isAnonymous = user.isAnonymous;
    USER.uid = user.uid;
    USER.providerData = user.providerData;
    loginButton.style.display = "none";
    logoutButton.style.display = "block";
    submitDiv.style.display = "block";
    getLinks();
    // console.log(USER);
  } else {
    USER = null;
    loginButton.style.display = "block";
    logoutButton.style.display = "none";
    submitDiv.style.display = "none";
  }
});

function getLinks() {
  firebase.database().ref('links/').on('value', function(snapshot) {
    buildTable();

    var temp = snapshot.val();
    for(i in temp) {
      e = temp[i];

      var t = document.getElementById("linkTable");
      var r = document.createElement("tr");
      r.name = e.name;

      var td = document.createElement("td");
      var date = new Date(e.timestamp);
      td.innerText = date.toLocaleString();
      r.appendChild(td);

      var td = document.createElement("td");
      td.innerText = e.name;
      td.id = "entry_name_" + e.name;
      r.appendChild(td);

      var td = document.createElement("td");
      td.innerText = e.link;
      r.appendChild(td);

      var td = document.createElement("td");
      td.innerText = e.visits;
      r.appendChild(td);

      var td = document.createElement("td");
      var deleteButton = document.createElement("button");
      deleteButton.innerHTML = "Delete";
      deleteButton.name = i;
      deleteButton.addEventListener("click", deleteEntry);
      td.appendChild(deleteButton);
      r.appendChild(td);

      t.appendChild(r);
    }
  });
}

function login() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    var token = result.credential.accessToken;
    var user = result.user;
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });
}

function logout() {
  firebase.auth().signOut();
}

function submit() {
  var name = document.getElementById("nameInput").value.toLowerCase();
  var link = document.getElementById("linkInput").value;
  if(name == "") {
    return alert("Missing Name");
  }
  if(link == "") {
    return alert("Missing Link");
  }
  var linkRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;
  if(link.match(linkRegex) == null) {
    return alert("Bad URL");
  }
  if(link.indexOf("http://") != 0 && link.indexOf("https://") != 0) {
    return alert("Must start with 'http://' or 'https://");
  }
  var nameRegex = /^[\da-z-_]*$/;
  if(name.match(nameRegex) == null) {
    return alert("Bad Name");
  }
  if(document.getElementById("entry_name_" + name) != null) {
    return alert("Name already used.");
  }

  // console.log(name, link);
  var entry = {
    name: name,
    link: link,
    visits: 0,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };
  firebase.database().ref('links/').push(entry);

  var name = document.getElementById("nameInput").value = "";
  var link = document.getElementById("linkInput").value = "";
}

function buildTable() {
  var t = document.getElementById("linkTable");
  t.innerHTML = "";
  var r = document.createElement("tr");

  var th = document.createElement("th");
  th.innerText = "Date Added";
  th.style.width = "200px";
  r.appendChild(th);

  var th = document.createElement("th");
  th.innerText = "Name";
  r.appendChild(th);

  var th = document.createElement("th");
  th.innerText = "Link";
  r.appendChild(th);

  var th = document.createElement("th");
  th.innerText = "Visits";
  th.style.width = "100px";
  r.appendChild(th);

  var th = document.createElement("th");
  th.innerText = "Delete";
  th.style.width = "100px";
  r.appendChild(th);

  t.appendChild(r);
}

function deleteEntry(e) {
  var c = confirm("Are you sure you want to delete this entry?");
  if(c) {
    var id = e.target.name;
    firebase.database().ref('links/' + id).remove();
  }
}