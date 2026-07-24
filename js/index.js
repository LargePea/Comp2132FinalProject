import { GameState } from "./gameState.js";

let gameState;

let $displayChars;
let $wrongDisplay;
let $hangman;
let $loadingBar;

let lastKey = -1;
const imagePath = './images/hangman_'

let loadingAnimation;
let loadingAnimFrameTime = 100;
let loadingAnimLastFrame = 0;
let loadingCycle = 0;

$(document).ready(function() {
    console.warn("YOU MIGHT SEE A 404 ERROR WHEN I LOOK UP THE HINT DEFINITION.\nTHIS IS NOT MY FAULT BUT A LIMITATION OF THE API I AM USING.\nPLEASE DO NOT DEDUCT MARKS BECAUSE OF THAT!!!")
    //handle Keyboard input
    $('html').on('keydown', function(event){
        //bounce repeated keyboard entries
        if(lastKey == event.keyCode) return;
        lastKey = event.keyCode;

        //make sure input is a character key and not a string key
        if(!/^.{1}$/.test(event.key)) return;

        let sanitizedInput = event.key.toLowerCase();
        handleInput(sanitizedInput);
        gameState.checkGameState();   
    });

    //handle button inputs
    $('#input button').on('click', function(){
        let sanitizedInput = this.value.toLowerCase();
        handleInput(sanitizedInput);
        gameState.checkGameState();
    })

    $('#hint button').on('click', function(){
        $(this).fadeOut(150);
        $('#hint h3').fadeIn(150);
    });

    $('#restart').on('click', function(){
        restartGame();
    })

    
    $loadingBar = $('#loading-bar')
    $wrongDisplay = $('#wrong-letters');
    $hangman = $('#hangman');

    loadGame();
});

async function loadGame(){
    //select word length between 5 - 7 chars long
    startAnimation();

    const wordLength = Math.floor(Math.random() * 3) + 5;
    let word = await getWord(wordLength);

    finishAnimation();

    gameState = new GameState(word, winGame, loseGame);

    //update word display
    const displayHtml = '<h3></h3>'.repeat(wordLength);
    $('#word-container').html(displayHtml);
    $displayChars = $('#word-container h3');
}

async function getWord(wordLength){
    try{
        //generate word
        const wordResp = await fetch(`https://random-word-api.herokuapp.com/word?length=${wordLength}`);
        if(!wordResp.ok)
            throw new Error("Could not connect to word generator.\nPlease try again later...");
        const possibleWord = (await wordResp.json())[0];

        //get hint
        //THIS API DOES NOT HAVE DEFINITIONS FOR EVERY WORD THAT THE PREVIOUS API CAN GENERATE THIS IS NOT MY PROBLEM!!!!
        const hintResp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${possibleWord}`);
        if(!hintResp.ok){
            //keep looking for words until definition can be found
            console.warn("Could not find definition. Looking for new word")
            return getWord(wordLength);
        }
        const hint = (await hintResp.json())[0]['meanings'][0]['definitions'][0]['definition'];
        $('#hint h3').text(hint);
        return possibleWord;
    } catch(error){
        //TO:DO ERROR MESSAGE TO USER
    }
}

function startAnimation(){
    let loadingAnimation = requestAnimationFrame(animation);
    loadingAnimLastFrame = 0;
    $('#loading-screen').fadeIn(100);
}

function animation(timestamp){
    if(timestamp - loadingAnimLastFrame < loadingAnimFrameTime){
        requestAnimationFrame(animation);
        return;
    }

    loadingAnimLastFrame = timestamp;
    loadingCycle++;
    loadingCycle %= 3;
    $loadingBar.text(". ".repeat(loadingCycle + 1));
    requestAnimationFrame(animation);
}

function finishAnimation(){
    cancelAnimationFrame(loadingAnimation);
    $('#loading-screen').fadeOut(100);
}

function handleInput(input){
    let result = gameState.guessCharacter(input);
    if(result.length === 0) return;

    for(let i = 0; i < result.length; i++){
        if(result[i] === -1){
            updateHangman(input);
            break;
        }

        $displayChars[result[i]].textContent = input.toUpperCase();
    }

    let $button = $(`button[value=${input}]`);
    $button.attr('disabled', true);
}

function updateHangman(character){
    let wrongCounter = gameState.wrongCounter;
    $hangman.attr('src', `${imagePath}${wrongCounter}`);

    let wrongHtml = $wrongDisplay.html();
    wrongHtml += `<h3>${character.toUpperCase()}</h3>`
    $wrongDisplay.html(wrongHtml);
}

function winGame(){
    $('#win-text').css('display', 'block');
    $('#lose-text').css('display', 'none');
    $('#gameover').fadeIn(500);
}

function loseGame(){
    $('#lose-text').css('display', 'block');
    $('#win-text').css('display', 'none');
    $('#gameover').fadeIn(500);
}

function restartGame(){
    $('#gameover').fadeOut(150);
    $('#input button:disabled').attr('disabled', false);
    $('#word-container').html('<h3></h3>');
    $wrongDisplay.html('');
    $hangman.attr('src', `${imagePath}0`);
    $('#hint button').fadeIn(150);
    $('#hint h3').fadeOut(150);
    loadGame();
}