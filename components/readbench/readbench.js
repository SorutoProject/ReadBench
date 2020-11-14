/*
    ReadBench

    (C) 2020 Soruto Project, MIT Licensed.
    Main Script
*/

const readBench = {
  //save the sentences array to use globally
  sentences: [],
  forceStopFlag: false,
  loadPassage: function(passage) {
    //Initialize #text
    document.getElementById("text").innerHTML = "";

    //cut by sentences
    //save to readBench.sentences
    readBench.sentences = tokenizer.sentences(passage);
    console.log(readBench.sentences);

    //make <span>s into #text
    for (let i = 0; i < readBench.sentences.length; i++) {
      let sentence = readBench.sentences[i];

      const span = document.createElement("span");
      span.innerText = sentence;
      //add event to read from the sentence
      span.addEventListener("click", function() {
        if (span.classList.contains("active")) {
          readBench.stop();
        } else {
          readBench.speak(i, false);
        }
      });
      span.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        if (confirm("選択した文:\n" + e.currentTarget.innerText.trim() + "\nから、この文章の最後までを読み上げますか？")) {
          readBench.speak(i, true);
        }
      });

      document.getElementById("text").appendChild(span);
    }
  },
  speak: function(readingSentenceNo = 0, goNext = true) {
    const startSpeak = function() {
      const maxSentenceNo = readBench.sentences.length - 1;
      let uttr = new SpeechSynthesisUtterance();
      uttr.lang = "en-US";
      let speakSentence = function() {
        const readingSentenceElem = document.querySelectorAll("div#text span")[readingSentenceNo];
        uttr.text = readingSentenceElem.textContent;
        uttr.rate = document.getElementById("speech-rate").value;
        document.querySelectorAll("div#text span").forEach(function(span) {
          span.classList.remove("active");
        });

        readingSentenceElem.classList.add("active");
        //Scroll into viewport
        readingSentenceElem.scrollIntoView();

        speechSynthesis.speak(uttr);
      }
      let next = function() {
        //console.log([readingSentenceNo, maxSentenceNo]);
        if (readingSentenceNo < maxSentenceNo && goNext === true) {
          readingSentenceNo++;
          speakSentence();
        } else {
          readBench.resetHighlight();
        }
      }
      uttr.onend = function(e) {
        if (readBench.forceStopFlag === false) {
          next();
        } else {
          readBench.forceStopFlag = false;
          readBench.resetHighlight();
        }
      }

      //start speaking
      speakSentence();
    }
    if (speechSynthesis.speaking === true) {
      readBench.stop();
      setTimeout(function() {
        startSpeak();
      }, 250);
    } else {
      startSpeak();
    }


  },
  stop: function() {
    readBench.forceStopFlag = true;
    speechSynthesis.cancel();
  },
  resetHighlight: function() {
    document.querySelectorAll("div#text span").forEach(function(span) {
      span.classList.remove("active");
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("file-button").addEventListener("click", function() {
    //make an input[type="file"] element
    const fileElem = document.createElement("input");
    fileElem.type = "file";

    //read only .txt
    fileElem.accept = ".txt";

    //add Event to fileElem
    fileElem.addEventListener("change", function(e) {
      const reader = new FileReader();
      reader.onload = function() {
        readBench.loadPassage(reader.result);
        readBench.stop();

        readBench.forceStopFlag = false;
      }
      reader.readAsText(e.target.files[0]);
    });

    //open the dialog
    fileElem.click();
  });

  document.getElementById("speak-button").addEventListener("click", function() {
    readBench.speak(0, true);
  });

  document.getElementById("stop-button").addEventListener("click", function() {
    readBench.stop();
  });
  const storageAvailable = function(type) {
    var storage;
    try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        (storage && storage.length !== 0);
    }
  }
  document.getElementById("speech-rate").addEventListener("change", function(e) {
    //save to localStorage
    if(storageAvailable('localStorage')) localStorage.setItem("speech-rate", e.currentTarget.value);
  });

  document.getElementById("new-button").addEventListener("click", function(){
    document.getElementById("new-modal-text").innerText = document.getElementById("text").innerText;
    setTimeout(function(){
      document.getElementById("new-modal-text").focus();
    },250);
  });

  document.getElementById("new-modal-apply-button").addEventListener("click", function(){
    readBench.loadPassage(document.getElementById("new-modal-text").innerText);
  });

  document.getElementById("new-modal-download-button").addEventListener("click", function(){
    const text = document.getElementById("new-modal-text").innerText;
    const link = document.createElement("a");
    link.href = "data:text/plain, " + text;
    //ファイル名を聞く
    let fileName = prompt("ファイル名を入力してください。");
    if(fileName !== null){
        if(!fileName.match(/.*.txt$/)){
          fileName+= ".txt";
        }
        link.setAttribute("download", fileName);
        link.click();
    }

  });

  //set user speech-rate setting if it was saved.
  if(storageAvailable("localStorage")){
    if(localStorage.getItem("speech-rate")){
      document.getElementById("speech-rate").value = localStorage.getItem("speech-rate");
    }else{
      document.getElementById("speech-rate").value =　1;
    }
  }

  M.AutoInit();
});
