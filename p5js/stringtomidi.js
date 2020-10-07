let noteDict = {"bs": 0, "c": 0, "cs": 1, "df": 1, "d": 2, "ds": 3, "ef": 3, "e": 4, "ff": 4, "es": 5,
    "f": 5, "fs": 6, "gf": 6, "g": 7, "gs": 8, "af": 8, "a": 9, "as": 10, "bf": 10,
    "b": 11};

function stringToMidi(iptNote) {
    let noteName = iptNote.slice(0,-1);
    let noteOct = parseInt(iptNote.slice(-1),10);
    let curOct = (noteOct+1)*12;
    let noteDisp = noteDict[noteName];
    let curNote = curOct + noteDisp;
    return curNote;
}  

function isNote(iptNote) {
    let noteName = iptNote.slice(0,-1);
    if(Object.keys(noteDict).includes(noteName)) {
        return true;
    }
    else {
        return false;
    };
}
