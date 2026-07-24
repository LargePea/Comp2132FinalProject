
export class GameState{
    #word;
    #winDelegate;
    #loseDelegate;
    #usedCharacters = '';
    #correctCounter = 0;
    #wrongCounter = 0;
    #gameComplete = false;

    #MAXWRONG = 6;

    constructor(word, winDelegate, loseDelegate){
        this.#word = word;
        this.#winDelegate = winDelegate;
        this.#loseDelegate = loseDelegate;
    }

    get wrongCounter() { return this.#wrongCounter; }
    get word() {return this.#word; }

    //return: empty array if there is an error, array(1) with -1 if it is wrong, array(n) where elements are index position of correct letters
    guessCharacter(character){
        if(!/[a-z]/.test(character) || this.#gameComplete) return [];

        if(this.#usedCharacters.includes(character)) return [];
        this.#usedCharacters += character;

        if(!this.#word.includes(character)){
            this.#wrongCounter++;
            return [-1];
        }
        else{
            let retArr = [];
            for(let i = 0; i < this.#word.length; i++){
                if(this.#word[i] === character){
                    this.#correctCounter++;
                    retArr.push(i);
                }
            }
            return retArr;
        }
    }

    checkGameState(){
        if(this.#wrongCounter === this.#MAXWRONG) {
            this.#gameComplete = true;
            this.#loseDelegate();
        }
        else if(this.#correctCounter === this.#word.length) {
            this.#gameComplete = true;
            this.#winDelegate();
        }
    }
}