/*
    ReadBench

    (C) 2020 Soruto Project, MIT Licensed.
    Main Script
*/

const readBench = {
    //save the sentences array to use globally
    sentences:[],
    forceStopFlag: false,
    loadPassage: function (passage) {
        //Initialize #text
        document.getElementById("text").innerHTML = "";

        //cut by sentences
        //save to readBench.sentences
        readBench.sentences = tokenizer.sentences(passage);
        console.log(readBench.sentences);

        //make <span>s into #text
        for(let i = 0 ; i < readBench.sentences.length; i++){
            const sentence = readBench.sentences[i];
            const span = document.createElement("span");
            span.innerText = sentence;
            //add event to read from the sentence
            span.addEventListener("click", function(){
                readBench.speak(i, false);
            });
            document.getElementById("text").appendChild(span);
        }
    },
    speak: function (readingSentenceNo = 0, goNext = true) {

        const maxSentenceNo = readBench.sentences.length - 1;
        let uttr = new SpeechSynthesisUtterance();
        uttr.lang = "en-US";
        uttr.speed = 2;
        let speakSentence = function () {
            const readingSentenceElem = document.querySelectorAll("div#text span")[readingSentenceNo];
            uttr.text = readingSentenceElem.textContent;
            document.querySelectorAll("div#text span").forEach(function (span) {
                span.classList.remove("active");
            });

            readingSentenceElem.classList.add("active");

            speechSynthesis.speak(uttr);
        }
        let next = function () {
            //console.log([readingSentenceNo, maxSentenceNo]);
            if (readingSentenceNo < maxSentenceNo && goNext === true) {
                readingSentenceNo++;
                speakSentence();
            } else {
                readBench.resetHighlight();
            }
        }
        uttr.onend = function (e) {
            if(readBench.forceStopFlag === false){
                next();
            }else{
              readBench.forceStopFlag = false;
              readBench.resetHighlight();
            }
        }

        //start speaking
        speakSentence();

    },
    stop:function(){
        readBench.forceStopFlag = true;
    },
    resetHighlight: function(){
        document.querySelectorAll("div#text span").forEach(function (span) {
            span.classList.remove("active");
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("file-button").addEventListener("click", function(){
        //make an input[type="file"] element
        const fileElem = document.createElement("input");
        fileElem.type = "file";

        //read only .txt
        fileElem.accept = ".txt";

        //add Event to fileElem
        fileElem.addEventListener("change", function(e){
            const reader = new FileReader();
            reader.onload = function(){
                readBench.loadPassage(reader.result);
            }
            reader.readAsText(e.target.files[0]);
        });

        //open the dialog
        fileElem.click();
    });

    document.getElementById("speak-button").addEventListener("click", function(){
        readBench.speak(0,true);
    });

    document.getElementById("stop-button").addEventListener("click", function(){
        readBench.stop();
        M.toast({
          html:`現在読み上げ中のテキストが読み終わると停止します。`
        })
    });

    //load sample text
    readBench.loadPassage(`Please click the upload button and select a txt file to read.`);
});
